const config = require('./config');
const logger = require('./logger')('main');
const rmq = require('./rabbitmq');

(async () => {
  if (config.CONSUMER_ID) {
    return rmq.consumer.init(config.CONSUMER_ID);
  }

  logger.info(`Publishing file ${config.file} to consumer: ${config.sendTo}`);
  await rmq.producer.init();
  await rmq.producer.sendFile(config.file, config.sendTo);
  await rmq.common.closeConnection('publish');
  return 0;
})();

process.on('SIGINT', async () => {
  logger.info('Gracefully closing connections...');
  await rmq.common.closeConnection('publish');
  await rmq.common.closeConnection('consume');
  process.exit(1);
});
