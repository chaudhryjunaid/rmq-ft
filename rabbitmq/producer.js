const common = require('./common');

let channel = null;
exports.init = async () => {
  const conn = common.ensureConnection('publish');
  channel = conn.createChannel();

  await channel.assertExchange('file', 'topic', {
    persistent: true,
    durable: false,
  });
};

exports.sendFile = (file) => {
  console.log(file);
};
