const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('portfolio-3d.html', 'utf8');
const js = fs.readFileSync('portfolio-3d.js', 'utf8');

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    url: "http://localhost/"
});

dom.window.eval(`
  // Mock WebGL and Canvas
  HTMLCanvasElement.prototype.getContext = function() {
    return {
      fillRect: function() {},
      clearRect: function() {},
      getImageData: function(x, y, w, h) { return { data: new Array(w*h*4).fill(0) }; },
      putImageData: function() {},
      createImageData: function() { return []; },
      setTransform: function() {},
      drawImage: function() {},
      save: function() {},
      fillText: function() {},
      restore: function() {},
      beginPath: function() {},
      moveTo: function() {},
      lineTo: function() {},
      closePath: function() {},
      stroke: function() {},
      translate: function() {},
      scale: function() {},
      rotate: function() {},
      arc: function() {},
      fill: function() {},
      measureText: function() { return { width: 0 }; },
      transform: function() {},
      rect: function() {},
      clip: function() {},
    };
  };
  window.requestAnimationFrame = function(cb){ setTimeout(cb, 16); };
`);

// Mock THREE.js
dom.window.document.head.appendChild(dom.window.document.createElement('script')).src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

dom.window.onerror = function(msg, url, line, col, error) {
    console.log("ERROR: ", msg, line, col);
};

setTimeout(() => {
    try {
        dom.window.eval(js);
    } catch (e) {
        console.log("CAUGHT EVAL ERROR:", e);
    }
}, 1000);
