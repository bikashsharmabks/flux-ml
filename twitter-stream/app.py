#external imports
from flask import Flask
from flask import jsonify
import json
import os

#internal imports
import twitter as tw

#get kafka host and port config from env variable
KAFKA_HOST = os.environ['KAFKA_HOST']

#create instance of flask app
app = Flask(__name__)

#create instance of 
twitter_Service = tw.Service('config.json', KAFKA_HOST)

# GET /
@app.route("/twitter-config")
def get_twitter_config():
	return jsonify(twitter_Service.config)

# GET /
@app.route("/hashtags/<string:hash_tag>")
def get_hashtag_tweets(hash_tag):
	twitter_Service.start_listening(hash_tag)
	return hash_tag

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=80)