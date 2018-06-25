var path = require('path'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request'),
	loki = require('../framework/loki'),
	moment = require('moment');

var PYTHON_SERVER_HOST = "http://twitter-stream:5000"
// var PYTHON_SERVER_HOST = "http://localhost:5000"
/**
 * [RequestHandler handles api request
 * @type {[type]}
 */
var RequestHandler = module.exports = {
	startHashtagJob: startHashtagJob,
	stopHashtagJob: stopHashtagJob,
	getAllHashtags: getAllHashtags,
	getStatsByHashtag: getStatsByHashtag,
	getTopUserMention: getTopUserMention,
	getTopRelatedHashTag: getTopRelatedHashTag,
	getEmotionCount: getEmotionCount,
	getActivityTimeSeriesData: getActivityTimeSeriesData,
	getGenderCount: getGenderCount
}


function startHashtagJob(req, res, next) {
	var hashtag = req.params.hashtag;
	var requestURL = PYTHON_SERVER_HOST + "/api/schedule-hashtags/" + hashtag + "/start"
	request.get(requestURL)
		.on('response', function(response) {
			res.status(response.statusCode);
			if (response.statusCode == 200) {
				loki.insertHashtag(hashtag);
				console.log(loki.findAllHashtag())
				res.send('Started job for Hashtag- #' + req.params.hashtag);
			} else
				res.send('Something went wrong while starting job for hashtag- #' + req.params.hashtag + ".   " + JSON.stringify(response));
			next();
		}).on('error', function(err) {
			res.status(500);
			res.send("Problem with PYTHON_SERVER ," + JSON.stringify(err));
			next();
		})
}


function stopHashtagJob(req, res, next) {
	var hashtag = req.params.hashtag;
	var requestURL = PYTHON_SERVER_HOST + "/api/schedule-hashtags/" + hashtag + "/stop"
	request.get(requestURL)
		.on('response', function(response) {
			res.status(response.statusCode);
			if (response.statusCode == 200) {
				loki.updateHashtag(hashtag);
				console.log(loki.findAllHashtag())
				res.send('Stopped job for Hashtag- #' + req.params.hashtag);
			} else
				res.send('Something went wrong while starting job for hashtag- #' + req.params.hashtag + ".   " + JSON.stringify(response));
			next();
		}).on('error', function(err) {
			res.status(500);
			res.send("Problem with PYTHON_SERVER ," + JSON.stringify(err));
			next();
		})
}



function getStatsByHashtag(req, res, next) {
	var hashtag = req.params.hashtag;
	var InfluxService = require('./InfluxService');
	InfluxService.getStatsByHashtag(hashtag).then(function(statData) {
		res.send(200, statData);
		next();
	}).catch(function(err) {
		res.status(500);
		res.send(err);
		next();
	})
}

function getTopUserMention(req, res, next) {
	var hashtag = req.params.hashtag;
	var InfluxService = require('./InfluxService');
	InfluxService.getTopUserMention(hashtag).then(function(statData) {
		res.send(200, statData);
		next();
	}).catch(function(err) {
		res.status(500);
		res.send(err);
		next();
	})
}

function getTopRelatedHashTag(req, res, next) {
	var hashtag = req.params.hashtag;
	var InfluxService = require('./InfluxService');
	InfluxService.getTopRelatedHashTag(hashtag).then(function(statData) {
		res.send(200, statData);
		next();
	}).catch(function(err) {
		res.status(500);
		res.send(err);
		next();
	})
}

function getEmotionCount(req, res, next) {
	var hashtag = req.params.hashtag;
	var InfluxService = require('./InfluxService');
	InfluxService.getEmotionCount(hashtag).then(function(statData) {
		res.send(200, statData);
		next();
	}).catch(function(err) {
		res.status(500);
		res.send(err);
		next();
	})
}

function getActivityTimeSeriesData(req, res, next) {
	var hashtag = req.params.hashtag;
	var InfluxService = require('./InfluxService');
	InfluxService.getActivityTimeSeriesData(hashtag).then(function(statData) {
		res.send(200, statData);
		next();
	}).catch(function(err) {
		res.status(500);
		res.send(err);
		next();
	})
}

function getAllHashtags(req, res, next) {
	res.send(200, loki.findAllHashtag());
	next();
}

function getGenderCount(req, res, next) {
	var hashtag = req.params.hashtag;
	res.send(200, loki.getGenderCount(hashtag));
	next();
}