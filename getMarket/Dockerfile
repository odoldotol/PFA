FROM python:3.8-slim-buster

RUN apt-get update \
&& apt-get install curl -y

RUN pip3 install -U pip \
&& pip3 install -U pipenv

WORKDIR /home/app
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --system

COPY . .

EXPOSE 8001

HEALTHCHECK --start-period=20s --interval=5m --timeout=20s --retries=3 CMD bash health-check

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port", "8001", "--workers", "3"]