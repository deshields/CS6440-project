from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User

from django_react.models import Provider, PhysicalProvider, MentalProvider

class ProvidersBackend(BaseBackend):
    """
    Auth against providers db
    """

    def authenticate(self, request, username=None, password=None, provider_type=None):
        try:
            if provider_type == "mental":
                provider = MentalProvider.objects.get(username=username)
                if provider.user.check_password(password) is True:
                    return PhysicalProvider.public
            elif provider_type == "phys":
                provider = PhysicalProvider.objects.get(username=username)
                if provider.user.check_password(password) is True:
                    return PhysicalProvider.public
        except (Provider.DoesNotExist, MentalProvider.DoesNotExist, PhysicalProvider.DoesNotExist):
            pass

    def get_user(self, user_id, user_type):
        try:
            if user_type == "mental":
                return MentalProvider.objects.get(pk=user_id)
            else:
                return PhysicalProvider.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None