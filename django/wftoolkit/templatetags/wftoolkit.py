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
        "wftoolkit/sankeyfx", # Path to javascript library
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
