from django.shortcuts import render
import requests

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.http import JsonResponse
from .models import CustomPOI, OsmPoint, OsmPolygon
import random

# geospacial data django imports
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import LinearRing
from django.contrib.gis.geos import MultiPolygon


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


# For custom_pois that dont have a coordinate, make a random one within the parent polygon
def random_point_in_polygon(polygon):
    """
    Generate a random point inside a polygon.
    Works for Polygon (and not MultiPolygon.)
    """
    # If MultiPolygon, pick a random polygon
    # if polygon.geom_type == "MultiPolygon":
    #     polygon = random.choice(polygon)

    # Map polygon boundaries to a bounding box
    min_x, min_y, max_x, max_y = polygon.extent

    # Generate random point and make sure it's in the polygon
    while True:
        x = random.uniform(min_x, max_x)
        y = random.uniform(min_y, max_y)
        point = Point(x, y)
        if polygon.contains(point):
            return point


# Convert pois into Geojson
def pois_geojson(request):
    features = []

    for poi in CustomPOI.objects.all():
        # Use POI's own coordinates if available
        if poi.coordinates:
            coordinates = poi.coordinates

        # Otherwise, fallback to parent OSM polygon
        elif poi.osm_object:
            try:
                # Get the parent osm_object (a polygon in this case)
                parent = OsmPolygon.objects.get(osm_id=poi.osm_object)

                # If the parent has coordinates (way) then find a random point in it
                if parent.way:
                    coordinates = random_point_in_polygon(parent.way)
                else:
                    # Skip if parent polygon has no geometry
                    continue
            except OsmPolygon.DoesNotExist:
                continue
        else:
            # Skip POIs with no coordinates and no parent
            continue

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [coordinates.x, coordinates.y],
            },
            "properties": {
                "poi_id": poi.poi_id,
                "name": poi.name,
                "location_description": poi.location_description,
                "type": poi.poi_type,
                "poi_desc": poi.poi_desc,
                "website": poi.website,
            },
        }
        features.append(feature)

    data = {
        "type": "FeatureCollection",
        "features": features,
    }

    return JsonResponse(data)
