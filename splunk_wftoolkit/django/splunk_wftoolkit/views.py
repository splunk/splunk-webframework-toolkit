from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

# Imports for the setup view
from .forms import SetupForm
from django.core.urlresolvers import reverse
from splunkdj.setup import config_required
from splunkdj.setup import create_setup_view_context

@render_to('splunk_wftoolkit:home.html')
@login_required
#@config_required   # enable when using a real setup view
def home(request):
    return {
        # No special variables
    }

@render_to()
@login_required
#@config_required   # enable when using a real setup view
def render_page(request, tmpl):
    return {
        "TEMPLATE": "splunk_wftoolkit:%s.html" % tmpl
    }

@render_to('splunk_wftoolkit:setup.html')
@login_required
def setup(request):
    # Renders the setup view, passing the following variables to the template:
    #   * form -- Can be rendered with {{ form.as_p }}.
    #   * configured -- Whether the app has already been configured.
    #                   If false, then the existing configuration is being edited.
    return create_setup_view_context(
        request,
        SetupForm,                  # the form class to use
        # NOTE: Most apps should redirect to the home view 'splunk_wftoolkit:home'
        #       instead of back to the setup page.
        reverse('splunk_wftoolkit:setup'))  # where to redirect after the completing the setup view