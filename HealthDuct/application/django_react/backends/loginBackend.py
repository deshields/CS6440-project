import logging
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User

from django_react.models import PhysicalProvider, MentalProvider, Patient

logger = logging.getLogger('django')

class ProviderBackend(BaseBackend):
    """
    Auth against providers db
    """

    def authenticate(self, request, username=None, password=None, provider_type=None):
        try:
            requesting_user = User.objects.get(username=username)
            if provider_type == "mental":
                provider = MentalProvider.objects.get(user=requesting_user)
                checking = provider.user.check_password(password)
                if checking is True:
                    return provider
                return None
            elif provider_type == "phys":
                provider = PhysicalProvider.objects.get(user=requesting_user)
                if provider.user.check_password(password) is True:
                    return provider
                return None
            elif provider_type == "patient":
                provider = Patient.objects.get(user=requesting_user)
                if provider.user.check_password(password) is True:
                    return provider
                return None
        # except (User.DoesNotExist, MentalProvider.DoesNotExist, PhysicalProvider.DoesNotExist) as err:
        except Exception as err:
            logger.error(f"Error in Provider authentication: {err}")
            return None

    def get_user(self, user_id, user_type):
        try:
            if user_type == "mental":
                return MentalProvider.objects.get(pk=user_id)
            else:
                return PhysicalProvider.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None