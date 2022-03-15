import uuid
from django.db import models
from django.contrib.auth.models import User

class Provider(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    url_id = models.UUIDField(default=uuid.uuid4, unique=True)
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
            "firstname": self.user.first_name,
            "lastname": self.user.last_name,
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
    uuid = models.UUIDField(primary_key=True, unique=True)
    url_id = models.UUIDField(unique=True)
    assigned_mental_provider = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    assigned_physical_provider = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    verified = models.BooleanField(default=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class TreatmentPlan(models.Model):
    plan_uuid = models.UUIDField(primary_key=True, unique=True)
    assigned_patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

class TreatmentNotes(models.Model):
    note_uuid = models.UUIDField(primary_key=True, unique=True)
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE)
    m_author_uuid = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    p_author_uuid = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    contents = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class TreatmentNoteComments:
    comment_uuid = models.UUIDField(primary_key=True, unique=True)
    m_author_uuid = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    p_author_uuid = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    treatment_note = models.ForeignKey(TreatmentNotes, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    contents = models.TextField()

    