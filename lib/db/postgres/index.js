'use strict';


const knex = require('knex');

const config = require('config');
const databaseToCreate = config.get('postgres.database');

const logger = require('../../../logger').getLogger();

module.exports = {
    initialise,
    getClient: () => _KNEX_CLIENT
};


/**
 * Module's knex client
 */
let _KNEX_CLIENT = null;

/**
 * Initialise pg knex client 
 */
async function initialise() {

    //try to initialise with the databaseToCreate in case it exists  
    logger.info(`db - postgres - Attempting to connect to database: ${databaseToCreate}`);
    await initialiseConnection(databaseToCreate);

    //try to use the connection
    //it will throw if the database does not exist
    try {
        await _KNEX_CLIENT.raw(`SELECT 1`);
    } catch (err) {
        if (err.message.includes(`database "${databaseToCreate}" does not exist`)) {
            logger.warn(`db - postgres - Database: ${databaseToCreate} does not exist; reconnecting as postgres to create it..`);

            //connect with postgres default database
            await initialiseConnection();

            //create the configured database
            try {
                logger.info(`db - postgres - Creating the configured database: ${databaseToCreate}`);
                await _KNEX_CLIENT.raw(`CREATE DATABASE ${databaseToCreate}`);
                logger.info(`db - postgres - Finished to create the configured database: ${databaseToCreate}`);
            } catch (err) {
                logger.error(`db - postgres - Failed to create the configured database: ${databaseToCreate}; with message: ${err.message}`);
                logger.error(err.stack);
                throw new Error(err);
            }

            logger.info(`db - postgres - Reconecting to database: ${databaseToCreate}`);
            //reinitialise the with the created database
            await initialiseConnection(databaseToCreate);
        } else {
            throw new Error(err);
        }
    }

    await initialiseModels();

    return _KNEX_CLIENT;
}


/**
 * Initialises the pg knex client connection to the passed in database or default postgres
 * Note: postgres database exists by default and cannot be removed
 * 
 * @param {String} databaseName     database name 
 */
async function initialiseConnection(databaseName) {
    const postgresConfig = {
        host: config.get('postgres.host'),
        port: config.get('postgres.port'),
        username: config.get('postgres.username'),
        password: config.get('postgres.password'),
        database: databaseName || 'postgres',
        pool: config.get('postgres.pool')
    };
    logger.info(`db - postgres - Initialising the postgres knex client connection to database: ${postgresConfig.database}`);
    _KNEX_CLIENT = await knex({
        client: 'pg',
        connection: postgresConfig
    });
    logger.info(`db - postgres - Finished initialising the postgres knex client connection to database: ${postgresConfig.database}`);
}

/**
 * Initialises the models
 */
async function initialiseModels() {

    logger.info(`db - postgres - Initialising postgres models..`);
    try {
        await require('./ProjectDefinition').build();
    } catch (err) {
        logger.error(`db = postgres - Error while initialising postgres models; with message: ${err.message}`);
        logger.error(err.stack);
        throw new Error(err);
    }

    module.exports.models = {
        ProjectDefinition: require('./ProjectDefinition'),
        BaseModel: require('./BaseModel')
    };
    logger.info(`db - postgres - Finished initialising postgres models.`);
}