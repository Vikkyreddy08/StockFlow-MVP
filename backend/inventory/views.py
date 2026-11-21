"""Product CRUD views, scoped to the authenticated user's organization."""

from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated

from .models import Product
from .serializers import ProductSerializer


class OrganizationScopedMixin:
    """Restricts every queryset to the authenticated user's organization."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        organization = self.request.user.organization
        if organization is None:
            return Product.objects.none()
        return Product.objects.filter(organization=organization)


class ProductListCreateView(OrganizationScopedMixin, generics.ListCreateAPIView):
    """GET /api/products/  - list the organization's products.
    POST /api/products/ - create a product for the organization.
    """

    serializer_class = ProductSerializer

    def perform_create(self, serializer):
        organization = self.request.user.organization
        if organization is None:
            raise serializers.ValidationError(
                {'organization': 'Your account is not linked to an organization.'}
            )
        serializer.save(organization=organization)


class ProductDetailView(OrganizationScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/products/<id>/ for the organization's products."""

    serializer_class = ProductSerializer
