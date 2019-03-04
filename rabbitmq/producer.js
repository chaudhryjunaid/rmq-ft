const common = require('./common');
const config = require('../config');
const logger = require('../logger')('producer');

let channel = null;
exports.init = async () => {
  const conn = await common.ensureConnection('publish', config.RABBITMQ_URL);
  channel = await conn.createConfirmChannel();

  await channel.assertExchange('file', 'topic', {
    persistent: true,
    durable: false,
  });
};

exports.sendFile = async (file, consumer) => {
  try {
    const ok = await common.publishWithConfirmation(channel, 'file', `${consumer}.file`,
      Buffer.from(file));
    logger.info('File sent successfully!', { ok });
  } catch (e) {
    logger.error('Error sending file!', e);
  }
};
