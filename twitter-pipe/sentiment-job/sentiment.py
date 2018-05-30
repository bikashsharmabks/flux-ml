
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

import re
from textblob import TextBlob

import json
import os


#get MASTER_SPARK host , KAFKA_HOST and port config from env variable
MASTER_SPARK = os.environ['MASTER']
KAFKA_HOST = os.environ['KAFKA_HOST']

schema = StructType([
        StructField("id", StringType(), True),
        StructField("text", StringType(), True),
        StructField("hashtag", StringType(), True),
        StructField("timestamp_ms", StringType(), True),
        StructField("name", StringType(), True),
        StructField("screen_name", StringType(), True)     
    ])
# setting up conf obj for SparkContext
conf = SparkConf()
conf.setMaster(MASTER_SPARK)
conf.setAppName("sentiment-job")
conf.set("spark.executor.memory", "512m")
conf.set("spark.cores.max","1")
conf.set("spark.scheduler.mode", "FAIR")

# intializing spark context.
sc = SparkContext(conf = conf)

# intializing spark,sqlContext,StreamingContext obj.
spark = SparkSession(sc);
#sqlContext = SQLContext(sc);
ssc = StreamingContext(sc, 2)

# kafka-spark stream.
kafkaTwitterStream = KafkaUtils.createDirectStream(ssc,["activity"], {"metadata.broker.list": KAFKA_HOST})
print(kafkaTwitterStream)

# text coming as tuple (None,Tweet_data) 
def format_twitter_data(text):
	return json.loads(text[1]);


def get_tweet_sentiment(r):
    #Convert to python dict
    temp = r.asDict();
    print(temp)

    for tw_key,tw_value in temp.items():
        if( tw_value == None):
            temp[tw_key] = "";

    text = temp.get("text");
    print("@@@@@@@@@")
    print(text)
    return text

def extract_each_RDD(rdd):
   	#print(rdd.collect())
    if(rdd.isEmpty()): 
        print("Rdd empty.");
    else:
        print("Rdd not empty."); 
        tweets_df = spark.createDataFrame(rdd,schema);
        tweets_df.createOrReplaceTempView("tweets");
        twitterEntityDF = spark.sql("SELECT id,hashtag,text,timestamp_ms from tweets");
        twitterEntityRDD = twitterEntityDF.rdd.map(get_tweet_sentiment);
        print(twitterEntityRDD.collect())

(kafkaTwitterStream.map(format_twitter_data).foreachRDD(extract_each_RDD));

ssc.start()
ssc.awaitTermination()

sc.stop();


# {"name": "Harbender", "coordinates": "", "url_4": "", "hashtag_2": "bypolls", "url_2": "", "followers_count": 38, "user_mention_name_4": "", "hashtag_5": "", "verified": false, "user_mention_name_5": "", "user_mention_name_1": "Shalini Chaurasiya (84ya ji)", "user_mention_screen_name_2": "", "url_3": "", "location": "New Delhi, India", "timestamp_ms": "1527674691224", "user_mention_screen_name_3": "", "hashtag_3": "", "statuses_count": 866, "user_mention_name_3": "", "friends_count": 77, "user_mention_screen_name_5": "", "hashtag_1": "Indian_Media_Died", "url_5": "", "hashtag": "bypolls", "hashtag_4": "", "user_mention_screen_name_4": "", "id": "1001766378557313024", "screen_name": "Harbender2", "url_1": "", "text": "RT @ShaliniChaura15: #Indian_Media_Died\n#bypolls \n\u092e\u0940\u0921\u093f\u092f\u093e \u092c\u093f\u0915 \u091a\u0941\u0915\u093e \u0939\u0948 \u092a\u0948\u0938\u0947 \u0915\u0940 \u0932\u093e\u0932\u091a \u092e\u0947\u0902 \u0905\u092a\u0928\u093e \u0909\u0926\u094d\u0926\u0947\u0936\u094d\u092f \u092d\u0942\u0932 \u0917\u092f\u093e \u0939\u0948\u0964\u0907\u0938 \u092e\u0940\u0921\u093f\u092f\u093e \u0915\u0947 \u0915\u093e\u0930\u0923 \u0905\u092a\u0928\u0947 \u092d\u093e\u0930\u0924\u2026", "user_mention_screen_name_1": "ShaliniChaura15", "profile_image_url": "http://pbs.twimg.com/profile_images/1001020609466429440/LejKmV0w_normal.jpg", "user_mention_name_2": "", "profile_background_image_url": ""}
