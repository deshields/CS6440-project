FROM python:3.9-buster

LABEL description="The Healthduct application"

ENV PYTHONUNBUFFERED 1
ENV PATH="/code/django_react/scripts:${PATH}"

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update && apt-get --no-install-recommends install -y software-properties-common unzip nodejs

COPY ../requirements.txt requirements.txt
RUN pip install -r requirements.txt

WORKDIR /code
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY webpack.config.js webpack.config.js
COPY .babelrc .babelrc

RUN npm install

COPY application application
RUN npm run build
WORKDIR /code/application
EXPOSE 8000

RUN ./manage.py collectstatic --noinput
RUN ./manage.py makemigrations --noinput
# RUN ./manage.py migrate --noinput

CMD ["gunicorn", "django_react.wsgi", "--bind", "0.0.0.0:8000", "--log-level", "debug", "-t", "3000", "-w", "12", "--threads", "8"]