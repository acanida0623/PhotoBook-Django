from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render_to_response
from django.utils import timezone
from .models import Image, Album, UserProfile
from .forms import UserCreationForm
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db.models import Count
import json
from django.template import RequestContext
from django.contrib.auth import authenticate, login, logout
import boto3
from boto3.s3.transfer import S3Transfer
import base64
import uuid
import os

os.environ["AWS_ACCESS_KEY"] = 'AKIAJEIU7WAJGRORW4MQ'
os.environ["AWS_SECRET_KEY"] = '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'
os.environ["S3_BUCKET_NAME"] = 'cloudimgs'

AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY')
AWS_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

@csrf_exempt
def upload_img(request):
    if request.is_ajax():
        if request.method == 'POST':
            uuid_key = uuid.uuid4()
            uuid_key = str(uuid_key)
            uuid_key = uuid_key[0:8]
            img_in_bytes = base64.b64decode(request.POST['image'])
            mime_type = request.POST['mime_type']
            c = boto3.client('s3', 'us-west-2')
            p = c.put_object(Body=img_in_bytes,Bucket=AWS_BUCKET_NAME,Key=uuid_key,ACL="public-read",ContentType=mime_type)
            url = "https://s3-us-west-2.amazonaws.com/{bucket}/{key}".format(bucket=AWS_BUCKET_NAME,key=uuid_key)
            response = {'url':url}
            return HttpResponse( json.dumps(response) )

#BOTO3 TRANSFER
# transfer = S3Transfer(boto3.client('s3', 'us-west-2'))
# transfer.upload_file('/Users/andrewcanida/Documents/cloud_button.png', AWS_BUCKET_NAME, uuid_key+"1",extra_args={'ACL': 'public-read','Content-Type': 'image/png'})

#BOTO1
# c = boto.connect_s3(AWS_ACCESS_KEY,AWS_SECRET_KEY,host="s3-us-west-2.amazonaws.com")
# b = c.get_bucket(AWS_BUCKET_NAME)
# k = Key(b)
# k.key = uuid_key
# k.set_contents_from_string(img_in_bytes)
# k.set_metadata('Content-Type', 'image/jpeg')
# k.set_acl('public-read')


def login_home(request):
    return render(request, 'login.html', {
    })

@csrf_exempt
def login_user(request):
    username = ''
    password = ''
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        print(username)
        print(password)
        user = authenticate(username=username, password=password)
        login(request,user)
        print("!@#!@#!@")
        print(user)
        if user is not None:
            if user.is_active:
                return render(request, 'main_view.html', {
                })
    return render(request, 'main_view.html', {
    })

def logout_the_user(request):
    logout(request)
    return redirect('/accounts/login')


@login_required(login_url='/accounts/login/')
def main_view(request):
    return render(request, 'main_view.html', {
    })


def new_account(request):
    form = UserCreationForm(request.POST)
    return render(request, 'new_user.html',{'form': form})


@csrf_exempt
def submit_new_account(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            UserProfile.objects.create(user = form.save(commit = True))
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request,'new_user.html', {'form': form})



def upload_images(request):
    return render(request, 'upload.html')


@login_required
@csrf_exempt
def new_album(request):
    user = UserProfile.objects.get(user__username=request.user)
    req = eval(request.body)
    album_name = str(req['album_name'])
    users = str(req['users'])
    if request.method == "POST":
        same_name = Album.objects.filter(name=album_name, author=user)
        try:
            if album_name == same_name.name:
                error = "Album Name Exists"
                return HttpResponse(
                json.dumps(error)
                )
        except:
            new_album = Album(author=user,name=album_name,users=users)
            new_album.save()
            print("TEST")
            print(new_album.author)
            new_image = Image(url="http://i.imgur.com/wFpjb8w.jpg",author=user,album_name=new_album.name)
            new_image.save()
            new_album.images.add(new_image)
            new_album.save()
            success = "Success!"
            return HttpResponse(
            json.dumps(success)
            )

@csrf_exempt
def save_urls(request):
    if request.is_ajax():
        req = eval(request.body)
        if request.method == 'POST':

            album = Album.objects.filter(name=req['album'])
            user = str(request.user)
            user_profile = UserProfile.objects.get(user__username=request.user)
            images = []
            for x in album:
                if x.author == user_profile or user in x.users:
                    url_list = Image(author=user_profile,url=req['url'],album_name=req['album'])
                    url_list.save()
                    print(url_list.url)
                    x.images.add(url_list)
                    x.save()
                    img = x.images.all()
                    for y in img:
                        images.append(y.url)
            user = str(request.user)
            album_url_list = fill_albums(user)
            done = {'album':req['album'], 'images':images, 'author':user, 'albums':album_url_list}
            return HttpResponse( json.dumps(done) )

@csrf_exempt
def delete_url(request):
    if request.is_ajax():
        req = eval(request.body)
        print("YESYES")
        print(req['url'])
        if request.method == 'POST':
            user = UserProfile.objects.get(user__username=request.user)
            for x in req['url']:
                x = str(x)
                url_list = Image.objects.get(author=user,url=x,album_name=req['album'])
                album = Album.objects.get(author=user,name=req['album'])
                album.images.remove(url_list)
                album.save()
                url_list.delete()
            return HttpResponse( request )

@csrf_exempt
def get_urls(request):

    if request.is_ajax():
        if request.method == 'GET':
            url_list = []
            for name in Image.objects.filter(author=request.user):
                url_list.append(name.url)
            return HttpResponse(
            json.dumps(url_list)
            )

def get_user(request):
    if request.is_ajax():
        if request.method == 'GET':
            user = str(request.user)
            return HttpResponse(
            json.dumps(user)
            )

def get_albums(request):
    uuid_key = uuid.uuid4()
    print(AWS_ACCESS_KEY)
    if request.is_ajax():
        if request.method == 'GET':
            user = str(request.user)
            album_url_list = fill_albums(user)
            result = {'album_url_list':album_url_list,'user':user}
            return HttpResponse(
            json.dumps(result)
            )

def fill_albums(user):
    album_url_list = {'user_albums':[],'contr_albums':[]}
    for name in Album.objects.annotate(entry_count=Count('images')).order_by('-entry_count'):
        author = str(name.author.user)
        if user == author:
            urls = list(name.images.all().order_by('?'))
            images = []
            for x in urls:
                images.append(x.url)
            album_url_list['user_albums'].append({'urls':images,'name':name.name,'author':author})
        if user in name.users:
            urls2 = list(name.images.all())
            images2 = []
            for x in urls2:
                images2.append(x.url)
            album_url_list['contr_albums'].append({'urls':images2,'name':name.name,'author':author})
    return (album_url_list)

@csrf_exempt
def delete_album(request):
    if request.is_ajax():
        req = eval(request.body)
        if request.method == 'POST':
            user = UserProfile.objects.get(user__username=request.user)
            album_to_delete = Album.objects.get(author=user,name=req['album'])
            imgs = list(album_to_delete.images.all().order_by('-created_date'))
            for x in imgs:
                x.delete()
            album_to_delete.delete()
            user = str(request.user)
            album_url_list = fill_albums(user)
            return HttpResponse(
            json.dumps(album_url_list)
            )
