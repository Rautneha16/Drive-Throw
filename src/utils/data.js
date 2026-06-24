export const ZONES = [
  { 
    id: 'about', label: 'ABOUT ME', x: 0, z: -15, color: 0xff85a2, tag: 'INTRODUCTION', title: 'Hello, I am Neha Raut!', 
    body: `Not just a developer — a digital architect who turns caffeine and curiosity into impactful digital experiences. With a B.Tech in IT and a love for all things full-stack, I craft web applications that are fast, intelligent, and visually alive.\n\nFrom research papers on OTP security to building immersive 3D environments, my journey is anything but ordinary. I write code that solves real problems — and occasionally makes people go "wow".`, 
    extraHTML: `<div class="panel-grid">
      <div class="panel-item"><span>Degree</span>B.Tech in IT</div>
      <div class="panel-item"><span>Role</span>Software Engineer</div>
      <div class="panel-item"><span>Status</span>Open to Work ✦</div>
      <div class="panel-item"><span>Focus</span>Web & Systems</div>
    </div>`
  },
  { 
    id: 'projects', label: 'PROJECTS', x: 30, z: -40, color: 0x5dbcd2, tag: 'PORTFOLIO', title: 'My Creations', 
    body: `Here is a collection of things I've built. Each project represents a new challenge conquered and new technologies learned in my journey as an IT Engineer.`, 
    extraHTML: `<div style="display:flex;flex-direction:column;gap:1rem;">
      <div style="border:1px solid rgba(255,255,255,0.2);padding:1rem;border-radius:12px;">
        <div style="font-size:0.9rem;font-weight:800;color:var(--accent);margin-bottom:0.3rem;">Bachatgat Management Platform (2025)</div>
        <div style="font-size:0.7rem;opacity:0.8;margin-bottom:0.4rem;font-weight:600;">React.js · JavaScript · Modern UI</div>
        <div style="font-size:0.75rem;">A comprehensive web application designed to digitize and streamline the financial tracking, member management, and regular operational records of local Self-Help Groups.</div>
      </div>
      <div style="border:1px solid rgba(255,255,255,0.2);padding:1rem;border-radius:12px;">
        <div style="font-size:0.9rem;font-weight:800;color:var(--accent);margin-bottom:0.3rem;">Alpha Identification Based OTP System (2024)</div>
        <div style="font-size:0.7rem;opacity:0.8;margin-bottom:0.4rem;font-weight:600;">Node.js · Express.js · MongoDB · Twilio · React.js</div>
        <div style="font-size:0.75rem;">A secure authentication system using unique alphanumeric patterns for OTP generation, minimizing unauthorized access. Published in the IRJ on Advanced Engineering Hub.</div>
      </div>
      <div style="border:1px solid rgba(255,255,255,0.2);padding:1rem;border-radius:12px;">
        <div style="font-size:0.9rem;font-weight:800;color:var(--accent);margin-bottom:0.3rem;">J-ScriptPlug-in: Android Pattern Lock Simulator (2021)</div>
        <div style="font-size:0.7rem;opacity:0.8;margin-bottom:0.4rem;font-weight:600;">HTML · CSS · Research & Analysis</div>
        <div style="font-size:0.75rem;">A web-based solution replacing traditional passwords with an Android-style pattern lock. Published in the IRJ on Advanced Engineering Hub.</div>
      </div>
    </div>`
  },
  { 
    id: 'skills', label: 'SKILLS', x: -30, z: -40, color: 0x9370db, tag: 'EXPERTISE', title: 'Technical Arsenal', 
    body: `I adapt to the right tool for the job. Here are some of the technologies and languages I've mastered during my B.Tech and beyond.`, 
    extraHTML: `<div class="skill-pills">
      <div class="skill-pill">HTML</div><div class="skill-pill">CSS</div><div class="skill-pill">JavaScript</div><div class="skill-pill">React.js</div>
      <div class="skill-pill">Node.js</div><div class="skill-pill">Express.js</div><div class="skill-pill">REST API</div><div class="skill-pill">MySQL</div>
      <div class="skill-pill">Tools</div><div class="skill-pill">Git</div><div class="skill-pill">GitHub</div><div class="skill-pill">Postman</div>
    </div>`
  },
  { 
    id: 'contact', label: 'CONTACT', x: 0, z: -70, color: 0xffaa00, tag: 'CONNECT', title: 'Let\'s Build Together', 
    body: `I am currently open to exciting new opportunities and collaborations. If you are looking for a dedicated IT Engineer to bring your ideas to life, reach out!`, 
    extraHTML: `<div class="panel-grid">
      <div class="panel-item"><span>Email</span><a href="mailto:nehasraut02@gmail.com">nehasraut02@gmail.com</a></div>
      <div class="panel-item"><span>GitHub</span><a href="https://github.com/Rautneha16" target="_blank">https://github.com/Rautneha16</a></div>
      <div class="panel-item"><span>LinkedIn</span><a href="https://www.linkedin.com/in/neha-raut0516/" target="_blank">https://www.linkedin.com/in/neha-raut0516/</a></div>
      <div class="panel-item"><span>Whatsapp</span><a href="#" onclick="window.open('https://wa.me/917420008485', '_blank')">+917420008485</a></div>
    </div>
    <div class="proj-links">
      <a href="mailto:nehasraut02@gmail.com" class="proj-link">Send Email</a>
    </div>`
  }
];
