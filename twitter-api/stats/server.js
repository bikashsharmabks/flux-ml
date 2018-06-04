var restify = require('restify');

var RequestHandler = require('./services/RequestHandler');

var config = {
	"influx": {
		"host": "influxdb",
		"port": "8086",
		"dbName": "tweet_timeseries"
	},
	"kafka": {
		host: "kafka:9092"
	}
}

var influxDb = require('./framework/influx');
influxDb.init(config.influx);

var KafkaInstance = require('./framework/kafka');
KafkaInstance.init(config.kafka);
KafkaInstance.startActivityConsumer(KafkaInstance.client);

var loki = require('./framework/loki');
loki.init()



var server = restify.createServer();

server.get('/api/hashtags/:hashtag/start', RequestHandler.startHashtagJob);
server.get('/api/hashtags', RequestHandler.getAllHashtags);
server.get('/api/hashtags/:hashtag/stop', RequestHandler.stopHashtagJob);
server.get('/api/hashtags/:hashtag/stats', RequestHandler.getStatsByHashtag);
server.get('/api/hashtags/:hashtag/emotion-count', RequestHandler.getEmotionCount);
server.get('/api/hashtags/:hashtag/top-user-mentions', RequestHandler.getTopUserMention);
server.get('/api/hashtags/:hashtag/top-related-hashtags', RequestHandler.getTopRelatedHashTag);
server.get('/api/hashtags/:hashtag/activity-timeseries-data', RequestHandler.getActivityTimeSeriesData);


server.listen(5001, function() {
	console.log('%s listening at %s', server.name, server.url);
});