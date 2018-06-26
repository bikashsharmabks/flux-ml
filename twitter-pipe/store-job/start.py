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

# lang , activity type , source , url desc.
from kafka import KafkaProducer
from kafka.errors import KafkaError
from kafka.client import KafkaClient

import json
import os

import requests

import re
from textblob import TextBlob



# dataframe schema for extracting features from twitter stream data
schema = StructType([
        StructField("id", StringType(), True),
        StructField("text", StringType(), True),
        StructField("hashtag", StringType(), True),
        StructField("source", StringType(), True),
        StructField("timestamp_ms", StringType(), True),
        StructField("coordinates", StringType(), True),
        StructField("lang", StringType(), True),
        StructField("favorite_count", IntegerType(), True),
        StructField("user",StructType([
                    StructField("name", StringType(), True),
                    StructField("id", StringType(), True),
                    StructField("screen_name", StringType(), True),
                    StructField("location", StringType(), True),
                    StructField("profile_background_image_url", StringType(), True),
                    StructField("profile_image_url", StringType(), True),
                    StructField("verified", BooleanType(), True),
                    StructField("followers_count", IntegerType(), True),
                    StructField("friends_count", IntegerType(), True),
                    StructField("statuses_count", IntegerType(), True)
                ])
            , True),
        StructField("retweeted_status",StructType([
                    StructField("id", StringType(), True)
                ])
            , True),
        StructField("quoted_status",StructType([
                    StructField("id", StringType(), True)
                ])
            , True),
        StructField("entities",StructType([
                    StructField("user_mentions", ArrayType(StructType([
                        StructField("screen_name", StringType(), True),
                        StructField("name", StringType(), True)
                ])), True),
                    StructField("hashtags", ArrayType(StructType([
                        StructField("text", StringType(), True)
                ])), True),
                    StructField("urls", ArrayType(StructType([
                        StructField("url", StringType(), True),
                        StructField("display_url", StringType(), True)
                ])), True)
                ])
            , True)
    ])


#get MASTER_SPARK host , KAFKA_HOST and port config from env variable
MASTER_SPARK = os.environ['MASTER']
KAFKA_HOST = os.environ['KAFKA_HOST']
ZOOKEEPER_HOST = os.environ['ZOOKEEPER_HOST']

# setting up conf obj for SparkContext
conf = SparkConf()
conf.setMaster(MASTER_SPARK)
conf.setAppName("store-job")
conf.set("spark.executor.memory", "1g")
#conf.set("spark.cores.max","2")

# intializing spark context.
sc = SparkContext(conf = conf)

# intializing spark,sqlContext,StreamingContext obj.
spark = SparkSession(sc);
sqlContext = SQLContext(sc);
ssc = StreamingContext(sc, 5)


kvs = KafkaUtils.createStream(ssc, ZOOKEEPER_HOST, "store-job-group", {"hashtag": 1})

producer = KafkaProducer(bootstrap_servers=KAFKA_HOST, value_serializer=lambda v: json.dumps(v).encode('utf-8'))

def format_tweet(r):
    #Convert to python dict
    temp = r.asDict();
    
    LIMIT_COUNT = 5;
    
    for tw_key,tw_value in temp.items():
        if( tw_value == None):
            temp[tw_key] = "";
    
    if(temp.get("quoted_status_id")):
        temp["activity_type"] = "quote";
    elif(temp.get("favorite_count") > 0):
        temp["activity_type"] = "favorite";
    elif(temp.get("retweeted_status_id")):
        temp["activity_type"] = "retweet";
    else:
        temp["activity_type"] = "tweet";    
    
    user_mentions = temp.get("user_mentions"); 
    hashtags = temp.get("hashtags"); 
    urls = temp.get("urls");

    if (user_mentions != None):
        um_len = len(user_mentions);
        while um_len < LIMIT_COUNT:
            user_mentions.append({
                "name": "",
                "screen_name": ""
                });
            um_len = um_len + 1;
        user_mentions = user_mentions[:LIMIT_COUNT]        
        i = 1;
        print("%%%%%%%% user_mentions")
        print(user_mentions);
        
        for user_men_data in user_mentions:
            dictToIterate = {};
            if(isinstance(user_men_data, dict)):
                dictToIterate = user_men_data;
            else:
                dictToIterate = user_men_data.asDict()
                
            for k,v in dictToIterate.items():
                if(v == None):
                    v = '';
                temp["user_mention_"+ k + "_" + str(i)] = v
                             
            i = i + 1;         
                    
   
    if(hashtags != None):
        ht_len = len(hashtags);
        while ht_len < LIMIT_COUNT:
            hashtags.append({
                "text":""
                });
            ht_len = ht_len + 1;
        hashtags = hashtags[:LIMIT_COUNT]        
        j = 1;
        print("%%%%%%%% hash tag")
        print(hashtags);
        
        for hashtag_data in hashtags:
            dictToIterate = {};
            if(isinstance(hashtag_data, dict)):
                dictToIterate = hashtag_data;
            else:
                dictToIterate = hashtag_data.asDict()
                
            for k,v in dictToIterate.items():
                if(v == None):
                    v = '';
                temp["hashtag_"+ str(j)] = v
                             
            j = j + 1; 
    
      
    if(urls != None):
        url_len = len(urls);
        while url_len < LIMIT_COUNT:
            urls.append({
                "url":""
                });
            url_len = url_len + 1;
        urls = urls[:LIMIT_COUNT]        
        m = 1;
        print("%%%%%%%%")
        print(urls);
        
        for url_data in urls:
            dictToIterate = {};
            if(isinstance(url_data, dict)):
                dictToIterate = url_data;
            else:
                dictToIterate = url_data.asDict()
                
            for k,v in dictToIterate.items():
                if(v == None):
                    v = '';
                temp["url_"+ str(m)] = v
                             
            m = m + 1; 

    text = temp.get("text");
    text = clean_tweet(text);
    temp["text"]  = text;
    lang = temp.get("lang");
    activity_type = temp.get("activity_type");
    
    analysis = TextBlob(text)
    temp["polarity"] = analysis.sentiment.polarity;
    if temp["polarity"] > 0:
        temp["sentiment"] = 'positive'
    elif temp["polarity"] == 0:
        temp["sentiment"] = 'neutral'
    else:
        temp["sentiment"] ='negative'        
    
    try:
        payload = {
        "name": temp.get("user_name")
        }                                
        r = requests.post("http://198.211.109.154:10001/api/predictions/gender", json=payload) 
        if(r.status_code == 200):
            temp["gender"] = r.json().get("gender")
        else:
            temp["gender"] = "unknown" 
    except:
        temp["gender"] = "unknown" 
        print("model serve server down.")
       
    
       

    del temp["user_mentions"] 
    del temp["hashtags"] 
    del temp["urls"] 

    # Save or output the row to a pyspark rdd
    output = Row(**temp) 
    return output;

def clean_tweet(tweet):
    '''
    Utility function to clean tweet text by removing links, special characters
    using simple regex statements.
    '''
    return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())

def extract_each_RDD(rdd):
    print(rdd.count())
    if(rdd.isEmpty()): 
        print("Rdd empty.");
    else:
        print("Rdd not empty."); 
        tweets_df = spark.createDataFrame(rdd,schema);
        tweets_df.createOrReplaceTempView("tweets");
        twitterEntityDF = spark.sql("SELECT id,hashtag,text,timestamp_ms,coordinates,source,lang,\
                                    quoted_status.id as quoted_status_id,favorite_count ,retweeted_status.id as retweeted_status_id,\
                                    user.name as user_name,user.screen_name as user_screen_name,\
                                    user.location as user_location,user.id as user_id,\
                                    user.profile_background_image_url as user_profile_background_image_url,\
                                    user.profile_image_url as user_profile_image_url,\
                                    user.verified as user_verified,\
                                    user.followers_count as user_followers_count,\
                                    user.friends_count as user_friends_count,\
                                    user.statuses_count as user_statuses_count,\
                                    entities.user_mentions,\
                                    entities.hashtags,\
                                    entities.urls \
                                    from tweets");
        twitterEntityRDD = twitterEntityDF.rdd.map(format_tweet);
        twitterDFToWrite = sqlContext.createDataFrame(twitterEntityRDD);
        print(twitterDFToWrite.show()); 
        twitterDFToWrite.write.mode('append').parquet("twitter.parquet")
        print('after sql execution. and data written to parquet file.');

        for tweet in twitterEntityRDD.collect():
            producer.send("activity",tweet.asDict());

        producer.flush()   



(kvs.map(lambda v: json.loads(v[1])).foreachRDD(extract_each_RDD));


ssc.start()
ssc.awaitTermination()

sc.stop();

#spark-submit --packages org.apache.spark:spark-streaming-kafka-0-8_2.11:2.3.0  /app/store-job/start.py

