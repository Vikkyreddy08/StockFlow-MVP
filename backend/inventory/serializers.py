"""Serializers for the inventory app."""

from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Read/write serializer for products.

    `organization` is intentionally excluded so it can never be supplied or
    modified by the client; the view assigns it from the authenticated user.
    """

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'sku',
            'description',
            'quantity_on_hand',
            'cost_price',
            'selling_price',
            'low_stock_threshold',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_sku(self, value):
        value = value.strip()
        request = self.context.get('request')
        organization = getattr(request.user, 'organization', None) if request else None

        duplicates = Product.objects.filter(organization=organization, sku__iexact=value)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError(
                'A product with this SKU already exists in your organization.'
            )
        return value
