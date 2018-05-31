
from pyspark import SparkConf, SparkContext
from pyspark.sql.session import SparkSession
from pyspark.streaming.kafka import KafkaUtils
from pyspark.streaming import StreamingContext
from pyspark.sql import functions as F
from pyspark.sql import SQLContext
from pyspark.sql.functions import desc
from pyspark.sql.types import StringType, StructField, StructType, BooleanType, ArrayType, IntegerType
from pyspark.sql import Row
from pyspark.sql.functions import explode

from kafka import KafkaProducer
from kafka.errors import KafkaError
from kafka.client import KafkaClient

import re
from textblob import TextBlob

import json
import os

#get MASTER_SPARK host , KAFKA_HOST and port config from env variable
MASTER_SPARK = os.environ['MASTER']
KAFKA_HOST = os.environ['KAFKA_HOST']

schema = StructType([
        StructField("id", StringType(), True),
        StructField("user_name", StringType(), True),
        StructField("user_screen_name", StringType(), True),
        StructField("lang", StringType(), True),
        StructField("text", StringType(), True),
        StructField("hashtag", StringType(), True),
        StructField("timestamp_ms", StringType(), True),
        StructField("activity_type", StringType(), True)     
    ])
# setting up conf obj for SparkContext
conf = SparkConf()
conf.setMaster(MASTER_SPARK)
conf.setAppName("sentiment-job")
conf.set("spark.executor.memory", "1g")
conf.set("spark.cores.max","1")
conf.set("spark.scheduler.mode", "FAIR")

# intializing spark context.
sc = SparkContext(conf = conf)

# intializing spark,sqlContext,StreamingContext obj.
spark = SparkSession(sc);
sqlContext = SQLContext(sc);
ssc = StreamingContext(sc, 2)

# kafka-spark stream.
kafkaTwitterStream = KafkaUtils.createDirectStream(ssc,["activity"], {"metadata.broker.list": KAFKA_HOST})

producer = KafkaProducer(bootstrap_servers=KAFKA_HOST, value_serializer=lambda v: json.dumps(v).encode('utf-8'))

# text coming as tuple (None,Tweet_data) 
def format_twitter_data(text):
	return json.loads(text[1]);

def get_tweet_sentiment(r):
    #Convert to python dict
    temp = r.asDict();
    tweets_with_sentiment = {}
    for tw_key,tw_value in temp.items():
        if( tw_value == None):
            temp[tw_key] = "";

    text = temp.get("text");
    text = clean_tweet(text);
    temp["text"]  = text;
    lang = temp.get("lang");
    activity_type = temp.get("activity_type");

    if((activity_type == "tweet" or activity_type == "quote") and lang == "en"):
        analysis = TextBlob(text)
        temp["polarity"] = analysis.sentiment.polarity;
        if temp["polarity"] > 0:
            temp["sentiment"] = 'positive'
        elif temp["polarity"] == 0:
            temp["sentiment"] = 'neutral'
        else:
            temp["sentiment"] ='negative'

        tweets_with_sentiment.update(temp)
    
    output = Row(**tweets_with_sentiment);
    return output
    

    
# [{'id': '1002054275588083712', 'user_name': 'Rachit Seth', 'text': 'Perspective: This is the same seat which the BJP got countermanded because Prakash Javadekar lied about some voter… https://t.co/IQcmgqTIaC', 'timestamp_ms': '1527743331225', 'user_screen_name': 'rachitseth', 'hashtag': 'bypolls', 'lang': 'en', 'activity_type': 'quote'}, {'id': '1002054301768933376', 'user_name': 'Shailabh', 'text': 'Counting of votes underway in 4 Loksabha seats and 10 assembly seats across different states that went for bypolls… https://t.co/eDr6LL23eT', 'timestamp_ms': '1527743337467', 'user_screen_name': 'shailabhnandan', 'hashtag': 'bypolls', 'lang': 'en', 'activity_type': 'tweet'}]

# r = {'id': '1002054275588083712', 'user_name': 'Rachit Seth', 'text': 'Perspective: This is the same seat which the BJP got countermanded because Prakash Javadekar lied about some voter… https://t.co/IQcmgqTIaC', 'timestamp_ms': '1527743331225', 'user_screen_name': 'rachitseth', 'hashtag': 'bypolls', 'lang': 'en', 'activity_type': 'tweet'}


def clean_tweet(tweet):
    '''
    Utility function to clean tweet text by removing links, special characters
    using simple regex statements.
    '''
    return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())
 

def extract_each_RDD(rdd):

    if(rdd.isEmpty()):
        print("Rdd empty.");

    else:
        print("Rdd not empty."); 
        tweets_df = spark.createDataFrame(rdd,schema);
        tweets_df.createOrReplaceTempView("tweets");
        twitterEntityDF = spark.sql("SELECT id,user_name, user_screen_name, hashtag,text,timestamp_ms,lang,activity_type from tweets");
        twitterEntityRDD = twitterEntityDF.rdd.map(get_tweet_sentiment);
        #print(twitterEntityRDD.collect());
        #twitterEntityRDD = get_tweet_sentiment(r);
        if twitterEntityRDD:
            twitterDFToWrite = sqlContext.createDataFrame(twitterEntityRDD);
            print(twitterDFToWrite.show()); 
            twitterDFToWrite.write.mode('append').parquet("sentiment.parquet")
      
            for tweet in twitterEntityRDD.collect():
                producer.send("sentiment",tweet.asDict());

            producer.flush(); 

(kafkaTwitterStream.map(format_twitter_data).foreachRDD(extract_each_RDD));

ssc.start()
ssc.awaitTermination()

sc.stop();

#spark-submit --packages org.apache.spark:spark-streaming-kafka-0-8_2.11:2.3.0 /app/sentiment-job/sentiment.py
