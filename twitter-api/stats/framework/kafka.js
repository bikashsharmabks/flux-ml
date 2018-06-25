var kafka = require('kafka-node'),
  Consumer = kafka.Consumer,
  loki = require('./loki'),
  Service = require('../services/Service');


/**
 * Kafka  module.
 * @module framework/Kafka
 */
var KafkaInstance = module.exports = {
  init: init,
  startActivityConsumer: startActivityConsumer
}

/**
 * @param  {config object }
 * @return {null}
 */

function init(config) {


  KafkaInstance.Client = new kafka.KafkaClient({
    kafkaHost: config.host
  });
}


function startActivityConsumer() {
  var consumer = new Consumer(
    KafkaInstance.Client, [{
      topic: 'activity'
    }], {
      groupId: 'kafka-node-group', //consumer group id, default `kafka-node-group`
      // Auto commit config
      autoCommit: true,
      autoCommitIntervalMs: 5000,
      // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
      fetchMaxWaitMs: 100,
      // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
      fetchMinBytes: 1,
      // The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
      fetchMaxBytes: 1024 * 1024,
      // If set true, consumer will fetch message from the given offset in the payloads
      fromOffset: false,
      // If set to 'buffer', values will be returned as raw buffer objects.
      encoding: 'utf8',
      keyEncoding: 'utf8'
    }
  );

  consumer.on('message', function(message) {
    var tweetData = JSON.parse(message.value);
    if (tweetData) {
      
      // store user count in loki db
      loki.updateGenderCount(tweetData.hashtag,tweetData.gender)

      Service.InfluxService.writeActivityMeasurement(tweetData).then(function(res) {
        console.log("#" + tweetData.hashtag + " Activity data added.", res);
        return Service.InfluxService.writeUserMentionMeasurement(tweetData);
      }).then(function(umData) {
        console.log("#" + tweetData.hashtag + " userMention data added.", umData);
        return Service.InfluxService.writeHashtagMeasurement(tweetData);
      }).then(function(htData) {
        console.log("#" + tweetData.hashtag + " Otherhashtag data added.", htData);
      }).catch(function(err) {
        console.log(err);
      });
    }
  });
}

// select(Top(val, 3))  from activity where verified = 'true' group by userId


// select(Top(val, 3)), userId  from activity where verified = 'true'
// select count(userCount)  from activity