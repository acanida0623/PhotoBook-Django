# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-05-20 04:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0009_image_album_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]