# Using gettyimages/spark spark image
FROM gettyimages/spark

# Scala related variables.
ARG SCALA_VERSION=2.11.8
ARG SCALA_BINARY_ARCHIVE_NAME=scala-${SCALA_VERSION}
ARG SCALA_BINARY_DOWNLOAD_URL=https://downloads.lightbend.com/scala/${SCALA_VERSION}/${SCALA_BINARY_ARCHIVE_NAME}.tgz

# SBT related variables.
ARG SBT_VERSION=1.1.5
ARG SBT_BINARY_ARCHIVE_NAME=sbt-$SBT_VERSION
ARG SBT_BINARY_DOWNLOAD_URL=https://piccolo.link/${SBT_BINARY_ARCHIVE_NAME}.tgz

# Configure env variables for Scala.
# Also configure PATH env variable to include binary folders of Scala.
ENV SCALA_HOME  /usr/scala
ENV SBT_HOME  /usr/sbt
ENV PATH=${PATH}:$SCALA_HOME/bin:$SBT_HOME/bin:

# Download, uncompress and move all the required packages and libraries to their corresponding directories in /usr/local/ folder.
RUN apt-get -y update && \
	apt -y install wget && \
    apt-get	clean && \
    wget -O - ${SCALA_BINARY_DOWNLOAD_URL} | tar -xz -C /usr/ && \
    wget -O - ${SBT_BINARY_DOWNLOAD_URL} | tar -xz -C /usr/ && \
	cd /usr/ && \
    ln -s ${SCALA_BINARY_ARCHIVE_NAME} scala

#set application directory
#WORKDIR /app

#Install requirements.txt
#ADD requirements.txt /app/requirements.txt
#RUN pip install -r requirements.txt

#copy code from current folder to /app folder
#ADD . /app

