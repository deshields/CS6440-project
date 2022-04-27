# HealthDuct #
## _Where mental and physical health meet._ ##

### Project Description ###
Healthduct is the proof of concept of a web application that allows PCPs and mental health providers connect for the betterment of a particular patient.

---

### Deployment Configuration ###
For local development:

#### Prerequistites ####
 - Have `docker-compose` installed. 
 - Have ports 15001 (front-end), 8000 (backend), and 5432 (database) unused.

#### Steps ####
Within the `Startup & Config` folder:
1. Create a `.env` file with an environment variables `FDA_KEY` and `PORT` set. The `FDA_KEY` can be requested from the OpenFDA site: https://open.fda.gov/apis/authentication/. The `PORT` is the port where the python backend will live.
The .env file will look something like this:
```
FDA_KEY=<api_key_here>
PORT=8000
```
A `.env` will be added to the submission.

2. Call `docker-compose up -d --build` to (re)build the HealthDuct application.
3. Perform a `docker exec -it healthduct bash` to go into the container. We now have to migrate the django database to have our tables ready.
    - Perform a `./manage.py migrate` to import the new tables. If this fails, do the following step then repeat this one. Otherwise, proceed to step 4.
    - Perform a `./manage.py makemigrations django_react` inside the container. _You may have to do this a few times if the next step fails, and I do not know why - I'm sorry for the inconvenience._
4. Type `exit` to leave the container and navigate to `localhost:15001` in a browser of your choice and the application should be up and running.
If you want to have easy access into the attached Django database, use pgAdmin4 to connect to `localhost:5432`. The username is `postgres`.

### Using the Application ###
Here is the recommended workflow for Healthduct:
1. Sign up with a provider account. Notes on this are in `Final Delivery/Manuals/Provider Manual.md`.
2. Go over to the PATIENTS tab. There won't be any patients in there.
3. In a separate tab, open the application and sign up with a patient account. Notes on this are in `Final Delivery/Manuals/Patient Manual.md`.
4. Follow the directions detailed under the `Inviting Providers` section in the Patient Manual.
5. Go back to the tab with the provider you created in step 1, and insert the consenting code to the input box in under the PATIENTS tab. You should now see your patient in the patient list. Click the patient to see their profile.
6. Providers can see more than what the patient can. You should see a `Medical Data` tab and a `Treatment Plan` tab. Proceed to the Medical Data Tab. Now there should be 3 prescriptions for you to click and explore. Every label returns different headers, so what to explore needs to be discerned by the user.
7. Proceed to the Treatment Plan tab. You may add details or notes from the perspective of a provider, capable of adding long notes and deleting them.

### Datasets & Test Data Used ###
The largest dataset used to assign mock FHIR prescriptions is the Product.csv (stored in  `HealthDuct/application/django_react/data/Products.csv`) provided by OpenFDA here: https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-data-files. Only the Products table was used.

### Known Errors ###
Sometimes the `db` container will refuse to update, and cause a failure with the entire build. In this case, doing a `docker stop db && docker rm db` on the failed `db` container should allow for a clean rebuild.