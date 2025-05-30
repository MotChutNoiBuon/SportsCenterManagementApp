from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField
from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Class, Trainer, User, Progress, Receptionist, Payment, Member, Notification, Appointment, \
    InternalNews, Enrollment, Statistic


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone']
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance


class TrainerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = ['id', 'full_name', 'username', 'avatar']  # Thêm các trường bạn muốn trả về


class ClassSerializer(ModelSerializer):
    trainer = TrainerShortSerializer(read_only=True)
    trainer_id = PrimaryKeyRelatedField(
        queryset=Trainer.objects.all(),
        source='trainer',
        write_only=True
    )

    class Meta:
        model = Class
        fields = ['id', 'name', 'description', 'trainer', 'trainer_id',
                  'start_time', 'end_time', 'max_members', 'status', 'price',
                  'active', 'created_date', 'updated_date']


class TrainerSerializer(ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    username = serializers.CharField(validators=[UniqueValidator(queryset=User.objects.all())])
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all())])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'last_name', 'phone', 'password','role' ,'password2', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')  # Remove password2 as it's not needed
        avatar = validated_data.pop('avatar', None)

        # Set role to member
        validated_data['role'] = 'member'

        # Create Member
        member = Member(**validated_data)
        member.set_password(password)
        if avatar:
            member.avatar = avatar
        member.payment_status = 'unpaid'
        member.save()

        return member

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            if 'password2' not in validated_data:
                raise serializers.ValidationError({"password2": "Cần xác nhận mật khẩu."})
            if validated_data['password'] != validated_data['password2']:
                raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
            instance.set_password(validated_data['password'])
            validated_data.pop('password')
            validated_data.pop('password2')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else None
        return data


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

    def create(self, validated_data):
        data = validated_data.copy()
        # Set role to member by default
        data['role'] = 'member'
        u = Member(**data)
        u.save()
        return u


class ReceptionistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receptionist
        fields = '__all__'


from rest_framework import serializers
from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Enrollment, xử lý dữ liệu đăng ký lớp học.
    """

    class Meta:
        model = Enrollment
        fields = ['id', 'gym_class', 'status', 'created_date', 'updated_date']
        read_only_fields = ['status', 'created_date', 'updated_date']

    def validate(self, data):
        """
        Kiểm tra dữ liệu trước khi tạo bản ghi.
        - Đảm bảo người dùng có hồ sơ thành viên.
        - Kiểm tra trùng lặp đăng ký.
        - Kiểm tra sức chứa lớp học (nếu có).
        """
        request = self.context['request']
        if not hasattr(request.user, 'member'):
            raise serializers.ValidationError("Người dùng không có hồ sơ thành viên.")

        member = request.user.member
        gym_class = data['gym_class']

        # Kiểm tra trùng lặp
        if Enrollment.objects.filter(member=member, gym_class=gym_class).exists():
            raise serializers.ValidationError("Bạn đã đăng ký lớp học này rồi.")

        # Kiểm tra sức chứa lớp học (giả định Class có max_capacity và current_capacity)
        if hasattr(gym_class, 'max_capacity') and hasattr(gym_class, 'current_capacity'):
            if gym_class.current_capacity >= gym_class.max_capacity:
                raise serializers.ValidationError("Lớp học đã đầy.")

        return data

    def create(self, validated_data):
        """
        Tạo bản ghi Enrollment với member được gán từ người dùng hiện tại.
        """
        return Enrollment.objects.create(**validated_data)


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
