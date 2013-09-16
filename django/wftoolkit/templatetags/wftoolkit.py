from django import template
from splunkdj.templatetags.tagutils import component_context

register = template.Library()

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def globe(context, id, *args, **kwargs):
    return component_context(
        context, 
        "splunk-toolkit-globe",        # Splunk registry name
        id, 
        "view",
        "wftoolkit/globefx",  # Path to javascript library
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sankey(context, id, *args, **kwargs):
    return component_context(
        context, 
        "splunk-toolkit-sankey",        # Splunk registry name
        id, 
        "view",
        "wftoolkit/sankeychart", # Path to javascript library
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def calheat(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "calheat",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/calheat",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def bubbles(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "bubbles",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/bubbles",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def forcedirected(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "forcedirected",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/forcedirected",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelsets(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "parallelsets",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/parallelsets",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sunburst(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "sunburst",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/sunburst",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def resultsview(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "splunk-toolkit-results-viewer",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/resultsview",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelcoords(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "parallelcoords",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/parallelcoords",             # Path to the JavaScript class/file for the view
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def fd2(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "fd2",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/fd2",             # Path to the JavaScript class/file for the view
        kwargs
    )

