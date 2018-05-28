# Using official python runtime base image
FROM python:3

#set application directory
WORKDIR /app

#Install requirements.txt
ADD requirements.txt /app/requirements.txt
RUN pip install pathlib && \
	pip install tweepy && \
	pip install -r requirements.txt

#copy code from current folder to /app folder
ADD . /app

#Make expose port 80
EXPOSE 80

#run app.py on launch of docker
CMD ["python", "app.py"]