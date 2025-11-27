from django.shortcuts import render
import requests

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import requests 

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0="

@api_view(['POST'])
def search_poi(request):
    query = request.data.get("query")
    lat = request.data.get("latitude")
    lon = request.data.get("longitude")

    if not query or lat is None or lon is None:
        return Response({"error": "query, latitude, and longitude required"}, status=400)

    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "text": query,
        "api_key": ORS_API_KEY,
        "boundary.circle.lat": lat,
        "boundary.circle.lon": lon,

        "boundary.circle.radius": 1000,
    }

    resp = requests.get(url, params=params).json()
    return Response(resp)

@api_view(['POST'])
def get_route(request):
    try:
        start = request.data.get("start")
        end = request.data.get("end")

        if not start or not end:
            return Response({"error": "start and end coordinates required"}, status=400)

        url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
        headers = {"Authorization": ORS_API_KEY}

        body = {
            "coordinates": [
                [start["longitude"], start["latitude"]],
                [end["longitude"], end["latitude"]],
            ]
        }

        ors_response = requests.post(url, json=body, headers=headers).json()
        return Response(ors_response)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

def test_endpoint(request):
    return Response({"message": "Hello from Django!"})
