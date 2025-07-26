from django.db import models


# Create your models here.


class DateTimeBase(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# Topics are the categorization of the categories
class Topic(DateTimeBase):
    name = models.CharField(max_length=255, db_index=True)
    display_name = models.CharField(max_length=512, null=True, blank=True)
    description = models.CharField(max_length=1024, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    priority = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    public = models.BooleanField(default=False)
    user_id = models.CharField(max_length=255)

    class Meta:
        db_table = "linknova_topic"
        unique_together = ("user_id", "name")


# Directory means categories/label/tags
class Category(DateTimeBase):
    name = models.CharField(max_length=255, db_index=True)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=1024, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    priority = models.IntegerField(default=0)
    user_id = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    # If public so any logged-in user can see the labeled content.
    public = models.BooleanField(default=False)

    # TODO: Handle roles and permission for different users together
    # TODO: Handle collaboration, for now keeping public and private concept
    class Meta:
        db_table = "linknova_category"
        unique_together = ("user_id", "name")


# a topic can have multiple categories
# a category can be present in the multiple topics
class TopicCategoryMapping(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        db_table = "linknova_topic_category_map"
        unique_together = [["category", "topic"]]


class Bookmark(DateTimeBase):
    url = models.CharField(max_length=4096)
    user_id = models.CharField(max_length=255, db_index=True)
    title = models.CharField(max_length=1024, blank=True, null=True)
    content = models.TextField(null=True, blank=True)
    referrer = models.CharField(max_length=1024, blank=True, null=True)
    # UN: Unread
    # RD: Read
    # AR: Archived
    status = models.CharField(max_length=2)

    class Meta:
        db_table = "linknova_bookmark"


#
#
# a bookmark can belongs to multiple categories
class BookmarkCategoryMapping(models.Model):
    bookmark = models.ForeignKey(Bookmark, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        db_table = "linknova_bookmark_category_map"
        unique_together = [["category", "bookmark"]]
