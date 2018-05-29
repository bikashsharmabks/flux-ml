package com.p10labs.sentiment

import org.apache.spark.SparkConf
import org.apache.spark.serializer.KryoSerializer
import org.apache.spark.streaming.{Durations, StreamingContext}
import org.apache.spark.streaming.kafka010._
import org.apache.spark.streaming.kafka010.LocationStrategies.PreferConsistent
import org.apache.spark.streaming.kafka010.ConsumerStrategies.Subscribe

//import org.apache.spark.SparkContext
//import org.apache.spark.rdd.RDD
//import org.apache.spark.sql.SaveMode
//import org.apache.kafka.clients.consumer.ConsumerRecord
//import org.p7h.spark.sentiment.corenlp.CoreNLPSentimentAnalyzer
//import org.p7h.spark.sentiment.mllib.MLlibSentimentAnalyzer

object SentimentAnalyzer {

  val kafkaHost = System.getenv("KAFKA_HOST")
  val sparkMaster = System.getenv("MASTER")

  def main(args: Array[String]) {

    val ssc = StreamingContext.getActiveOrCreate(createSparkStreamingContext)
    val kafkaParams = Map[String, Object](
      "bootstrap.servers" -> kafkaHost,
      "group.id" -> "sentiment",
      "auto.offset.reset" -> "latest",
      "enable.auto.commit" -> (false: java.lang.Boolean)
    )
    val topics = Array("hashtag")
    val stream = KafkaUtils.createDirectStream[String, String](
      ssc,
      PreferConsistent,
      Subscribe[String, String](topics, kafkaParams)
    )
    print(stream)
    stream.map(record => (record.key, record.value))

    stream.foreachRDD { rdd =>
      if (rdd != null && !rdd.isEmpty() && !rdd.partitions.isEmpty) {
        rdd.collect().foreach(println)
      }
    }
    //ssc.stop
  }

  /**
    * Create StreamingContext.
    * @return StreamingContext
    */
  def createSparkStreamingContext(): StreamingContext = {
    val conf = new SparkConf()
      .setAppName("sentiment-analyzer")
      // Use KryoSerializer for serializing objects as JavaSerializer is too slow.
      .set("spark.serializer", classOf[KryoSerializer].getCanonicalName)
      // Reduce the RDD memory usage of Spark and improving GC behavior.
      .set("spark.streaming.unpersist", "true")
      //.setMaster("local")
      .setMaster(sparkMaster)
    val ssc = new StreamingContext(conf, Durations.seconds(15))
    ssc
  }
}


