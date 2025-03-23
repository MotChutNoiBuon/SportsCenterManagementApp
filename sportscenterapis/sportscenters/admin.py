from django.contrib import admin
from sportscenters.models import Class, Payment, Enrollment, Progress, Appointment, InternalNews, Notification

admin.site.register(Class)
admin.site.register(Payment)
admin.site.register(Enrollment)
admin.site.register(Progress)
admin.site.register(Appointment)
admin.site.register(InternalNews)
admin.site.register(Notification)