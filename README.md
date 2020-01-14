
# cj-parser


### Summary 

The cj-parser is a component, part of a pet project, that is responsible for parsing .cj files and import them into a target database.

Cj files contain description of hardware boards, properties of the components used for such boards, details and coordinates of how those board circuits are composed. 
The aim of the whole project (which was unfortunately eventually abandoned) was to use this data and visualize such boards with their circuits and layers.
These files are still good for experimentation purposes as they are medium in size (15-20MB) and it's a challenge to parse and interpret them.
You can find an example of such file in `./mocks/0.cj`

This component currently supports two target databases: MongoDB and PostgreSQL.
Because we needed to also discover the data, the database structure (models and tables) is dynamically created by the parser with information from the file, but this uncertainty forces the parser to have some drawbacks (e.g. assuming as every column to be of type string/varchar) 

Aims to provide 3 data ingestion/migration strategies:
- forceCreate - will forcefully insert every record in batches; this achieves maximum insert speed but creates duplicates
- checkIfExists - will check the existance of records before inserting; does not create duplicates but loses speed
- createOrUpdate - will check the existance and update existing record in case there are any changes

### Config

```json
{

	"app": {
		"logLevel": "debug",				//log level
		"targetFilePath": "./mocks/0.cj",		// target file path 
		"targetDatabaseClient": "mongo",                // target database
		"migrationStrategy": "checkIfExists",		// forceCreate, checkIfExists or createOrUpdate
		"insertBatchSize": 5000,			//insert batch size for forceCreate mode
                "singleInsertConcurrency": 5			//insert concurrency for checkIfExists and createOrUpdate modes
	},
	"postgres": {					        // postgres connection details
		"host": "localhost",
		"port": "5432",
		"username": "postgres",
		"password": "postgres",
		"database": "schema_metrics"
	},
	"mongo": {						// mongo connection details
		"connString": "mongodb://localhost/schema_metrics"
	}
}
```

### Setup

Adjust component configuration `./config/default.json` and (if needed) pm2 configuration `./config/pm2-ecosystem.config.js` to your environment

Install dependencies `npm install`

Run via node `node index.js` or `npm start`
or
Run via pm2 `pm2 start ./config/pm2-ecosystem.config.js` or `npm run pm2`


### TODOs:
- more research on data format and types
- instead of infering every field as string, attempt to add integer capabilities
- configurable migration strategy createOrUpdate (decreases speed due to the extra check but doesn't create duplicates, and also updated already inserted data - this need more data inspection/research and knowledge of the schema)
- unit tests
- instrumentation
