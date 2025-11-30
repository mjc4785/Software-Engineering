from django.shortcuts import render
import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.http import JsonResponse
from .models import CustomPOI, OsmPoint, OsmPolygon
import random

# geospatial
from django.contrib.gis.geos import Point, GEOSGeometry, Polygon, MultiPolygon
from django.db import connection
import json

from pathlib import Path
import os
from dotenv import load_dotenv  # <--- Import this

# Load environment variables from .env file
load_dotenv()

ORS_API_KEY = os.getenv("ORS_KEY")


@api_view(["GET"])
def get_route(request):
    start = request.GET.get("start")
    end = request.GET.get("end")

    url = "https://api.openrouteservice.org/v2/directions/foot-walking"
    headers = {
        "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0="
    }
    params = {"start": start, "end": end}

    r = requests.get(url, headers=headers, params=params)
    return Response(r.json())


def test_endpoint(request):
    return Response({"message": "Hello from Django!"})


# views.py
import json
import requests
from django.http import JsonResponse
from django.conf import settings  # Assuming you put your key in settings.py


def get_walking_directions(request):
    # 1. Get coordinates from the request URL parameters
    start_lat = request.GET.get("start_lat")
    start_lon = request.GET.get("start_lon")
    end_lat = request.GET.get("end_lat")
    end_lon = request.GET.get("end_lon")

    # start_lat = 39.25431410070744
    # start_lon = -76.7133101777004
    # end_lat = 39.256981310658794
    # end_lon = -76.7069603775125

    if not all([start_lat, start_lon, end_lat, end_lon]):
        return JsonResponse({"error": "Missing coordinates"}, status=400)

    # 2. Call OpenRouteService (Server-side)
    # Move your ORS_API_KEY to your Django settings or .env file!
    api_key = ORS_API_KEY

    url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
    headers = {"Authorization": api_key, "Content-Type": "application/json"}
    body = {
        "coordinates": [
            [float(start_lon), float(start_lat)],
            [float(end_lon), float(end_lat)],
        ],
        "instructions": True,  # We need the text instructions
        "language": "en",
    }

    try:
        response = requests.post(url, json=body, headers=headers)
        data = response.json()

        # 3. Parse and Clean the Data
        feature = data["features"][0]

        # Extract the raw geometry (coordinates for the blue line)
        # ORS GeoJSON is [lon, lat], React Native Maps needs {latitude, longitude}
        raw_coords = feature["geometry"]["coordinates"]
        formatted_coords = [{"latitude": c[1], "longitude": c[0]} for c in raw_coords]

        # Extract segments (the text instructions)
        segments = feature["properties"]["segments"][0]
        steps_raw = segments["steps"]

        formatted_steps = []
        for index, step in enumerate(steps_raw):
            formatted_steps.append(
                {
                    "id": index,
                    "text": step["instruction"],
                    "distance": f"{step['distance']}m",
                    # way_points tells us which part of the coordinate array belongs to this step
                    # e.g., [0, 10] means coords[0] to coords[10]
                    "way_points": step["way_points"],
                }
            )

        # 4. Return clean JSON to the app
        return JsonResponse(
            {
                "route_geometry": formatted_coords,
                "steps": formatted_steps,
                "total_time": f"{round(segments['duration'] / 60)} min",
                "total_distance": f"{round(segments['distance'])} m",
            }
        )

    except Exception as e:
        print(f"Error fetching directions: {e}")
        return JsonResponse({"error": "Failed to fetch directions"}, status=500)


# ---------------------------
#  CUSTOM POI → GEOJSON
# ----------------------------
def pois_geojson(request):
    features = []

    for poi in CustomPOI.objects.all():
        if poi.coordinates:
            coordinates = poi.coordinates

        elif poi.osm_object:
            try:
                parent = OsmPolygon.objects.get(osm_id=poi.osm_object)

                if parent.way:
                    coordinates = random_point_in_polygon(parent.way)
                else:
                    continue

            except OsmPolygon.DoesNotExist:
                continue

        else:
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

    data = {"type": "FeatureCollection", "features": features}
    return JsonResponse(data)


from django.http import JsonResponse
from django.contrib.gis.geos import Point
import random
from .models import CustomPOI, OsmPoint, OsmPolygon


from django.http import JsonResponse
from django.contrib.gis.geos import Point
import random
from .models import (
    CustomPOI,
    OsmPoint,
    OsmPolygon,
    POIAlias,
)


from django.http import JsonResponse
from django.contrib.gis.geos import Point
import random
from .models import CustomPOI, OsmPoint, OsmPolygon, POIAlias


def random_point_in_polygon(poly):
    """Generate a random point inside a polygon"""
    min_x, min_y, max_x, max_y = poly.extent
    while True:
        p = Point(random.uniform(min_x, max_x), random.uniform(min_y, max_y))
        if poly.contains(p):
            return p


def search_pois(request):
    query = request.GET.get("q", "").strip()

    # --- Search by name ---
    custom_qs = CustomPOI.objects.filter(name__icontains=query)
    point_qs = OsmPoint.objects.filter(name__icontains=query)
    polygon_qs = OsmPolygon.objects.filter(name__icontains=query)

    # --- Search by aliases ---
    alias_qs = POIAlias.objects.filter(alias__icontains=query)

    # Collect object IDs from aliases
    custom_ids = [a.custom_poi for a in alias_qs if a.custom_poi]
    osm_ids = [a.osm_object for a in alias_qs if a.osm_object]

    # Merge alias results with original querysets
    if custom_ids:
        custom_qs = custom_qs | CustomPOI.objects.filter(poi_id__in=custom_ids)
    if osm_ids:
        point_qs = point_qs | OsmPoint.objects.filter(osm_id__in=osm_ids)
        polygon_qs = polygon_qs | OsmPolygon.objects.filter(osm_id__in=osm_ids)

    features = []

    # --- CUSTOM POIs ---
    for poi in custom_qs.distinct():
        if poi.coordinates:
            pt = poi.coordinates
        elif poi.osm_object:
            try:
                poly = OsmPolygon.objects.get(osm_id=poi.osm_object)
                pt = random_point_in_polygon(poly.way)
            except OsmPolygon.DoesNotExist:
                continue
        else:
            continue

        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [pt.x, pt.y]},
                "properties": {
                    "poi_id": poi.poi_id,
                    "name": poi.name,
                    "source": "custom",
                },
            }
        )

    # --- OSM POINTS ---
    for p in point_qs.distinct():
        if not p.way:
            continue
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [p.way.x, p.way.y]},
                "properties": {
                    "osm_id": p.osm_id,
                    "name": p.name,
                    "source": "osm_point",
                },
            }
        )

    # --- OSM POLYGONS → random interior point ---
    for poly in polygon_qs.distinct():
        if not poly.way:
            continue
        pt = random_point_in_polygon(poly.way)
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [pt.x, pt.y]},
                "properties": {
                    "osm_id": poly.osm_id,
                    "name": poly.name,
                    "source": "osm_polygon",
                },
            }
        )

    return JsonResponse({"type": "FeatureCollection", "features": features})
