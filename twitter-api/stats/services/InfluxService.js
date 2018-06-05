var path = require('path'),
	Influx = require('influx'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	influx = require('./../framework/influx').influxClient,
	Twitter = require('./../framework/twitter'),
	moment = require('moment');

var DB_NAME = "tweet_timeseries";

var InfluxService = module.exports = {
	writeActivityMeasurement: writeActivityMeasurement,
	writeUserMentionMeasurement: writeUserMentionMeasurement,
	writeHashtagMeasurement: writeHashtagMeasurement,
	getStatsByHashtag: getStatsByHashtag,
	getTopUserMention: getTopUserMention,
	getTopRelatedHashTag: getTopRelatedHashTag,
	getActivityTimeSeriesData: getActivityTimeSeriesData,
	getEmotionCount: getEmotionCount
}



function writeActivityMeasurement(tweetData) {
	return new Promise(function(resolve, reject) {

		var location = tweetData.user_location ? tweetData.user_location : undefined,
			verified = tweetData.user_verified,
			activityType = tweetData.activity_type,
			userId = tweetData.user_id ? tweetData.user_id : undefined,
			hashtag = tweetData.hashtag,
			sentiment = tweetData.sentiment;

		var fieldData = {
			"locationCount": location ? 1 : 0,
			"verifiedCount": 1,
			"activityCount": 1,
			"userCount": 1,
			"hashtagCount": 1,
			"emotionCount": 1
		};

		var tagData = {
			'hashtag': hashtag,
			'location': location,
			'verified': verified,
			"activityType": activityType,
			"userId": userId,
			"emotion": sentiment
		}

		influx.writePoints([{
			measurement: "activity",
			tags: tagData,
			fields: fieldData,
			timestamp: new Date(parseInt(tweetData.timestamp_ms))
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

function writeUserMentionMeasurement(tweetData) {
	return new Promise(function(resolve, reject) {

		var hashtag = tweetData.hashtag,
			measurement = "user_mention";

		var points = [];

		_.forOwn(tweetData, function(value, key) {

			if (key.includes("user_mention_screen_name_")) {
				if (tweetData[key]) {
					points.push({
						measurement: measurement,
						tags: {
							'hashtag': hashtag,
							"userScreenName": tweetData[key],
							"userName": tweetData[key.replace("user_mention_screen_name_", "user_mention_name_")]
						},
						fields: {
							userCount: 1
						},
						timestamp: new Date(parseInt(tweetData.timestamp_ms))
					})
				}
			}
		});
		console.log(points)

		influx.writePoints(points, {
			precision: 'u',
			database: DB_NAME,
		}).then(function(res) {
			return resolve(points);
		}).catch(err => {
			console.log(`Error saving data to InfluxDB! ${err.stack}`)
			return reject(err);
		})
	});
}


function writeHashtagMeasurement(tweetData) {
	return new Promise(function(resolve, reject) {

		var hashtag = tweetData.hashtag,
			measurement = "hashtag";

		var points = [];

		_.forOwn(tweetData, function(value, key) {

			if (key.includes("hashtag_")) {
				if (tweetData[key]) {
					points.push({
						measurement: measurement,
						tags: {
							'hashtag': hashtag,
							"otherHashtag": tweetData[key]
						},
						fields: {
							hashtagCount: 1
						},
						timestamp: new Date(parseInt(tweetData.timestamp_ms))
					})
				}
			}
		});
		console.log(points)

		influx.writePoints(points, {
			precision: 'u',
			database: DB_NAME,
		}).then(function(res) {
			return resolve(points);
		}).catch(err => {
			console.log(`Error saving data to InfluxDB! ${err.stack}`)
			return reject(err);
		})
	});
}


function getStatsByHashtag(hashtag) {

	return new Promise(function(resolve, reject) {

		var statObj = {};

		var verifiedCountQuery = `select count(verifiedUserCount) from(select count(userCount) 
	as verifiedUserCount from activity 
	where verified = 'true' and hashtag = '${hashtag}' group by userId)`

		var userInteractedQuery = `select count(userCount) 
		from(select count(userCount) as userCount from activity 
		where hashtag = '${hashtag}' GROUP by  userId)`

		var totalActivityQuery = `select count(activityCount) from activity 
		where hashtag = '${hashtag}'`

		console.log(verifiedCountQuery, userInteractedQuery);

		influx.query(verifiedCountQuery).then(function(verifiedResult) {
			_.each(verifiedResult, function(res) {
				statObj["verifiedProfileCount"] = res.count
			})
			return influx.query(userInteractedQuery)
		}).then(function(userInteractedResult) {
			_.each(userInteractedResult, function(res) {
				statObj["userInteractedCount"] = res.count
			})
			return influx.query(totalActivityQuery);
		}).then(function(allActivityResult) {
			_.each(allActivityResult, function(res) {
				statObj["totalActivityCount"] = res.count
			})
			return resolve(statObj);
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}

var userData = {};

function getTopUserMention(hashtag) {

	return new Promise(function(resolve, reject) {

		var topMentions = []

		var topMentionQuery = `select top(userCount,userScreenName,3) as count 
		  from  (select sum(userCount) as userCount from user_mention  where hashtag = '${hashtag}'
		 GROUP by userScreenName)`

		influx.query(topMentionQuery).then(function(topMentionRes) {
			if (topMentionRes.length == 0) {
				return resolve(topMentions)
			} else {
				var userDataToFetch = []
				_.each(topMentionRes, function(res) {

					if (!userData[res.userScreenName]) {
						userDataToFetch.push(res.userScreenName)
					}

					topMentions.push({
						"count": res.count,
						"userScreenName": res.userScreenName
					})
				});
				//console.log(userData, userDataToFetch)

				Twitter.getUserInfoByScreenName(userDataToFetch.toString()).then(function(usrData) {
					console.log("No of user info fetched from twitter- ",usrData.length)
					_.each(usrData, function(urData) {
						userData[urData.screen_name] = {
							verified: urData.verified,
							profileUrl: urData.profile_image_url
						}
					})
					_.each(topMentions, function(tm) {
						if (userData[tm.userScreenName]) {
							tm.verified = userData[tm.userScreenName].verified;
							tm.profileUrl = userData[tm.userScreenName].profileUrl;
						}
					})

					return resolve(topMentions);
				}).catch(function(err) {
					return resolve(topMentions);
				});
			}
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}

function getEmotionCount(hashtag) {

	return new Promise(function(resolve, reject) {


		var emotionQuery = `select sum(emotionCount) as count from activity where hashtag = '${hashtag}' group by emotion`



		influx.query(emotionQuery).then(function(emotionRes) {
			var emotions = []
			_.each(emotionRes, function(res) {
				emotions.push({
					"count": res.count,
					"sentiment": res.emotion
				})
			})
			return resolve(emotions);
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}


function getTopRelatedHashTag(hashtag) {

	return new Promise(function(resolve, reject) {

		var topHashtags = []

		var topHashtagQuery = `select top(hashtagCount,otherHashtag,3) as count 
		  from  (select sum(hashtagCount) as hashtagCount from hashtag  where hashtag = '${hashtag}'
		 GROUP by otherHashtag)`



		influx.query(topHashtagQuery).then(function(topHashtagRes) {
			_.each(topHashtagRes, function(res) {
				topHashtags.push({
					"count": res.count,
					"hashtag": res.otherHashtag
				})
			})
			return resolve(topHashtags);
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}

// select sum(emotionCount) as count from activity where hashtag = 'ipl' GROUP by emotion, time(1m)
function getActivityTimeSeriesData(hashtag) {

	return new Promise(function(resolve, reject) {

		var activityTSData = {
			quote: [],
			tweet: [],
			favorite: [],
			retweet: []
		}

		var activityTSQuery = `select sum(activityCount) as count from 
		activity where hashtag = '${hashtag}' GROUP by activityType, time(1m)`



		influx.query(activityTSQuery).then(function(activityData) {
			_.each(activityData, function(res) {
				if (res.activityType == "quote" || res.activityType == "tweet" || res.activityType == "retweet" ||
					res.activityType == "favorite") {
					activityTSData[res.activityType].push(res)
				}
			});
			return resolve(activityTSData);
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}


// select sum(emotionCount) from activity where hashtag = 'ipl' group by emotion



// var tagData = {

// 	location: "US", // 1
// 	verified: "true", // 1
// 	activityType: "tweet", // 1
// 	userId: "ad3",
// 	hashtag: "trump"
// }

// var fieldData = {
// 	locationCount: 1,
// 	verifiedCount: 1,
// 	activityCount: 1,
// 	userCount: 1,
// 	hashtagCount: 1
// }

// select sum(activityCount) as count from activity GROUP by activityType, time(1 m)

// select sum(count) from (select sum(activityCount) as count from activity GROUP by activityType) GROUP by time(1m)
// select top(userCount,userScreenName,3) as count from  (select sum(userCount) as userCount from user_mention  GROUP by userScreenName)
// select top(hashtagCount,otherHashtag,3) as count from  (select sum(hashtagCount) as hashtagCount from hashtag  GROUP by otherHashtag)

// var r = {
// 	"user_verified": false,
// 	"user_mention_screen_name_5": "",
// 	"user_friends_count": 1500,
// 	"coordinates": "",
// 	"url_4": "",
// 	"source": "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
// 	"user_followers_count": 6617,
// 	"hashtag_2": "bypolls",
// 	"activity_type": "retweet",
// 	"user_mention_name_4": "",
// 	"hashtag_5": "",
// 	"user_mention_screen_name_4": "",
// 	"user_mention_name_5": "",
// 	"user_mention_name_1": "CA. RAJEEV GUPTA",
// 	"user_mention_screen_name_2": "",
// 	"url_3": "",
// 	"user_mention_screen_name_3": "",
// 	"timestamp_ms": "1527846312433",
// 	"user_mention_screen_name_1": "RajeevGuptaCA",
// 	"user_profile_image_url": "http://pbs.twimg.com/profile_images/905860334988148737/0N8ZNeZ5_normal.jpg",
// 	"hashtag_3": "",
// 	"favorite_count": 0,
// 	"user_mention_name_3": "",
// 	"retweeted_status_id": "1002459570533326848",
// 	"user_name": "ANAND",
// 	"url_1": "https://t.co/jQtzzHkakG",
// 	"url_5": "",
// 	"hashtag": "bypolls",
// 	"hashtag_4": "",
// 	"lang": "en",
// 	"id": "1002486210080542720",
// 	"user_statuses_count": 112722,
// 	"user_screen_name": "dubeyback",
// 	"hashtag_1": "bypoll",
// 	"text": "RT @RajeevGuptaCA: How can the BJP still win more than 400 seats in the 2019 general elections?\nhttps://t.co/jQtzzHkakG\n#bypoll #bypolls #B\u2026",
// 	"quoted_status_id": "",
// 	"user_profile_background_image_url": "",
// 	"url_2": "",
// 	"user_mention_name_2": "",
// 	"user_location": " India"
// }


// setTimeout(function() {
// 	writeUserMentionMeasurement(r)
// 	writeHashtagMeasurement(r)
// }, 2000)

// select count(userCount) from(select count(userCount) as userCount from activity where hashtag = 'ipl' GROUP by  userId)


// setInterval(function() {
// 	writeActivityMeasurement(tagData, fieldData,new Date().getTime()).then(function(res) {
// 		console.log(res)
// 	}).catch(function(err) {
// 		console.log(err)
// 	})
// }, 2000)

// select count(verifiedCount) from(select count(userCount) as verifiedCount from activity where verified = 'true' and hashtag = 'ipl' group by userId)



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