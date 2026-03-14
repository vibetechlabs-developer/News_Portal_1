import requests
import re
from django.core.management.base import BaseCommand
from news.models import VideoContent, ReelContent
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Checks YouTube URLs for active live streams and toggles is_live off if the broadcast has ended.'

    def check_youtube_live_status(self, url):
        try:
            # Add headers to avoid basic bot blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return None  # Could not verify, assume it might still be live to be safe

            html = response.text
            
            # YouTube embeds "isLiveBroadcast" internally if it is a running stream
            # If the stream ended, this flag is usually missing or we can check for "endDate"
            if '"isLiveBroadcast":true' in html:
                # Still actually broadcasting
                return True
                
            # If it explicitly says the recording is not available or the live event is over
            if '"endDate"' in html or 'Live stream recording is not available' in html:
                return False

            # If it's a normal video now (no live broadcast tags at all)
            if '"isLiveBroadcast":true' not in html:
                return False

            return True  # Default fallback
        except Exception as e:
            logger.error(f'Error checking YouTube URL {url}: {e}')
            return None

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting YouTube live stream verification...')
        
        # Check VideoContent
        live_videos = VideoContent.objects.filter(is_live=True)
        videos_updated = 0
        for video in live_videos:
            if video.youtube_url:
                is_active = self.check_youtube_live_status(video.youtube_url)
                if is_active is False:
                    self.stdout.write(f'Video {video.id} stream has ended. Updating database...')
                    video.is_live = False
                    video.save(update_fields=["is_live"])
                    videos_updated += 1

        # Check ReelContent
        live_reels = ReelContent.objects.filter(is_live=True)
        reels_updated = 0
        for reel in live_reels:
            if reel.youtube_url:
                is_active = self.check_youtube_live_status(reel.youtube_url)
                if is_active is False:
                    self.stdout.write(f'Reel {reel.id} stream has ended. Updating database...')
                    reel.is_live = False
                    reel.save(update_fields=["is_live"])
                    reels_updated += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {videos_updated} videos and {reels_updated} reels.'))
