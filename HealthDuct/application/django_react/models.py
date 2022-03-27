import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

class Provider(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    url_id = models.CharField(default=get_random_string(length=15), max_length=15, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=30, blank=True, null=True)
    contact = models.JSONField(null=True)
    verified = models.BooleanField(default=False)
    affiliated_institution = models.ForeignKey('Institution', on_delete=models.PROTECT, null=True)

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        return super().__init__(*args, **kwargs)

    def public(self, **addtional_info):
        data = {
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "title": self.title,
            "contact": self.contact,
            "institute": self.affiliated_institution,
            "verified": self.verified,
            "url": self.url_id,
        }

        data.update(addtional_info)
        return data

class MentalProvider(Provider):
    def __init__(self, *args, **kwargs):
        self.provider_type = "mental"
        return super().__init__(*args, **kwargs)
    
    def public(self, **addtional_info):
        data = super().public(**addtional_info)
        data["provider_type"] = "mental"
        return data


class PhysicalProvider(Provider):
    def __init__(self, *args, **kwargs):
        self.provider_type = "phys"
        return super().__init__(*args, **kwargs)

    def public(self, **addtional_info):
        data = super().public(**addtional_info)
        data["provider_type"] = "phys"
        return data

class Institution(models.Model):
    uuid = models.UUIDField(primary_key=True, unique=True)
    url_id = models.UUIDField(unique=True)
    name = models.CharField(max_length=30)
    contact = models.JSONField()
    email = models.EmailField(unique=True)
    verified = models.BooleanField(default=False)
    password = models.CharField(max_length=30)

class Patient(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    url_id = models.CharField(default=get_random_string(length=15), max_length=15, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=10, blank=True, null=True)
    assigned_mental_provider = models.OneToOneField(MentalProvider, on_delete=models.CASCADE, null=True)
    assigned_physical_provider = models.OneToOneField(PhysicalProvider, on_delete=models.CASCADE, null=True)
    verified = models.BooleanField(default=False)
    contact = models.JSONField(null=True)

    def __init__(self, *args, **kwargs):
        return super().__init__(*args, **kwargs)

    def public(self, **addtional_info):
        data = {
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "title": self.title,
            "contact": self.contact,
            "verified": self.verified,
            "url": self.url_id,
            "assigned_pcp": None if self.assigned_physical_provider is None else self.assigned_physical_provider.user.last_name,
            "assigned_mp": None if self.assigned_mental_provider is None else self.assigned_mental_provider.user.last_name,
            "provider_type": "patient"
        }

        data.update(addtional_info)
        return data

class TreatmentPlan(models.Model):
    plan_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    assigned_patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

class TreatmentNotes(models.Model):
    note_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE)
    m_author_uuid = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    p_author_uuid = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    contents = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class TreatmentNoteComments(models.Model):
    comment_uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    m_author_uuid = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    p_author_uuid = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    treatment_note = models.ForeignKey(TreatmentNotes, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    contents = models.TextField()

class PatientInviteCode(models.Model):
    patient_uuid = models.ForeignKey(Patient, on_delete=models.CASCADE)
    code = models.CharField(default=get_random_string(length=10), max_length=10, unique=True)
    valid_for_mp = models.BooleanField(default=True)
    valid_for_pcp = models.BooleanField(default=True)