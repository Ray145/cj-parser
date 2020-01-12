'use strict';

const mongoose = require('mongoose');

const config = require('config');
const mongoConnString = config.get('mongo.connString');

const logger = require('../../../logger').getLogger();

module.exports = {
    initialise,
    getClient: () => _MONGOOSE_CLIENT
};


/**
 * Module's mongoose client
 */
let _MONGOOSE_CLIENT = null;

/**
 * Initialise the mongoose client 
 */
async function initialise() {

    logger.info(`db - mongo - Attempting to connect to mongo: ${mongoConnString}`);
    try {
        _MONGOOSE_CLIENT = await mongoose.createConnection(mongoConnString, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (err) {
        logger.error(`db - mongo - Errro while connecting to ${mongoConnString}; with message: ${err.message}`);
        logger.error(err);
        throw new Error(err);
    }

    await initialiseModels();

    return _MONGOOSE_CLIENT;
}

/**
 * Initialises the models
 */
async function initialiseModels() {

    logger.info(`db - mongo - Initialising mongo models..`);
    try {
        //placeholder - don't need to initialise anything for mongo yet; apart from the mongoose client
    } catch (err) {
        logger.error(`db = mongo - Error while initialising mongo models; with message: ${err.message}`);
        logger.error(err.stack);
        throw new Error(err);
    }

    module.exports.models = {
        ProjectDefinition: require('./ProjectDefinition'),
        BaseModel: require('./BaseModel')
    };
    logger.info(`db - mongo - Finished initialising mongo models.`);
}

