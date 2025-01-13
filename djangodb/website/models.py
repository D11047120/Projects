from django.db import models

class Member(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.username + ': ' + self.email
    
class Product(models.Model):
    METRIC_CHOICES = [
        ('g', 'Grams'),
        ('ml', 'Milliliters'),
        ('each', 'Each')
    ]

    name = models.CharField(max_length=100)
    calories = models.PositiveIntegerField()
    protein = models.IntegerField()
    quantity = models.PositiveIntegerField(default=1)
    metric = models.CharField(max_length=10, choices=METRIC_CHOICES)
    

    def __str__(self):
        return self.name