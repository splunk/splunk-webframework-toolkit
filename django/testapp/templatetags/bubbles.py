from django import template
from splunkdj.templatetags.tagutils import component_context
register = template.Library()
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