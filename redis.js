const Redis = require('ioredis');

let client;
let lastError;
let firstConnect = true;
let isReady = false;

function connect(logger, config, callback) {

    logger.redisClient = {
        publish:(obj) => {
            if (isReady && client) {
                client.publish(config.pubsub.logger, JSON.stringify(obj));
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
        console.warn('logger: redis connection closed');
        isReady = false;
    });

    client.on('disconnect', () => {
        console.warn('logger: redis disconnected');
        isReady = false;
    });

    client.on('connect', () => {
        lastError = null;
        isReady = true;
        if (firstConnect) {
            firstConnect = false;
        } else {
            console.info('logger: redis reconnected');
        }
    });

    client.on('ready', () => {
        isReady = true;
        callback && callback();
    });

}

module.exports = {
    connect,
    client
};
