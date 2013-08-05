from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('testapp:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from testapp!",
        "app_name": "testapp"
    }

@render_to('app_name:helloworld.html')
@login_required
def helloworld(request):
    return {}
