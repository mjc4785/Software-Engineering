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


def random_point_in_polygon(poly):
    min_x, min_y, max_x, max_y = poly.extent
    while True:
        p = Point(random.uniform(min_x, max_x), random.uniform(min_y, max_y))
        if poly.contains(p):
            return p


def search_pois(request):
    query = request.GET.get("q", "").strip()

    custom_qs = CustomPOI.objects.all()
    point_qs = OsmPoint.objects.all()
    polygon_qs = OsmPolygon.objects.all()

    if query:
        custom_qs = custom_qs.filter(name__icontains=query)
        point_qs = point_qs.filter(name__icontains=query)
        polygon_qs = polygon_qs.filter(name__icontains=query)

    features = []

    # --- CUSTOM POIs ---
    for poi in custom_qs:
        if poi.coordinates:
            pt = poi.coordinates
        elif poi.osm_object:
            try:
                poly = OsmPolygon.objects.get(osm_id=poi.osm_object)
                pt = random_point_in_polygon(poly.way)
            except:
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
    for p in point_qs:
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

    # --- OSM POLYGONS → convert to random interior point ---
    for poly in polygon_qs:
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
