FROM python:3.8-slim-buster
WORKDIR /home/app
RUN pip3 install -U pip \
&& pip3 install -U pipenv
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --system
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port", "8000", "--workers", "3"]