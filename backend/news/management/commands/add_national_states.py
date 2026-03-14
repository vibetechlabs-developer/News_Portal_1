"""
Management command to populate Indian States/UTs for the National section.
Run once on any server: python manage.py add_national_states
"""
from django.core.management.base import BaseCommand
from news.models import Section, District


INDIAN_STATES = [
    ("Andhra Pradesh", "આંધ્ર પ્રદેશ"),
    ("Arunachal Pradesh", "અરુણાચલ પ્રદેશ"),
    ("Assam", "આસામ"),
    ("Bihar", "બિહાર"),
    ("Chhattisgarh", "છત્તીસગઢ"),
    ("Goa", "ગોવા"),
    ("Haryana", "હરિયાણા"),
    ("Himachal Pradesh", "હિમાચલ પ્રદેશ"),
    ("Jharkhand", "ઝારખંડ"),
    ("Karnataka", "કર્ણાટક"),
    ("Kerala", "કેરળ"),
    ("Madhya Pradesh", "મધ્ય પ્રદેશ"),
    ("Maharashtra", "મહારાષ્ટ્ર"),
    ("Manipur", "મણિપુર"),
    ("Meghalaya", "મેઘાલય"),
    ("Mizoram", "મિઝોરમ"),
    ("Nagaland", "નાગાલેન્ડ"),
    ("Odisha", "ઓડિશા"),
    ("Punjab", "પંજાબ"),
    ("Rajasthan", "રાજસ્થાન"),
    ("Sikkim", "સિક્કિમ"),
    ("Tamil Nadu", "તમિલ નાડુ"),
    ("Telangana", "તેલંગાણા"),
    ("Tripura", "ત્રિપુરા"),
    ("Uttar Pradesh", "ઉત્તર પ્રદેશ"),
    ("Uttarakhand", "ઉત્તરાખંડ"),
    ("West Bengal", "પશ્ચિમ બંગાળ"),
    # Union Territories
    ("Andaman and Nicobar Islands", "અંડમાન અને નિકોબાર ટાપુઓ"),
    ("Chandigarh", "ચંડીગઢ"),
    ("Dadra and Nagar Haveli and Daman and Diu", "દાદરા અને નગર હવેલી અને દમણ અને દીવ"),
    ("Delhi", "દિલ્હી"),
    ("Jammu and Kashmir", "જમ્મુ અને કાશ્મીર"),
    ("Ladakh", "લદ્દાખ"),
    ("Lakshadweep", "લક્ષદ્વીપ"),
    ("Puducherry", "પુડુચેરી"),
]


class Command(BaseCommand):
    help = "Add all Indian states and UTs as districts under the National section"

    def handle(self, *args, **options):
        try:
            national = Section.objects.get(slug="national")
        except Section.DoesNotExist:
            self.stderr.write(self.style.ERROR(
                'National section not found. Make sure a section with slug="national" exists.'
            ))
            return

        created_count = 0
        skipped_count = 0

        for order, (name_en, name_gu) in enumerate(INDIAN_STATES, start=1):
            from django.utils.text import slugify
            slug = slugify(name_en)
            district, created = District.objects.get_or_create(
                slug=slug,
                defaults={
                    "name_en": name_en,
                    "name_gu": name_gu,
                    "section": national,
                    "order": order,
                    "is_active": True,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  ✓ Created: {name_en}")
            else:
                # Update section link if it was created for a different section
                if district.section != national:
                    district.section = national
                    district.save(update_fields=["section"])
                    self.stdout.write(f"  ↻ Updated section for: {name_en}")
                else:
                    skipped_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created {created_count} states, skipped {skipped_count} (already existed)."
        ))
