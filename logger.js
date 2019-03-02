const { createLogger, format, transports } = require('winston');
const util = require('util');

const logger = createLogger({
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
        level, message, ...rest
      } = info;
      return `[${info.timestamp.substring(11)}] ${level}: ${message} ${util.inspect(rest, { colors: true })}`;
    }),
  ),
  defaultMeta: { service: 'rmq-ft' },
  transports: [
    new transports.Console({
      level: 'debug',
    }),
  ],
});

module.exports = logger;
