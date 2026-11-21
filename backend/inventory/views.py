"""Product CRUD and dashboard views, scoped to the authenticated user's organization."""

from django.db.models import Count, F, Sum
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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


class DashboardView(APIView):
    """GET /api/dashboard/ - inventory summary for the user's organization."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = request.user.organization
        if organization is None:
            return Response(
                {'total_products': 0, 'total_stock': 0, 'low_stock_items': []}
            )

        products = Product.objects.filter(organization=organization)

        totals = products.aggregate(
            total_products=Count('id'),
            total_stock=Sum('quantity_on_hand'),
        )

        low_stock_items = products.filter(
            low_stock_threshold__isnull=False,
            quantity_on_hand__lte=F('low_stock_threshold'),
        ).values('id', 'name', 'sku', 'quantity_on_hand', 'low_stock_threshold')

        return Response(
            {
                'total_products': totals['total_products'],
                'total_stock': totals['total_stock'] or 0,
                'low_stock_items': list(low_stock_items),
            }
        )
