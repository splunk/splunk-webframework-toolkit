from django import template
from splunkdj.templatetags.tagutils import component_context

register = template.Library()

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sankey(context, id, *args, **kwargs):
    return component_context(
        context, 
        "splunk-toolkit-sankey",
        id, 
        "view",
        "splunk_wftoolkit/components/sankey/sankey",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def calendarheatmap(context, id, *args, **kwargs):
    return component_context(
        context,
        "calendarheatmap",
        id,
        "view",
        "splunk_wftoolkit/components/calendarheatmap/calendarheatmap",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def bubblechart(context, id, *args, **kwargs):
    return component_context(
        context,
        "splunk-toolkit-bubble-chart",
        id,
        "view",
        "splunk_wftoolkit/components/bubblechart/bubblechart",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def forcedirected(context, id, *args, **kwargs):
    return component_context(
        context,
        "forcedirected",
        id,
        "view",
        "splunk_wftoolkit/components/forcedirected/forcedirected",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelsets(context, id, *args, **kwargs):
    return component_context(
        context,
        "parallelsets",
        id,
        "view",
        "splunk_wftoolkit/components/parallelsets/parallelsets",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def sunburst(context, id, *args, **kwargs):
    return component_context(
        context,
        "sunburst",
        id,
        "view",
        "splunk_wftoolkit/components/sunburst/sunburst",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def resultsview(context, id, *args, **kwargs):
    return component_context(
        context,
        "splunk-toolkit-results-viewer",
        id,
        "view",
        "splunk_wftoolkit/components/resultsview/resultsview",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def parallelcoords(context, id, *args, **kwargs):
    return component_context(
        context,
        "parallelcoords",
        id,
        "view",
        "splunk_wftoolkit/components/parallelcoords/parallelcoords",
        kwargs
    )

@register.inclusion_tag('splunkdj:components/component.html', takes_context=True)
def punchcard(context, id, *args, **kwargs):
    return component_context(
        context,
        "punchcard",
        id,
        "view",
        "splunk_wftoolkit/components/punchcard/punchcard",
        kwargs
    )