import { Moon, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-moon-border bg-black/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-moon-primary">
          <Moon className="h-5 w-5" />
          <span className="font-semibold tracking-wide">Moonlight Logger</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a className="text-neutral-300 hover:text-white" href="#docs">Docs</a>
          <a className="text-neutral-300 hover:text-white" href="#about">Sobre</a>
          <a className="btn-secondary" href="#github"><Github className="h-4 w-4"/>GitHub</a>
        </nav>
      </div>
    </header>
  );
}

