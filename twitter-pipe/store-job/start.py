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

import json
import os



# dataframe schema for extracting features from twitter stream data
schema = StructType([
        StructField("id", StringType(), True),
        StructField("text", StringType(), True),
        StructField("hashtag", StringType(), True),
        StructField("timestamp_ms", StringType(), True),
        StructField("coordinates", StringType(), True),
        StructField("user",StructType([
                    StructField("name", StringType(), True),
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

# setting up conf obj for SparkContext
conf = SparkConf()
conf.setMaster(MASTER_SPARK)
conf.setAppName("store-job")
conf.set("spark.executor.memory", "512m")
conf.set("spark.cores.max","1")
conf.set("spark.scheduler.mode", "FAIR")

# intializing spark context.
sc = SparkContext(conf = conf)

# intializing spark,sqlContext,StreamingContext obj.
spark = SparkSession(sc);
sqlContext = SQLContext(sc);
ssc = StreamingContext(sc, 5)

# kafka-spark stream.
kvs = KafkaUtils.createDirectStream(ssc,["hashtag"], {"metadata.broker.list": KAFKA_HOST})

producer = KafkaProducer(bootstrap_servers=KAFKA_HOST, value_serializer=lambda v: json.dumps(v).encode('utf-8'))

# text coming as tuple (None,Tweet_data) 
def format_twitter_data(text):
	return json.loads(text[1]); 

def format_tweet(r):
    #Convert to python dict
    temp = r.asDict();
    
    LIMIT_COUNT = 5;
    
    for tw_key,tw_value in temp.items():
        if( tw_value == None):
            temp[tw_key] = "";
        
    
    user_mentions = temp.get("user_mentions"); 
    hashtags = temp.get("hashtags"); 
    urls = temp.get("urls"); 


    if (user_mentions != None):
        um_len = len(user_mentions);
        while um_len < LIMIT_COUNT:
            user_mentions.append({
                "name":"",
                "screen_name":""
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
                                    
        
            
    del temp["user_mentions"] 
    del temp["hashtags"] 
    del temp["urls"] 

    # Save or output the row to a pyspark rdd
    output = Row(**temp) 
    return output;

def extract_each_RDD(rdd):
    print(rdd.count())
    if(rdd.isEmpty()): 
        print("Rdd empty.");
    else:
        print("Rdd not empty."); 
        tweets_df = spark.createDataFrame(rdd,schema);
        tweets_df.createOrReplaceTempView("tweets");
        twitterEntityDF = spark.sql("SELECT id,hashtag,text,timestamp_ms,coordinates,user.*,entities.user_mentions,entities.hashtags,entities.urls from tweets");
        twitterEntityRDD = twitterEntityDF.rdd.map(format_tweet);
        twitterDFToWrite = sqlContext.createDataFrame(twitterEntityRDD);
        print(twitterDFToWrite.show()); 
        twitterDFToWrite.write.mode('append').parquet("twitter.parquet")
        print('after sql execution. and data written to parquet file.');

        for tweet in twitterEntityRDD.collect():
            producer.send("activity",tweet.asDict());

        producer.flush()   


(kvs.map(format_twitter_data).foreachRDD(extract_each_RDD));


ssc.start()
ssc.awaitTermination()

sc.stop();

