var path = require('path'),
	Influx = require('influx'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	influx = require('./../framework/influx').influxClient,
	moment = require('moment');

var DB_NAME = "tweet_timeseries";

var InfluxService = module.exports = {
	writeActivityMeasurement: writeActivityMeasurement
}



function writeActivityMeasurement(tagData, fieldData) {
	return new Promise(function(resolve, reject) {
		var locationCount = 1,
			verifiedCount = 1,
			activityCount = 1;

		influx.writePoints([{
			measurement: "activity",
			tags: tagData,
			fields: fieldData
		}], {
			precision: 'u',
			database: DB_NAME,
		}).then(function(res) {
			return resolve(tagData);
		}).catch(err => {
			console.log(`Error saving data to InfluxDB! ${err.stack}`)
			return reject(err);
		})
	});
}


var tagData = {

	location: "US", // 1
	verified: "true", // 1
	activityType: "tweet", // 1
	userId: "ad3",
	hashtag:"trump"
}

var fieldData = {
	locationCount: 1,
	verifiedCount: 1,
	activityCount: 1,
	userCount: 1,
	hashtagCount: 1
}


// var query = `select count(val) from activity where verified = 'true'  GROUP by userId `
//         console.log(query);

//         influx.query(query).then(results => {

//             _.each(results, function(res) {
//                 console.log('res------------', res)

//             })


//         }).catch(function(err) {
//             //console.log(err)
//             return reject(new Error("Something went wrong."));
//         })

// setInterval(function() {
// 	writeActivityMeasurement(tagData, fieldData).then(function(res) {
// 		console.log(res)
// 	}).catch(function(err) {
// 		console.log(err)
// 	})
// }, 2000)

// select count(count) from(select count(userCount) from activity where verified = 'true'	GROUP by userId)



// select sum(count) from(select count(userCount) from activity where verified = 'false'	GROUP by userId)

// select count(val) from activity where verified = 'true'  GROUP by userId 
// 
// select * from  (select count(val) from activity where verified = 'true'  GROUP by userId )
// 
// select top(count,1) , userId from  (select count(val) from activity where verified = 'true'  GROUP by userId )
// 
// select distinct("userId") from activity

// select(Top(val , userId, 3)), userId  from activity where verified = 'true'

// select sum(locationCount)   from minute_activity_data GROUP BY time(1m)
// select * from activity where location='bihar'
// select (distinct(location)) from activity where location='bihar'
// select distinct("location") from (select "location" from minute_activity_data)
// SELECT COUNT(DISTINCT(locationCount)) FROM minute_activity_data
// SELECT DISTINCT(location) FROM activity
// SELECT locationCount,DISTINCT(location) FROM activity
// 
// SELECT count(distinct(location)) FROM (SELECT value, location FROM activity)
// 
// SELECT COUNT(distinct(locationCount)) FROM  activity WHERE location = 'bihar' GROUP BY location