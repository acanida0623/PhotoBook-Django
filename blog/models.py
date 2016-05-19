from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Post(models.Model):
    author = models.ForeignKey('auth.User')
    title = models.CharField(max_length=200)
    text = models.TextField()
    created_date = models.DateTimeField(
            default=timezone.now)
    published_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey('blog.Post', related_name='comments')
    author = models.CharField(max_length=200)
    text = models.TextField()
    created_date = models.DateTimeField(default=timezone.now)
    approved_comment = models.BooleanField(default=False)

    def approve(self):
        self.approved_comment = True
        self.save()

    def __str__(self):
        return self.text

    def approved_comments(self):
        return self.comments.filter(approved_comment=True)


class UserProfile(models.Model):
    user =  models.OneToOneField(User, unique=True)
    picture = models.URLField(null = True)


class Image(models.Model):
    author = models.ForeignKey(UserProfile, null = True)
    url = models.URLField()
    row = models.CharField(max_length=200, null=True)


class Album(models.Model):
    author = models.ForeignKey(UserProfile, null = True)
    users = models.CharField(max_length=2000, null = True)
    images = models.ManyToManyField(Image, blank=True)
    name = models.CharField(max_length=200)
    created_date = models.DateTimeField(default=timezone.now)

    def Publish(self):
        self.save()
