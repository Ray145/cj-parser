'use strict';

const moment = require('moment');


module.exports = {
    inferType
};

/**
 * Attempts to infer the type of the passed in value
 * 
 * It's still opinionated as I'm only able to check the very first record of every table 
 * 
 * @param {*} value       the value to infer the type for
 */
function inferType(value) {

    //dates have a weird/non-standard format
    const isDate = moment(value, 'DD-MM-YYYY', true).isValid();

    const isNumber = !isNaN(parseInt(value, 10)) && !value.includes('/');

    switch (true) {
        case isDate:
            return Date;

        case isNumber:
            return Number;

        default:
            return String;
    }
}