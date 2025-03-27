from django.contrib.auth.hashers import make_password, check_password
from rest_framework.serializers import ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from .models import Class, Trainer, User

class ClassSerializer(ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

class TrainerSerializer(ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'

class UserSerializer(ModelSerializer):
    username = serializers.CharField(validators=[UniqueValidator(queryset=User.objects.all())])
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},  # Không cho phép chỉnh sửa ID
        }

    def create(self, validated_data):
        """Hash password khi tạo mới user"""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Chỉ hash password nếu nó chưa được mã hóa"""
        password = validated_data.get('password')

        if password:  # Nếu user gửi password mới
            if not instance.password or not check_password(password, instance.password):
                validated_data['password'] = make_password(password)

        return super().update(instance, validated_data)