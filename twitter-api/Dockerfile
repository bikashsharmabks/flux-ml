# Using gettyimages/spark spark image
FROM node:8

ADD . /app

#set application directory
WORKDIR /app/stats

USER "root"

#Install requirements.txt
RUN npm install

#Make expose port 5001
EXPOSE 5001

