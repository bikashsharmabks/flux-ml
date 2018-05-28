#external export
import tweepy
import json
from kafka import KafkaProducer
from kafka.errors import KafkaError
from kafka.client import KafkaClient

#internal imports
import framework.logger as logger

log = logger.get_module_logger('twitter-stream.twitter')

class Service(object):
	def __init__(self, congfig_file, kafka_host):

		with open(congfig_file) as config_data:
			self._twitter_config = json.load(config_data)

		auth = tweepy.OAuthHandler(self._twitter_config['consumer_key'], self._twitter_config['consumer_secret'])
		auth.set_access_token(self._twitter_config['access_token'], self._twitter_config['access_token_secret'])
		self._api = tweepy.API(auth)
		self._kafka_host = kafka_host
		self._streams = []

	@property
	def config(self):
		return self._twitter_config

	@property
	def api(self):
		return self._api

	def start_streaming(self, hashtag):
		"""Start Streaming for a hastag"""

		stream = TwitterStreamListener(hashtag, self._kafka_host)
		twitter_stream = tweepy.Stream(auth = self._api.auth, listener=stream)
		twitter_stream.filter(track=[hashtag], async=True)
		self._streams.append(twitter_stream)
		log.debug("stream connected %s" % (hashtag))

	def stop_streaming(self, hashtag):
		for stream in self._streams:
			if stream.body['track'] == hashtag.encode('utf8'):
				stream.disconnect()
				self._streams.remove(stream)
				log.debug("stream disconnected %s" % (hashtag))


class TwitterStreamListener(tweepy.StreamListener):
	def __init__(self, hashtag, kafka_host):
		pass
		self._hashtag = hashtag

		# encode objects via msgpack
		#self.producer = KafkaProducer(bootstrap_servers=kafka_host, value_serializer=msgpack.dumps)
		
		# check if spark can consume 
		self.producer = KafkaProducer(bootstrap_servers=kafka_host, value_serializer=lambda v: json.dumps(v).encode('utf-8'))
		
	def on_data(self, data):
		
		data_json = json.loads(data)
		data_json["hashtag"] = self._hashtag

		text = data_json[u'text']
		log.debug(text)
		
		self.producer.send("hashtag", data_json)
		self.producer.flush()

	def on_error(self, status_code):
		log.error(status_code)

		if status_code == 420:
			return False