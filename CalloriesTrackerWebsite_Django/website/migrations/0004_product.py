# Generated by Django 5.0.4 on 2025-01-10 12:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0003_rename_members_member'),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('calories', models.PositiveIntegerField()),
                ('protein', models.PositiveIntegerField()),
                ('metric', models.CharField(choices=[('g', 'Grams'), ('ml', 'Milliliters'), ('each', 'Each')], max_length=10)),
            ],
        ),
    ]