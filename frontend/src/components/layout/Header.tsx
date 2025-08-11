import { Moon, Github, User } from 'lucide-react';

type HeaderProps = {
  currentPage: 'dashboard' | 'settings' | 'about';
  onPageChange: (page: 'dashboard' | 'settings' | 'about') => void;
};

export function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-moon-border bg-black/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-moon-primary cursor-pointer" onClick={() => onPageChange('dashboard')}>
          <Moon className="h-5 w-5" />
          <span className="font-semibold tracking-wide">MOONLIGHT LOGGER</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <button 
            className={`${currentPage === 'dashboard' ? 'text-moon-primary' : 'text-neutral-300 hover:text-white'} transition-colors`}
            onClick={() => onPageChange('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`${currentPage === 'settings' ? 'text-moon-primary' : 'text-neutral-300 hover:text-white'} transition-colors`}
            onClick={() => onPageChange('settings')}
          >
            Settings
          </button>
          <button 
            className={`${currentPage === 'about' ? 'text-moon-primary' : 'text-neutral-300 hover:text-white'} transition-colors`}
            onClick={() => onPageChange('about')}
          >
            About
          </button>
          <a 
            className="btn-secondary" 
            href="https://github.com/atlasfernands/Moonlight-Logger" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4"/>GitHub
          </a>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-moon-border text-neutral-300 cursor-pointer hover:bg-white/10 transition-colors">
            <User className="h-4 w-4"/>
          </span>
        </nav>
      </div>
    </header>
  );
}

