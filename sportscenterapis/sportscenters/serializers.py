from django.contrib.auth.hashers import make_password
from rest_framework.serializers import ModelSerializer
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
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)