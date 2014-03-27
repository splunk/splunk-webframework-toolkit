from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', render('splunk_wftoolkit:home.html'), name='home'),
    url(r'^overview/$', render('splunk_wftoolkit:overview.html'), name='overview'),
    # Components
    url(r'^managers/$', render('splunk_wftoolkit:managers.html'), name='managers'),
    url(r'^charts/$', render('splunk_wftoolkit:charts.html'), name='charts'),
    url(r'^tables/$', render('splunk_wftoolkit:tables.html'), name='tables'),
    url(r'^forms/$', render('splunk_wftoolkit:forms.html'), name='forms'),
    url(r'^dataview/$', render('splunk_wftoolkit:dataview.html'), name='dataview'),
    url(r'^searchcontrols/$', render('splunk_wftoolkit:searchcontrols.html'), name='searchcontrols'),
    url(r'^map/$', render('splunk_wftoolkit:map.html'), name='map'),
    # Toolkit Components
    url(r'^toolkitcomponents/$', render('splunk_wftoolkit:toolkitcomponents.html'), name='toolkitcomponents'),
    url(r'^sankey/$', render('splunk_wftoolkit:sankey.html'), name='sankey'),
    url(r'^bubblechart/$', render('splunk_wftoolkit:bubblechart.html'), name='bubblechart'),
    url(r'^forcedirected/$', render('splunk_wftoolkit:forcedirected.html'), name='forcedirected'),
    url(r'^calendarheatmap/$', render('splunk_wftoolkit:calendarheatmap.html'), name='calendarheatmap'),
    url(r'^parcoords/$', render('splunk_wftoolkit:parallelcoords.html'), name='parallelcoords'),
    url(r'^parallelsets/$', render('splunk_wftoolkit:parallelsets.html'), name='parallelsets'),
    url(r'^sunburst/$', render('splunk_wftoolkit:sunburst.html'), name='sunburst'),
    # Examples
    url(r'^dashboarddj/$', render('splunk_wftoolkit:dashboarddj.html'), name='dashboarddj'),
    url(r'^dashboardjs/$', render('splunk_wftoolkit:dashboardjs.html'), name='dashboardjs'),
    url(r'^savedsearch/$', render('splunk_wftoolkit:savedsearch.html'), name='savedsearch'),
    url(r'^postprocess/$', render('splunk_wftoolkit:postprocess.html'), name='postprocess'),
    url(r'^cache/$', render('splunk_wftoolkit:cache.html'), name='cache'),
    url(r'^form/$', render('splunk_wftoolkit:form.html'), name='form'),
    url(r'^cascade/$', render('splunk_wftoolkit:cascade.html'), name='cascade'),
    url(r'^properties/$', render('splunk_wftoolkit:properties.html'), name='properties'),
    url(r'^timerange/$', render('splunk_wftoolkit:timerange.html'), name='timerange'),
    url(r'^timerangegroup/$', render('splunk_wftoolkit:timerangegroup.html'), name='timerangegroup'),
    url(r'^multidropdown/$', render('splunk_wftoolkit:multidropdown.html'), name='multidropdown'),
    url(r'^twosearchbars/$', render('splunk_wftoolkit:twosearchbars.html'), name='twosearchbars'),
    url(r'^search/$', render('splunk_wftoolkit:search.html'), name='search'),
    url(r'^interactive/$', render('splunk_wftoolkit:interactive.html'), name='interactive'),
    url(r'^chartclick/$', render('splunk_wftoolkit:chartclick.html'), name='chartclick'),
    url(r'^customtablecells/$', render('splunk_wftoolkit:customtablecells.html'), name='customtablecells'),
    url(r'^databindingjs/$', render('splunk_wftoolkit:databindingjs.html'), name='databindingjs'),
    url(r'^maps/$', render('splunk_wftoolkit:maps.html'), name='maps'),
    url(r'^airlinedashboard/$', render('splunk_wftoolkit:airlinedashboard.html'), name='airlinedashboard'),

    #Extended examples
    url(r'^d3chart/$', render('splunk_wftoolkit:d3chart.html'), name='d3chart'),
    url(r'^jsonviewer/$', render('splunk_wftoolkit:jsonviewer.html'), name='jsonviewer'),
    url(r'^setup/$', 'splunk_wftoolkit.views.setup', name='setup'),
    # Code Stencils
    url(r'^dashboarddj_stencil/$', render('splunk_wftoolkit:dashboarddj_stencil.html'), name='dashboarddj_stencil'),
    url(r'^dashboardjs_stencil/$', render('splunk_wftoolkit:dashboardjs_stencil.html'), name='dashboardjs_stencil'),
    url(r'^dashboard_stencil1/$', render('splunk_wftoolkit:dashboard_stencil1.html'), name='dashboard_stencil1'),
    url(r'^dashboard_stencil2/$', render('splunk_wftoolkit:dashboard_stencil2.html'), name='dashboard_stencil2'),

    url(r'^splunkdevcli/$', render('splunk_wftoolkit:splunkdevcli.html'), name='splunkdevcli'),

    url(r'^test/$', render('splunk_wftoolkit:test.html'), name='test'),
)
