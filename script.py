import os
import glob

map_html = """
        <!-- Map Section -->
        <div class="footer-col footer-map-col">
          <h4 class="footer-developers-title">Location Map</h4>
          <div style="border-radius: 8px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.4); width: 100%; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.749504107567!2d74.49651581485514!3d15.817109589038234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf65b8cb468e2f%3A0xc68cb32f489f66bb!2sKLS%20Gogte%20College%20of%20Commerce!5e0!3m2!1sen!2sin!4v1693899214717!5m2!1sen!2sin" 
              width="300" 
              height="200" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
"""

search_str = """            </a>
          </div>
        </div>

      </div>
      <div class="footer-copy">"""

replace_str = """            </a>
          </div>
        </div>
""" + map_html + """
      </div>
      <div class="footer-copy">"""

files = glob.glob('c:/Users/ijare/OneDrive/Documents/Projects/magna-main/site/*.html')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "footer-map-col" not in content:
        new_content = content.replace(search_str, replace_str)
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")
        else:
            print(f"Could not find exact match in {f}")
