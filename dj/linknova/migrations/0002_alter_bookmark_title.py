# Generated by Django 4.2.1 on 2024-06-30 15:14

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("linknova", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bookmark",
            name="title",
            field=models.CharField(blank=True, max_length=1024),
        ),
    ]
