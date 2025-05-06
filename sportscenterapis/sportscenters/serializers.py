from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.serializers import ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from oauth2_provider.models import AccessToken, Application
from django.utils import timezone
from datetime import timedelta

from .models import Class, Trainer, User, Progress,Receptionist,Payment,Member,Notification,Appointment,InternalNews,Enrollment, Statistic


class ClassSerializer(ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

class TrainerSerializer(ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[UniqueValidator(queryset=User.objects.all())])
    password2 = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'role', 'avatar', 'full_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
        }
    
    def validate(self, attrs):
        # Validation cho đăng ký
        if self.context['request'].method == 'POST':
            if 'password2' not in attrs:
                raise serializers.ValidationError({"password2": "Vui lòng nhập lại mật khẩu."})
                
            if attrs['password'] != attrs.pop('password2', None):
                raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
                
            # Đảm bảo có role
            if 'role' not in attrs:
                attrs['role'] = 'member'  # Mặc định là member
        return attrs
    
    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.avatar:
            representation['avatar'] = instance.avatar.url
        return representation

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class ReceptionistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receptionist
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class InternalNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternalNews
        fields = '__all__'

class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = '__all__'