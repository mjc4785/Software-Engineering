from django.urls import path
from .views import search_poi, get_route

urlpatterns = [
    path("search-poi/", search_poi),
    path("route/", get_route),
]

