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

    // Example table template

    // >TABLE:stLCAD_LAYER_DATA
    // 3
    // 41
    // FIELDS:MNlayer_id|OAlayn_name|MNlayn_flip_layer_id
    // 1|"COPPERCOMMON"|0
    // 2|"COPPER___TOP"|3
    // 3|"COPPERBOTTOM"|2

    switch (true) {

        //primary row >
        case line.startsWith('>'):
            line = line.replace('>', '');

            switch (true) {
                //TABLE row
                case line.startsWith('TABLE'):
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

        //FIELDS row
        case line.startsWith('FIELDS'):
            line = line.replace('FIELDS:', '');

            return CURRENT_TABLE.setColumns(line);

        //save the record
        default:
            // 3|"COPPERBOTTOM"|2
            line = line.split('|')

            if (line.length > 1) {
                return CURRENT_TABLE.insertRecord(line);
            }
    }
}