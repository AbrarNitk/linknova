from django.db import models
from django.contrib.postgres.fields import ArrayField


# Create your models here.


class DateTimeBase(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Topic(DateTimeBase):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)


class Directory(DateTimeBase):
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    # user = models.CharField(max_length=255)
    # is_active = models.BooleanField(default=True)
    # public = models.BooleanField(default=True)
    # TODO: Handle roles and permission for different users together
    # TODO: Handle collaboration, for now keeping public and private concept
    # If public so any logged in used can add the content to it.


class Bookmark(DateTimeBase):
    title = models.CharField(max_length=1024)
    url = models.CharField(max_length=4096)
    content = models.TextField(null=True, blank=True)
    directory = models.ForeignKey(Directory, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    # img_url = models.CharField(max_length=4096, null=True, blank=True)
    # modified = models.BooleanField(default=False)
    # archived = models.BooleanField(default=False)
    # user = models.CharField(max_length=255)
    # tags = ArrayField(models.IntegerField())
