const fs = require('fs');

try {
  let html = fs.readFileSync('portfolio-3d.html', 'utf8');

  // Extract CSS
  const styleRegex = /<style>([\s\S]*?)<\/style>/;
  const styleMatch = html.match(styleRegex);
  if(styleMatch) {
      fs.writeFileSync('portfolio-3d.css', styleMatch[1].trim() + '\n');
      html = html.replace(styleRegex, '<link rel="stylesheet" href="portfolio-3d.css"/>');
  }

  // Extract JS (the last script tag which contains our code)
  const scriptRegex = /<script>\s*?\n([\s\S]*?)\n<\/script>/;
  const scriptMatch = html.match(scriptRegex);
  if(scriptMatch) {
      fs.writeFileSync('portfolio-3d.js', scriptMatch[1].trim() + '\n');
      html = html.replace(scriptRegex, '<script src="portfolio-3d.js"></script>');
  } else {
      console.log("Could not find the script block using regular expression.");
  }

  fs.writeFileSync('portfolio-3d.html', html);
  console.log("Successfully split the files.");
} catch(e) {
  console.error(e);
}
