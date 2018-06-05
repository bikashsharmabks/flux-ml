
# Run influxdb & twitter-api container first.
docker exec -i influxdb sh -c "cd ~ && influx -execute 'use tweet_timeseries' && influx -execute 'DROP SERIES FROM /.*/'"
docker exec -i twitter-api sh -c "rm -f /data/tweetstore.db"


