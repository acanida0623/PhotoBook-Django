# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-07-07 05:22
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0023_message_messageboard'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='created_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
