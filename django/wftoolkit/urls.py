from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', render('wftoolkit:home.html'), name='home'),
    url(r'^basics/$', render('wftoolkit:basics.html'), name='basics'),
    # Components
    url(r'^managers/$', render('wftoolkit:managers.html'), name='managers'),
    url(r'^charts/$', render('wftoolkit:charts.html'), name='charts'),
    url(r'^tables/$', render('wftoolkit:tables.html'), name='tables'),
    url(r'^forms/$', render('wftoolkit:forms.html'), name='forms'),
    url(r'^dataview/$', render('wftoolkit:dataview.html'), name='dataview'),
    url(r'^searchcontrols/$', render('wftoolkit:searchcontrols.html'), name='searchcontrols'),
    url(r'^map/$', render('wftoolkit:map.html'), name='map'),
    # Toolkit Components
    url(r'^sankey/$', render('wftoolkit:sankey.html'), name='sankey'),
    url(r'^bubble_chart/$', render('wftoolkit:bubble_chart.html'), name='bubble_chart'),
    url(r'^forcedirected/$', render('wftoolkit:forcedirected.html'), name='forcedirected'),
    url(r'^calendarheatmap/$', render('wftoolkit:calendarheatmap.html'), name='calendarheatmap'),
    url(r'^parcoords/$', render('wftoolkit:parallelcoords.html'), name='parallelcoords'),
    url(r'^parallelsets/$', render('wftoolkit:parallelsets.html'), name='parallelsets'),
    url(r'^sunburst/$', render('wftoolkit:sunburst.html'), name='sunburst'),
    # Examples
    url(r'^dashboarddj/$', render('wftoolkit:dashboarddj.html'), name='dashboarddj'),
    url(r'^dashboardjs/$', render('wftoolkit:dashboardjs.html'), name='dashboardjs'),
    url(r'^savedsearch/$', render('wftoolkit:savedsearch.html'), name='savedsearch'),
    url(r'^postprocess/$', render('wftoolkit:postprocess.html'), name='postprocess'),
    url(r'^cache/$', render('wftoolkit:cache.html'), name='cache'),
    url(r'^form/$', render('wftoolkit:form.html'), name='form'),
    url(r'^cascade/$', render('wftoolkit:cascade.html'), name='cascade'),
    url(r'^properties/$', render('wftoolkit:properties.html'), name='properties'),
    url(r'^timerange/$', render('wftoolkit:timerange.html'), name='timerange'),
    url(r'^timerange_group/$', render('wftoolkit:timerange_group.html'), name='timerange_group'),
    url(r'^multidropdown/$', render('wftoolkit:multidropdown.html'), name='multidropdown'),
    url(r'^search/$', render('wftoolkit:search.html'), name='search'),
    url(r'^interactive/$', render('wftoolkit:interactive.html'), name='interactive'),
    url(r'^chartclick/$', render('wftoolkit:chartclick.html'), name='chartclick'),
    url(r'^custom_table_cells/$', render('wftoolkit:custom_table_cells.html'), name='custom_table_cells'),
    url(r'^databindingjs/$', render('wftoolkit:databindingjs.html'), name='databindingjs'),
    url(r'^maps/$', render('wftoolkit:maps.html'), name='maps'),

    #Extended examples
    url(r'^d3_chart/$', render('wftoolkit:d3_chart.html'), name='d3_chart'),
    url(r'^json_viewer/$', render('wftoolkit:json_viewer.html'), name='json_viewer'),
    url(r'^setup/$', 'wftoolkit.views.setup', name='setup'),
    # Code Stencils
    url(r'^dashboarddj_stencil/$', render('wftoolkit:dashboarddj_stencil.html'), name='dashboarddj_stencil'),
    url(r'^dashboardjs_stencil/$', render('wftoolkit:dashboardjs_stencil.html'), name='dashboardjs_stencil'),
    url(r'^dashboard_stencil1/$', render('wftoolkit:dashboard_stencil1.html'), name='dashboard_stencil1'),
    url(r'^dashboard_stencil2/$', render('wftoolkit:dashboard_stencil2.html'), name='dashboard_stencil2'),

    url(r'^test/$', render('wftoolkit:test.html'), name='test'),
)
