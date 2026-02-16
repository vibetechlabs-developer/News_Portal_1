from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db.models import Count

from analytics.models import NewsView
from news.models import NewsArticle


class Command(BaseCommand):
    help = (
        "Recompute denormalized NewsArticle.view_count values from analytics.NewsView.\n"
        "Useful if counts drift due to manual data fixes or missed increments."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be updated without writing changes.",
        )

    def handle(self, *args, **options):
        dry_run: bool = options["dry_run"]

        self.stdout.write(self.style.NOTICE("Aggregating view counts from analytics.NewsView..."))

        aggregates = (
            NewsView.objects.values("article_id")
            .annotate(view_total=Count("id"))
            .order_by()
        )

        updated = 0
        for row in aggregates:
            article_id = row["article_id"]
            view_total = row["view_total"]

            try:
                article = NewsArticle.objects.get(pk=article_id)
            except NewsArticle.DoesNotExist:
                # Article was deleted; skip its historical views.
                continue

            if article.view_count != view_total:
                self.stdout.write(
                    f"Article {article_id}: view_count {article.view_count} -> {view_total}"
                )
                updated += 1
                if not dry_run:
                    article.view_count = view_total
                    article.save(update_fields=["view_count"])

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"[DRY RUN] Would update view_count for {updated} articles.")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Updated view_count for {updated} articles.")
            )

