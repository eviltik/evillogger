const winston = require('winston');
const util = require('util');
const fs = require('fs');
const sprintf = require('sprintf').sprintf;

class EvilLogger {

    constructor(options) {

        if (typeof options === 'string') {
            options = {
                ns:options
            }
        }

        this.ns = options.ns || 'master';
        this.spaces = options.spaces || 15;

        this.allowedMessageCount = [5,10, 100, 500, 1000, 5000, 10000, 50000];
        this.lastMessage = '';
        this.lastMessageRepeat = 0;
        this.message = '';

        let argz = require('minimist')(process.argv.slice(2));

        let opts = {
            json: false,
            colorize: true,
            timestamp: () => {
                let d = new Date();
                let h = (d.getHours() < 10 ? "0" : "") + d.getHours();
                let m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
                let s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
                let mm = d.getMilliseconds();

                if (mm < 10) mm = '0' + mm;
                if (mm < 100) mm = '0' + mm;

                let date = h + ':' + m + ':' + s + '.' + mm;
                let ms = ' | ' + sprintf('%'+this.spaces+'s', (this.ns));
                return date + ms;
            }
        };

        if (argz.debug || process.env.DEBUG) opts.level = 'debug';

        let transportConsole = new (winston.transports.Console)(opts);
        let transports = [transportConsole];
        this.winstonLogger = new (winston.Logger)({transports: transports});

    }

    info() {
        arguments[0] = ' ' + arguments[0];
        this.handleLastMessage(arguments, this.winstonLogger.info);
    }

    warn() {
        arguments[0] = ' ' + arguments[0];
        this.handleLastMessage(arguments, this.winstonLogger.warn);
    }

    error() {
        this.handleLastMessage(arguments, this.winstonLogger.error);
    }

    debug() {
        this.handleLastMessage(arguments, this.winstonLogger.debug);
    }

    handleLastMessage(args, fnc) {
        this.message = util.format.apply(this, args);

        if (this.message != this.lastMessage) {
            this.lastMessage = this.message;
            this.lastMessageRepeat = 0;
            return fnc(this.message);
        }

        this.lastMessageRepeat++;

        if (this.lastMessageRepeat > this.allowedMessageCount[this.allowedMessageCount.length]) {
            return fnc(' last message repeated more than '+ this.allowedMessageCount[this.allowedMessageCount.length]+' times: '+this.allowedMessageCount[this.allowedMessageCount.length]);
        }

        if (this.allowedMessageCount.indexOf(this.lastMessageRepeat)>=0) {
            return fnc(' last message repeated '+this.lastMessageRepeat+' times: '+this.lastMessage);
        }

        if (this.lastMessageRepeat < 5) {
            return fnc(message);
        }
    }

}

module.exports = function(ns) {
    return new (EvilLogger)(ns);
};
