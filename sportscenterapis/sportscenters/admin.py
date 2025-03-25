from django.contrib import admin
from sportscenters.models import Trainer, Class, Payment, Enrollment, Progress, Appointment, InternalNews, Notification, User

admin.site.register(Class)
admin.site.register(Payment)
admin.site.register(Enrollment)
admin.site.register(Progress)
admin.site.register(Appointment)
admin.site.register(InternalNews)
admin.site.register(Notification)
admin.site.register(User)
admin.site.register(Trainer)