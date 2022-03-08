from django.db import models

class Provider(models.Model):
    uuid = models.UUIDField(primary_key=True, unique=True)
    url_id = models.UUIDField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    title = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField()
    verified = models.BooleanField(default=False)
    username = models.CharField(max_length=30)
    password = models.CharField(max_length=30)
    affiliated_institution = models.ForeignKey('Institution', on_delete=models.PROTECT)
    class Meta:
        abstract = True

class MentalProvider(Provider):
    pass

class PhysicalProvider(Provider):
    pass

class Institution(models.Model):
    uuid = models.UUIDField(primary_key=True, unique=True)
    url_id = models.UUIDField(unique=True)
    name = models.CharField(max_length=30)
    email = models.EmailField()
    verified = models.BooleanField(default=False)
    password = models.CharField(max_length=30)

class Patient(models.Model):
    uuid = models.UUIDField(primary_key=True, unique=True)
    url_id = models.UUIDField(unique=True)
    assigned_mental_provider = models.ForeignKey(MentalProvider, on_delete=models.CASCADE)
    assigned_physical_provider = models.ForeignKey(PhysicalProvider, on_delete=models.CASCADE)
    email = models.EmailField()
    verified = models.BooleanField(default=False)
    password = models.CharField(max_length=30)

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

    