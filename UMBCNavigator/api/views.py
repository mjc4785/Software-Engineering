from django.shortcuts import render
import requests

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

ORS_API_KEY = "YOUR_ORS_KEY"


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
