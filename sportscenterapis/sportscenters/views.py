from django_filters import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.timezone import now
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
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
    AppointmentSerializer, InternalNewsSerializer, StatisticSerializer
)
from .perms import (
    IsAdmin, IsTrainer, IsReceptionist, IsMember, IsTrainerOrAdmin,
    CanManageClass, CanEnrollInClass, CanManagePayments, CanPostInternalNews
)


class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        """Hội viên chỉ thấy lớp `active`, Admin/Lễ tân thấy tất cả"""
        if self.request.user.is_staff:
            return Class.objects.all()
        return Class.objects.filter(status='active', deleted_at__isnull=True)

    def get_permissions(self):
        """Phân quyền API"""
        if self.action in ['create', 'update', 'partial_update']:
            return [CanManageClass()]  # Admin & Huấn luyện viên/Lễ tân được chỉnh sửa lớp
        elif self.action in ['destroy', 'restore']:
            return [permissions.IsAdminUser()]  # Chỉ Admin mới được xóa/khôi phục lớp
        return [permissions.IsAuthenticated()]  # Hội viên chỉ xem danh sách lớp

    def retrieve(self, request, *args, **kwargs):
        """Chặn truy cập lớp đã bị xóa mềm"""
        instance = self.get_object()
        if instance.deleted_at:
            return Response({"error": "Lớp học này không tồn tại hoặc đã bị xóa."}, status=404)
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Xóa mềm lớp học thay vì xóa cứng"""
        instance = self.get_object()

        if instance.deleted_at:
            return Response({"message": f"Lớp học '{instance.name}' đã bị xóa trước đó."}, status=400)

        instance.deleted_at = now()
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã bị xóa mềm."}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        """Khôi phục lớp học đã bị xóa mềm"""
        instance = self.get_object()

        if not instance.deleted_at:
            return Response({"message": "Lớp học này chưa bị xóa."}, status=400)

        instance.deleted_at = None
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã được khôi phục."}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[CanEnrollInClass])
    def enroll(self, request, pk=None):
        """Hội viên đăng ký vào lớp"""
        obj = self.get_object()
        user = request.user

        if obj.deleted_at:
            return Response({"error": "Lớp học này đã bị xóa."}, status=400)

        if obj.is_full():
            return Response({"error": "Lớp học đã đầy."}, status=400)

        if obj.members.filter(id=user.id).exists():
            return Response({"error": "Bạn đã đăng ký lớp này rồi."}, status=400)

        obj.members.add(user)
        return Response({"message": f"Đăng ký lớp '{obj.name}' thành công."}, status=200)


class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [IsTrainer]  # Chỉ Huấn luyện viên mới có quyền truy cập
    pagination_class = paginators.StandardResultsSetPagination


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Cung cấp quyền truy cập công khai cho việc đăng ký và đăng nhập
    pagination_class = paginators.StandardResultsSetPagination

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Trả về thông tin của người dùng đang đăng nhập"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['payment_status']  # Lọc theo trạng thái thanh toán
    search_fields = ['full_name', 'phone']  # Tìm kiếm theo tên hoặc số điện thoại
    pagination_class = paginators.StandardResultsSetPagination


class ReceptionistViewSet(viewsets.ModelViewSet):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer
    permission_classes = [IsReceptionist]  # Nhân viên lễ tân có quyền truy cập
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
    permission_classes = [CanManagePayments]  # Admin hoặc lễ tân có quyền xử lý thanh toán
    pagination_class = paginators.StandardResultsSetPagination


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination


class InternalNewsViewSet(viewsets.ModelViewSet):
    queryset = InternalNews.objects.all()
    serializer_class = InternalNewsSerializer
    permission_classes = [CanPostInternalNews]  # Chỉ Admin hoặc Huấn luyện viên có thể đăng tin
    pagination_class = paginators.StandardResultsSetPagination

class StatisticViewSet(viewsets.ModelViewSet):
    queryset = Statistic.objects.all()
    serializer_class = StatisticSerializer
    permission_classes = [IsAdmin]

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