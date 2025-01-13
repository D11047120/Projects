from django.urls import path
from . import views

urlpatterns = [
    path('', views.home , name='home'),
    path('join', views.join , name='join'),
    path('products', views.products , name='products'),
    path('remove/<int:item_id>/', views.remove_product, name='remove_product'),

]
