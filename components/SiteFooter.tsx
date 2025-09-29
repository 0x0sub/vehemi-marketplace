export default function SiteFooter({
  brand = "veHEMI.com Marketplace",
  byline = "Built for all Hemigos by @sub_research",
  faqUrl = "#",
  activityUrl = "/activity",
  docsUrl = "#",
  termsUrl = "#",
  privacyUrl = "#",
  xUrl = "https://x.com/sub_research",
  githubUrl = "#",
  discordUrl = "#",
  telegramUrl = "https://t.me/vehemi",
  disclaimer = "This marketplace is experimental. Use at your own risk.",
  version = "v0.1.0",
}: {
  brand?: string;
  byline?: string;
  faqUrl?: string;
  activityUrl?: string;
  docsUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
  xUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  disclaimer?: string;
  version?: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-[#1E2937] text-white">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Column 1: Brand & Byline */}
        <div className="space-y-2">
          <div className="text-sm text-[#93A4B7]">{brand}</div>
          <div className="text-sm font-medium">{byline}</div>
          <div className="text-xs text-[#93A4B7]">{disclaimer}</div>
          <div className="text-xs text-[#93A4B7]">© {year} - {version}</div>
        </div>

        {/* Column 2: Navigation */}
        <nav className="space-y-2">
          <div className="text-sm font-semibold text-[#E5EDF5]">Resources</div>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li><a className="text-[#93A4B7] hover:text-white" href={faqUrl}>FAQ</a></li>
            <li><a className="text-[#93A4B7] hover:text-white" href={activityUrl}>Activity</a></li>
             {/*
            <li><a className="text-[#93A4B7] hover:text-white" href={docsUrl}>Docs</a></li>
            <li><a className="text-[#93A4B7] hover:text-white" href={termsUrl}>Terms</a></li>
            <li><a className="text-[#93A4B7] hover:text-white" href={privacyUrl}>Privacy</a></li>
            */}
          </ul>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li><a className="inline-flex items-center gap-1 text-[#93A4B7] hover:text-white" href={xUrl} target="_blank" rel="noreferrer"><XIcon className="h-4 w-4"/>X</a></li>
            <li><a className="inline-flex items-center gap-1 text-[#93A4B7] hover:text-white" href={githubUrl} target="_blank" rel="noreferrer"><GitHubIcon className="h-4 w-4"/>GitHub</a></li>
          </ul>
        </nav>

        {/* Column 3: Community CTAs */}
        <div>
          <div className="text-sm font-semibold text-[#E5EDF5]">Join the community</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-700/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-slate-500"
              aria-label="Join our Discord"
            >
              <DiscordIcon className="h-5 w-5"/> Discord
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-700/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-slate-500"
              aria-label="Join our Telegram"
            >
              <TelegramIcon className="h-5 w-5"/> Telegram
            </a>
          </div>
          <p className="mt-3 text-xs text-[#93A4B7]">Get support, share strategies, and stay updated.</p>
        </div>
      </div>
    </footer>
  );
}

// ----------------- Icons -----------------
function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.19.34-.403.8-.552 1.162a18.27 18.27 0 0 0-7.99 0C7.867 3.8 7.654 3.34 7.463 3A19.8 19.8 0 0 0 3.704 4.37C1.614 7.806.94 11.14 1.186 14.435A19.9 19.9 0 0 0 7.41 17.1c.34-.474.64-.98.89-1.51-.49-.185-.96-.41-1.41-.67.12-.09.24-.18.36-.27a13.36 13.36 0 0 0 10.5 0c.12.09.24.18.36.27-.45.26-.92.49-1.41.67.25.53.55 1.04.89 1.51a19.86 19.86 0 0 0 6.22-2.66c.31-4.11-.66-7.4-2.9-10.03Z"/>
    </svg>
  );
}

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M21.9 4.5a1 1 0 0 0-1.1-.1L3.2 12.4a.9.9 0 0 0 .1 1.7l4.8 1.5 1.6 4.7a.9.9 0 0 0 1.5.3l2.6-2.4 4.7 3.4a1 1 0 0 0 1.6-.6l3-15a1 1 0 0 0-.7-1.1ZM9.2 14.8l-3.2-1 11-5.4-7.8 6.4Z"/>
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M18 3h3l-7.5 8.6L22 21h-6l-4.5-6L6 21H3l7.6-8.8L2 3h6l4 5.6L18 3Z"/>
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path fillRule="evenodd" d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.2 11.2.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.6-1.5-2-1.5-2-1.2-.8.1-.8.1-.8 1.3.1 2 .9 2 .9 1.2 2 3.1 1.5 3.9 1.1.1-.9.5-1.5.8-1.9-2.7-.3-5.5-1.4-5.5-6.2 0-1.4.5-2.5 1.2-3.4-.1-.3-.5-1.7.1-3.5 0 0 1-.3 3.5 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.5-1.6 3.5-1.3 3.5-1.3.6 1.8.2 3.2.1 3.5.8.9 1.2 2 1.2 3.4 0 4.8-2.9 5.9-5.6 6.2.5.4.9 1.2.9 2.4v3.5c0 .4.2.8.8.6 4.8-1.6 8.2-6 8.2-11.2A11.5 11.5 0 0 0 12 .5Z"/>
    </svg>
  );
}


