from django import template
from splunkdj.templatetags.tagutils import component_context
register = template.Library()
@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def chosenselect(context, id, *args, **kwargs):       # The template tag
    return component_context(
        context,
        "chosenselect",                           # The custom view's CSS class name
        id,
        "view",
        "wftoolkit/chosenselect",             # Path to the JavaScript class/file for the view
        kwargs
    )


