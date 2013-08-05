from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'testapp.views.home', name='home'), 
    url(r'^helloworld/$', 'app_name.views.helloworld', name='helloworld'),
)
