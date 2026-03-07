import type { Profile } from "./types";

/**
 * Dummy profile for local testing.
 * Exercises both templates: minimal (1) and full (2) with experience, projects, blogs, etc.
 
 */
export const dummyProfile: Profile = {
  template: "portfolio-1",
  img: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
  img_alt: "Profile photo",
  heading_bold: "Hi, I'm Alex:",
  heading_light: "Frontend Developer",
  desc_1:
    "I build products at the intersection of design and engineering. Currently focused on frontend web apps.",
  tech_stack: [
    { iconName: "SI Typescript", visibleName: "TypeScript" },
    { iconName: "SI React", visibleName: "React" },
    { iconName: "SI Nextdotjs", visibleName: "Next.js" },
    { iconName: "SI Nodedotjs", visibleName: "Node.js" },
    { iconName: "SI Tailwindcss", visibleName: "Tailwind" },
    { iconName: "SI Javascript", visibleName: "Javascript" },
  ],
  desc_2:
    "5+ years shipping production software. I care about performance, DX, and user experience.",
  desc_3: "Open to contract and full-time roles. Let's talk!",
  cta_buttons: [
    {
      type: "primary",
      label: "Resume",
      href: "https://example.com/resume.pdf",
      icon: "LU FileText",
    },
    {
      type: "secondary",
      label: "Get in touch",
      href: "mailto:alex@example.com",
      icon: "BI Send",
    },
  ],
  social_links: [
    { type: "SI x", label: "X", href: "https://x.com/octocat" },
    { type: "SI Linkedin", label: "LinkedIn", href: "https://linkedin.com/in/octocat" },
    { type: "BI Envelope", label: "Email", href: "mailto:alex@example.com" },
  ],
  experience: [
    {
      company: "Acme Corp",
      role: "Senior Engineer",
      period: "2022 – Present",
      location: "San Francisco, CA",
      tech: ["TypeScript", "React", "PostgreSQL"],
      bullets: [
        "Led migration to Next.js, cutting load time by 40%",
        "Shipped real-time collaboration features for 10k+ users",
      ],
    },
    {
      company: "StartupXYZ",
      role: "Full-stack Developer",
      period: "2020 – 2022",
      location: "Remote",
      tech: ["Node.js", "React", "MongoDB"],
      bullets: ["Built core product from 0 to 1", "Mentored 3 junior devs"],
    },
  ],
  projects: [
    {
      title: "Open Source CLI Tool",
      description:
        "CLI for scaffolding projects. 2k+ weekly downloads on npm.",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      href: "https://example.com/cli",
      tech: ["TypeScript", "Node.js", "Oclif"],
    },
    {
      title: "Side Project",
      description: "Small SaaS for local teams. Built with Next.js and Stripe.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      tech: ["Next.js", "Stripe", "Supabase"],
    },
  ],
  blogs: [
    {
      title: "How I Ship Faster",
      description: "My workflow for rapid iteration without breaking things.",
      href: "https://blog.example.com/ship-faster",
      date: "Jan 2024",
      tags: ["productivity", "engineering"],
    },
    {
      title: "TypeScript Tips for React",
      description: "Patterns I use daily to get the most out of TS.",
      href: "https://blog.example.com/ts-react",
      date: "Dec 2023",
      tags: ["typescript", "react"],
    },
  ],
  meeting_link: {
    label: "Book a call",
    href: "https://cal.com/alex",
  },
  quote: {
    text: "The best code is the code you don't have to write.",
    author: "Jeff Atwood",
  },
  theme: {
    colors: {
      bg: "#0b0b0b",
      text: "#f5f5f5",
      muted: "#a3a3a3",
      accent: "#ffffff",
      border: "#262626",
    },
    fonts: {
      body: "\"IBM Plex Sans\", sans-serif",
      heading: "\"Space Grotesk\", sans-serif",
    },
  },
};
