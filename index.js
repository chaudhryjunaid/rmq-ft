const config = require('./config');
const logger = require('./logger')('main');
const rmq = require('./rabbitmq');

const receiverCallback = async (msg) => {
  const { content, fields: { routingKey } } = msg;
  console.log(`REQUEST> ${routingKey}::${content.toString()}`);
  await rmq.producer.reply({ status: 'success' }, msg);
};

(async () => {
  if (!config.CONSUMER_ID) {
    return logger.error('Please provide consumer ID!');
  }

  if (!!config.file !== !!config.sendTo) {
    return logger.error('Inconsistent args!');
  }

  await rmq.producer.init();

  if (config.file) {
    logger.info(`Publishing file ${config.file} to consumer: ${config.sendTo}`);
    await rmq.producer.sendFile(config.file, config.sendTo);
    await rmq.common.closeConnection('publish');
    await rmq.common.closeConnection('consume');
  } else {
    await rmq.consumer.init(config.CONSUMER_ID, 'consume', receiverCallback);
  }

  return 0;
})();

process.on('SIGINT', async () => {
  logger.info('Gracefully closing connections...');
  await rmq.common.closeConnection('publish');
  await rmq.common.closeConnection('consume');
  process.exit(1);
});
