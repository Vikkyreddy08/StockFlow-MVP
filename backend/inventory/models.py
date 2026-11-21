from django.db import models

from organizations.models import Organization


class Product(models.Model):
    """A stock item owned by an organization."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='products',
    )
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    quantity_on_hand = models.PositiveIntegerField(default=0)
    cost_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    selling_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    low_stock_threshold = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['organization', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'sku'],
                name='unique_sku_per_organization',
            ),
            models.CheckConstraint(
                condition=models.Q(quantity_on_hand__gte=0),
                name='quantity_on_hand_non_negative',
            ),
            models.CheckConstraint(
                condition=models.Q(low_stock_threshold__gte=0)
                | models.Q(low_stock_threshold__isnull=True),
                name='low_stock_threshold_non_negative',
            ),
        ]

    def __str__(self):
        return f'{self.name} ({self.sku})'
