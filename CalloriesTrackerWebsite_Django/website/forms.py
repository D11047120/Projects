from django import forms
from .models import Member , Product

class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['username' ,'email' , 'password']

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'calories', 'protein', 'quantity' , 'metric']
