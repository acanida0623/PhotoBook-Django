from django.conf.urls import url
from django.contrib.auth.forms import UserCreationForm
from . import views


urlpatterns = [
    url(r'^$', views.post_list),
    url(r'^save/$', views.save_urls, name='save_urls'),
    url(r'^delete/$', views.delete_url, name='delete_url'),
    url(r'^upload/$', views.upload_images, name='upload'),
    url(r'^get/$', views.get_albums, name='get_albums'),
    url(r'^get/user$', views.get_user, name='get_user'),
    url(r'^post/(?P<pk>\d+)/$', views.post_detail,name='post_detail'),
    url(r'^post/new/$', views.post_new, name='post_new'),
    url(r'^post/(?P<pk>\d+)/edit/$', views.post_edit, name='post_edit'),
    url(r'^drafts/$', views.post_draft_list, name='post_draft_list'),
    url(r'^post/(?P<pk>\d+)/publish/$', views.post_publish, name='post_publish'),
    url(r'^post/(?P<pk>\d+)/remove/$', views.post_remove, name='post_remove'),
    url(r'^post/(?P<pk>\d+)/comment/$', views.add_comment_to_post, name='add_comment_to_post'),
    url(r'^comment/(?P<pk>\d+)/approve/$', views.comment_approve, name='comment_approve'),
    url(r'^comment/(?P<pk>\d+)/remove/$', views.comment_remove, name='comment_remove'),
    url(r'^accounts/new/$', views.new_account, name='new_account'),
    url(r'^accounts/submit/$', views.submit_new_account, name='submit_new_user'),
]
