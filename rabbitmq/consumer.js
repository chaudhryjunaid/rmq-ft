const common = require('./common');
const config = require('../config');
const logger = require('../logger')('rmq-consumer');

let consumerID = null;

exports.init = async (_consumerID, mode, callback) => {
  if (consumerID) {
    throw new Error(`Already registered as: ${consumerID}`);
  }

  const conn = await common.ensureConnection('consume', config.RABBITMQ_URL);
  consumerID = _consumerID;
  const channel = await conn.createChannel();

  await channel.assertExchange('file', 'direct', {
    persistent: true,
    durable: false,
  });

  await channel.assertQueue(consumerID, {
    durable: false,
  });

  const routingKey = `${consumerID}.${mode === 'consume' ? 'request' : 'reply'}`;
  await channel.bindQueue(consumerID, 'file', routingKey);

  await channel.prefetch(1);

  logger.info(`Now Listening on rabbitmq queue: '${consumerID}' boundWith: '${routingKey}'`);
  await channel.consume(consumerID, async (msg) => {
    try {
      await callback(msg);
      channel.ack(msg);
    } catch (error) {
      logger.error('Error processing rabbitmq msg: ', { msg, error });
      channel.nack(msg);
    }
  });
};
