'use strict';

const _ = require('lodash');
const { ProjectDefinition: ProjectDefinitionModel } = require('../db').models;

const config = require('config');
const migrationStrategy = config.has('app.migrationStrategy') ? config.get('app.migrationStrategy') : 'forceCreate';

const logger = require('../../logger').getLogger();

module.exports = class ProjectDefinition {

    constructor() {
        this._active = true;
        this._projectDefinition = {};
    }

    /**
     * Updates the project definition with the passed in line
     * 
     * @param {String}  line        line of .cj file that contains a part of project definition 
     */
    updateProjectDefinition(line) {
        line = line.split(':');

        _.assign(this._projectDefinition, {
            [line[0]]: line[1]
        });
    }

    /**
     * Saves internal state and deactivates
     */
    async saveAndDeactivate() {
        try {
            logger.info('structures.ProjectDefinition - Saving project definition..');
            await ProjectDefinitionModel.insert(this._projectDefinition, migrationStrategy);
            logger.info('structures.ProjectDefinition - Finished saving project definition; deactivating..');
        } catch (err) {
            logger.error(`structures.ProjectDefinition - Error while saving project definition; with message: ${err.message}`);
            logger.error(err.stack);
            throw new Error(err);
        }

        this._active = false;
    }

    /**
     * Checks wether the internal _projectDefinition is empty
     */
    hasData() {
        if (!this._active) { return false; }

        return !_.isEmpty(this._projectDefinition);
    }

    /**
     * Checks whether the passed in line if *known* part of project definition
     * 
     * @param {String}  line        line of .cj file 
     */
    static isPartOfProjectDefinition(line) {

        //Example of Project Definition pattern
        // PRASID:50335
        // PROJECT:ALUTRI
        // ASSY_NUMBER:ALC3-8DG59237ABAA
        // ASSY_REVISION:04-008
        // PANEL_NUMBER:
        // PANEL_REVISION:
        // BOARD_ALL:
        // BOARD_PICTURE:
        return line.includes('PRASID')
            || line.includes('PROJECT')
            || line.includes('ASSY_NUMBER')
            || line.includes('ASSY_REVISION')
            || line.includes('PANEL_NUMBER')
            || line.includes('PANEL_REVISION')
            || line.includes('BOARD_ALL')
            || line.includes('BOARD_PICTURE');
    }

}