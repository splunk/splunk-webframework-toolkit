from splunkdj.setup import forms   # (1): NOT from django import forms

class SetupForm(forms.Form):
    email = forms.EmailField(
        endpoint='configs/conf-setup', entity='auth', field='email',     # (2)
        max_length=100)
    password = forms.CharField(
        endpoint='configs/conf-setup', entity='auth', field='password',  # (2)
        max_length=100,
        widget=forms.PasswordInput(render_value=True))
