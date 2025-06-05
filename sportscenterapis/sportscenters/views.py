from rest_framework import viewsets, generics, status, parsers, permissions, filters
from rest_framework.exceptions import PermissionDenied, ValidationError
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
from django.db.models import Q
from django.utils.dateparse import parse_date
from django.db.models import Case, When, F, FloatField, Value
from django.db.models import ExpressionWrapper

class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        queryset = Class.objects.all()
        trainer_id = self.request.query_params.get('trainer')
        if trainer_id:
            queryset = queryset.filter(trainer_id=trainer_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email','full_name', 'phone']
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        queryset = Member.objects.filter(active=True)
        not_in_class = self.request.query_params.get('not_in_class')
        if not_in_class:

            queryset = queryset.exclude(
                id__in=Enrollment.objects.filter(
                    gym_class_id=not_in_class,
                    status='approved'
                ).values_list('member_id', flat=True)
            )
        return queryset


class ReceptionistViewSet(viewsets.ModelViewSet):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer
    pagination_class = paginators.StandardResultsSetPagination


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'member':
            queryset = Enrollment.objects.filter(member=user.member)
        elif user.role == 'receptionist':
            queryset = Enrollment.objects.all()
        elif user.role == 'trainer':
            queryset = Enrollment.objects.filter(gym_class__trainer=user.trainer)
        else:
            return Enrollment.objects.none()

        gym_class_id = self.request.query_params.get('gym_class')
        member_id = self.request.query_params.get('member')

        if gym_class_id:
            queryset = queryset.filter(gym_class_id=gym_class_id)
        if member_id:
            queryset = queryset.filter(member_id=member_id)

        return queryset.select_related('member', 'gym_class')

    def perform_create(self, serializer):
        user = self.request.user
        gym_class = serializer.validated_data['gym_class']
        member = serializer.validated_data.get('member')

        if user.role == 'member':
            member = user.member
        elif user.role == 'receptionist':
            if not member:
                raise ValidationError("Receptionist phải chọn học viên.")
        else:
            raise PermissionDenied("Bạn không có quyền tạo đăng ký.")


        if Enrollment.objects.filter(member=member, gym_class=gym_class).exists():
            raise ValidationError("Học viên đã đăng ký lớp học này rồi.")

        if gym_class.current_capacity >= gym_class.max_members:
            raise ValidationError("Lớp học đã đủ số lượng học viên.")


        serializer.save(member=member)
        gym_class.current_capacity += 1
        gym_class.save()


    def perform_destroy(self, instance):
        gym_class = instance.gym_class
        gym_class.current_capacity = max(0, gym_class.current_capacity - 1)
        gym_class.save()
        instance.delete()


class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination


class TrainerClassListView(generics.ListAPIView):
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            try:
                trainer = Trainer.objects.get(pk=user.pk)
                return Class.objects.filter(trainer=trainer)
            except Trainer.DoesNotExist:
                return Class.objects.none()
        return Class.objects.none()


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.StandardResultsSetPagination

class TrainerStudentListView(generics.ListAPIView):
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role != 'trainer':
            return Member.objects.none()

        try:
            trainer = Trainer.objects.get(pk=user.pk)
        except Trainer.DoesNotExist:
            return Member.objects.none()


        enrollments = Enrollment.objects.filter(
            gym_class__trainer=trainer,
            status='approved'
        ).select_related('member')


        member_ids = enrollments.values_list('member__id', flat=True).distinct()

        return Member.objects.filter(id__in=member_ids)

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
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InternalNewsSerializer
    pagination_class = paginators.StandardResultsSetPagination


class StatisticViewSet(viewsets.ModelViewSet):
    queryset = Statistic.objects.all()
    serializer_class = StatisticSerializer

    @action(detail=False, methods=['get'], url_path='class-members')
    def class_member_stats(self, request):
        period = request.query_params.get('period', 'monthly')

        # Validate period
        if period not in ['weekly', 'monthly', 'yearly']:
            return Response({
                'error': 'Invalid period. Must be weekly, monthly, or yearly'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Parse dates
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        try:
            if start_date_str:
                start_date = parse_date(start_date_str)
                if not start_date:
                    raise ValueError("Invalid start_date format")
                start_date = datetime.combine(start_date, datetime.min.time())
            else:
                start_date = timezone.now() - timedelta(days=365)

            if end_date_str:
                end_date = parse_date(end_date_str)
                if not end_date:
                    raise ValueError("Invalid end_date format")
                end_date = datetime.combine(end_date, datetime.max.time())
            else:
                end_date = timezone.now()

        except ValueError as e:
            return Response({
                'error': f'Invalid date format. Use YYYY-MM-DD. {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate date range
        if start_date >= end_date:
            return Response({
                'error': 'start_date must be before end_date'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            stats = self.get_class_member_stats(period, start_date, end_date)

            # Optional filtering
            class_id = request.query_params.get('class_id')
            trainer_id = request.query_params.get('trainer_id')

            if class_id or trainer_id:
                filtered_stats = []
                for period_stat in stats:
                    filtered_classes = period_stat['classes']

                    if class_id:
                        filtered_classes = [c for c in filtered_classes if c['class_id'] == int(class_id)]

                    if trainer_id:
                        # Filter by trainer - need to check trainer relationship
                        target_classes = Class.objects.filter(trainer_id=trainer_id).values_list('id', flat=True)
                        filtered_classes = [c for c in filtered_classes if c['class_id'] in target_classes]

                    # Recalculate summary stats for filtered data
                    period_stat['classes'] = filtered_classes
                    period_stat['total_classes'] = len(filtered_classes)
                    period_stat['total_new_enrollments'] = sum(c['new_enrollments'] for c in filtered_classes)
                    period_stat['average_occupancy_rate'] = round(
                        sum(c['occupancy_rate'] for c in filtered_classes) / len(filtered_classes)
                        if filtered_classes else 0, 2
                    )

                    filtered_stats.append(period_stat)

                stats = filtered_stats

            return Response({
                'success': True,
                'data': stats,
                'summary': {
                    'period_type': period,
                    'date_range': {
                        'start': start_date.date(),
                        'end': end_date.date()
                    },
                    'total_periods': len(stats)
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'An error occurred while generating statistics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    @action(detail=False, methods=['get'], url_path='class-summary')
    def class_summary_stats(self, request):
        """
        API endpoint để lấy tổng quan thống kê lớp học
        """
        try:
            # Tổng số lớp học active
            total_active_classes = Class.objects.filter(active=True, deleted_at__isnull=True).count()

            # Tổng số enrollment approved
            total_enrollments = Enrollment.objects.filter(status='approved').count()

            # Thống kê theo trạng thái lớp học
            class_status_stats = Class.objects.filter(active=True, deleted_at__isnull=True).values('status').annotate(
                count=Count('id')
            )

            # Top 5 lớp học có nhiều hội viên nhất
            top_classes = Class.objects.filter(active=True, deleted_at__isnull=True).annotate(
                member_count=Count('enrollment', filter=Q(enrollment__status='approved'))
            ).order_by('-member_count')[:5]

            top_classes_data = []
            for cls in top_classes:
                trainer_name = "Chưa có huấn luyện viên"
                if cls.trainer:
                    full_name = cls.trainer.full_name or ""
                    if full_name:
                        trainer_name = f"{full_name}"

                top_classes_data.append({
                    'class_id': cls.id,
                    'class_name': cls.name,
                    'member_count': cls.member_count,
                    'max_capacity': cls.max_members,
                    'occupancy_rate': round((cls.member_count / cls.max_members * 100) if cls.max_members > 0 else 0,
                                            2),
                    'trainer_name': trainer_name
                })

            return Response({
                'success': True,
                'summary': {
                    'total_active_classes': total_active_classes,
                    'total_enrollments': total_enrollments,
                    'class_status_distribution': list(class_status_stats),
                    'top_classes_by_members': top_classes_data
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_class_member_stats(self, period, start_date, end_date):
        """
        Lấy thống kê chi tiết số lượng hội viên của từng lớp học theo thời kỳ
        """
        cache_key = f"class_member_stats_{period}_{start_date.date()}_{end_date.date()}"
        stats = cache.get(cache_key)

        if not stats:
            stats = []

            # Xác định khoảng thời gian cho mỗi period
            delta_map = {
                'weekly': timedelta(days=7),
                'monthly': timedelta(days=30),
                'yearly': timedelta(days=365)
            }
            delta = delta_map.get(period, timedelta(days=30))

            current_date = start_date

            while current_date <= end_date:
                period_end = min(current_date + delta, end_date)

                # Lấy tất cả lớp học active trong khoảng thời gian này
                active_classes = Class.objects.filter(
                    active=True,
                    deleted_at__isnull=True,
                    start_time__lte=period_end,
                    end_time__gte=current_date
                ).select_related('trainer')

                period_stats = {
                    'period_start': current_date.date(),
                    'period_end': period_end.date(),
                    'total_classes': active_classes.count(),
                    'classes': [],
                    'total_new_enrollments': 0,
                    'average_occupancy_rate': 0
                }

                total_occupancy = 0
                valid_classes_count = 0

                for gym_class in active_classes:
                    # Đếm số enrollment approved hiện tại cho lớp này
                    current_enrollments = Enrollment.objects.filter(
                        gym_class=gym_class,
                        status='approved',
                        created_date__lte=period_end
                    ).count()

                    # Đếm số enrollment mới trong khoảng thời gian này
                    new_enrollments = Enrollment.objects.filter(
                        gym_class=gym_class,
                        status='approved',
                        created_date__range=[current_date, period_end]
                    ).count()

                    # Tính tỷ lệ lấp đầy
                    occupancy_rate = 0
                    if gym_class.max_members > 0:
                        occupancy_rate = round((current_enrollments / gym_class.max_members) * 100, 2)
                        total_occupancy += occupancy_rate
                        valid_classes_count += 1

                    class_data = {
                        'class_id': gym_class.id,
                        'class_name': gym_class.name,
                        'trainer_name': gym_class.trainer.full_name if gym_class.trainer and gym_class.trainer.full_name else "Chưa có huấn luyện viên",
                        'trainer_id': gym_class.trainer.id if gym_class.trainer else None,
                        'current_members': current_enrollments,
                        'max_capacity': gym_class.max_members,
                        'new_enrollments': new_enrollments,
                        'occupancy_rate': occupancy_rate,
                        'status': gym_class.status,
                        'price': float(gym_class.price) if gym_class.price else 0
                    }

                    period_stats['classes'].append(class_data)
                    period_stats['total_new_enrollments'] += new_enrollments

                # Tính tỷ lệ lấp đầy trung bình
                if valid_classes_count > 0:
                    period_stats['average_occupancy_rate'] = round(total_occupancy / valid_classes_count, 2)

                # Sắp xếp lớp học theo số lượng hội viên giảm dần
                period_stats['classes'].sort(key=lambda x: x['current_members'], reverse=True)

                stats.append(period_stats)
                current_date += delta

            # Cache kết quả trong 1 giờ
            cache.set(cache_key, stats, timeout=3600)

        return stats

    @action(detail=False, methods=['get'], url_path='dashboard-overview')
    def dashboard_overview(self, request):
        """
        API endpoint để lấy tổng quan dashboard cho admin
        """
        try:
            # Thống kê tổng quan
            total_members = Member.objects.filter(active=True).count()
            total_active_classes = Class.objects.filter(active=True, deleted_at__isnull=True).count()
            total_trainers = Trainer.objects.filter(active=True).count()

            # Thống kê hôm nay
            today = timezone.now().date()
            today_enrollments = Enrollment.objects.filter(
                created_date__date=today,
                status='approved'
            ).count()

            today_revenue = Payment.objects.filter(
                date_paid__date=today,
                status='success'
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Thống kê tuần này
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)

            week_new_members = Member.objects.filter(
                join_date__range=[week_start, week_end]
            ).count()

            week_revenue = Payment.objects.filter(
                date_paid__date__range=[week_start, week_end],
                status='success'
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Top 5 lớp học phổ biến nhất
            popular_classes = Class.objects.filter(
                active=True,
                deleted_at__isnull=True
            ).annotate(
                enrollment_count=Count('enrollment', filter=Q(enrollment__status='approved'))
            ).order_by('-enrollment_count')[:5]

            popular_classes_data = []
            for cls in popular_classes:
                popular_classes_data.append({
                    'id': cls.id,
                    'name': cls.name,
                    'enrollment_count': cls.enrollment_count,
                    'occupancy_rate': round(
                        (cls.enrollment_count / cls.max_members * 100) if cls.max_members > 0 else 0, 2),
                    'trainer_name': f"{cls.trainer.first_name} {cls.trainer.last_name}" if cls.trainer else "N/A"
                })

            # Thống kê theo trạng thái thanh toán
            payment_stats = Payment.objects.values('status').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            )

            return Response({
                'success': True,
                'overview': {
                    'total_members': total_members,
                    'total_active_classes': total_active_classes,
                    'total_trainers': total_trainers,
                    'today_stats': {
                        'new_enrollments': today_enrollments,
                        'revenue': float(today_revenue)
                    },
                    'week_stats': {
                        'new_members': week_new_members,
                        'revenue': float(week_revenue)
                    }
                },
                'popular_classes': popular_classes_data,
                'payment_statistics': list(payment_stats),
                'generated_at': timezone.now()
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='class-performance')
    def class_performance(self, request):
        """
        API endpoint để phân tích hiệu suất của các lớp học
        """
        try:
            # Lấy tham số từ query
            period = request.query_params.get('period', 'monthly')
            limit = int(request.query_params.get('limit', 10))

            # Thống kê hiệu suất lớp học
            classes_performance = Class.objects.filter(
                active=True,
                deleted_at__isnull=True
            ).annotate(
                total_enrollments=Count('enrollment', filter=Q(enrollment__status='approved')),
                total_revenue=Sum('enrollment__member__payment__amount',
                                  filter=Q(enrollment__member__payment__status='success')),
                avg_occupancy=Case(
                    When(max_members__gt=0,
                         then=ExpressionWrapper(
                             F('current_capacity') * 100.0 / F('max_members'),
                             output_field=FloatField()
                         )),
                    default=Value(0),
                    output_field=FloatField()
                )
            ).order_by('-total_enrollments')[:limit]

            performance_data = []

            # Xử lý dữ liệu (thêm logic xử lý của bạn ở đây)
            for class_obj in classes_performance:
                performance_data.append({
                    'id': class_obj.id,
                    'name': class_obj.name,
                    'total_enrollments': class_obj.total_enrollments,
                    'total_revenue': class_obj.total_revenue or 0,
                    'avg_occupancy': round(class_obj.avg_occupancy, 2),
                })

            return Response({
                'status': 'success',
                'data': performance_data
            })

        except ValueError as e:
            return Response({
                'status': 'error',
                'message': f'Invalid parameter: {str(e)}'
            }, status=400)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'An error occurred: {str(e)}'
            }, status=500)
