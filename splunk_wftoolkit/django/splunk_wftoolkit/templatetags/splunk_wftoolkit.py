from django import template
from splunkdj.templatetags.tagutils import component_context

register = template.Library()

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sankey(context, id, *args, **kwargs):
    return component_context(
        context, 
        "splunk-toolkit-sankey",        # Splunk registry name
        id, 
        "view",
        "splunk_wftoolkit/sankeychart", # Path to javascript library
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def calendarheatmap(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "calendarheatmap",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/calendarheatmap",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def bubblechart(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "splunk-toolkit-bubble-chart",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/bubblechart",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def forcedirected(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "forcedirected",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/forcedirected",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelsets(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "parallelsets",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/parallelsets",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sunburst(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "sunburst",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/sunburst",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def resultsview(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "splunk-toolkit-results-viewer",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/resultsview",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelcoords(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "parallelcoords",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/parallelcoords",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def fd2(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "fd2",                           # The custom view's CSS class name
        id,
        "view",
        "splunk_wftoolkit/fd2",             # Path to the JavaScript class/file for the view
        kwargs
    )

