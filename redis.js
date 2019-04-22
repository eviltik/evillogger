const Redis = require('ioredis');

let client;
let lastError;
let firstConnect = true;

function connect(logger, config, callback) {

    logger.redisClient = {
        publish:(obj) => {
            try {
                client && client.publish(config.pubsub.logger, JSON.stringify(obj));
            } catch(e) {
                
            }
        }
    }

    if (client) {
        callback && callback();
        return;
    }

    config.retryStrategy = () => {
        return config.retryDelay;
    };

    client = new Redis(config);

    client.on('error', (err) => {
        // Do not repeat connexion refused too often when redis crash
        if (lastError != err.message) {
            console.log(
                'logger: error: %s:%s ',
                config.host,
                config.port,
                err.message
            );
            lastError = err.message;
        }
    });

    client.on('close', () => {
        console.warn('logger: redis disconnected');
    });

    client.on('connect', () => {
        lastError = null;
        if (firstConnect) {
            firstConnect = false;
        } else {
            console.info('logger: redis reconnected');
        }
    });

    client.on('ready', () => {
        callback && callback();
    });

}

module.exports = {
    connect,
    client
};
