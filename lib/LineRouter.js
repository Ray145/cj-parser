'use strict';

const _ = require('lodash');

const ProjectDefinition = require('./structures/ProjectDefinition');
const TableGenerator = require('./structures/TableGenerator');

module.exports = {
    routeLine,
    getStats
};

/**
 * Stats of the current run
 */
const STATS = {};
function getStats() { return STATS; }

/**
 * Holds the project definition before it's saved to db
 */
const PROJECT_DEFINITION = new ProjectDefinition();
/**
 * Holds one table at a time
 * See TableWriter structure
 */
let CURRENT_TABLE = null;

/**
 * Routes the lines and uses flags to trigger saves or exports
 * 
 * @param {String}      line                the line received by the readline stream
 */
async function routeLine(line) {

    // Example table pattern
    // >TABLE:stLCAD_LAYER_DATA                                         //table name
    // 3                                                                //number of columns
    // 41                                                               //number of rows
    // FIELDS:MNlayer_id|OAlayn_name|MNlayn_flip_layer_id               //columns array
    // 1|"COPPERCOMMON"|0                                               //example of data
    // 2|"COPPER___TOP"|3
    // 3|"COPPERBOTTOM"|2

    const isPrimaryRow = line.startsWith('>'); 
    const isTableColumnsRow = line.startsWith('FIELDS');
    switch (true) {

        case isPrimaryRow:
            line = line.replace('>', '');

            const isTableNameRow = line.startsWith('TABLE'); 
            switch (true) {

                case isTableNameRow:
                    line = line.replace('TABLE:', '');

                    if (PROJECT_DEFINITION.hasData()) {
                        await PROJECT_DEFINITION.saveAndDeactivate();
                    }

                    if (CURRENT_TABLE) {
                        await CURRENT_TABLE.saveExistingBuffer();

                        _.assign(STATS, CURRENT_TABLE.getStats());
                    }

                    CURRENT_TABLE = new TableGenerator(line);
                    return;

                case ProjectDefinition.isPartOfProjectDefinition(line):
                    return PROJECT_DEFINITION.updateProjectDefinition(line);
            }
            break;

        case isTableColumnsRow:
            line = line.replace('FIELDS:', '');

            return CURRENT_TABLE.setColumns(line);

        default:
            line = line.split('|');

            if (line.length > 1) {
                return CURRENT_TABLE.insertRecord(line);
            }
    }
}