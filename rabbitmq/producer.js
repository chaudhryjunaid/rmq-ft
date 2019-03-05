const _ = require('lodash');
const uuid = require('uuid/v4');
const common = require('./common');
const config = require('../config');
const logger = require('../logger')('producer');
const consumer = require('./consumer');

let channel = null;
exports.init = async () => {
  const conn = await common.ensureConnection('publish', config.RABBITMQ_URL);
  channel = await conn.createConfirmChannel();

  await channel.assertExchange('file', 'direct', {
    persistent: true,
    durable: false,
  });
};

exports.sendFile = async (file, receiver) => {
  const senderCallback = async (msg) => {
    const { content, fields: { routingKey } } = msg;
    console.log(`REPLY> ${routingKey}::${content.toString()}`);
  };

  consumer.init(config.CONSUMER_ID, 'publish', senderCallback);
  try {
    await module.exports.request({ file }, receiver);
  } catch (e) {
    logger.error('Error sending file!', e);
  }
};

exports.request = async (_json, receiver) => {
  const json = _.extend(_json, {
    _request: {
      correlationId: uuid(),
      senderId: config.CONSUMER_ID,
    },
  });
  const content = Buffer.from(JSON.stringify(json));
  return common.publishWithConfirmation(channel, 'file', `${receiver}.request`,
    content);
};

exports.reply = async (_json, msg) => {
  const { content: receivedContent } = msg;
  const receivedJson = JSON.parse(receivedContent);
  const { _request: { sender, correlationId } } = receivedJson;
  const json = _.extend(_json, {
    _reply: {
      correlationId,
      sender,
    },
    _request: {
      correlationId: uuid(),
      sender: config.CONSUMER_ID,
    },
  });
  const content = Buffer.from(JSON.stringify(json));
  return common.publishWithConfirmation(channel, 'file', `${sender}.reply`,
    content);
};
