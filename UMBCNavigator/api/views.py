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
    start = request.data.get("start")     # [lon, lat]
    end = request.data.get("end")         # [lon, lat]

    url = "https://api.openrouteservice.org/v2/directions/foot-walking"
    headers = {"Authorization": ORS_API_KEY}
    body = { "coordinates": [start, end] }

    resp = requests.post(url, json=body, headers=headers).json()
    return Response(resp)

@api_view(["GET"])
def get_route(request):
    start = request.GET.get("start")  # "lon,lat"
    end = request.GET.get("end")  # "lon,lat"

    url = "https://api.openrouteservice.org/v2/directions/foot-walking"
    headers = {
        "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0="
    }
    params = {"start": start, "end": end}

    r = requests.get(url, headers=headers, params=params)
    return Response(r.json())


def test_endpoint(request):
    return Response({"message": "Hello from Django!"})
