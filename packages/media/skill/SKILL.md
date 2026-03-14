---
name: media
description: Media processing — download, convert, compress, transform audio/video/images using ffmpeg, yt-dlp, and imagemagick
---

# Media Processing

Three tools for all media work: **ffmpeg** (audio/video), **yt-dlp** (downloads), **imagemagick** (images).

Always output files to `outbox/` so they get delivered back to the user.

## Inspect before processing

```bash
# Video/audio info
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4

# Image info
identify -verbose input.jpg
```

## ffmpeg

### Convert formats

```bash
ffmpeg -i input.mp4 outbox/output.mp3
ffmpeg -i input.webm outbox/output.mp4
ffmpeg -i input.wav outbox/output.flac
```

### Extract audio

```bash
ffmpeg -i video.mp4 -vn -acodec libmp3lame -q:a 2 outbox/audio.mp3
```

### Compress video

```bash
# General compression (CRF 28 = good balance, higher = smaller/worse)
ffmpeg -i input.mp4 -crf 28 -preset fast -vf scale=-2:720 outbox/compressed.mp4

# For a specific size target, check output and retry with higher CRF if needed
ffmpeg -i input.mp4 -crf 32 -preset fast -vf scale=-2:480 outbox/compressed.mp4
```

### Trim / clip

```bash
# Fast trim (no re-encode, may have keyframe inaccuracy)
ffmpeg -i input.mp4 -ss 00:00:30 -to 00:01:00 -c copy outbox/clip.mp4

# Precise trim (re-encodes)
ffmpeg -i input.mp4 -ss 00:00:30 -to 00:01:00 -c:v libx264 -c:a aac outbox/clip.mp4
```

### Create GIF

```bash
ffmpeg -i input.mp4 -ss 0:30 -t 5 -vf "fps=15,scale=480:-1:flags=lanczos" outbox/output.gif
```

### Strip audio from video

```bash
ffmpeg -i input.mp4 -an -c:v copy outbox/silent.mp4
```

### Merge audio + video

```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest outbox/merged.mp4
```

### Concatenate files

```bash
# Create file list
printf "file '%s'\n" clip1.mp4 clip2.mp4 clip3.mp4 > /tmp/concat.txt
ffmpeg -f concat -safe 0 -i /tmp/concat.txt -c copy outbox/joined.mp4
```

### Generate thumbnail

```bash
# Single frame at timestamp
ffmpeg -i input.mp4 -ss 00:00:05 -frames:v 1 outbox/thumb.jpg

# Thumbnail grid (4x4)
ffmpeg -i input.mp4 -vf "select=not(mod(n\,100)),scale=320:-1,tile=4x4" -frames:v 1 outbox/grid.jpg
```

### Audio adjustments

```bash
# Normalize volume
ffmpeg -i input.mp3 -af loudnorm outbox/normalized.mp3

# Change speed (2x)
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" outbox/fast.mp4
```

## yt-dlp

### Download video

```bash
yt-dlp -o "outbox/%(title)s.%(ext)s" "URL"
```

### Download audio only

```bash
yt-dlp -x --audio-format mp3 -o "outbox/%(title)s.%(ext)s" "URL"
```

### Download with size limit

```bash
# Best format under 16MB (WhatsApp)
yt-dlp -f "best[filesize<16M]" -o "outbox/%(title)s.%(ext)s" "URL"

# If no single format fits, download best and compress with ffmpeg after
yt-dlp -o "/tmp/dl.%(ext)s" "URL"
ffmpeg -i /tmp/dl.* -crf 32 -preset fast -vf scale=-2:480 outbox/compressed.mp4
```

### List available formats

```bash
yt-dlp -F "URL"
```

### Download specific format

```bash
yt-dlp -f 22 -o "outbox/%(title)s.%(ext)s" "URL"
```

## imagemagick

The container has ImageMagick v6. Use `convert` (not `magick`).

### Resize

```bash
# By width (preserve aspect ratio)
convert input.jpg -resize 800x outbox/resized.jpg

# By height
convert input.jpg -resize x600 outbox/resized.jpg

# Exact dimensions (may distort)
convert input.jpg -resize 800x600! outbox/resized.jpg
```

### Crop

```bash
convert input.jpg -crop 500x500+100+50 outbox/cropped.jpg
```

### Convert format

```bash
convert input.png outbox/output.jpg
convert input.jpg outbox/output.webp
```

### Thumbnail (crop to fill)

```bash
convert input.jpg -thumbnail 200x200^ -gravity center -extent 200x200 outbox/thumb.jpg
```

### Composite / overlay

```bash
composite -gravity southeast overlay.png base.jpg outbox/result.jpg
```

### Strip metadata

```bash
convert input.jpg -strip outbox/clean.jpg
```

### Batch operations

```bash
# Resize all images in inbox
for f in inbox/*.jpg; do
  convert "$f" -resize 800x "outbox/$(basename "$f")"
done
```

### Adjust quality

```bash
# JPEG quality (1-100, lower = smaller)
convert input.jpg -quality 75 outbox/compressed.jpg

# WebP quality
convert input.png -quality 80 outbox/output.webp
```

## Platform size limits

| Platform | Video | Files |
|----------|-------|-------|
| WhatsApp | 16 MB | 100 MB |
| Telegram | 50 MB | 2 GB (bot API) |
| Discord | 25 MB | 50 MB (Nitro) |
| Slack | — | 1 GB |

When the user sends media from a platform, check these limits before producing output. If the result exceeds the limit, compress further or split.

## Key rules

1. **Always output to `outbox/`** — this is how files get sent back to the user
2. **Inspect first** — use `ffprobe` or `identify` before processing
3. **Prefer `-c copy`** when no re-encoding is needed (faster, lossless)
4. **Check output size** when targeting a size limit — retry with higher CRF / lower resolution if too large
5. **Use `-y`** flag with ffmpeg to overwrite without prompting: `ffmpeg -y -i ...`
6. **Input files** arrive in `inbox/` — check there for user-uploaded media
