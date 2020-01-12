'use strict';

const Schema = require('mongoose').Schema;
const mongoConnection = require('./index').getClient();
const logger = require('../../../logger').getLogger();


//Example of Project Definition pattern
// PRASID:50335
// PROJECT:ALUTRI
// ASSY_NUMBER:ALC3-8DG59237ABAA
// ASSY_REVISION:04-008
// PANEL_NUMBER:
// PANEL_REVISION:
// BOARD_ALL:
// BOARD_PICTURE:

const ProjectDefinitionSchema = new Schema({
    PRASID: Number,
    PROJECT: String,
    ASSY_NUMBER: String,
    ASSY_REVISION: String,
    PANEL_NUMBER: String,
    PANEL_REVISION: String,
    BOARD_ALL: String,
    BOARD_PICTURE: String
});
const ProjectDefinitionModel = mongoConnection.model('ProjectDefinition', ProjectDefinitionSchema);

module.exports = class ProjectDefinition {

    constructor() {

    }

    static async insert(record, migrationStrategy) {
        try {
            await ProjectDefinitionModel.insertMany([record]);
        } catch (err) {
            throw new Error(err);
        }
    }
}