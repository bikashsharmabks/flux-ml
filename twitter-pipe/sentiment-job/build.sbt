name := "SentimentAnalyser"

version := "0.1"

scalaVersion := "2.11.8"

val coreNlpVersion = "3.6.0"
val sparkVersion = "2.3.0"
val kafkaVersion = "0.11.0.1"

libraryDependencies ++= Seq("org.apache.spark" %% "spark-core" % sparkVersion,
  "org.apache.spark" %% "spark-streaming" % sparkVersion,
  "org.apache.kafka" %% "kafka" % kafkaVersion,
  "org.apache.spark" %% "spark-streaming-kafka-0-10" % sparkVersion,
  "org.apache.spark" %% "spark-sql" % sparkVersion
)


//"edu.stanford.nlp" % "stanford-corenlp" % coreNlpVersion,
  //"edu.stanford.nlp" % "stanford-corenlp" % coreNlpVersion classifier "models"