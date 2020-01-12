'use strict';


const config = require('config');
const targetClient = config.get('app.targetDatabaseClient');

const logger = require('../../logger').getLogger();

const postgresClient = require('./postgres');
const mongoClient = require('./mongo');


module.exports = {
    initialise,
    getClient
};

/**
 * Module's database client
 */
let _CLIENT;

/**
 * Initialise the database connection client based on the configured target
 */
async function initialise() {

    switch (targetClient) {
        case 'postgres':
            _CLIENT = await postgresClient.initialise();
            
            module.exports.models = require('./postgres').models;
            break;

        case 'mongo':
            _CLIENT = await mongoClient.initialise();

            module.exports.models = require('./mongo').models;
            break;
    }
}

/**
 * Gets the currently initialised db client
 */
function getClient() {
    return _CLIENT;
}