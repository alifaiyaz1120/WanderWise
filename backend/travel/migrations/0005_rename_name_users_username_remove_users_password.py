# Generated by Django 4.2.5 on 2023-12-06 23:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('travel', '0004_remove_event_budget_event_firebase_user_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='users',
            old_name='name',
            new_name='username',
        ),
        migrations.RemoveField(
            model_name='users',
            name='password',
        ),
    ]
