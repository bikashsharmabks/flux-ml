var Influx = require('influx'),
	debug = require('debug')('influx');
/**
 * Influx Database module.
 * @module framework/influx
 */
var influxDb = module.exports = {
	init: init
}

var schema = [{
	measurement: 'tweets',
	fields: {
		val: Influx.FieldType.INTEGER
	},
	tags: [
		'clientId', 'payerId', 'channelId', 'transactionTypeId'
	]
}, {
	measurement: 'inprocess',
	fields: {
		val: Influx.FieldType.INTEGER
	},
	tags: [
		'clientId', 'payerId', 'channelId', 'transactionTypeId'
	]
}];


/**
 * @param  {config object }
 * @return {null}
 */
function init(config) {

	var dbName = config.dbName ? config.dbName : 'tweet_timeseries';
	var host = config.host ? config.host : 'localhost';
	var port = config.port ? config.port : '8086';

	var influx = new Influx.InfluxDB({
		host: host,
		port:port,
		database: dbName
	});


	influxDb.influxClient = influx;

	setUpDatabase(influx, host, dbName);

}

function setUpDatabase(influx, host, dbName) {

	var influx = new Influx.InfluxDB({
		host: host,
		database: dbName,
		schema: schema
	});


	influx.getDatabaseNames()
		.then(names => {
			if (!names.includes(dbName)) {
				return influx.createDatabase(dbName);
			}
		})
		.then(() => {
			debug('Influx database already setup.');
		})
		.catch(err => {
			throw new Error('Error creating Influx database!');
		});
}