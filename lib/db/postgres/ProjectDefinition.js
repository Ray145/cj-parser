'use strict';

const knex = require('./index').getClient();
const logger = require('../../../logger').getLogger();

module.exports = class ProjectDefinition {

    constructor() {

    }

    static async build() {
        try {
            //Create the Project Definition table of what we know so far

            // PRASID:50335
            // PROJECT:ALUTRI
            // ASSY_NUMBER:ALC3-8DG59237ABAA
            // ASSY_REVISION:04-008
            // PANEL_NUMBER:
            // PANEL_REVISION:
            // BOARD_ALL:
            // BOARD_PICTURE:
            logger.info('postgres.model.ProjectDefinition - Initialising the PROJECT_DEFINITION table');
            const doesTableExist = await knex.schema.hasTable('PROJECT_DEFINITION');

            if (!doesTableExist) {
                await knex.schema.createTable('PROJECT_DEFINITION', function (t) {
                    t.increments('id').primary();
                    t.integer('PRASID', 100);
                    t.string('PROJECT', 100);
                    t.string('ASSY_NUMBER', 100);
                    t.string('ASSY_REVISION', 100);
                    t.string('PANEL_NUMBER', 100);
                    t.string('PANEL_REVISION', 100);
                    t.string('BOARD_ALL', 100);
                    t.string('BOARD_PICTURE', 100);
                });
            }
            logger.info('postgres.model.ProjectDefinition - Finished initialising the PROJECT_DEFINITION table');
        } catch (err) {
            logger.error(`postgres.model.ProjectDefinition - Errpr while initialising the PROJECT_DEFINITION table; with message: ${err.message}`);
            logger.error(err.stack);
            throw new Error(err);
        }
    }

    static async insert(record) {
        try {
            await knex('PROJECT_DEFINITION').insert(record);
        } catch (err) {
            throw new Error(err);
        }
    }
}