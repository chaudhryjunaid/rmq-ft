const nconf = require('nconf');

nconf.argv({
  f: {
    alias: 'file',
    describe: 'file to send as producer',
  },
  t: {
    alias: 'send-to',
    describe: 'consumer to send file to',
  },
})
  .env(['CONSUMER_ID']);

module.exports = nconf.get();
