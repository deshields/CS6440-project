"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django_react import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", views.index),
    path("api/login/", views.login),
    path("api/signup/", views.sign_up),
    path("api/provider/<str:url_id>", views.get_provider_info),
    path("api/patient/<str:url_id>", views.get_patient_info),
    path("api/patient/invite", views.get_invite),
    path("api/patient/invite/new", views.make_invite),
    path("api/patient/invite/update", views.update_invite),
    path("api/verify/", views.verify),
    re_path(r"^(?:.*)/?$", views.index)

    # path("login/", views.view_js_app)
]
