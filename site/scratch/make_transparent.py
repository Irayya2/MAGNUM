from PIL import Image
import sys
import os

def remove_black_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for r, g, b, a in data:
        # The glow's brightness determines its opacity
        alpha = max(r, g, b)
        if alpha == 0:
            new_data.append((0, 0, 0, 0))
        else:
            # Un-premultiply to get the pure color
            # We cap at 255 to be safe
            new_r = min(255, int((r * 255) / alpha))
            new_g = min(255, int((g * 255) / alpha))
            new_b = min(255, int((b * 255) / alpha))
            new_data.append((new_r, new_g, new_b, alpha))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    remove_black_background(input_file, output_file)
