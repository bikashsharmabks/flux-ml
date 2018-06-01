var restify = require('restify');

var RequestHandler = require('./services/RequestHandler');

var config = {
	"influx": {
		"host": "localhost",
		"port": "8086",
		"dbName": "tweet_timeseries"
	},
	"kafka": {
		host: "kafka:9092"
	}
}

var influxDb = require('./framework/influx');
influxDb.init(config.influx);


// var KafkaInstance = require('./framework/kafka');
// KafkaInstance.init(config.kafka);
// KafkaInstance.startActivityConsumer(KafkaInstance.client);


var server = restify.createServer();
server.get('/api/hashtags/:hashtag/start', RequestHandler.startHashtagJob);

server.listen(5001, function() {
  console.log('%s listening at %s', server.name, server.url);
});