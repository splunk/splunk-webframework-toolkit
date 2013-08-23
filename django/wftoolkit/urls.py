from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'wftoolkit.views.home', name='home'), 
    url(r'^helloworld/$', 'wftoolkit.views.helloworld', name='helloworld'),
)
