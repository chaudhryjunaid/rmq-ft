const amqp = require('amqplib');

const connections = {
  publish: null,
  consume: null,
};

exports.ensureConnection = async (mode = 'consume', url = 'amqp://localhost') => {
  if (connections[mode]) {
    return connections[mode];
  }

  connections[mode] = await amqp.connect(url);
  return connections[mode];
};

exports.closeConnection = async (mode = 'publish') => {
  if (connections[mode]) {
    await connections[mode].close();
  }
  connections[mode] = null;
};

exports.publishWithConfirmation = async (
  confirmChannel, exchange, routingKey, content, options = {}
) => (
  new Promise((resolve, reject) => {
    confirmChannel.publish(exchange, routingKey, content, options, async (err, ok) => {
      if (err) {
        return reject(err);
      }
      resolve(ok);
    });
  })
);
