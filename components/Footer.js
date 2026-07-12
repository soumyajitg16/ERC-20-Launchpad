"use client";

import { useState } from "react";

const projects = [
  {
    name: "Multidrop Platform",
    docsHref: "https://docs.google.com/document/d/1jhULJ8I5ey0-XADmybSQNRu7NloZIAosqvDBLW4NfM4/edit?usp=sharing",
    liveHref: "https://multidropx.vercel.app/"
  },
  {
    name: "Tokenforge ERC20 Launchpad",
    docsHref: "https://docs.google.com/document/d/1cCSKMPbehUG2iVP8hdIpNjOjKUSjMcgkmVgGlE4q6KM/edit?usp=sharing",
    liveHref: "https://tokenforgex.vercel.app/"
  },
  {
    name: "Fractionalized NFT Marketplace",
    docsHref: "",
    liveHref: ""
  },
  {
    name: "Next Generation EV Charging using Blockchain",
    docsHref: "https://docs.google.com/document/d/12l901M1WAVoVqAlO8C2zc6vIIOHcvWNh70fRLHQLE0c/edit?usp=sharing",
    liveHref: ""
  }
];

const contactLinks = [
  {
    label: "Email",
    href: "mailto:soumyajitg16@gmail.com"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/soumyajitg16"
  }
];

function SectionHeader({ title, subtitle }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-700">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
    </div>
  );
}

function DisabledPill({ children }) {
  return (
    <span
      className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-400 sm:px-2.5 sm:text-[11px]"
      aria-disabled="true"
    >
      {children}
    </span>
  );
}

function ProjectPill({ href, children }) {
  if (!href) return <DisabledPill>{children}</DisabledPill>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 sm:px-2.5 sm:text-[11px]"
    >
      {children}
    </a>
  );
}

function OpenPill({ href }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 sm:px-2.5 sm:text-[11px]"
    >
      Open
    </a>
  );
}

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <footer className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 text-sm font-semibold text-indigo-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        >
          Important Links
          <svg
            aria-hidden="true"
            className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="mt-5 grid items-start gap-6 border-t border-zinc-200 pt-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <SectionHeader title="Other Projects" subtitle="Explore more blockchain builds" />

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.name}
                  className="flex min-h-12 items-center justify-between gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 transition hover:border-indigo-200 hover:bg-indigo-50/60 sm:gap-3 sm:px-3.5 sm:py-3"
                >
                  <h3 className="min-w-0 text-[13px] font-semibold leading-4 sm:text-sm sm:leading-5">
                    {project.name}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ProjectPill href={project.docsHref}>Docs</ProjectPill>
                    <ProjectPill href={project.liveHref}>Live</ProjectPill>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <SectionHeader title="Contact" subtitle="Reach out" />

            <div className="mt-4 grid gap-3">
              {contactLinks.map((link) => (
                <article
                  key={link.label}
                  className="flex min-h-12 items-center justify-between gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 transition hover:border-cyan-200 hover:bg-cyan-50/60 sm:gap-3 sm:px-3.5 sm:py-3"
                >
                  <h3 className="text-[13px] font-semibold leading-4 sm:text-sm sm:leading-5">{link.label}</h3>
                  <OpenPill href={link.href} />
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </footer>
  );
}
