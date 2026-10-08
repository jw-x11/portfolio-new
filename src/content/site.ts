/** Edit this file to update name, copy, projects, and social links. */
export const site = {
  firstName: "Junxi",
  lastName: "Wu",
  role: "Software engineer",
  location: "Available remotely",
  email: "jasonwu700@outlook.com",
  tagline: "I build web systems, APIs, and product interfaces.",
  about: [
    "I’m a software engineer focused on web platforms: TypeScript and React on the client, Node and Python behind the API, and interfaces that stay readable under real data.",
    "I care about structure, performance, and the details that make a tool feel fast. Photography is a hobby — a way to look carefully when I’m not at the keyboard.",
  ],
  facts: [
    { label: "Focus", value: "Web systems, APIs, product UI" },
    { label: "Stack", value: "TypeScript, React, Node, Python" },
    { label: "Currently", value: "Building software" },
  ],
  skills: [
    "TypeScript",
    "React",
    "Node",
    "Python",
    "REST / APIs",
    "Vite",
    "SQL",
    "Git",
  ],
  projects: [
    {
      year: "2025",
      title: "Northline",
      description:
        "An operations console for live service metrics. Built for scanability: dense data, calm typography, no decorative chrome.",
      tags: ["TypeScript", "React", "Node"],
      href: "",
      repo: "",
    },
    {
      year: "2024",
      title: "Trace",
      description:
        "A lightweight inspector for request flows. Turns noisy logs into a single readable path from cause to effect.",
      tags: ["Python", "APIs", "DX"],
      href: "",
      repo: "",
    },
    {
      year: "2024",
      title: "Relay",
      description:
        "A typed gateway for internal services. One contract, auth at the edge, and a smaller surface for every client to talk to.",
      tags: ["TypeScript", "Node", "Auth"],
      href: "",
      repo: "",
    },
  ],
  contactNote: "For engineering work, product builds, or a technical conversation — a short note is enough.",
  social: [
    { name: "GitHub", href: "https://github.com/" },
    { name: "LinkedIn", href: "https://www.linkedin.com/" },
    { name: "Email", href: "mailto:jasonwu700@outlook.com" },
  ],
} as const;
