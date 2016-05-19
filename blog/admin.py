from django.contrib import admin
from .models import Post, Comment, Image, Album, UserProfile
# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Image)
admin.site.register(Album)
admin.site.register(UserProfile)
