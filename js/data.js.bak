// js/data.js
// Static data: image paths, URLs, project definitions, service catalogue.
// Pure values - no functions, no DOM.

export const PHOTO = "assets/img/portrait.jpg";
export const PH_A  = "assets/img/ph-a.jpg";
export const PH_B  = "assets/img/ph-b.jpg";

export const GH = "https://github.com/UnrealZahid101894/";

export const WK = [
  { t: "Main Portfolio", tag: ["HTML"], sub: "Over-engineered, never finished", repo: "Main-portfolio", live: "",
    d: "My first portfolio. Over-engineered, permanently incomplete, and live in a sense. Contributions and suggestions are welcome.",
    sh: '<rect class="a" width="100" height="70"/><rect x="6" y="6" width="10" height="3"/><rect class="c" x="60" y="6" width="34" height="3"/><rect x="8" y="24" width="52" height="9"/><rect x="8" y="36" width="38" height="9"/><circle class="b" cx="76" cy="40" r="14"/>' },
  { t: "Linux Terminal Commands", tag: ["Reference", "Linux"], sub: "A command reference that explains itself", repo: "Linux_Terminal_Commands", live: "", term: true,
    d: "Terminal commands from basic navigation to system administration, with clear explanations, real-world examples and organized tables. Written for beginners.",
    sh: '<rect class="a" width="100" height="70"/><rect x="8" y="10" width="6" height="3"/><rect class="c" x="18" y="10" width="34" height="3"/><rect x="8" y="20" width="6" height="3"/><rect class="c" x="18" y="20" width="52" height="3"/><rect class="c" x="18" y="30" width="44" height="3"/><rect x="8" y="42" width="6" height="3"/><rect class="b" x="18" y="41" width="5" height="6"/>' },
  { t: "Setanel", tag: ["HTML"], sub: "Built for a friend's startup", repo: "setanel", live: "",
    d: "A fun project made for a friend who wanted to build a startup together.",
    sh: '<rect class="a" width="100" height="70"/><rect class="c" x="14" y="48" width="14" height="14"/><rect class="c" x="34" y="38" width="14" height="24"/><rect x="54" y="26" width="14" height="36"/><rect class="b" x="74" y="12" width="14" height="50"/>' },
  { t: "Rendrx", tag: ["HTML", "Landing page"], sub: "A creative studio landing page", repo: "Agency_website", live: "",
    d: "Showcase landing page for a creative studio offering three core services: video production, motion graphics and web development.",
    sh: '<rect class="a" width="100" height="70"/><rect x="8" y="14" width="26" height="42"/><path class="w" d="M17 28 L27 35 L17 42Z"/><rect class="c" x="37" y="14" width="26" height="42"/><circle class="b" cx="50" cy="35" r="8"/><rect x="66" y="14" width="26" height="42"/><rect class="w" x="70" y="20" width="18" height="3"/><rect class="w" x="70" y="27" width="12" height="3"/>' }
];

export const WK_MAIN = WK.slice(0, 4);

export const WK_CS = {
  "Main-portfolio": { brief: "My first portfolio, written as a single file: no framework, no build step, no bundler. Over-engineered on purpose and never quite finished.", hi: ["A Three.js wireframe globe with a Dhaka marker and mouse-tracked rotation. Every material is pushed into one array at creation, so the whole globe recolors in a single pass with no geometry rebuild.", "The splash measures the ZAHID title before drawing it, and force-loads the font first so the first frame never lays out in a fallback face.", "The terminals type raw text first, then swap in syntax-highlighted HTML once a line finishes, so highlighting never breaks the typing animation.", "The cursor moves with transform instead of top/left, which keeps it on the compositor thread."], stack: ["HTML", "CSS", "JavaScript", "Three.js r128", "Google Fonts", "Vercel"] },
  "Linux_Terminal_Commands": { brief: "A command reference for people starting out with Linux, built so each command comes with an explanation and an example instead of a bare list.", hi: ["Covers basic navigation through system administration, organised into tables you can scan.", "Includes a quick-reference of the most used commands and an OS comparison at a glance.", "The full reference is written for Zorin OS / Ubuntu (APT-based): system info, package management, files and directories, and more."], stack: ["Markdown", "Bash", "APT (Ubuntu / Zorin)", "GitHub"] },
  "setanel": { brief: "Built for a friend's startup: an anti-piracy video security SDK that protects EdTech course videos from account sharing, screen recording and piracy.", hi: ["A drop-in SDK: it needs no changes to an existing login system or design.", "Configured through a single init call with a device limit and a revoke callback, plus a destroy call for logout.", "Device and session state is kept in Supabase. Also published as the npm package setanel-sdk."], stack: ["HTML", "JavaScript", "Supabase", "npm", "Vercel"] },
  "Agency_website": { brief: "A showcase landing page for a creative studio offering video production, motion graphics and web development.", hi: ["Dark and light themes from one CSS variable system, with a flash overlay so the switch never jars.", "Live canvas visuals per service: a hero particle field, a simulated video editing timeline, a motion preview and a starfield.", "A Tetris canvas loader, a filterable project grid, animated counters and scroll reveals via IntersectionObserver."], stack: ["HTML", "CSS", "JavaScript", "Canvas", "IntersectionObserver", "Supabase", "Vercel"] }
};

export const SVC = [
  ["Languages", ["JavaScript", "Python", "C", "Java", "SQL"],
    "Core languages I work with ? from scripting small tools to building full applications.",
    '<rect class="a" width="100" height="70"/><rect x="8" y="10" width="6" height="3"/><rect class="c" x="18" y="10" width="46" height="3"/><rect class="c" x="8" y="18" width="6" height="3"/><rect class="c" x="18" y="18" width="34" height="3"/><rect class="b" x="8" y="28" width="6" height="3"/><rect x="18" y="28" width="52" height="3"/><rect class="c" x="8" y="38" width="6" height="3"/><rect x="18" y="38" width="40" height="3"/>'],
  ["Frontend", ["React", "Next.js", "HTML / CSS", "Tailwind"],
    "Building interfaces that feel fast, stay accessible, and hold together from 320px to 4K.",
    '<rect class="a" width="100" height="70"/><rect x="6" y="6" width="10" height="3"/><rect class="c" x="60" y="6" width="34" height="3"/><rect x="8" y="20" width="52" height="9"/><rect class="b" x="8" y="32" width="38" height="9"/><rect class="c" x="8" y="46" width="84" height="18"/>'],
  ["Backend", ["Node.js", "Express", "Supabase", "PostgreSQL"],
    "APIs and data layers that stay predictable under real load ? clean REST, honest schemas, secure auth.",
    '<rect class="a" width="100" height="70"/><rect x="8" y="10" width="30" height="4"/><rect class="b" x="14" y="20" width="50" height="4"/><rect x="14" y="30" width="38" height="4"/><rect class="c" x="14" y="40" width="58" height="4"/><rect x="8" y="50" width="20" height="4"/>'],
  ["Security", ["Linux", "Networking", "Web hardening", "Auth flows"],
    "Focused on how systems break, how they get exploited, and how to actually defend them.",
    '<rect class="a" width="100" height="70"/><path class="c" d="M50 12 L70 20 L70 38 Q70 52 50 58 Q30 52 30 38 L30 20 Z"/><rect class="b" x="45" y="32" width="10" height="8" rx="1"/><path class="w" d="M47 32 V29 a3 3 0 0 1 6 0 V32" fill="none" stroke="none"/>'],
  ["Tools", ["Git", "VS Code", "Figma", "Postman"],
    "Everyday workflow ? fast iteration, clean commits, and a design loop that stays close to the code.",
    '<rect class="a" width="100" height="70"/><circle class="b" cx="24" cy="35" r="9"/><rect class="c" x="33" y="33" width="14" height="4"/><circle cx="52" cy="35" r="9"/><rect class="c" x="61" y="33" width="10" height="4"/><rect x="72" y="24" width="20" height="22"/>']
];
