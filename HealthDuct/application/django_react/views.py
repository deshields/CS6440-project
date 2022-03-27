
import django_react.models as mdls
import json
import logging

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.hashers import make_password


logging.basicConfig(level=logging.INFO)
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

def get_provider_info(request, url_id):
    # url_id will probably be encrypted at some point
    provider = mdls.PhysicalProvider.objects.get(url_id=url_id) or mdls.MentalProvider.objects.get(url_id=url_id)
    if provider is None:
        return _http400("User doesn't exist")
    patients = get_list_of_patients(provider.uid, provider.provider_type)

    data = provider.public()
    data.update({"patients": patients})
    print(data)

    return JsonResponse({"user_data": data})

def get_patient_info(request, url_id):
    # url_id will probably be encrypted at some point
    patient = get_object_or_404(mdls.Patient, url_id=url_id)
    data = patient.public()

    #get provider info
    mentalP = mdls.MentalProvider.objects.get(uid=patient.assigned_mental_provider).public() if data.get("assigned_mp") is not None else None
    pcP = mdls.PhysicalProvider.objects.get(uid=patient.assigned_physical_provider).public() if data.get("assigned_pcp") is not None else None
    data.update({"provider": {"mental": mentalP, "phys": pcP}})

    return JsonResponse({"user_data": data})


def login(request):
    body = json.loads(request.body)
    # username, password, login type
    data = authenticate(username=body.get("username"), password=body.get("password"), provider_type=body["provider_type"])
    if data is not None:
        return JsonResponse({"user_data": data.public() })
    else:
        return _http400("Crendentials incorrect.")

def verify(request):
    body = json.loads(request.body)
    pt = body.get("provider_type")
    
    if pt == "phys":
        v = mdls.PhysicalProvider.objects.filter(username=body.get("username")).update(verified=True)
    elif pt == "mental":
        v = mdls.MentalProvider.objects.filter(username=body.get("username")).update(verified=True)

    for item in v:
        item.save()

    return _http201(f"Verified {body['username']}")

def make_invite(request):
    body = json.loads(request.body)
    patient_id = body.get("patientId")
    patient = mdls.Patient.objects.get(uid=patient_id)
    mp = True if patient.assigned_mental_provider is None or body.get("newMental") else False
    pcp = True if patient.assigned_physical_provider is None or body.get("newPhys") else False
    invite_code = mdls.PatientInviteCode.objects.create(patient_uuid=patient_id.uid, valid_for_pcp=pcp, valid_for_mp=mp)
    return JsonResponse({"code": invite_code.code})

def get_invite(request):
    body = json.loads(request.body)
    patient_url_id = body.get("patientId")
    patient_id = get_object_or_404(mdls.Patient, url_id=patient_url_id).uid
    invite_code = get_object_or_404(mdls.PatientInviteCode, patient_uuid=patient_id)
    return JsonResponse({"code": invite_code.code})

def update_invite(request):
    body = json.loads(request.body)
    patient_code = body.get("code")
    pt = body.get("provider_type")
    if pt == "phys":
        invite = mdls.PatientInviteCode.objects.filter(code=patient_code).update(valid_for_pcp=False)
    elif pt == "mental":
        invite = mdls.PatientInviteCode.objects.filter(code=patient_code).update(valid_for_mp=False)

    for item in invite:
        if not item["valid_for_pcp"] and not item["valid_for_mp"]:
            item.delete()
        else:
            item.save()
    return _http201(f"Updated Patient Code")

def sign_up(request):
    body = json.loads(request.body)
    pt = body.get("provider_type")
    model = body.get("model")
    user_details = model.get("user")
    provider_details = model.get("provider")
    user_details["password"] = make_password(user_details["password"])

    try:
        new_user, made = User.objects.get_or_create(**user_details)
        sign_up_dict = {
            "mental": mdls.MentalProvider.objects.get_or_create,
            "phys": mdls.PhysicalProvider.objects.get_or_create,
            "patient": mdls.Patient.objects.get_or_create
        }
        if not made:
            return _http400("User Exists")
        obj, created = sign_up_dict[pt](user=new_user, **provider_details)
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
    query = mdls.Patient.objects.filter(assigned_mental_provider__exact=provider_uuid) if provider_type == "mental" else mdls.Patient.objects.filter(assigned_physical_provider__exact=provider_uuid)
    patient_public_data = [patient.public() for patient in list(query.values())]

    return patient_public_data

def _http200():
    return HttpResponse(status=200)

def _http201(message="Created"):
    return HttpResponse(message, status=201)

def _http500(message="Internal Server Error"):
    return HttpResponse(message, status=500)

def _http400(message="Bad Request"):
    return HttpResponse(message, status=400)