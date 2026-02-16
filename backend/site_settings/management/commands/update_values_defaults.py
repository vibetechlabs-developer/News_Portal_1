from django.core.management.base import BaseCommand
from site_settings.models import SiteSettings


class Command(BaseCommand):
    help = 'Update existing SiteSettings with default values for the new value fields'

    def handle(self, *args, **options):
        instance = SiteSettings.objects.first()
        if not instance:
            self.stdout.write(self.style.WARNING('No SiteSettings record found. Create one in admin first.'))
            return

        updated = False
        
        # Set default values if they are empty
        if not instance.value1_title_en:
            instance.value1_title_en = "Truth"
            instance.value1_desc_en = "Committed to truthful reporting"
            updated = True
            
        if not instance.value2_title_en:
            instance.value2_title_en = "Community"
            instance.value2_desc_en = "Serving our community"
            updated = True
            
        if not instance.value3_title_en:
            instance.value3_title_en = "Accuracy"
            instance.value3_desc_en = "Precise and verified news"
            updated = True
            
        if not instance.value4_title_en:
            instance.value4_title_en = "Integrity"
            instance.value4_desc_en = "Ethical journalism"
            updated = True

        if updated:
            instance.save()
            self.stdout.write(self.style.SUCCESS('Successfully updated SiteSettings with default values.'))
        else:
            self.stdout.write(self.style.SUCCESS('SiteSettings already has values set.'))
