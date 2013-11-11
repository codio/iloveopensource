/**
 * Author: krasu
 * Date: 10/17/13
 * Time: 3:16 PM
 */
var winston = require('winston'),
    cfg = require('../../config')

if (!cfg.isDev) {
    winston.remove(winston.transports.Console)
    winston.add(winston.transports.Console, {
        json: false,
        timestamp: true,
        handleExceptions: true
    })
    winston.add(winston.transports.DailyRotateFile, {
        filename: cfg.logsDir + '/iloveopensource.log',
        datePattern: '.yyyy-MM-dd',
        handleExceptions: true
    })
}


module.exports = winston;