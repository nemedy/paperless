# Generated by Django 3.2.12 on 2022-03-11 15:02

from django.db import migrations


def migrate_tag_to_tags(apps, schema_editor):
    # Manual data migration, see
    # https://docs.djangoproject.com/en/3.2/topics/migrations/#data-migrations
    #
    # Copy the assign_tag property to the new assign_tags set if it exists.
    MailRule = apps.get_model("paperless_mail", "MailRule")
    for mail_rule in MailRule.objects.all():
        if mail_rule.assign_tag:
            mail_rule.assign_tags.add(mail_rule.assign_tag)
            mail_rule.save()


def migrate_tags_to_tag(apps, schema_editor):
    # Manual data migration, see
    # https://docs.djangoproject.com/en/3.2/topics/migrations/#data-migrations
    #
    # Copy the unique value in the assign_tags set to the old assign_tag property.
    # Do nothing if the tag is not unique.
    MailRule = apps.get_model("paperless_mail", "MailRule")
    for mail_rule in MailRule.objects.all():
        tags = mail_rule.assign_tags.all()
        if len(tags) == 1:
            mail_rule.assign_tag = tags[0]
            mail_rule.save()


class Migration(migrations.Migration):
    dependencies = [
        ("paperless_mail", "0009_mailrule_assign_tags"),
    ]

    operations = [
        migrations.RunPython(migrate_tag_to_tags, migrate_tags_to_tag),
    ]
