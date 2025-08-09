import { Moon, Github, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-moon-border bg-black/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-moon-primary">
          <Moon className="h-5 w-5" />
          <span className="font-semibold tracking-wide">MOONLIGHT LOGGER</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a className="text-neutral-300 hover:text-white" href="#dashboard">Dashboard</a>
          <a className="text-neutral-300 hover:text-white" href="#logs">Logs</a>
          <a className="text-neutral-300 hover:text-white" href="#settings">Settings</a>
          <a className="btn-secondary" href="#github"><Github className="h-4 w-4"/>GitHub</a>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-moon-border text-neutral-300"><User className="h-4 w-4"/></span>
        </nav>
      </div>
    </header>
  );
}

