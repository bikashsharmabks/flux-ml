# Using official python runtime base image
FROM python:2.7-alpine

#set application directory
WORKDIR /app

#Install requirements.txt
ADD requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

#copy code from current folder to /app folder
ADD . /app

#Make expose port 80
EXPOSE 80

#run app.py on launch of docker
CMD ["python", "app.py"]