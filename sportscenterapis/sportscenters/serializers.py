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

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            # Tạo hoặc lấy token cho user
            app = Application.objects.first()  # Lấy application đầu tiên hoặc theo điều kiện cụ thể
            if not app:
                raise serializers.ValidationError("OAuth2 Application chưa được cấu hình.")

            # Tạo access token
            token = AccessToken.objects.create(
                user=user,
                application=app,
                expires=timezone.now() + timedelta(days=1),
                token=f'token_{user.id}_{timezone.now().timestamp()}'  # Tạo token string theo cách của bạn
            )

            return {
                'token': token.token,
                'user_id': user.id,
                'username': user.username
            }
        raise serializers.ValidationError("Tài khoản hoặc mật khẩu không đúng.")

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


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
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


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