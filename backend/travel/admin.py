from django.contrib import admin

# Register your models here.
from .models import Users, Budget, Event
from django.contrib.auth.models import User

class UsersAdmin(admin.ModelAdmin):
    list_display = ('username', 'email')

class BudgetAdmin(admin.ModelAdmin):
    list_display = ('firebase_user_id', 'max_budget')

class EventAdmin(admin.ModelAdmin):
    list_display = ('firebase_user_id', 'event_name', 'event_description', 'event_location', 'event_budget')


admin.site.register(Users, UsersAdmin)
admin.site.register(Budget, BudgetAdmin)
admin.site.register(Event, EventAdmin)