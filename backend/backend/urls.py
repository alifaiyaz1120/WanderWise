"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# backend/urls.py
from django.contrib import admin
from django.urls import path, include

from travel import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', views.UsersView, 'user')
router.register(r'budgets', views.BudgetViewSet, basename='budgets')
router.register(r'events', views.EventViewSet, basename='events')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('flightstatus.urls')),  
    path('api/', include(router.urls)), 
    path('check_max_budget/<str:firebase_user_id>/', views.check_max_budget, name='check_max_budget'),
    path('update_max_budget/<str:firebase_user_id>/', views.update_max_budget, name='update_max_budget'),
    path('get_events/<str:firebase_user_id>/', views.get_events_for_user, name='get_events'),
    path('delete_event/<str:firebase_user_id>/<str:event_id>/', views.delete_event, name='delete_event'),
    path('check_username/<str:username>/', views.check_username, name='check_username'),
]


