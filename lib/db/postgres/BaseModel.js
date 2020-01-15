'use strict';


const _ = require('lodash');
const Bluebird = require('bluebird');

const config = require('config');
const singleInsertConcurrency = config.has('app.singleInsertConcurrency') ? config.get('app.singleInsertConcurrency') : 10;

const DataTypeUtil = require('../../util/DataType');
const knex = require('./index').getClient();
const logger = require('../../../logger').getLogger();


module.exports = class BaseModel {

    constructor() {

    }

    /**
     * Builds the database table 
     * 
     * @param {String}      tableName        table name 
     * @param {String[]}    tableColumns     an array of column names
     * @param {Object}      sampleRecord     sample record
     */
    static async buildModel(tableName, tableColumns, sampleRecord) {
        try {
            logger.info(`postgres.BaseModel - Asserting database table: ${tableName}..`);
            const doesTableExist = await knex.schema.hasTable(tableName);

            if (!doesTableExist) {
                logger.info(`postgres.BaseModel - Creating database table: ${tableName}..`);
                await createTable(tableName, tableColumns, sampleRecord);
                logger.info(`postgres.BaseModel - Finished creating table: ${tableName}..`);
            } else {
                logger.info(`postgres.BaseModel - Table: ${tableName} already exists; skipping creation`);
            }
        } catch (err) {
            logger.error(`postgres.BaseModel - Error while creating the table: ${tableName}; with message: ${err.message}`);
            logger.error(err.stack);
            throw new Error(err);
        }
    }

    /**
     * Inserts a batch of table records
     * 
     * @param {String}      tableName           table name to insert the records into                
     * @param {Object[]}    records             records to insert    
     * @param {Number}      chunkSize           batch size
     * @param {String}      migrationStrategy   forceCreate, checkIfExists or createOrUpdate
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
            const doesExist = !_.isEmpty(
                await knex(tableName).first('*').where(record)
            );

            if (doesExist) {
                logger.debug(`postgres.BaseModel - ${tableName} record already exists: ${JSON.stringify(record)}`);
            } else {
                await knex(tableName).insert(record);
            }

        } catch (err) {
            logger.error(`postgres.BaseModel - Error while saving ${tableName} record; with message: ${err.message}`);

            throw new Error(err);
        }

    }, { concurrency: singleInsertConcurrency });
}

/**
 * Inserts by force creating the records - i.e. doesn't check if one already exists and doesn't createOrUpdate
 * With this drawback, achieves the highest insert speed
 * 
 * @param {String}      tableName           table name to insert the records into                
 * @param {Object[]}    records             records to insert    
 * @param {Number}      chunkSize           batch size
 */
async function forceCreateInsert(tableName, records, chunkSize) {
    records = _.map(records, record => _.pickBy(record));

    try {
        await knex.batchInsert(tableName, records, chunkSize);
    } catch (err) {
        logger.error(`postgres.BaseModel - Error while saving the existing record buffer; with message: ${err.message}`);

        throw new Error(err);
    }
}

/**
 * Creates a table with the passed in tableName and columns
 * 
 * @param {String}      tableName        table name 
 * @param {String[]}    columns          an array of column names 
 * @param {Object}      sampleRecord     sample record
 */
async function createTable(tableName, columns, sampleRecord) {
    await knex.schema.createTable(tableName, function (t) {
        t.increments('id').primary();

        _.each(columns, (column) => {
            const dataType = DataTypeUtil.inferType(sampleRecord[column]);

            switch (dataType) {
                case Date:
                    t.date(column);
                    break;

                case Number:
                    t.integer(column, 16);
                    break;

                case String:
                    t.string(column, 100);
                    break;
            }
        });
    });
}