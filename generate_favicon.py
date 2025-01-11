from PIL import Image, ImageDraw, ImageFont
import os

def create_favicon():
    # Create different sizes
    sizes = [(16, 16), (32, 32), (48, 48)]
    
    for size in sizes:
        # Create a new image with a transparent background
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a house shape
        background_color = (108, 92, 231)  # Match your theme color #6C5CE7
        
        # Fill the entire icon with the background color
        draw.rectangle([0, 0, size[0], size[1]], fill=background_color)
        
        # Draw a $ symbol in white
        font_size = size[0] // 2
        try:
            font = ImageFont.truetype("Arial", font_size)
        except:
            font = ImageFont.load_default()
            
        text = "$"
        text_color = (255, 255, 255)  # White
        
        # Center the text
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x = (size[0] - text_width) // 2
        y = (size[1] - text_height) // 2
        
        draw.text((x, y), text, font=font, fill=text_color)
        
        # Save the images
        if size == (16, 16):
            img.save('static/favicon-16x16.png')
        elif size == (32, 32):
            img.save('static/favicon-32x32.png')
        
        # Save ICO file
        if size == (48, 48):
            img.save('static/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

if __name__ == "__main__":
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    create_favicon() 