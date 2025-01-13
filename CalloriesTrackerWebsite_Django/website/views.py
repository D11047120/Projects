from django.shortcuts import render , redirect , get_object_or_404
from .models import Member , Product
from .forms import MemberForm , ProductForm
from django.contrib import messages

def home(request):
    all_members = Member.objects.all
    return render(request, 'home.html',{'all':all_members})

def join(request):
    if request.method == "POST":
        form = MemberForm(request.POST or None)
        if form.is_valid():
            form.save()
        else:
            messages.success(request, ('There was a error in your form! Please try again...'))
            return redirect('join')

        messages.success(request, ("Your Form Has Been Submited Successfully !"))
        return redirect('home')
    else:
        return render(request, 'join.html', {} )
    
def products(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('products')
    else:
        form = ProductForm()
    
    items = Product.objects.all()
    total_calories = sum(item.calories for item in items)
    total_protein = sum(item.protein for item in items)

    return render(request, 'products.html', {
        'form': form,
        'items': items,
        'total_calories': total_calories,
        'total_protein': total_protein
    })
    
def remove_product(request, item_id):
    item = get_object_or_404(Product, id=item_id)
    item.delete()
    return redirect('products')
