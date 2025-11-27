from django.contrib.gis.db import models


# Corresponds to planet_osm_point
class OsmPoint(models.Model):
    osm_id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, null=True)
    way = models.PointField()

    class Meta:
        managed = False
        db_table = "planet_osm_point"


# Corresponds to planet_osm_polygon
class OsmPolygon(models.Model):
    osm_id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, null=True)
    way = models.PolygonField()

    class Meta:
        managed = False
        db_table = "planet_osm_polygon"


# Corresponds to custom_poi
class CustomPOI(models.Model):
    poi_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    website = models.CharField(max_length=255)
    location_description = models.TextField(null=True)
    poi_type = models.CharField(max_length=50, blank=True, null=True, db_column="type")
    poi_desc = models.CharField(max_length=255)
    osm_object = models.CharField(max_length=255)
    coordinates = models.PointField(srid=4326)

    class Meta:
        managed = False
        db_table = "custom_poi"
