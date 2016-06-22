# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-06-20 19:05
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0015_friends_friends'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='users',
            field=models.ManyToManyField(blank=True, related_name='tagged_users', to='blog.UserProfile'),
        ),
        migrations.AlterField(
            model_name='friends',
            name='friends',
            field=models.ManyToManyField(blank=True, related_name='friends_list', to='blog.UserProfile'),
        ),
    ]