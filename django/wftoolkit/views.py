from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('wftoolkit:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from wftoolkit!",
        "app_name": "wftoolkit"
    }

@render_to('app_name:helloworld.html')
@login_required
def helloworld(request):
    return {}
