from django.shortcuts import render
from rest_framework import viewsets

from .serializers import UsersSerializer, BudgetSerializer, EventSerializer
from .models import Users, Budget, Event
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
import json

# Create your views here.
class UsersView(viewsets.ModelViewSet):
    serializer_class = UsersSerializer
    queryset = Users.objects.all()

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()

    def get_queryset(self):
        # Filter budgets by Firebase user ID passed from frontend
        firebase_user_id = self.request.query_params.get('firebase_user_id')
        return self.queryset.filter(firebase_user_id=firebase_user_id)
    
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_queryset(self):
        # Filter events by Firebase user ID passed from frontend
        firebase_user_id = self.request.query_params.get('firebase_user_id')
        return self.queryset.filter(firebase_user_id=firebase_user_id)

#below are functions for users
def check_username(request, username):
    try: 
        existing_user = Users.objects.get(username=username)
        existing_username = existing_user.username
        return JsonResponse({'username': existing_username})
    except Users.DoesNotExist:
        return JsonResponse({'username': None})

# function for the flight tracker
def search_location(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        location_name = data.get('location_name')

        # Use the Google Places API to search for the location
        # Implement your logic here

        return JsonResponse({"message": "Location search endpoint reached."})
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)
    
# below are all budget tracker functions 

# function to check if the current user has an existing max budget
def check_max_budget(request, firebase_user_id):
    try:
        existing_budget = Budget.objects.get(firebase_user_id=firebase_user_id)
        max_budget = existing_budget.max_budget
        return JsonResponse({'max_budget': max_budget})
    except Budget.DoesNotExist:
        # Return a response indicating that the user does not have a max budget set
        return JsonResponse({'max_budget': None})
    
# updates max budget object in drf
def update_max_budget_for_user(firebase_user_id, new_max_budget):
    try:
        # Get the budget object for the given Firebase user ID
        budget_obj = Budget.objects.get(firebase_user_id=firebase_user_id)

        # Update the max budget field
        budget_obj.max_budget = new_max_budget

        # Save the updated budget object
        budget_obj.save()

        return budget_obj  # Return the updated budget object if needed
    except Budget.DoesNotExist:
        # Handle the case where the budget object doesn't exist for the given user
        return None
    
# gives a message for whether the update of max budget was successful or not
@csrf_exempt
def update_max_budget(request, firebase_user_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)  # Parse JSON data from the request body
            new_max_budget = data.get('new_max_budget')

            if new_max_budget is not None:
                updated_budget = update_max_budget_for_user(firebase_user_id, new_max_budget)
                if updated_budget:
                    return JsonResponse({'success': True, 'message': 'Max budget updated successfully'})
                else:
                    return JsonResponse({'success': False, 'message': 'Budget not found for the user'})
            else:
                return JsonResponse({'success': False, 'message': 'New max budget not provided'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON format in request body'}, status=400)
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})

# function to get current events for a user 
def get_events_for_user(request, firebase_user_id):
    if request.method == 'GET':
        user_events = Event.objects.filter(firebase_user_id=firebase_user_id).values()
        return JsonResponse({'events': list(user_events)})
    else:
        return JsonResponse({'message': 'Invalid request method'})

# function to delete event for a user
@csrf_exempt
def delete_event(request, firebase_user_id, event_id):
    if request.method == 'DELETE':
        try:
            event = Event.objects.get(id=event_id, firebase_user_id=firebase_user_id)
            
            event.delete()
            
            return JsonResponse({'message': 'Event deleted successfully'})
        except Event.DoesNotExist:
            return JsonResponse({'message': 'Event not found'})
    else:
        return JsonResponse({'message': 'Invalid request method'})