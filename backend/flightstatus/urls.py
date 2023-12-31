# flightstatus/urls.py
from django.urls import path
from .views import get_flight_status

urlpatterns = [
    path('flight-status/<str:flight_iata>/', get_flight_status, name='get_flight_status'),
]
