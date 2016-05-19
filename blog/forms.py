from django import forms

from .models import Post, Comment, UserProfile
from django import forms as baseForms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.admin.widgets import AdminDateWidget

class PostForm(forms.ModelForm):

    class Meta:
        model = Post
        fields = ('title', 'text',)

class CommentForm(forms.ModelForm):

    class Meta:
        model = Comment
        fields = ('author', 'text',)


class UserCreationForm(forms.ModelForm):
    error_messages = {
        'duplicate_username': ("A user with that username already exists."),
        'password_mismatch': ("The two password fields didn't match."),
        'invalid_email': ('Email addresses do not match.'),
    }
    username = forms.RegexField(label=("Username"), max_length=30,
        regex=r'^[\w.@+-]+$',
        help_text=("Required. 30 characters or fewer. Letters, digits and "
                      "@/./+/-/_ only."),
        error_messages={
            'invalid': ("This value may contain only letters, numbers and "
                         "@/./+/-/_ characters.")})
    email = forms.EmailField(label=("Email"))
    confirm = forms.EmailField(label=("Confirm Email"))
    password1 = forms.CharField(label=("Password"),
        widget=forms.PasswordInput)
    password2 = forms.CharField(label=("Password confirmation"),
        widget=forms.PasswordInput,
        help_text=("Enter the same password as above, for verification."))

    class Meta:
        model = User
        fields = ("username",)

    def clean(self):
        username = self.cleaned_data.get("username")
        print("x {x}".format(x=username))
        dupe = True
        try:
            User._default_manager.get(username=username)
        except User.DoesNotExist:
            dupe = False
        if dupe:
            raise forms.ValidationError(self.error_messages['duplicate_username'])
        cleaned_data = super(UserCreationForm, self).clean()
        email = cleaned_data.get("email")
        confirm_email = cleaned_data.get("confirm")
        print(email)
        print(confirm_email)
        if email and confirm_email:
        # Only do something if both fields are valid so far.
            if email != confirm_email:
                raise forms.ValidationError("Emails do not match.")
            if email != confirm_email:
                raise forms.ValidationError("Emails do not match.")

        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'])



        return cleaned_data


    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()

        return user
