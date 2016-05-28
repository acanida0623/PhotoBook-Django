
from django.conf.urls import url
from django.contrib.auth.forms import UserCreationForm
from . import views

urlpatterns = [
    url(r'^$', views.main_view),
    url(r'^accounts/login/$',views.login_home, name='login'),
    url(r'^accounts/login/submit$',views.login_user, name='login_user'),
    url(r'^accounts/logout/$', views.logout_the_user,name = 'logout_the_user'),
    url(r'^user/password/reset/$',
        'django.contrib.auth.views.password_reset',
        {'post_reset_redirect' : '/user/password/reset/done/'},
        name = "password_reset"),
    url(r'^user/password/reset/done/$',
        'django.contrib.auth.views.password_reset_done'),
    url(r'^user/password/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',
        'django.contrib.auth.views.password_reset_confirm',
        {'post_reset_redirect' : '/user/password/done/'}),
    url(r'^user/password/done/$',
        'django.contrib.auth.views.password_reset_complete'),
    url(r'^save/$', views.save_urls, name='save_urls'),
    url(r'^delete/$', views.delete_url, name='delete_url'),
    url(r'^delete/album$', views.delete_album, name='delete_album'),
    url(r'^upload/$', views.upload_images, name='upload'),
    url(r'^upload/s3/$', views.upload_img, name='upload_s3'),
    url(r'^get/$', views.get_albums, name='get_albums'),
    url(r'^get/user$', views.get_user, name='get_user'),

    url(r'^new/album$', views.new_album, name='new_album'),
    url(r'^accounts/new/$', views.new_account, name='new_account'),
    url(r'^accounts/submit/$', views.submit_new_account, name='submit_new_user'),

]
