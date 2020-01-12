'use strict';

const logLevel = require('config').get('app.logLevel');
const log4js = require('log4js');
log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: logLevel } }
});

const loggerInstance = log4js.getLogger();

module.exports = {
    getLogger: () => loggerInstance
};