# Generated by Django 5.0.4 on 2024-11-28 13:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0002_rename_users_members'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Members',
            new_name='Member',
        ),
    ]
