const common = require('./common');
const config = require('../config');
const logger = require('../logger')('rmq-consumer');

let consumerID = null;

exports.init = async (_consumerID) => {
  if (consumerID) {
    throw new Error(`Already registered as: ${consumerID}`);
  }

  const conn = await common.ensureConnection('consume', config.RABBITMQ_URL);
  consumerID = _consumerID;
  const channel = await conn.createChannel();

  await channel.assertExchange('file', 'topic', {
    persistent: true,
    durable: false,
  });

  await channel.assertQueue(consumerID, {
    durable: false,
  });

  await channel.bindQueue(consumerID, 'file', `${consumerID}.#`);

  await channel.prefetch(1);

  logger.info(`Now Listening on rabbitmq queue: '${consumerID}' boundWith: '${consumerID}.#'`);
  await channel.consume(consumerID, (msg) => {
    const { content, fields: { routingKey } } = msg;
    console.log(`${routingKey}::${content.toString()}`);
    channel.ack(msg);
  });
};
