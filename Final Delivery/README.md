# HealthDuct #
## _Where mental and physical health meet._ ##

### Project Description ###
Healthduct is the proof of concept of a web application that allows PCPs and mental health providers connect for the betterment of a particular patient.

### Deployment Configuration ###
For local development:
1. Within the Healtduct folder, have a `.env` file with an environment variable `FDA_KEY`. This key can be requested from the OpenFDA site: https://open.fda.gov/apis/authentication/
2. Call `docker-compose up -d --build` to (re)build the HealthDuct application.
3. Perform a `docker exec -it healthduct bash` to go into the container. We now have to migrate the django database to have our tables ready.
    - Perform a `./manage.py makemigrations django_react` inside the container. _You may have to do this a few times if the next step fails, and I do not know why - I'm sorry for the inconvenience._
    - Perform a `./manage.py migrate` to import the new tables.
4. Navigate to `localhost:15001` in a browser of your choice and the application should be up and running.

If you want to have easy access into the attached Django database, use pgAdmin4 to connect to `localhost:5432`. The username is `postgres`.

### Datasets & Test Data Used ###
The largest dataset used to assign mock FHIR prescriptions is the Product.csv (stored in  `HealthDuct/application/django_react/data/Products.csv`) provided by OpenFDA here.