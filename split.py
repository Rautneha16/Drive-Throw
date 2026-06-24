import re

try:
    with open('portfolio-3d.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract CSS
    style_match = re.search(r'<style>([\s\S]*?)</style>', html)
    if style_match:
        css_content = style_match.group(1).strip() + '\n'
        with open('portfolio-3d.css', 'w', encoding='utf-8') as f:
            f.write(css_content)
        html = re.sub(r'<style>([\s\S]*?)</style>', '<link rel="stylesheet" href="portfolio-3d.css"/>', html)

    # Extract JS
    script_match = re.search(r'<script>\s*\n([\s\S]*?)</script>', html)
    if script_match:
        js_content = script_match.group(1).strip() + '\n'
        with open('portfolio-3d.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
        html = re.sub(r'<script>\s*\n([\s\S]*?)</script>', '<script src="portfolio-3d.js"></script>', html)
    else:
        print("Could not find the script block.")

    with open('portfolio-3d.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Successfully separated the files using Python.")
except Exception as e:
    print(f"Error: {e}")
