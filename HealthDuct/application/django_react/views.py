

import django_react.models as mdls
from django.shortcuts import render, redirect

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

def view_js_app(request):
    def redirect_view(request, **kwargs):
        return redirect(f"{request.path}")
    return redirect_view


def get_provider_info():
    pass

def get_list_of_patients(provider_uuid, provider_type):
    query = mdls.Patient.objects.filter(assigned_mental_provider__exact=provider_uuid) if provider_type == "m" else models.Patient.objects.filter(assigned_physical_provider__exact=provider_uuid)
    return list(query.values())
