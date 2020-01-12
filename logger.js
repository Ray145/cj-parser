'use strict';

const log4js = require('log4js');
log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: 'debug' } }
});

const loggerInstance = log4js.getLogger();

module.exports = {
    getLogger: () => loggerInstance
};