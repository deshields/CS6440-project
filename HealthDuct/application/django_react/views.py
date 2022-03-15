
import django_react.models as mdls
import json
import logging

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('django')

class WebContext:
    def __init__(self, request, **kwargs):
        self.request = request
        self.kwargs = kwargs

    @classmethod
    def create(cls, request, **kwargs):
        return cls(request, **kwargs)
    
    @classmethod
    def create_error(cls, request, error):
        return cls(request, message=str(error))

    def render(self):
        context = {"props": self.kwargs}
        return render(self.request, 'index.html', context)
    

def index(request):
    return WebContext.create(request).render()

def get_public_provider_info(url_id):
    # url_id will probably be encrypted at some point
    pass

def login(request):
    body = json.loads(request.body)
    # username, password, login type
    login_type = body.get("signInType", None)
    # logins = {
    #     "mental": authenticate(username=body.get("username"), password=body.get("password")).public(),
    #     "phys": mdls.PhysicalProvider.objects.get(username=body.get("username"), password=body.get("password")).public(),
    #     # "patient": mdls.Patient.objects.get(username=body.get("username"), password=body.get("password")), # will be fixed later
    #     # "institution":mdls.Institution.objects.get(email=body.get("email"), password=body.get("password"))
    # }
    # query = logins[login_type]
    return JsonResponse({"user_data": authenticate(username=body.get("username"), password=body.get("password")).public()})

def verify(request):
    body = json.loads(request.body)
    pt = body.get("provider_type")
    

    if pt == "phys":
        mdls.PhysicalProvider.objects.filter(username=body.get("username")).update(verified=True)
    elif pt == "mental":
        mdls.MentalProvider.objects.filter(username=body.get("username")).update(verified=True)
    return _http201(f"Verified {body['username']}")


def sign_up(request):
    body = json.loads(request.body)
    pt = body.get("provider_type")
    model = body.get("model")
    user_details = model.get("user")
    provider_details = model.get("provider")

    try:
        new_user, made = User.objects.get_or_create(**user_details)
        if not made:
            return _http400("User Exists")
        obj, created = mdls.PhysicalProvider.objects.get_or_create(user=new_user, **provider_details) if pt == "phys" else mdls.MentalProvider.objects.get_or_create(user=new_user, **provider_details)
        if created:
            return JsonResponse({"user_data": obj.public()})
        else:
            return _http400("User Exists")
    except Exception as err:
        try:
            new_user.delete()
        except Exception as del_err:
            logger.error(f"Error signing up: {err}, couldn't delete new user: {del_err}")
            return _http500(f"Error signing up: {err}, couldn't delete new user: {del_err}")

        logger.error(f"Error signing up: {err}")
        return _http500(f"Error signing up: {err}")
            

def get_list_of_patients(provider_uuid, provider_type):
    query = mdls.Patient.objects.filter(assigned_mental_provider__exact=provider_uuid) if provider_type == "m" else mdls.Patient.objects.filter(assigned_physical_provider__exact=provider_uuid)
    return list(query.values())

def _http200():
    return HttpResponse(status=200)

def _http201(message="Created"):
    return HttpResponse(message, status=201)

def _http500(message="Internal Server Error"):
    return HttpResponse(message, status=500)

def _http400(message="Bad Request"):
    return HttpResponse(message, status=400)