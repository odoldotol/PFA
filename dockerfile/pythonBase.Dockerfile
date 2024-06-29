FROM python:3.8-slim-buster

RUN apt-get update \
&& apt-get install curl -y

RUN pip3 install -U pip \
&& pip3 install -U pipenv