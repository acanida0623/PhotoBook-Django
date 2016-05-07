from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render_to_response
from django.utils import timezone
from .models import Post, Comment, Image, Album
from .forms import PostForm, CommentForm, UserCreationForm
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json

# a1 = Album(images=[Image(url='http://imgur.com/gallery/DOn1x3l.jpg')],name='TestAlbum')
# a1.save()
# print(a1)


@login_required
def post_list(request):
    posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('published_date')
    return render(request, 'blog/post_list.html', {
        'posts': Post.objects.all()
    })

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'blog/post_detail.html', {'post': post})


def new_account(request):
    form = UserCreationForm(request.POST)
    return render(request, 'blog/new_user.html',{'form': form})

def submit_new_account(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save(commit=True)
    return redirect('blog.views.post_list')

def upload_images(request):
    return render(request, 'blog/upload.html')


def post_draft_list(request):
    posts = Post.objects.filter(published_date__isnull=True).order_by('created_date')
    return render(request, 'blog/post_draft_list.html', {'posts': posts})

@login_required
@csrf_exempt
def new_album(request):
    req = eval(request.body)
    album_name = str(req['album_name'])
    users = str(req['users'])
    if request.method == "POST":
        same_name = Album.objects.filter(name=album_name, author=request.user)
        try:
            print("123")
            print(same_name.name)
            print(album_name)
            if album_name == same_name.name:
                error = "Album Name Exists"
                return HttpResponse(
                json.dumps(error)
                )
        except:
            new_album = Album(author=request.user,name=album_name,users=users,images="http://i.imgur.com/wFpjb8w.jpg")
            new_album.save()
            success = "Success!"
            return HttpResponse(
            json.dumps(success)
            )

@login_required
def post_edit(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
        form = PostForm(request.POST, instance=post)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.published_date = timezone.now()
            post.save()
            return redirect('post_detail', pk=post.pk)
    else:
        form = PostForm(instance=post)
    return render(request, 'blog/post_edit.html', {'form': form})

@login_required
def post_publish(request, pk):
    post = get_object_or_404(Post, pk=pk)
    post.publish()
    return redirect('blog.views.post_detail', pk=pk)

def post_remove(request, pk):
    post = get_object_or_404(Post, pk=pk)
    post.delete()
    return redirect('blog.views.post_list')

def add_comment_to_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
            return redirect('blog.views.post_detail', pk=post.pk)
    else:
        form = CommentForm()
    return render(request, 'blog/add_comment_to_post.html', {'form': form})

@login_required
def comment_approve(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    comment.approve()
    return redirect('blog.views.post_detail', pk=comment.post.pk)

@login_required
def comment_remove(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    post_pk = comment.post.pk
    comment.delete()
    return redirect('blog.views.post_detail', pk=post_pk)

@csrf_exempt
def save_urls(request):
    if request.is_ajax():
        print('1')
        req = eval(request.body)
        print(req['url'])
        if request.method == 'POST':
            album = Album.objects.filter(name=req['album'])
            user = str(request.user)
            for x in album:
                if x.author == request.user or user in x.users:
                    url_list = Image(author=request.user,url=req['url'])
                    url_list.save()
                    x.images += ","+req['url']
                    x.save()
            return HttpResponse( request )

@csrf_exempt
def delete_url(request):
    if request.is_ajax():
        req = eval(request.body)
        print("YESYES")
        print(req['url'])
        if request.method == 'POST':
            for x in req['url']:
                url_list = Image.objects.filter(author=request.user,url=x)
                url_list.all().delete()
                for album in Album.objects.filter(author=request.user,name=req['album']):
                    alb_delete = ","+x
                    alb2_delete = x+","
                    album.images = album.images.replace(alb_delete,"")
                    album.save()
                    album.images = album.images.replace(alb2_delete,"")
                    album.save()
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
    if request.is_ajax():
        if request.method == 'GET':
            album_url_list = {'user_albums':[],'contr_albums':[]}
            for name in Album.objects.all():
                author = str(name.author)
                if request.user == name.author:
                    album_url_list['user_albums'].append({'urls':name.images,'name':name.name,'author':author})
                user = str(request.user)
                if user in name.users:
                    album_url_list['contr_albums'].append({'urls':name.images,'name':name.name,'author':author})
            print(album_url_list['user_albums'])
            return HttpResponse(
            json.dumps(album_url_list)
            )
