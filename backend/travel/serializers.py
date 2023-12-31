from rest_framework import serializers
from .models import Users, Budget, Event

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('id', 'username', 'email')

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ('id', 'firebase_user_id', 'max_budget')

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'firebase_user_id', 'event_name', 'event_description', 'event_location', 'event_budget')