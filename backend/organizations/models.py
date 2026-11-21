from django.db import models


class Organization(models.Model):
    """A tenant in StockFlow. Users and products belong to one organization."""

    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class OrganizationSettings(models.Model):
    """Per-organization default settings."""

    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='settings',
    )
    default_low_stock_threshold = models.PositiveIntegerField(default=5)

    def __str__(self):
        return f'Settings for {self.organization.name}'
