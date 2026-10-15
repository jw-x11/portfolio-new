type Project = {
  year: string;
  title: string;
  description: string;
  tags: readonly string[];
  href: string;
  repo: string;
  image: string;
};

/** Edit this file to update name, copy, projects, and social links. */
export const site = {
  firstName: "Junxi",
  lastName: "Wu",
  role: "Developer",
  location: "Santa Barbara, CA",
  email: "junxiwu103@gmail.com",
  tagline: "Computer Science student at UCSB building backend and AI projects.",
  about: [
    "I'm a Computer Science student at UCSB with a strong passion for software engineering and AI technologies. I aim to apply my problem-solving abilities, positive mindset, and eagerness to learn toward building impactful projects.",
    "I'm also dedicated to contributing to collaborative environments and supporting team goals through a proactive and thoughtful approach.",
  ],
  facts: [
    { label: "Focus", value: "Software engineering, Back-end, Software architecture, AI" },
    { label: "Education", value: "UC Santa Barbara, Computer Science" },
    { label: "Hobbies", value: "Photography, Cooking, Gym" },
  ],
  skills: ["Java", "Python", "Redis", "SQL"],
  projects: [
    {
      year: "2026",
      title: "Campus Nest",
      description:
        "A student-focused marketplace for renting out unused space as storage. I focused on backend scalability and performance, designing a caching layer shared across most modules so the service can handle large volumes of data.",
      tags: ["Redis", "FastAPI", "Postgres"],
      href: "",
      repo: "https://github.com/jw-x11/campus_nest",
      image: "",
    },
    {
      year: "2025",
      title: "TasteBuds",
      description:
        "A social app for sharing meals, discovering recipes, and connecting with friends. Features a rating system to encourage cooking and friendly competition. I led frontend development using Flutter, designing responsive UI components and smooth user interactions, and set up AWS backend services for ratings and user profiles.",
      tags: ["Flutter", "AWS"],
      href: "",
      repo: "https://github.com/RyanVSD/TasteBuds",
      image: "/assets/tastebud demo.webp",
    },
    {
      year: "2023",
      title: "Language Coach AI",
      description:
        "An AI-powered language learning tool for real-time, voice-based conversations in multiple languages, with custom role-playing scenarios. I focused on the React.js frontend and connected it to the LLM API, an early step in my LLM integration experience.",
      tags: ["React", "LLM API"],
      href: "",
      repo: "https://github.com/KKaradi/LanguageCoach.ai",
      image: "/assets/languagecoach demo.png",
    },
    {
      year: "2022",
      title: "Save The Land",
      description:
        "An educational website that raises awareness about wildfire risks through interactive learning. I designed and developed the core of its React-based game, which uses Gaussian noise generation to create a unique map each session, and tuned the terrain algorithm to balance difficulty and gameplay.",
      tags: ["React"],
      href: "",
      repo: "https://github.com/Da-Dog/ttsf-2022",
      image: "/assets/savetheland demo.png",
    },
  ] as readonly Project[],
  contactNote: "Reach out about software projects, collaboration, or opportunities.",
  social: [
    { name: "GitHub", href: "https://github.com/jw-x11" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/junxi-wu-220400211/" },
    { name: "Email", href: "mailto:junxiwu103@gmail.com" },
  ],
} as const;
