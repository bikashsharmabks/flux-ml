import tweepy
import json
import framework.logger as logger


log = logger.get_module_logger('twitter-stream.twitter')

class Service(object):
	def __init__(self, congfig_file):

		with open(congfig_file) as config_data:
			self._twitter_config = json.load(config_data)

		auth = tweepy.OAuthHandler(self._twitter_config['consumer_key'], self._twitter_config['consumer_secret'])
		auth.set_access_token(self._twitter_config['access_token'], self._twitter_config['access_token_secret'])
		self._api = tweepy.API(auth)

	@property
	def config(self):
		return self._twitter_config

	@property
	def api(self):
		return self._api

	def start_listening(self, hashtag):
		stream = TwitterStreamListener(hashtag)
		print(stream)
		twitter_stream = tweepy.Stream(auth = self._api.auth, listener=stream)
		twitter_stream.filter(track=[hashtag], async=True)
	

class TwitterStreamListener(tweepy.StreamListener):
	def __init__(self, hashtag):
		pass
		#self.producer = KafkaProducer(bootstrap_servers=KAFKA_HOST, value_serializer=lambda v: json.dumps(v))
		
	def on_data(self, data):
		text = json.loads(data)[u'text']
		log.info(text)
		log.info(data)
		#self.producer.send(hashtag, text)
		#self.producer.flush()

	def on_error(self, status_code):
		log.error(status_code)

		if status_code == 420:
			return False