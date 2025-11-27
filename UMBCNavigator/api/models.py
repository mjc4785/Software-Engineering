from django.contrib.gis.db import models


# Corresponds to planet_osm_point
class OsmPoint(models.Model):
    osm_id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, null=True)
    geom = models.PointField()

    class Meta:
        managed = False
        db_table = "planet_osm_point"


# Corresponds to planet_osm_polygon
class OsmPolygon(models.Model):
    osm_id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, null=True)
    geom = models.PolygonField()

    class Meta:
        managed = False
        db_table = "planet_osm_polygon"


# Corresponds to custom_poi
class CustomPOI(models.Model):
    name = models.CharField(max_length=255)
    website = models.CharField(max_length=255)
    location_desc = models.TextField(null=True)
    osm_point = models.ForeignKey(
        OsmPoint, null=True, blank=True, on_delete=models.SET_NULL
    )
    osm_polygon = models.ForeignKey(
        OsmPolygon, null=True, blank=True, on_delete=models.SET_NULL
    )

    def geometry(self):
        if self.osm_point:
            return self.osm_point.geom
        if self.osm_polygon:
            return self.osm_polygon.geom
        return None

    class Meta:
        managed = False
        db_table = "custom_poi"
