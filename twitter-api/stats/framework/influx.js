var Influx = require('influx');

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
		locationCount: Influx.FieldType.INTEGER, // 1
		verifiedCount: Influx.FieldType.INTEGER, // 1
		linkCount: Influx.FieldType.INTEGER, // calculate
		retweetCount: Influx.FieldType.INTEGER, // 1
		imageCount: Influx.FieldType.INTEGER, // calculate how many coming.
		HashtagCount: Influx.FieldType.INTEGER, // calculate how many coming.
	},
	tags: [
		'hashtag', 'location', 'verified', 'link', 'retweet', 'image', 'hashtag', 'mentions',
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
		port: port,
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
			console.log('Influx database already setup.');
		})
		.catch(err => {
			console.log(err)
			throw new Error('Error creating Influx database!');
		});
}