FROM pfa-base-python

WORKDIR /home/app
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --system

COPY . .

EXPOSE 8001

HEALTHCHECK --start-period=20s --interval=5m --timeout=20s --retries=3 CMD bash docker-scripts/health-check

CMD bash docker-scripts/start