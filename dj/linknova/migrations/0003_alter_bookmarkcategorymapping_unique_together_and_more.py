# Generated by Django 4.2.1 on 2024-09-15 16:28

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("linknova", "0002_auto_20240915_1543"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="bookmarkcategorymapping",
            unique_together={("category", "bookmark")},
        ),
        migrations.AlterUniqueTogether(
            name="topiccategorymapping",
            unique_together={("category", "topic")},
        ),
    ]