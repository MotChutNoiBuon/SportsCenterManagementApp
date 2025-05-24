from rest_framework import viewsets, generics, status, parsers, permissions, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils.timezone import now
from sportscenters import paginators
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
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

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


class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    pagination_class = paginators.StandardResultsSetPagination



class UserViewSet(generics.UpdateAPIView, viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = paginators.StandardResultsSetPagination

    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes = [permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name']:
                    setattr(u, k, v)
                elif k.__eq__('password'):
                    u.set_password(v)

            u.save()

        return Response(UserSerializer(u).data)


from rest_framework.views import APIView

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        - Nếu có query param `?id=...` thì trả về user tương ứng.
        - Nếu không có thì trả về chính user đang đăng nhập.
        """
        user_id = request.query_params.get('id')

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        else:
            user = request.user

        serializer = UserSerializer(user)
        return Response(serializer.data)

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
