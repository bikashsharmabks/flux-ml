# Using gettyimages/spark spark image
FROM gettyimages/spark

#set application directory
WORKDIR /app

#Install requirements.txt
ADD requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

#copy code from current folder to /app folder
ADD . /app

#run app.py on launch of docker
#CMD ["python", "app.py"]
