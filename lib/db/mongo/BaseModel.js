'use strict';


const _ = require('lodash');
const Bluebird = require('bluebird');

const Schema = require('mongoose').Schema;
const mongoConnection = require('./index').getClient();
const logger = require('../../../logger').getLogger();

const config = require('config');
const singleInsertConcurrency = config.has('app.singleInsertConcurrency') ? config.get('app.singleInsertConcurrency') : 10;

let _CURRENT_SCHEMA;
let _CURRENT_MODEL;


module.exports = class BaseModel {

    constructor() {

    }

    /**
     * Builds the database model
     *  
     * @param {String}      tableName             table name 
     * @param {String[]}    tableColumns          an array of column names 
     */
    static async buildModel(tableName, tableColumns) {
        try {
            logger.info(`mongo.BaseModel - Generating schema for: ${tableName}..`);

            //Note: currently forced to create them as string
            //column type is unknown unless custom mapping - i.e cherry picking each tablename and type manually
            const schemaAttributes = _.reduce(tableColumns, (acc, columnName) => {
                return _.assign(acc, { [columnName]: String });
            }, {});

            _CURRENT_SCHEMA = new Schema(schemaAttributes);

            _CURRENT_MODEL = mongoConnection.model(tableName, _CURRENT_SCHEMA);
            logger.info(`mongo.BaseModel - Finished generating schema for: ${tableName}..`);
        } catch (err) {
            logger.error(`mongo.BaseModel - Error while generating schema for: ${tableName}; with message: ${err.message}`);
            logger.error(err.stack);
            throw new Error(err);
        }
    }

    /**
     * Inserts a batch of table records
     * 
     * @param {String}      tableName           table name to insert the records into                
     * @param {String[]}    records             records to insert    
     * @param {Number}      chunkSize           batch size
     * @param {String}      migrationStrategy   forceCreate or createOrUpdate
     */
    static async insert(tableName, records, chunkSize, migrationStrategy) {

        switch (migrationStrategy) {

            case 'checkIfExists':
                return checkIfExistsInsert(tableName, records);

            case 'createOrUpdate':
                throw new Errpr(`Not yet implemented`);

            case 'forceCreate':
            default:
                return forceCreateInsert(tableName, records, chunkSize);
        }
    }

}

/**
 * Checks if records exist before inserting
 * Does not create duplicates ny sacrificing speed
 * 
 * @param {String}      tableName           table name to insert the records into                
 * @param {Object[]}    records             records to insert  
 */
async function checkIfExistsInsert(tableName, records) {
    return Bluebird.map(records, async (record) => {

        try {
            const doesExist = await _CURRENT_MODEL.exists(record);

            if (doesExist) {
                logger.debug(`mongo.BaseModel - ${tableName} record already exists: ${JSON.stringify(record)}`);
            } else {
                await _CURRENT_MODEL.create(record);
            }

        } catch (err) {
            logger.warn(`mongo.BaseModel - Error while saving ${tableName} record; with message: ${err.message}`);

            //Note: currently not crash here
            //one batch might fail and another might succeed
            //at the moment we need all the data we can get
        }

    }, { concurrency: singleInsertConcurrency });
}

/**
 * Inserts a batch of table records
 * 
 * @param {String}      tableName           table name to insert the records into                
 * @param {String[]}    records             records to insert    
 * @param {Number}      chunkSize           batch size
 * @param {String}      migrationStrategy   forceCreate or createOrUpdate
 */
async function forceCreateInsert() {
    try {
        await _CURRENT_MODEL.insertMany(records);
    } catch (err) {
        logger.error(`mongo.BaseModel - Error while saving the existing record buffer; with message: ${err.message}`);
        logger.error(err.stack);

        //Note: currently not crash here
        //one batch might fail and another might succeed
        //at the moment we need all the data we can get
    }
}