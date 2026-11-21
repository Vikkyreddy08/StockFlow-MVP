"""Product CRUD API tests, including multi-tenant isolation."""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from organizations.models import Organization

from .models import Product

User = get_user_model()

PRODUCTS_URL = '/api/products/'
LOGIN_URL = '/api/auth/login/'
PASSWORD = 'Str0ngPass!234567'


class ProductAPITests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name='Acme Corp')
        self.user = User.objects.create_user(
            email='owner@acme.com', password=PASSWORD, organization=self.organization
        )

        self.other_organization = Organization.objects.create(name='Globex')
        self.other_user = User.objects.create_user(
            email='owner@globex.com',
            password=PASSWORD,
            organization=self.other_organization,
        )

        self.product = Product.objects.create(
            organization=self.organization,
            name='Widget',
            sku='SKU-001',
            quantity_on_hand=10,
        )
        self.other_product = Product.objects.create(
            organization=self.other_organization,
            name='Gizmo',
            sku='SKU-999',
            quantity_on_hand=3,
        )

    def authenticate(self, user=None):
        user = user or self.user
        response = self.client.post(
            LOGIN_URL, {'email': user.email, 'password': PASSWORD}, format='json'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def product_url(self, product_id):
        return f'{PRODUCTS_URL}{product_id}/'

    def payload(self, **overrides):
        data = {'name': 'Gadget', 'sku': 'SKU-002', 'quantity_on_hand': 5}
        data.update(overrides)
        return data

    # --- Happy path -------------------------------------------------------

    def test_create_product_authenticated(self):
        self.authenticate()

        response = self.client.post(PRODUCTS_URL, self.payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['sku'], 'SKU-002')
        self.assertNotIn('organization', response.data)
        product = Product.objects.get(sku='SKU-002')
        self.assertEqual(product.organization, self.organization)

    def test_list_products(self):
        self.authenticate()

        response = self.client.get(PRODUCTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['sku'], 'SKU-001')

    def test_retrieve_product(self):
        self.authenticate()

        response = self.client.get(self.product_url(self.product.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sku'], 'SKU-001')

    def test_update_product(self):
        self.authenticate()

        response = self.client.patch(
            self.product_url(self.product.id), {'quantity_on_hand': 42}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity_on_hand, 42)

    def test_delete_product(self):
        self.authenticate()

        response = self.client.delete(self.product_url(self.product.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    # --- Authentication ---------------------------------------------------

    def test_unauthenticated_rejected(self):
        for method, url in [
            ('get', PRODUCTS_URL),
            ('post', PRODUCTS_URL),
            ('get', self.product_url(self.product.id)),
            ('patch', self.product_url(self.product.id)),
            ('delete', self.product_url(self.product.id)),
        ]:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url)
                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- SKU uniqueness ---------------------------------------------------

    def test_duplicate_sku_within_organization_rejected(self):
        self.authenticate()

        response = self.client.post(
            PRODUCTS_URL, self.payload(sku='SKU-001'), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sku', response.data)

    def test_same_sku_in_different_organizations_allowed(self):
        self.authenticate(self.other_user)

        response = self.client.post(
            PRODUCTS_URL, self.payload(sku='SKU-001'), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Product.objects.filter(
                organization=self.other_organization, sku='SKU-001'
            ).exists()
        )

    # --- Tenant isolation -------------------------------------------------

    def test_cannot_list_other_organization_products(self):
        self.authenticate()

        response = self.client.get(PRODUCTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_skus = [item['sku'] for item in response.data]
        self.assertEqual(returned_skus, ['SKU-001'])
        self.assertNotIn('SKU-999', returned_skus)

    def test_cannot_retrieve_other_organization_product(self):
        self.authenticate()

        response = self.client.get(self.product_url(self.other_product.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_other_organization_product(self):
        self.authenticate()

        response = self.client.patch(
            self.product_url(self.other_product.id),
            {'quantity_on_hand': 0},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_product.refresh_from_db()
        self.assertEqual(self.other_product.quantity_on_hand, 3)

    def test_cannot_delete_other_organization_product(self):
        self.authenticate()

        response = self.client.delete(self.product_url(self.other_product.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Product.objects.filter(id=self.other_product.id).exists())

    # --- Validation -------------------------------------------------------

    def test_negative_quantity_rejected(self):
        self.authenticate()

        response = self.client.post(
            PRODUCTS_URL, self.payload(quantity_on_hand=-1), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity_on_hand', response.data)

    def test_negative_low_stock_threshold_rejected(self):
        self.authenticate()

        response = self.client.post(
            PRODUCTS_URL, self.payload(low_stock_threshold=-5), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('low_stock_threshold', response.data)

    # --- Additional coverage ---------------------------------------------

    def test_user_without_organization_is_isolated(self):
        orphan_user = User.objects.create_user(
            email='nomad@nowhere.com', password=PASSWORD
        )
        self.authenticate(orphan_user)

        create_response = self.client.post(PRODUCTS_URL, self.payload(), format='json')
        self.assertEqual(create_response.status_code, status.HTTP_400_BAD_REQUEST)

        list_response = self.client.get(PRODUCTS_URL)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])

        retrieve_response = self.client.get(self.product_url(self.product.id))
        self.assertEqual(retrieve_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_duplicate_sku_case_insensitive_rejected(self):
        self.authenticate()

        first = self.client.post(
            PRODUCTS_URL, self.payload(sku='SKU-777'), format='json'
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            PRODUCTS_URL, self.payload(sku='sku-777'), format='json'
        )
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sku', second.data)

    def test_update_without_changing_sku_succeeds(self):
        self.authenticate()

        response = self.client.patch(
            self.product_url(self.product.id),
            {'sku': self.product.sku, 'quantity_on_hand': 7},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.sku, 'SKU-001')
        self.assertEqual(self.product.quantity_on_hand, 7)

    def test_update_to_conflicting_sku_rejected(self):
        self.authenticate()
        Product.objects.create(
            organization=self.organization,
            name='Sprocket',
            sku='SKU-555',
            quantity_on_hand=2,
        )

        response = self.client.patch(
            self.product_url(self.product.id), {'sku': 'SKU-555'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sku', response.data)
        self.product.refresh_from_db()
        self.assertEqual(self.product.sku, 'SKU-001')

    def test_put_requires_fields_and_patch_is_partial(self):
        self.authenticate()

        put_response = self.client.put(
            self.product_url(self.product.id), {'quantity_on_hand': 5}, format='json'
        )
        self.assertEqual(put_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', put_response.data)
        self.assertIn('sku', put_response.data)

        patch_response = self.client.patch(
            self.product_url(self.product.id), {'quantity_on_hand': 9}, format='json'
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity_on_hand, 9)
        self.assertEqual(self.product.name, 'Widget')
        self.assertEqual(self.product.sku, 'SKU-001')
