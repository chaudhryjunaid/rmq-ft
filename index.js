const config = require('./config');
const logger = require('./logger')('main');
const rmq = require('./rabbitmq');

(async () => {
  if (config.CONSUMER_ID) {
    return rmq.consumer.init(config.CONSUMER_ID);
  }

  await rmq.producer.init();
  await rmq.producer.sendFile(config.file, config.sendTo);
  await rmq.common.closeConnection('publish');
  return 0;
})();

process.on('SIGINT', async () => {
  await rmq.common.closeConnection('publish');
  await rmq.common.closeConnection('consume');
});
