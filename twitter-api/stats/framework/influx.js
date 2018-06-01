var Influx = require('influx');

/**
 * Influx Database module.
 * @module framework/influx
 */
var influxDb = module.exports = {
	init: init
}

var schema = [{
	measurement: 'activity',
	fields: {
		locationCount: Influx.FieldType.INTEGER,
		verifiedCount: Influx.FieldType.INTEGER,
		activityCount: Influx.FieldType.INTEGER,
		userCount: Influx.FieldType.INTEGER,
		hashtagCount: Influx.FieldType.INTEGER
	},
	tags: [
		'hashtag', 'location', 'verified', "activityType", "userId"
	]
}, {
	measurement: 'user_mention',
	fields: {
		userCount: Influx.FieldType.INTEGER
	},
	tags: [
		'hashtag',
		"userId"
	]
},{
	measurement: 'hashtag',
	fields: {
		hashtagCount: Influx.FieldType.INTEGER
	},
	tags: [
		'hashtag',
		"otherHashtag"
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
			// addContinuousQuery(influx);
		})
		.catch(err => {
			console.log(err)
			throw new Error('Error creating Influx database!');
		});
}


function addContinuousQuery(influx) {

	if (!influx || !influx.query) {
		console.log('Please start influxDB.')
		return;
	}

	influx.showContinousQueries().then(function(res) {
		if (res.length < 1) {
			//  activity  minute data
			influx.query(`CREATE CONTINUOUS QUERY cq_min_activity ON tweet_timeseries
 RESAMPLE EVERY 10s
BEGIN
  SELECT sum("locationCount") as locationCount , 
  sum("verifiedCount") as verifiedCount, sum("activityCount") 
  as activityCount  INTO "minute_activity_data" FROM "activity" GROUP BY time(1m),*  
END`).then(results => {
				console.log('CONTINUOUS QUERY cq_min_activity.')
			})
		}
	})
}