from flask import Flask
import tweepy

app = Flask(__name__)

@app.route("/")
def send():
	return "Hello how is it going...kjskfljsdrwerwer!!!"

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=80)