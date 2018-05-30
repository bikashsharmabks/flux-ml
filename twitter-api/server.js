var config = {
	"influx": {
		"host":"influxdb",
		"port":"8086"
		"dbName":"tweet_timeseries"
	}
}

var influxDb = require('./framework/influx');
influxDb.init(config.influx);


