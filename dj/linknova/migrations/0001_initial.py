# Generated by Django 4.2.1 on 2024-09-15 10:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Bookmark",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_on", models.DateTimeField(auto_now_add=True)),
                ("updated_on", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(blank=True, max_length=1024)),
                ("url", models.CharField(max_length=4096)),
                ("content", models.TextField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "db_table": "linknova_bookmark",
            },
        ),
        migrations.CreateModel(
            name="Topic",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_on", models.DateTimeField(auto_now_add=True)),
                ("updated_on", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(db_index=True, max_length=255, unique=True)),
                ("description", models.CharField(max_length=255)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "db_table": "linknova_topic",
            },
        ),
        migrations.CreateModel(
            name="Directory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_on", models.DateTimeField(auto_now_add=True)),
                ("updated_on", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(db_index=True, max_length=255, unique=True)),
                ("title", models.CharField(blank=True, max_length=255, null=True)),
                ("about", models.TextField(blank=True, null=True)),
                (
                    "topic",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="linknova.topic"
                    ),
                ),
            ],
            options={
                "db_table": "linknova_directory",
            },
        ),
        migrations.CreateModel(
            name="BookmarkDirectoryMapping",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "bookmark",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="linknova.bookmark",
                    ),
                ),
                (
                    "directory",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="linknova.directory",
                    ),
                ),
            ],
            options={
                "db_table": "linknova_bookmark_directory_map",
            },
        ),
    ]
