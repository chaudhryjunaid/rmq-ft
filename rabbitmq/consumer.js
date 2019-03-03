const common = require('./common');

let consumerID = null;

exports.init = async (_consumerID) => {
  if (consumerID) {
    throw new Error(`Already registered as: ${consumerID}`);
  }

  const conn = common.ensureConnection('publish');
  consumerID = _consumerID;
  const channel = conn.createChannel();

  await channel.assertExchange('file', 'topic', {
    persistent: true,
    durable: false,
  });

  await channel.assertQueue(consumerID, {
    durable: false,
  });

  await channel.bindQueue(consumerID, 'file', `${consumerID}.#`);

  await channel.prefetch(1);

  await channel.consume(consumerID, (data) => {
    const { content, fields: { routingKey } } = data;
    console.log(`${routingKey}::${content.toString().length}`);
  });
};
