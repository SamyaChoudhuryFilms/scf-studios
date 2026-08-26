from PIL import Image, ImageDraw
import os

def add_corners(im, rad):
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
    alpha = Image.new('L', im.size, 255)
    w, h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)
    return im

def main():
    src_path = 'public/logo-square.jpg'
    if not os.path.exists(src_path):
        print(f"Source file {src_path} not found.")
        return
        
    im = Image.open(src_path).convert('RGBA')
    # A standard rounded corner radius is 20% of the width
    radius = int(im.size[0] * 0.20)
    rounded_im = add_corners(im, radius)
    
    # Save as PNG
    rounded_im.save('public/favicon.png', 'PNG')
    # Save as ICO with multiple sizes for standard browsers
    rounded_im.save('public/favicon.ico', 'ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("Successfully generated rounded favicon.png and favicon.ico!")

if __name__ == '__main__':
    main()
