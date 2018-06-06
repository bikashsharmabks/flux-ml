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


function getMinTime(data) {
	//data = data.filter(d => d.count);
	if (data.length > 1)
		return data.reduce((min, d) => d.time < min ? d.time : min, data[0].time);
	else if (data.length == 1)
		return data[0].time;
	else if (data.length == 0)
		return null

}

function getMaxTime(data) {
	//data = data.filter(d => d.count);
	if (data.length > 1)
		return data.reduce((max, d) => d.time > max ? d.time : max, data[0].time);
	else if (data.length == 1)
		return data[0].time;
	else if (data.length == 0)
		return null
}

function getFormattedLabelData(label) {
	var formattedLabel = [];
	for (var i = 0; i < label.length; i++) {
		formattedLabel.push(label[i].format("HH:mm"))
	}
	return formattedLabel;
}

function formatActivityData(data) {

	var tweets = (data["tweet"]),
		retweets = data["retweet"],
		quotes = data["quote"],
		favorite = data["favorite"];

	tweets = tweets.filter(d => d.count);
	retweets = retweets.filter(d => d.count);
	quotes = quotes.filter(d => d.count);
	favorite = favorite.filter(d => d.count);

	var minTweetTime = getMinTime(tweets);
	var totalTime = []
	if (minTweetTime) {
		totalTime.push({
			time: minTweetTime
		})
		minTweetTime = moment(minTweetTime).utc();
	}
	console.log(minTweetTime)

	var minRetweetTime = getMinTime(retweets)
	if (minRetweetTime) {
		totalTime.push({
			time: minRetweetTime
		})
		minRetweetTime = moment(minRetweetTime).utc();
	}
	console.log(minRetweetTime)

	var minQuoteTime = getMinTime(quotes);
	if (minQuoteTime) {
		totalTime.push({
			time: minQuoteTime
		})
		minQuoteTime = moment(minQuoteTime).utc();
	}
	console.log(minQuoteTime)

	var minFavoriteTime = getMinTime(favorite);
	if (minFavoriteTime) {
		totalTime.push({
			time: minFavoriteTime
		})
		minFavoriteTime = moment(minFavoriteTime).utc();
	}
	console.log(minFavoriteTime)


	var maxTweetTime = getMaxTime(tweets);
	if (maxTweetTime) {
		totalTime.push({
			time: maxTweetTime
		})
		maxTweetTime = moment(maxTweetTime).utc();
	}

	var maxRetweetTime = getMaxTime(retweets)
	if (maxRetweetTime) {
		totalTime.push({
			time: maxRetweetTime
		})
		maxRetweetTime = moment(maxRetweetTime).utc();
	}
	var maxQuoteTime = getMaxTime(quotes);
	if (maxQuoteTime) {
		totalTime.push({
			time: maxQuoteTime
		})
		maxQuoteTime = moment(maxQuoteTime).utc();
	}

	var maxFavoriteTime = getMaxTime(favorite);
	if (maxFavoriteTime) {
		totalTime.push({
			time: maxFavoriteTime
		})
		maxFavoriteTime = moment(maxFavoriteTime).utc();
	}

	// console.log(minTweetTime, minRetweetTime, minQuoteTime, minFavoriteTime)
	var minTime = moment(getMinTime(totalTime)).utc();
	var maxTime = moment(getMaxTime(totalTime)).utc();

	console.log(minTime, "---", maxTime)
	var label = [];
	while (minTime.isSameOrBefore(maxTime, 'minutes')) {
		label.push(moment(new Date(_.cloneDeep(minTime))).utc());
		minTime.add(1, "m");
	}
	var labelCount = label.length;
	var tweetData = [];


	var i = 0;
	var tweetData = []
	if (tweets.length > 0) {
		_.each(tweets, function(td) {
			tweetData.push(td.count);
			// if (td.count == null) {
			// 	tweetData.push(0);
			// }else{
			// 	tweetData.push(td.count);	
			// }
			i++;
		});
		// while (label[i].isBefore(minTweetTime, 'minutes')) {
		// 	tweetData.push(0);
		// 	i++;
		// }

		// _.each(tweets, function(td) {
		// 	console.log("td", td)
		// 	if (td.count != null) {
		// 		var total = td.count// + (tweetData.length - 1);
		// 		tweetData.push(total);
		// 		i++;
		// 	}
		// 	//var total = td.count + (tweetData.length - 1 > 0 ? tweetData[tweetData.length - 1] : 0);
		// 	//tweetData.push(total);
		// 	//i++
		// })

		// while (i <= label.length - 1) {
		// 	tweetData.push(tweetData.length - 1 > 0 ? tweetData[tweetData.length - 1] : 0);
		// 	i++;
		// }
	}

	var j = 0;
	var retweetData = []
	if (retweets.length > 0) {
		_.each(retweets, function(td) {
			retweetData.push(td.count);
			// if (td.count == null) {
			// 	retweets.push(0);
			// }else{
			// 	retweets.push(td.count);	
			// }
			j++;	
		});
		// while (label[j].isBefore(minRetweetTime, 'minutes')) {
		// 	retweetData.push(0);
		// 	j++;
		// }
		// _.each(retweets, function(td) {
		// 	var total = td.count + (retweetData.length - 1 > 0 ? retweetData[retweetData.length - 1] : 0)
		// 	retweetData.push(total);
		// 	j++
		// })
		// while (j <= label.length - 1) {
		// 	retweetData.push(retweetData.length - 1 > 0 ? retweetData[retweetData.length - 1] : 0);
		// 	j++;
		// }
	}


	var k = 0;
	var quoteData = []
	if (quotes.length > 0) {
		_.each(quotes, function(td) {
			quoteData.push(td.count);
			// if (td.count == null) {
			// 	retweets.push(0);
			// }else{
			// 	retweets.push(td.count);	
			// }
			k++;
		});
		// while (label[k].isBefore(minQuoteTime, 'minutes')) {
		// 	quoteData.push(0);
		// 	k++;
		// }
		// _.each(quoteData, function(td) {
		// 	var total = td.count + (quoteData.length - 1 > 0 ? quoteData[quoteData.length - 1] : 0)
		// 	quoteData.push(total);
		// 	k++
		// })
		// while (k <= label.length - 1) {
		// 	quoteData.push(quoteData.length - 1 > 0 ? quoteData[quoteData.length - 1] : 0);
		// 	k++;
		// }
	}

	var m = 0;
	var favoriteData = []
	if (favorite.length > 0) {
		while (label[m].isBefore(minFavoriteTime, 'minutes')) {
			favoriteData.push(0);
			m++;
		}
		_.each(favoriteData, function(td) {
			var total = td.count + (favoriteData.length - 1 > 0 ? favoriteData[favoriteData.length - 1] : 0)
			favoriteData.push(total);
			m++
		})
		while (m <= label.length - 1) {
			favoriteData.push(favoriteData.length - 1 > 0 ? favoriteData[favoriteData.length - 1] : 0);
			m++;
		}
	}

	console.log(label.length, tweetData.length, retweetData.length, favoriteData.length, quoteData.length)

	return {
		labels: getFormattedLabelData(label),
		tweetData: tweetData,
		retweetData: retweetData,
		quoteData: quoteData,
		favoriteData: favoriteData
	}
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
		//console.log(points);

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
					console.log("No of user info fetched from twitter- ", usrData.length)
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
			return resolve(formatActivityData(activityTSData));
		}).catch(function(err) {
			console.log(err)
			return reject(new Error("Something went wrong."));
		})
	})
}

// var data = {
// 	"quote": [{
// 		"time": "2018-06-05T10:59:00.000Z",
// 		"count": null,
// 		"activityType": "tweet"
// 	}],
// 	"favorite": [],
// 	"tweet": [],
// 	"retweet": [{
// 		"time": "2018-06-05T10:10:00.000Z",
// 		"count": 1,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:11:00.000Z",
// 		"count": 2,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:12:00.000Z",
// 		"count": 4,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:13:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:14:00.000Z",
// 		"count": 3,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:15:00.000Z",
// 		"count": 4,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:16:00.000Z",
// 		"count": 4,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:17:00.000Z",
// 		"count": 5,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:18:00.000Z",
// 		"count": 5,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:19:00.000Z",
// 		"count": 2,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:20:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:21:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:22:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:23:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:24:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:25:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:26:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:27:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:28:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:29:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:30:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:31:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:32:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:33:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:34:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:35:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:36:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:37:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:38:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:39:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:40:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:41:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:42:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:43:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:44:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:45:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:46:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:47:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:48:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:49:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:50:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:51:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:52:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:53:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:54:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:55:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:56:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:57:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:58:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T10:59:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:00:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:01:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:02:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:03:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:04:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:05:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:06:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:07:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:08:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:09:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:10:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:11:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:12:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:13:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:14:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:15:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:16:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:17:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}, {
// 		"time": "2018-06-05T11:18:00.000Z",
// 		"count": null,
// 		"activityType": "retweet"
// 	}]
// }


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