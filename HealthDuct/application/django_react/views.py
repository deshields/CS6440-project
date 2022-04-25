
from itertools import count
from math import prod
import django_react.models as mdls
import pandas as pd
import json
import logging
import os
import requests

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.hashers import make_password
from django.utils.crypto import get_random_string

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

def get_or_none(model, *args, **kwargs):
    try:
        return model.objects.get(*args, **kwargs)
    except model.DoesNotExist:
        return None

def get_provider_info(request, url_id):
    # url_id will probably be encrypted at some point
    provider = get_or_none(mdls.PhysicalProvider, url_id=url_id) or get_or_none(mdls.MentalProvider, url_id=url_id)
    if provider is None:
        return _http400("User doesn't exist")
    patients = get_list_of_patients(provider.uid, provider.provider_type)

    data = provider.public()
    data.update({"patients": patients})

    return JsonResponse({"user_data": data})

def get_patient_info(request, url_id):
    # url_id will probably be encrypted at some point
    patient = get_object_or_404(mdls.Patient, url_id=url_id)
    data = patient.public()

    #get provider info
    mentalP = patient.assigned_mental_provider.public() if data.get("assigned_mp") is not None else None
    pcP = patient.assigned_physical_provider.public() if data.get("assigned_pcp") is not None else None
    data.update({"provider": {"mental": mentalP, "phys": pcP}, "prescriptions": patient.drug_list})

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
    url = body.get("patientId")
    patient = mdls.Patient.objects.get(url_id=url)
    mp = True if patient.assigned_mental_provider is None or body.get("newMental") else False
    pcp = True if patient.assigned_physical_provider is None or body.get("newPhys") else False
    invite_code, made = mdls.PatientInviteCode.objects.update_or_create(patient_uuid=patient, defaults={"valid_for_pcp": pcp, "valid_for_mp": mp, "code": get_random_string(length=10)})
    logger.info(invite_code.code)
    return JsonResponse({"code": invite_code.code})

def get_invite(request):
    body = json.loads(request.body)
    patient_url_id = body.get("patientId")
    patient_id = get_object_or_404(mdls.Patient, url_id=patient_url_id)
    invite_code = get_object_or_404(mdls.PatientInviteCode, patient_uuid=patient_id)
    logger.info(invite_code.code)
    return JsonResponse({"code": invite_code.code, "valid_for": {"mental health": invite_code.valid_for_mp, "primary care": invite_code.valid_for_pcp}})

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


def add_patient(request):
    body = json.loads(request.body)
    patient_code = body.get("code")
    user = body.get("url")
    invitation = get_object_or_404(mdls.PatientInviteCode, code=patient_code)
    requesting_provider = get_or_none(mdls.PhysicalProvider, url_id=user) or get_or_none(mdls.MentalProvider, url_id=user)
    if requesting_provider is None:
        return _http400("Provider doesn't exist")
    requested_patient = invitation.patient_uuid
    if requesting_provider.provider_type == "mental":
        requested_patient.assigned_mental_provider = requesting_provider
    elif requesting_provider.provider_type == "phys":
        requested_patient.assigned_physical_provider = requesting_provider
    requested_patient.save()
    return _http201(f"Updated Patient Providers")

def sign_up(request):
    body = json.loads(request.body)
    pt = body.get("provider_type")
    model = body.get("model")
    user_details = model.get("user")
    provider_details = model.get("provider")
    user_details["password"] = make_password(user_details["password"])
    if pt == "patient":
        drugs = _grab_random_meds().values.tolist()
        provider_details["drug_list"] = ",".join([" | ".join(drug) for drug in drugs])

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
    patient_public_data = [patient for patient in list(query.values("user__first_name", "user__last_name", "url_id", "title", "assigned_mental_provider", "assigned_physical_provider"))]
    return patient_public_data

def get_treatment_plan(request):
    body = json.loads(request.body)
    patient_url_id = body.get("patientId")
    patient_id = get_object_or_404(mdls.Patient, url_id=patient_url_id)
    plan = get_or_none( mdls.TreatmentPlan, assigned_patient=patient_id)
    if plan is None:
        return JsonResponse({"plan_note": []})
    plan_notes = mdls.TreatmentNotes.objects.filter(note_uuid=plan.plan_uuid)
    plan_comments = mdls.TreatmentNoteComments.objects.filter(treatment_note__note_uuid=plan.plan_uuid)

    notes = [{"note": note.contents, "author": (note.m_author_uuid or note.p_author_uuid).get_full_name(), "timestamp": note.timestamp, "comments": [{"contents": com.contents, "timestamp": com.timestamp, "author": (note.m_author_uuid or note.p_author_uuid).get_full_name() } for com in list(plan_comments.filter(treatment_note=note.note_uuid).values())]} for note in list(plan_notes.values())]
    return JsonResponse({"plan_note": sorted(notes, key=lambda d: d['timestamp'])})

def add_treatment_note(request):
    body = json.loads(request.body)
    patient_url_id = body.get("patientId")
    patient_id = get_object_or_404(mdls.Patient, url_id=patient_url_id)
    writer = body.get("authorId")
    writer_type = body.get("authorType")
    treatment_plan, _ = mdls.TreatmentPlan.objects.get_or_create(assigned_patient=patient_id)
    treatment_note = mdls.TreatmentNotes(treatment_plan=treatment_plan, contents=body.get("note"))
    if writer_type == "mental":
        treatment_note.m_author_uuid = get_object_or_404(mdls.MentalProvider, url_id=writer)
    else:
        treatment_note.p_author_uuid = get_object_or_404(mdls.PhysicalProvider, url_id=writer)
    treatment_note.save()
    return JsonResponse({"note": treatment_note})

def add_treatment_note_comment(request):
    body = json.loads(request.body)
    patient_url_id = body.get("patientId")
    patient_id = get_object_or_404(mdls.Patient, url_id=patient_url_id)
    note = body.get("noteId")
    writer = body.get("authorId")
    writer_type = body.get("authorType")
    treatment_plan = get_object_or_404(mdls.TreatmentPlan, assigned_patient=patient_id)
    treatment_note = get_object_or_404(mdls.TreatmentNotes, treatment_plan=treatment_plan, note_id=note)
    note_comment = mdls.TreatmentNoteComments(treatment_note=treatment_note, contents=body.get("comment"))
    if writer_type == "mental":
        note_comment.m_author_uuid = writer
    else:
        note_comment.p_author_uuid = writer
    note_comment.save()
    return JsonResponse({"note_comment": note_comment})

def get_drug_label(request, product):
    api = f"https://api.fda.gov/drug/label.json?api_key={os.environ['FDA_KEY']}&search=products.brand_name.exact={product}"
    drug_label_request = requests.get(api)
    ret = {"label": drug_label_request.json()}
    counts = f"https://api.fda.gov/drug/event.json?api_key={os.environ['FDA_KEY']}&search=products.brand_name.exact={product}&count=patient.reaction.reactionmeddrapt.exact"
    counts_request = requests.get(counts)
    ret.update({"reaction_counts": counts_request.json()})
    return JsonResponse(ret)
    

def _grab_random_meds():
    module_dir = os.path.dirname(__file__)
    products = pd.read_csv(f"{module_dir}/data/Products.csv", usecols=["DrugName", "Strength"])
    return products.sample(n = 3)

def _http200():
    return HttpResponse(status=200)

def _http201(message="Created"):
    return HttpResponse(message, status=201)

def _http500(message="Internal Server Error"):
    return HttpResponse(message, status=500)

def _http400(message="Bad Request"):
    return HttpResponse(message, status=400)