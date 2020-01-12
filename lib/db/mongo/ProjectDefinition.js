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

        switch (migrationStrategy) {

            case 'checkIfExists':
                if (await ProjectDefinitionModel.exists(record)) {
                    logger.debug(`mongo.model.ProjectDefinition - Project Definition: ${JSON.stringify(record)} already exists`);
                } else {
                    await ProjectDefinitionModel.insertMany([record]);
                }
                break;

            case 'createOrUpdate':
                throw new Errpr(`Not yet implemented`);

            case 'forceCreate':
            default:
                return ProjectDefinitionModel.insertMany([record]);
        }
    }
}