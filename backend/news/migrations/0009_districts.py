from django.db import migrations, models
import django.db.models.deletion


def create_gujarat_districts(apps, schema_editor):
    Section = apps.get_model("news", "Section")
    District = apps.get_model("news", "District")

    try:
        gujarat_section = Section.objects.get(slug="gujarat")
    except Section.DoesNotExist:
        return

    districts = [
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
        ("devbhoomi-dwarka", "Devbhumi Dwarka", "દેવભૂમિ દ્વારકા", "देवभूमि द्वारका"),
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
        ("vav-tharad", "Vav-Tharad", "વાવ- થરાદ", "वाव-थराद"),
    ]

    for order, (slug, name_en, name_gu, name_hi) in enumerate(districts, start=1):
        District.objects.get_or_create(
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


def delete_gujarat_districts(apps, schema_editor):
    District = apps.get_model("news", "District")
    District.objects.filter(section__slug="gujarat").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0008_alter_media_file_alter_reelcontent_file_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="District",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name_en", models.CharField(max_length=120)),
                ("name_hi", models.CharField(blank=True, max_length=120)),
                ("name_gu", models.CharField(blank=True, max_length=120)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "section",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="districts",
                        to="news.section",
                    ),
                ),
            ],
            options={
                "ordering": ["order", "name_en"],
                "indexes": [
                    models.Index(fields=["section", "is_active", "order"], name="news_distri_section_iaor_idx"),
                ],
            },
        ),
        migrations.RunPython(create_gujarat_districts, delete_gujarat_districts),
    ]

