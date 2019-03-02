const { createLogger, format, transports } = require('winston');
const util = require('util');

module.exports = (_service = 'default') => createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf((info) => {
      const {
        timestamp, level, message, service, ...meta
      } = info;
      let formattedMeta = util.inspect(meta, {
        colors: true,
        depth: null,
      });
      formattedMeta = formattedMeta && ` ${formattedMeta}`;
      return `[${timestamp}] ${service}::${level}: ${message}${formattedMeta}`;
    }),
  ),
  defaultMeta: { service: _service },
  transports: [
    new transports.Console({
      level: 'debug',
    }),
  ],
});
