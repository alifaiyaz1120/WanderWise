from django.db import models

# Create your models here.
class Users(models.Model):
    username = models.CharField(max_length=70)
    email = models.EmailField(max_length=100)

class Budget(models.Model):
    firebase_user_id = models.CharField(max_length=100)  # Firebase user ID
    max_budget = models.DecimalField(max_digits=10, decimal_places=2)

class Event(models.Model):
    firebase_user_id = models.CharField(max_length=100, null=True) # Firebase user ID
    event_name = models.CharField(max_length=100)
    event_description = models.TextField()
    event_location = models.CharField(max_length=100)
    event_budget = models.DecimalField(max_digits=10, decimal_places=2)