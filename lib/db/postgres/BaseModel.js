'use strict';


const _ = require('lodash');

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
     */
    static async buildModel(tableName, tableColumns) {
        try {
            logger.info(`postgres.BaseModel - Asserting database table: ${tableName}..`);
            const doesTableExist = await knex.schema.hasTable(tableName);

            if (!doesTableExist) {
                logger.info(`postgres.BaseModel - Creating database table: ${tableName}..`);
                await createTable(tableName, tableColumns);
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
     * @param {String}      tableName          table name to insert the records into                
     * @param {String[]}    records            records to insert    
     * @param {Number}      chunkSize          batch size
     */
    static async insert(tableName, records, chunkSize) {
        try {
            await knex.batchInsert(tableName, records, chunkSize);
        } catch (err) {
            logger.error(`postgres.BaseModel - Error while saving the existing record buffer; with message: ${err.message}`);
            logger.error(err.stack);

            //Note: currently not crash here
            //one batch might fail and another might succeed
            //at the moment we need all the data we can get
        }
    }

}


/**
 * Creates a table with the passed in tableName and columns
 * 
 * @param {String}      tableName        table name 
 * @param {String[]}    columns          an array of column names 
 */
async function createTable(tableName, columns) {
    await knex.schema.createTable(tableName, function (t) {
        t.increments('id').primary();

        //Note: currently forced to create them as string
        //column type is unknown unless custom mapping - i.e cherry picking each tablename and type manually
        _.each(columns, (column) => t.string(column, 100));
    });
}