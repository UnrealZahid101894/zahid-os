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
  ["Frontend", ["React", "Next.js", "TypeScript", "UI systems"],
    "Fast, accessible interfaces built with React and Next.js, typed end to end and organised into reusable systems.",
    '<rect class="a" width="100" height="70"/><rect x="6" y="6" width="10" height="3"/><rect class="c" x="60" y="6" width="34" height="3"/><rect x="18" y="20" width="64" height="7"/><rect class="b" x="26" y="30" width="48" height="7"/><rect class="c" x="6" y="44" width="88" height="20"/>'],
  ["Backend", ["Node.js", "REST APIs", "Databases", "Authentication"],
    "APIs and data layers that stay predictable: clean REST design, solid databases and authentication done properly.",
    '<rect class="a" width="100" height="70"/><rect x="8" y="10" width="30" height="4"/><rect class="b" x="14" y="20" width="50" height="4"/><rect x="14" y="30" width="38" height="4"/><rect class="c" x="14" y="40" width="58" height="4"/><rect x="8" y="50" width="20" height="4"/>'],
  ["Mobile", ["React Native", "Expo", "State management"],
    "Cross-platform apps with React Native and Expo, with state that stays manageable as the app grows.",
    '<rect class="a" width="100" height="70"/><rect x="14" y="8" width="30" height="54" rx="4"/><rect class="b" x="18" y="14" width="22" height="12" rx="2"/><rect class="w" x="18" y="30" width="22" height="4"/><rect x="54" y="14" width="30" height="54" rx="4"/><rect class="w" x="58" y="20" width="22" height="4"/>'],
  ["Product", ["Architecture", "UX", "Prototyping", "Deployment"],
    "From architecture to prototype to deployment: thinking in whole products, not just screens.",
    '<rect class="a" width="100" height="70"/><rect x="8" y="10" width="24" height="16"/><rect class="b" x="38" y="10" width="24" height="16"/><rect x="68" y="10" width="24" height="16"/><rect class="c" x="8" y="40" width="24" height="20"/><rect class="c" x="38" y="40" width="54" height="20"/>'],
  ["Automation", ["Scripting", "AI-assisted workflows", "CI/CD", "Integrations"],
    "Scripts and workflows that remove repetitive work, with AI-assisted tooling where it actually saves time.",
    '<rect class="a" width="100" height="70"/><circle cx="20" cy="35" r="9"/><rect class="c" x="29" y="33" width="14" height="4"/><circle class="b" cx="52" cy="35" r="9"/><rect class="c" x="61" y="33" width="10" height="4"/><rect x="72" y="24" width="20" height="22"/>']
];
