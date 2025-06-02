from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.serializers import ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Class, Trainer, User, Progress,Receptionist,Payment,Member,Notification,Appointment,InternalNews,Enrollment, Statistic

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone','role']
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance

class ClassSerializer(ModelSerializer):
    is_enrolled = serializers.SerializerMethodField()
    trainer_info = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'description', 'trainer', 'trainer_info',
            'start_time', 'end_time', 'current_capacity', 'max_members',
            'status', 'price', 'is_enrolled'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                member=request.user.member,
                gym_class=obj,
                status='approved'
            ).exists()
        return False

    def get_trainer_info(self, obj):
        if obj.trainer:
            return {
                'id': obj.trainer.id,
                'full_name': f"{obj.trainer.first_name} {obj.trainer.last_name}",
                'specialization': obj.trainer.specialization
            }
        return None

class TrainerSerializer(ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[UniqueValidator(queryset=User.objects.all())])

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'phone', 'email', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'member')  # Mặc định là member nếu không truyền

        # Tạo bản ghi Member nếu là hội viên
        if role == 'member':
            user = Member(**validated_data)
        else:
            user = User(**validated_data)

        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        d = super().to_representation(instance)
        d['avatar'] = instance.avatar.url if instance.avatar else ''
        return d

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class ReceptionistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receptionist
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    member = serializers.PrimaryKeyRelatedField(read_only=True)
    member_detail = UserSerializer(source='member', read_only=True)
    class_detail = ClassSerializer(source='gym_class', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'status',
            'member',
            'member_detail',
            'gym_class',
            'class_detail',
        ]



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
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = InternalNews
        fields = ['id', 'title', 'content', 'created_date', 'updated_date', 'active', 'author_name']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}"


class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = '__all__'