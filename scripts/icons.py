"""Render the original CW Station geometric icon. Requires Pillow for regeneration only."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent.parent / 'public'
image = Image.new('RGB', (1024, 1024), '#303d3a')
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((184,192,840,544), radius=24, fill='#ede6d3')
draw.ellipse((276,330,348,402), fill='#8c6a30')
draw.rounded_rectangle((412,330,612,402), radius=36, fill='#8c6a30')
draw.ellipse((676,330,748,402), fill='#8c6a30')
draw.rounded_rectangle((264,694,760,746), radius=26, fill='#8c6a30')
draw.rounded_rectangle((332,628,416,784), radius=24, fill='#8c6a30')
draw.rounded_rectangle((580,604,752,732), radius=64, fill='#8c6a30')
for size in (192,512):
    image.resize((size,size), Image.Resampling.LANCZOS).save(root / f'icon-{size}.png')
