from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('wftoolkit:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from wftoolkit!",
        "app_name": "wftoolkit"
    }

@render_to()
@login_required
def render_page(request, tmpl="wftoolkit:home.html"):
    return {
        "TEMPLATE": "wftoolkit:%s.html" % tmpl
    }