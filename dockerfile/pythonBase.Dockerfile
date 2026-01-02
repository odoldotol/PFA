FROM python:3.10-slim-bullseye

RUN apt-get update \
&& apt-get install curl -y

RUN pip3 install -U pip \
&& pip3 install -U pipenv