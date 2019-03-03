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
