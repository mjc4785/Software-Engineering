from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

@api_view(['GET'])
def get_route(request):
    start = request.GET.get('start')
    end = request.GET.get('end')

    # Example: calling external API
    response = requests.get("https://api.mapbox.com/directions/v5/mapbox/driving", params={
        "access_token": "YOUR_MAPBOX_KEY",
        "coordinates": f"{start};{end}"
    })

    return Response(response.json())


# Create your views here.
