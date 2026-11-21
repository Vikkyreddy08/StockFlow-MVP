"""Authentication API tests."""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from organizations.models import Organization, OrganizationSettings

User = get_user_model()

REGISTER_URL = '/api/auth/register/'
LOGIN_URL = '/api/auth/login/'
REFRESH_URL = '/api/auth/token/refresh/'
ME_URL = '/api/auth/me/'

VALID_PASSWORD = 'Str0ngPass!234567'


def register_payload(**overrides):
    payload = {
        'organization_name': 'Acme Corp',
        'email': 'owner@acme.com',
        'password': VALID_PASSWORD,
        'confirm_password': VALID_PASSWORD,
        'first_name': 'Ada',
        'last_name': 'Lovelace',
    }
    payload.update(overrides)
    return payload


class RegistrationTests(APITestCase):
    def test_successful_registration(self):
        response = self.client.post(REGISTER_URL, register_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'owner@acme.com')
        self.assertNotIn('password', response.data['user'])

    def test_registration_creates_organization_and_settings(self):
        self.client.post(REGISTER_URL, register_payload(), format='json')

        organization = Organization.objects.get(name='Acme Corp')
        settings_obj = OrganizationSettings.objects.get(organization=organization)
        user = User.objects.get(email='owner@acme.com')

        self.assertEqual(settings_obj.default_low_stock_threshold, 5)
        self.assertEqual(user.organization, organization)
        self.assertTrue(user.check_password(VALID_PASSWORD))
        self.assertNotEqual(user.password, VALID_PASSWORD)

    def test_duplicate_email_rejected(self):
        self.client.post(REGISTER_URL, register_payload(), format='json')

        response = self.client.post(
            REGISTER_URL,
            register_payload(organization_name='Other Co'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(User.objects.filter(email='owner@acme.com').count(), 1)

    def test_password_mismatch_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            register_payload(confirm_password='Different!234567'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)
        self.assertFalse(User.objects.exists())


class LoginTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name='Acme Corp')
        self.user = User.objects.create_user(
            email='owner@acme.com',
            password=VALID_PASSWORD,
            organization=self.organization,
        )

    def test_successful_login(self):
        response = self.client.post(
            LOGIN_URL,
            {'email': 'owner@acme.com', 'password': VALID_PASSWORD},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        response = self.client.post(
            LOGIN_URL,
            {'email': 'owner@acme.com', 'password': 'WrongPass!234567'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)


class TokenRefreshTests(APITestCase):
    def setUp(self):
        organization = Organization.objects.create(name='Acme Corp')
        User.objects.create_user(
            email='owner@acme.com',
            password=VALID_PASSWORD,
            organization=organization,
        )

    def test_token_refresh(self):
        login = self.client.post(
            LOGIN_URL,
            {'email': 'owner@acme.com', 'password': VALID_PASSWORD},
            format='json',
        )
        refresh = login.data['refresh']

        response = self.client.post(REFRESH_URL, {'refresh': refresh}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class MeTests(APITestCase):
    def setUp(self):
        organization = Organization.objects.create(name='Acme Corp')
        OrganizationSettings.objects.create(organization=organization)
        self.user = User.objects.create_user(
            email='owner@acme.com',
            password=VALID_PASSWORD,
            organization=organization,
        )

    def _authenticate(self):
        login = self.client.post(
            LOGIN_URL,
            {'email': 'owner@acme.com', 'password': VALID_PASSWORD},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_authenticated_me(self):
        self._authenticate()

        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'owner@acme.com')
        self.assertEqual(response.data['organization']['name'], 'Acme Corp')
        self.assertNotIn('password', response.data)

    def test_unauthenticated_me(self):
        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
