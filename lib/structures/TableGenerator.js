'use strict';


const _ = require('lodash');

const { BaseModel } = require('../db').models;

const config = require('config');
const migrationStrategy = config.has('app.migrationStrategy') ? config.get('app.migrationStrategy') : 'forceCreate';
const insertBatchSize = config.has('app.insertBatchSize') ? config.get('app.insertBatchSize') : 5000;

const logger = require('../../logger').getLogger();


module.exports = class TableGenerator {

    /**
     * Constructor
     * 
     * @param {String} tableName        name of the table to generate 
     */
    constructor(tableName) {
        logger.info(`structures.TableGenerator - Initialising for tableName: ${tableName}`);
        // stLCAD_LAYER_DATA
        this._recordCounter = 0;
        this._tableName = tableName;
        this._columns = [];
        this._needsBuild = false;

        this._bufferSize = insertBatchSize;
        this._buffer = [];
        logger.info(`structures.TableGenerator - Finished initialising for tableName: ${tableName}; Insert batchSize: ${this._bufferSize.toLocaleString()}`);
    }

    /**
     * Sets the passed in columns and triggers the table create
     * 
     * @param {String[]} columns        table columns row 
     */
    async setColumns(columns) {
        this.updateColumns(columns);
        this._needsBuild = true;

        logger.info(`structures.TableGenerator - Received columns: ${this._columns.join(', ')}`);
    }

    /**
     * Builds the model/table
     * 
     * @param {Object} sampleRecord     sample record
     */
    async buildModel(sampleRecord) {
        await BaseModel.buildModel(this._tableName, this._columns, sampleRecord);
        this._needsBuild = false;

        logger.info(`structures.TableGenerator - Table/Model asserted; Starting inserts..`);
    }

    /**
     * Updates self columns
     * 
     * @param {String[]} columns        table columns row 
     */
    updateColumns(columns) {
        // MNlayer_id|OAlayn_name|MNlayn_flip_layer_id
        this._columns = columns.split('|');
    }

    /**
     * Inserts the passed in values to generator's _tableName
     * 
     * @param {String[]} values         an array of string values
     */
    async insertRecord(values) {
        const record = this.mapValuesToColumns(values);

        if (this._needsBuild) {
            await this.buildModel(record);
        }

        if (this._buffer.length === this._bufferSize) {
            await this.saveExistingBuffer();
        }

        this._buffer.push(record);
        this._recordCounter += 1;
    }

    /**
     * Saves the existing record buffer and empties it
     */
    async saveExistingBuffer() {
        await BaseModel.insert(this._tableName, this._buffer, this._bufferSize, migrationStrategy);
        //empty buffer
        this._buffer = [];
    }

    /**
     * Maps incoming values to generator's columns
     * 
     * @param {String[]} values         an array of string values
     */
    mapValuesToColumns(values) {
        const record = {};

        _.each(values, (value, index) => {
            this._columns[index] && _.assign(record, {
                [this._columns[index]]: value
            });
        });

        return record;
    }

    /**
     * Gets the stats of the generator {tableName: numberOfInserts}
     */
    getStats() {
        logger.info(`structures.TableGenerator - ${this._tableName} had ${this._recordCounter.toLocaleString()} inserts`);
        return {
            [this._tableName]: this._recordCounter
        };
    }

}