import cv2
import os
import logging
from django.core.files.base import ContentFile

import tempfile

logger = logging.getLogger(__name__)

def generate_video_thumbnail(video_field):
    """
    Extracts the first frame of a video using OpenCV and returns a ContentFile
    suitable for saving into an ImageField.
    Returns None if extraction fails.
    """
    try:
        if not video_field:
            return None
        
        video_path = None
        is_temp = False
        
        if hasattr(video_field, 'path') and os.path.exists(video_field.path):
            video_path = video_field.path
        else:
            try:
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
                video_field.seek(0)
                temp_file.write(video_field.read())
                temp_file.close()
                video_path = temp_file.name
                is_temp = True
            except Exception as e:
                logger.error(f"Failed to create temp file for video: {e}")
                return None
                
        if not video_path:
            return None
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video file: {video_path}")
            if is_temp: os.unlink(video_path)
            return None
            
        # Try to read the 1st frame
        ret, frame = cap.read()
        cap.release()
        
        if is_temp:
            os.unlink(video_path)
        
        if ret:
            # Encode frame as JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            success, buffer = cv2.imencode('.jpg', frame, encode_param)
            if success:
                return ContentFile(buffer.tobytes())
                
    except Exception as e:
        logger.error(f"Error extracting thumbnail from {getattr(video_field, 'name', 'unknown')}: {e}")
        
    return None
