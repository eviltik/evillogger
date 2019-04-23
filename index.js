const util = require('util');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const cluster = require('cluster');
const colors = require('colors/safe');
const redis = require('./redis');
const merge = require('merge');

class EvilLogger {

    constructor(options) {

        this.redisClient = null;

        if (typeof options === 'string' || !options) {
            options = {
                ns:options
            };
        }

        this.options = options;

        if (cluster.cid && !options.ns) {
            this.ns = cluster.cid || process.env.NODE_APP_INSTANCE;
        } else {
            this.ns = options.ns || 'root';
        }

        this.spaces = options.spaces || 30;
        this.colorize = true;
        if (typeof options.colorize === 'boolean') {
            this.colorize = options.colorize;
        }

        this.repl = false;
        if (typeof options.repl === 'boolean') {
            this.repl = options.repl;
        }

        this.allowedMessageCount = [5, 10, 100, 500, 1000, 5000, 10000, 50000];
        this.lastMessage = '';
        this.lastMessageRepeat = 0;
        this.message = '';

        const argz = require('minimist')(process.argv.slice(2));

        if (typeof options.file === 'string') {
            this.file = fs.createWriteStream(options.file);
        }

        if (argz.debug || process.env.DEBUG) {
            // do not use () => {} syntax here, arguments will be empty
            this.debug = function() {
                this._handleLastMessage(arguments, 'debug');
            };
        } else {
            this.debug = () => {};
        }

        try {
            if (JSON.parse(process.env.npm_config_argv).original[0] === 'test') {
                // we are under yarn test or npm test, ignore logs
                this.debug = () => {};
                this.info = () => {};
                this.warn = () => {};
            }
        } catch(e) {

        };

        if (argz.nocolor) {
            this.colorize = false;
        }

        this.colors = {
            info:'white',
            error:'red',
            warn:'yellow',
            debug:'gray'
        };

    }

    _prefix(level, msg) {
        const d = new Date();

        let mm = d.getMilliseconds();
        if (mm < 10) mm = '0' + mm;
        if (mm < 100) mm = '0' + mm;

        let str = '';
        if (this.repl) str = '\r';
        str+=(d.getHours() < 10 ? '0' : '') + d.getHours()+':';
        str+=(d.getMinutes() < 10 ? '0' : '') + d.getMinutes()+':';
        str+=(d.getSeconds() < 10 ? '0' : '') + d.getSeconds()+'.';
        str+=mm;

        str+=sprintf(' %2s | %-'+this.spaces+'s | %s: ', cluster.forkNumber||process.env.NODE_APP_INSTANCE||process.pid, this.ns, level);

        if (this.redisClient) {
            let obj = {
                pid:process.pid,
                ns:this.ns,
                l:level,
                m:msg.trim()
            };

            if (this.options.attributes) {
                obj = merge(obj, this.options.attributes);
            }
            this.redisClient.publish(obj);
        }

        str+=msg;

        if (this.colorize) str = colors[this.colors[level]](str);

        return str;
    }

    info() {
        arguments[0] = ' ' + arguments[0];
        this._handleLastMessage(arguments, 'info');
    }

    warn() {
        arguments[0] = ' ' + arguments[0];
        this._handleLastMessage(arguments, 'warn');
    }

    error() {
        this._handleLastMessage(arguments, 'error');
    }

    logme(msg, level) {
        if (!cluster.forkNumber) {
            if (this.file) {
                this.file.write(this._prefix(level, msg)+'\n');
            } else {
                console.log(this._prefix(level, msg));
            }
            return;
        }

        // avoid multiple messages on the same line
        setTimeout(() => {
            if (this.file) {
                this.file.write(this._prefix(level, msg)+'\n');
            } else {
                console.log(this._prefix(level, msg));
            }
        }, cluster.forkNumber*4);
    }

    _handleLastMessage(args, level) {
        this.message = util.format.apply(this, args);

        if (this.message != this.lastMessage) {
            this.lastMessage = this.message;
            this.lastMessageRepeat = 0;
            return this.logme(this.message, level);
        }

        this.lastMessageRepeat++;

        if (this.lastMessageRepeat > this.allowedMessageCount[this.allowedMessageCount.length]) {
            return this.logme(' last message repeated more than '+ this.allowedMessageCount[this.allowedMessageCount.length]+' times: '+this.allowedMessageCount[this.allowedMessageCount.length], level);
        }

        if (this.allowedMessageCount.indexOf(this.lastMessageRepeat)>=0) {
            return this.logme(' last message repeated '+this.lastMessageRepeat+' times: '+this.lastMessage, level);
        }

        if (this.lastMessageRepeat < 5) {
            return this.logme(this.message, level);
        }
    }

}

module.exports = function(options) {
    const logger = new (EvilLogger)(options);
    if (options && options.redis) {
        redis.connect(logger, options.redis);
    }
    return logger;
};
