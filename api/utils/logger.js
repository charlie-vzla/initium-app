const winston = require('winston');

const console = new winston.transports.Console();
winston.add(console);

winston.level = process.env.LOG_LEVEL || 'debug';

module.exports = winston;