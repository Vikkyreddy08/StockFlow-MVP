"""Serializers for authentication and the custom user model."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from organizations.models import Organization, OrganizationSettings

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    """Read-only representation of an organization."""

    class Meta:
        model = Organization
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user (never includes the password)."""

    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'organization',
            'is_active',
            'date_joined',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """Creates an Organization, its settings, and the owning User atomically."""

    organization_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True, style={'input_type': 'password'}
    )
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_organization_name(self, value):
        value = value.strip()
        if Organization.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                'An organization with this name already exists.'
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {'confirm_password': 'Passwords do not match.'}
            )
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('confirm_password')

        organization = Organization.objects.create(
            name=validated_data['organization_name']
        )
        OrganizationSettings.objects.create(organization=organization)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            organization=organization,
        )
        return user
