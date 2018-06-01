var path = require('path'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request'),
	moment = require('moment');

var PYTHON_SERVER_HOST = "localhost:5000"
/**
 * [RequestHandler handles api request
 * @type {[type]}
 */
var RequestHandler = module.exports = {
	startHashtagJob: startHashtagJob,
	stopHashtagJob: stopHashtagJob
}


function startHashtagJob(req, res, next) {

	var requestURL = PYTHON_SERVER_HOST + "/api/hashtags/" + req.params.hashtag + "/start"
	console.log(requestURL)
	request
		.get(requestURL)
		.on('response', function(response) {
			console.log(response.statusCode) // 200
			console.log(response.headers['content-type']) // 'image/png'
		}).on('error', function(err) {
			console.log(err)
		})

	res.send('hello   ' + req.params.hashtag);
	next();
}


function stopHashtagJob(req, res, next) {

}