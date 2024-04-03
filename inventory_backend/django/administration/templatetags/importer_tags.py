from django import template
from django.template.defaultfilters import stringfilter
import os

register = template.Library()

@register.filter
@stringfilter
def env(key):
    return os.environ.get(key, None)