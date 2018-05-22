from flask import Flask
import json
import tweepy
import socket
import sys
import time
import os

from kafka import KafkaProducer
from kafka.errors import KafkaError
from kafka.client import KafkaClient


KAFKA_HOST = os.environ['KAFKA_HOST']

app = Flask(__name__)
stream = None

@app.route("/")
def send():
	return KAFKA_HOST

def initialize():
	with open('config.json') as config_data:
		config = json.load(config_data)

	producer = KafkaProducer(bootstrap_servers=[KAFKA_HOST], value_serializer=lambda v: json.dumps(v))
		
	# auth = tweepy.OAuthHandler(config['consumer_key'], config['consumer_secret'])
	# auth.set_access_token(config['access_token'], config['access_token_secret'])
	# api = tweepy.API(auth)

	# stream = TwitterStreamListener()
	# twitter_stream = tweepy.Stream(auth = api.auth, listener=stream)
	# twitter_stream.filter(track=['iphone'], async=True)

# class TwitterStreamListener(tweepy.StreamListener):
# 	def __init__(self):
# 		self.producer = KafkaProducer(bootstrap_servers=KAFKA_HOST, value_serializer=lambda v: json.dumps(v))
# 		self.tweets = []

# 	def on_data(self, data):
# 		text = json.loads(data)[u'text']
# 		self.producer.send('iphone', text)
# 		self.tweets.append(text)
# 		self.producer.flush()
# 		print(text)

# 	def on_error(self, status_code):
# 		if status_code == 420:
# 			return False

if __name__ == '__main__':
	initialize()
	app.run(host='0.0.0.0', port=80)