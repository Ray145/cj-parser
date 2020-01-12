'use strict';

const _ = require('lodash');
const LineByLineReader = require('line-by-line');

const config = require('config');
const targetFilePath = config.get('app.targetFilePath');

const logger = require('./logger.js').getLogger();


(async function initialise() {

    try {
        logger.info(`Main - Initialising the database connection..`);
        await require('./lib/db').initialise();
        logger.info(`Main - Finished to initialise the database connection..`);
    } catch (err) {
        logger.error(`Main - Error while initialising the database connection; with message: ${err.message}`);
        logger.error(err.stack);
        throw new Error(err);
    }

    const LineRouter = require('./lib/LineRouter');
    logger.info(`Main - Initiating the readable stream to target: ${targetFilePath}`);

    const startTimeSnapshot = process.hrtime();

    const readLineStream = new LineByLineReader(targetFilePath);
    readLineStream
        .on('line',
            async (line) => {
                readLineStream.pause();

                try {
                    await LineRouter.routeLine(line);
                } catch (err) {
                    logger.error(`Main - Error while processing line: ${line}; with message: ${err.message}`);
                    logger.error(err.stack);
                    throw new Error(err);
                }

                readLineStream.resume();
            }
        )
        .on('error', function (err) {
            logger.error(`Main - Read stream has errored with: ${err.message}`);
            logger.error(err.stack);
            process.exit(1);
        })
        .on('end', function () {
            const endTimeSnapshot = process.hrtime(startTimeSnapshot);
            logger.info(`Main - Finished parsing the file ${endTimeSnapshot[0]}s, ${endTimeSnapshot[1] / 1000000}ms`);

            logger.info(' ');
            logger.info(` *********************   STATS   ********************* `);
            logger.info(' ');
            const runStats = LineRouter.getStats();
            for (const tableName in runStats) {
                logger.info(`Table ${tableName} had ${runStats[tableName].toLocaleString()} entries`);
            }
            logger.info(' ');
            logger.info(`Total entries: ${_.sum(_.values(runStats)).toLocaleString()}`);
            process.exit(0);
        });

})().catch(err => console.error(err));