from rest_framework import viewsets, generics, status, parsers, permissions, filters, serializers
from rest_framework.serializers import PrimaryKeyRelatedField
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils.timezone import now
from sportscenters import paginators, perms, serializers
from datetime import datetime, timedelta
from django.db.models import Sum, Count
from django.utils import timezone
from django.core.cache import cache
from .models import (
    Class, Trainer, User, Progress, Member, Enrollment, Payment,
    InternalNews, Appointment, Notification, Receptionist, Statistic
)
from .serializers import (
    ClassSerializer, TrainerSerializer, UserSerializer, NotificationSerializer, ReceptionistSerializer,
    MemberSerializer, PaymentSerializer, ProgressSerializer, EnrollmentSerializer,
    AppointmentSerializer, InternalNewsSerializer, StatisticSerializer, UserProfileSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.filter(active=True)
    serializer_class = ClassSerializer
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()

        id = self.request.query_params.get('id')
        if id:
            queryset = queryset.filter(id=id)

        trainer_id = self.request.query_params.get('trainer_id')
        if trainer_id:
            queryset = queryset.filter(trainer_id=trainer_id)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

'''
    def get_queryset(self):
        if self.request.user.is_staff:
            return Class.objects.all()
        return Class.objects.filter(status='active', deleted_at__isnull=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.deleted_at:
            return Response({"error": "Lớp học này không tồn tại hoặc đã bị xóa."}, status=404)
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.deleted_at:
            return Response({"message": f"Lớp học '{instance.name}' đã bị xóa trước đó."}, status=400)

        instance.deleted_at = now()
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã bị xóa mềm."}, status=200)


    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        instance = self.get_object()

        if not instance.deleted_at:
            return Response({"message": "Lớp học này chưa bị xóa."}, status=400)

        instance.deleted_at = None
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã được khôi phục."}, status=200)
'''

class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    pagination_class = paginators.StandardResultsSetPagination



class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    search_fields = ['full_name', 'phone']  # Tìm kiếm theo tên hoặc số điện thoại
    pagination_class = paginators.StandardResultsSetPagination


class ReceptionistViewSet(viewsets.ModelViewSet):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer
    pagination_class = paginators.StandardResultsSetPagination


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination


class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    pagination_class = paginators.StandardResultsSetPagination


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        return Notification.objects.filter(member__user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})

    @action(detail=False, methods=['post'])
    def register_token(self, request):
        push_token = request.data.get('push_token')
        if not push_token:
            return Response({'error': 'Push token is required'}, status=400)
        
        member = Member.objects.get(user=request.user)
        member.push_token = push_token
        member.save()
        return Response({'status': 'success'})

    def create(self, request, *args, **kwargs):
        # This endpoint is used by admin to send notifications
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=403)
        
        member_id = request.data.get('member')
        message = request.data.get('message')
        notification_type = request.data.get('type')
        
        if not all([member_id, message, notification_type]):
            return Response({'error': 'Missing required fields'}, status=400)
        
        try:
            member = Member.objects.get(id=member_id)
            notification = Notification.objects.create(
                member=member,
                message=message,
                type=notification_type
            )
            
            # Send push notification if member has a push token
            if member.push_token:
                self.send_push_notification(member.push_token, message, notification_type)
            
            return Response(self.get_serializer(notification).data)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=404)

    def send_push_notification(self, push_token, message, notification_type):
        try:
            from firebase_admin import messaging
            
            # Create notification message
            notification = messaging.Notification(
                title=self.get_notification_title(notification_type),
                body=message
            )
            
            # Create message
            message = messaging.Message(
                notification=notification,
                token=push_token
            )
            
            # Send message
            response = messaging.send(message)
            print('Successfully sent message:', response)
        except Exception as e:
            print('Error sending push notification:', str(e))

    def get_notification_title(self, notification_type):
        if notification_type == 'class_schedule':
            return 'Lịch học'
        elif notification_type == 'promotion':
            return 'Khuyến mãi'
        elif notification_type == 'reminder':
            return 'Nhắc nhở'
        return 'Thông báo mới'

class InternalNewsViewSet(viewsets.ModelViewSet):
    queryset = InternalNews.objects.all()
    serializer_class = InternalNewsSerializer
    pagination_class = paginators.StandardResultsSetPagination

class StatisticViewSet(viewsets.ModelViewSet):
    queryset = Statistic.objects.all()
    serializer_class = StatisticSerializer
    def get_member_stats(self, period, start_date, end_date):
        """
        Lấy thống kê hội viên với cache.
        """
        cache_key = f"member_stats_{period}_{start_date.date()}_{end_date.date()}"
        stats = cache.get(cache_key)
        if not stats:
            stats = []
            current_date = start_date
            delta = {
                'weekly': timedelta(days=7),
                'monthly': timedelta(days=30),
                'yearly': timedelta(days=365)
            }.get(period, timedelta(days=30))

            while current_date <= end_date:
                period_end = current_date + delta
                member_count = Member.objects.filter(
                    active=True,
                    join_date__lte=period_end.date()
                ).count()
                new_members = Member.objects.filter(
                    join_date__range=[current_date.date(), period_end.date()]
                ).count()
                cancelled_members = Member.objects.filter(
                    cancellation_date__range=[current_date.date(), period_end.date()]
                ).count()

                stats.append({
                    'period_start': current_date.date(),
                    'period_end': period_end.date(),
                    'member_count': member_count,
                    'new_members': new_members,
                    'cancelled_members': cancelled_members
                })
                current_date += delta

            cache.set(cache_key, stats, timeout=3600)  # Cache 1 giờ
        return stats

    def get_revenue_stats(self, period, start_date, end_date):
        """
        Lấy thống kê doanh thu với cache.
        """
        cache_key = f"revenue_stats_{period}_{start_date.date()}_{end_date.date()}"
        stats = cache.get(cache_key)
        if not stats:
            stats = []
            current_date = start_date
            delta = {
                'weekly': timedelta(days=7),
                'monthly': timedelta(days=30),
                'yearly': timedelta(days=365)
            }.get(period, timedelta(days=30))

            while current_date <= end_date:
                period_end = current_date + delta
                total_revenue = Payment.objects.filter(
                    date_paid__range=[current_date, period_end],  # Sửa từ payment_date thành date_paid
                    status='completed'
                ).aggregate(total=Sum('amount'))['total'] or 0

                stats.append({
                    'period_start': current_date.date(),
                    'period_end': period_end.date(),
                    'total_revenue': total_revenue
                })
                current_date += delta

            cache.set(cache_key, stats, timeout=3600)  # Cache 1 giờ
        return stats

    def get_class_stats(self, period, start_date, end_date):
        """
        Lấy thống kê lớp học với cache.
        """
        cache_key = f"class_stats_{period}_{start_date.date()}_{end_date.date()}"
        stats = cache.get(cache_key)
        if not stats:
            stats = []
            classes = Class.objects.all()
            for cls in classes:
                total_enrollments = Enrollment.objects.filter(
                    class_id=cls,
                    created_date__date__range=[start_date, end_date]
                ).count()

                stats.append({
                    'class_id': cls.id,
                    'class_name': cls.name,
                    'total_enrollments': total_enrollments
                })

            cache.set(cache_key, stats, timeout=3600)  # Cache 1 giờ
        return stats

    @action(detail=False, methods=['get'], url_path='members')
    def member_stats(self, request):
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date', (timezone.now() - timedelta(days=365)).date())
        end_date = request.query_params.get('end_date', timezone.now().date())

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)

        stats = self.get_member_stats(period, start_date, end_date)
        return Response(stats)

    @action(detail=False, methods=['get'], url_path='revenue')
    def revenue_stats(self, request):
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date', (timezone.now() - timedelta(days=365)).date())
        end_date = request.query_params.get('end_date', timezone.now().date())

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)

        stats = self.get_revenue_stats(period, start_date, end_date)
        return Response(stats)

    @action(detail=False, methods=['get'], url_path='classes')
    def class_stats(self, request):
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date', (timezone.now() - timedelta(days=365)).date())
        end_date = request.query_params.get('end_date', timezone.now().date())

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)

        stats = self.get_class_stats(period, start_date, end_date)
        return Response(stats)
