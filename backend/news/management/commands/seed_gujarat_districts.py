from django.core.management.base import BaseCommand
from news.models import Section, District


GUJARAT_DISTRICTS = [
    ("ahmedabad", "Ahmedabad", "અમદાવાદ", "अहमदाबाद"),
    ("amreli", "Amreli", "અમરેલી", "अमरेली"),
    ("anand", "Anand", "આણંદ", "आनंद"),
    ("aravalli", "Aravalli", "અરવલ્લી", "अरावली"),
    ("banaskantha", "Banaskantha", "બનાસકાંઠા", "बनासकांठा"),
    ("bharuch", "Bharuch", "ભરૂચ", "भरूच"),
    ("bhavnagar", "Bhavnagar", "ભાવનગર", "भावनगर"),
    ("botad", "Botad", "બોટાદ", "बोटाद"),
    ("chhota-udepur", "Chhota Udepur", "છોટાઉદેપુર", "छोटा उदयपुर"),
    ("dahod", "Dahod", "દાહોદ", "दाहोद"),
    ("dang", "Dang", "ડાંગ", "डांग"),
    ("devbhoomi-dwarka", "Devbhoomi Dwarka", "દેવભૂમિ દ્વારકા", "देवभूमि द्वारका"),
    ("gandhinagar", "Gandhinagar", "ગાંધીનગર", "गांधीनगर"),
    ("gir-somnath", "Gir Somnath", "ગીર સોમનાથ", "गिर सोमनाथ"),
    ("jamnagar", "Jamnagar", "જામનગર", "जामनगर"),
    ("junagadh", "Junagadh", "જુનાગઢ", "जूनागढ़"),
    ("kutch", "Kutch", "કચ્છ", "कच्छ"),
    ("kheda", "Kheda", "ખેડા", "खेड़ा"),
    ("mahisagar", "Mahisagar", "મહીસાગર", "महीसागर"),
    ("mehsana", "Mehsana", "મહેસાણા", "मेहसाणा"),
    ("morbi", "Morbi", "મોરબી", "मोरबी"),
    ("narmada", "Narmada", "નર્મદા", "नर्मदा"),
    ("navsari", "Navsari", "નવસારી", "नवसारी"),
    ("panchmahal", "Panchmahal", "પંચમહાલ", "पंचमहल"),
    ("patan", "Patan", "પાટણ", "पाटन"),
    ("porbandar", "Porbandar", "પોરબંદર", "पोरबंदर"),
    ("rajkot", "Rajkot", "રાજકોટ", "राजकोट"),
    ("sabarkantha", "Sabarkantha", "સાબરકાંઠા", "साबरकांठा"),
    ("surat", "Surat", "સુરત", "सूरत"),
    ("surendranagar", "Surendranagar", "સુરેન્દ્રનગર", "सुरेंद्रनगर"),
    ("tapi", "Tapi", "તાપી", "ताप्ती"),
    ("vadodara", "Vadodara", "વડોદરા", "वडोदरा"),
    ("valsad", "Valsad", "વલસાડ", "वलसाड"),
    ("vav-tharad", "Vav-Tharad", "વાવ-થરાદ", "वाव-थराद"),
]


class Command(BaseCommand):
    help = "Seed all 34 Gujarat districts into the database"

    def handle(self, *args, **options):
        try:
            gujarat_section = Section.objects.get(slug="gujarat")
        except Section.DoesNotExist:
            self.stderr.write("Gujarat section not found. Make sure it exists first.")
            return

        created_count = 0
        for order, (slug, name_en, name_gu, name_hi) in enumerate(
            GUJARAT_DISTRICTS, start=1
        ):
            obj, created = District.objects.get_or_create(
                slug=slug,
                defaults={
                    "name_en": name_en,
                    "name_gu": name_gu,
                    "name_hi": name_hi,
                    "section": gujarat_section,
                    "order": order,
                    "is_active": True,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created: {name_en}")
            else:
                obj.order = order
                obj.save(update_fields=["order"])

        total = District.objects.filter(section=gujarat_section).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! {created_count} new district(s) added. Total Gujarat districts: {total}"
            )
        )
