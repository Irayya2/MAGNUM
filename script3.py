import os
import glob
import re

files = glob.glob('c:/Users/ijare/OneDrive/Documents/Projects/magna-main/site/*.html')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "footer-copy" not in content:
        print(f"No footer in {f}")
    elif "footer-map-col" not in content:
        print(f"Footer exists but no map added in {f}")
