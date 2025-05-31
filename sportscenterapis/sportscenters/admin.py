from django.contrib import admin
from sportscenters.models import Trainer, Class, Payment, Enrollment, Progress, Appointment, InternalNews, Notification, User, Member, Receptionist, Statistic
from django import forms
from django.utils.safestring import mark_safe
from django.http import HttpResponse
import csv
from django.shortcuts import render
from django.urls import path
from .views import StatisticViewSet
from datetime import datetime, timedelta
from django.utils import timezone


'''
list_display: Hiển thị các trường quan trọng.

list_filter: Lọc theo các trường có ý nghĩa.

search_fields: Tìm kiếm theo các trường phổ biến.

ordering: Sắp xếp mặc định.

date_hierarchy: Thêm thanh filter theo ngày.

readonly_fields: Chỉ cho phép xem một số trường.
'''
class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = '__all__'

class BaseUserAdmin(admin.ModelAdmin):
    form = UserForm

    def save_model(self, request, obj, form, change):
        password = form.cleaned_data.get('password')
        if password:
            if not password.startswith('pbkdf2_'):
                obj.set_password(password)
            else:
                obj.password = password  # đã băm sẵn
        super().save_model(request, obj, form, change)


class MyAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ DỤC THỂ THAO'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        viewset = StatisticViewSet()
        start_date = timezone.now() - timedelta(days=365)
        end_date = timezone.now()

        # Lấy dữ liệu thống kê
        member_stats = viewset.get_member_stats('monthly', start_date, end_date)
        revenue_stats = viewset.get_revenue_stats('monthly', start_date, end_date)
        class_stats = viewset.get_class_stats('monthly', start_date, end_date)

        context = {
            'site_header': self.site_header,
            'member_stats': member_stats,
            'revenue_stats': revenue_stats,
            'class_stats': class_stats
        }
        return render(request, 'admin/dashboard.html', context)

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'email', 'role', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'role')
    search_fields = ('username', 'email', 'full_name')
    ordering = ['-created_date']
    readonly_fields = ['avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản', {
            'fields': ('username', 'password', 'full_name', 'email', 'role', 'phone', 'avatar', 'avatar_preview')
        }),
        ('Quyền & Trạng thái', {
            'fields': ('is_active',)
        }),
    )

    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"
    avatar_preview.short_description = "Avatar Preview"

class MemberAdmin(BaseUserAdmin):
    list_display = ('full_name', 'payment_status', 'active','avatar_view')
    list_filter = ('payment_status', 'active')
    search_fields = ('full_name', 'payment_status')
    ordering = ['-created_date']
    readonly_fields = ['avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username','password' ,'full_name', 'email', 'role', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)}),
    )
    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"

    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"

    avatar_view.short_description = 'Avatar'

    @admin.action(description="Kích hoạt tài khoản đã chọn")
    def activate_members(self, request, queryset):
        queryset.update(is_active=True)


class TrainerAdmin(BaseUserAdmin):
    list_display = ('full_name', 'specialization', 'experience_years', 'active','avatar_view')
    list_filter = ('specialization', 'active')
    search_fields = ('full_name', 'email', 'specialization')
    ordering = ['-created_date']
    readonly_fields = ['avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username', 'password', 'full_name', 'email', 'role','specialization', 'experience_years', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)})
    )


    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"
    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"
    avatar_view.short_description = 'Avatar'



class ReceptionistAdmin(BaseUserAdmin):
    list_display = ('full_name', 'work_shift', 'active','avatar')
    list_filter = ('work_shift', 'active')
    search_fields = ('full_name', 'email', 'work_shift')
    ordering = ['-created_date']
    readonly_fields = ['avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username', 'password', 'full_name', 'email', 'role', 'work_shift', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)}),
    )
    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"

    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"

    avatar_view.short_description = 'Avatar'

class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'trainer', 'start_time','end_time', 'status', 'price')
    list_filter = ('status', 'trainer')
    search_fields = ('name', 'trainer__full_name')
    ordering = ['-start_time']


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'gym_class', 'status', 'created_date')
    list_filter = ('status', 'gym_class')
    search_fields = ('member__full_name', 'gym_class__name')
    ordering = ['-created_date']
    actions = ['export_enrollments']

    def export_enrollments(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="enrollments.csv"'
        writer = csv.writer(response)
        writer.writerow(['Member', 'Class', 'Status', 'Created Date'])
        for enrollment in queryset:
            writer.writerow([
                enrollment.member.full_name,
                enrollment.gym_class.name,
                enrollment.status,
                enrollment.created_date.date()
            ])
        return response

    export_enrollments.short_description = "Export selected enrollments to CSV"


class ProgressAdmin(admin.ModelAdmin):
    list_display = ('member', 'trainer', 'gym_class')
    search_fields = ('member__full_name', 'trainer__full_name', 'gym_class__name')
    ordering = ['-created_date']



class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'trainer', 'date_time')
    list_filter = ('date_time',)
    search_fields = ('member__full_name', 'trainer__full_name')
    ordering = ['-date_time']

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('member', 'amount', 'payment_method', 'status', 'date_paid')
    list_filter = ('status', 'payment_method')
    search_fields = ('member__full_name', 'transaction_id')
    ordering = ['-date_paid']

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('member', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('member',)
    ordering = ['-created_at']

class InternalNewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_date')
    search_fields = ('title', 'author__full_name')
    ordering = ['-created_date']

class StatisticAdmin(admin.ModelAdmin):
    list_display = ('period_type', 'period_start', 'period_end', 'member_count', 'total_revenue', 'attendance_rate')
    list_filter = ('period_type',)
    actions = ['export_stats']

    def export_stats(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="stats.csv"'
        writer = csv.writer(response)
        writer.writerow(['Period Type', 'Start Date', 'End Date', 'Members', 'Revenue', 'Attendance Rate'])
        for stat in queryset:
            writer.writerow([
                stat.period_type,
                stat.period_start,
                stat.period_end,
                stat.member_count,
                stat.total_revenue,
                stat.attendance_rate
            ])
        return response
    export_stats.short_description = "Export selected statistics to CSV"


admin_site = MyAdminSite(name='myadmin')

admin_site.register(User, UserAdmin)
admin_site.register(Member, MemberAdmin)
admin_site.register(Trainer, TrainerAdmin)
admin_site.register(Receptionist, ReceptionistAdmin)
admin_site.register(Class, ClassAdmin)
admin_site.register(Enrollment, EnrollmentAdmin)
admin_site.register(Progress, ProgressAdmin)
admin_site.register(Appointment, AppointmentAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(Notification, NotificationAdmin)
admin_site.register(InternalNews, InternalNewsAdmin)
admin_site.register(Statistic, StatisticAdmin)