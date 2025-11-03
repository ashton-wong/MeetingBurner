import { Flame, Moon, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCallback } from "react";

export default function Header() {
  const [location] = useLocation();
  const [halloween, setHalloween] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('halloweenMode');
    if (stored === '1') {
      setHalloween(true);
      document.documentElement.classList.add('halloween');
    }
  }, []);

  const toggleHalloween = () => {
    const next = !halloween;
    setHalloween(next);
    if (next) {
      document.documentElement.classList.add('halloween');
      localStorage.setItem('halloweenMode', '1');
    } else {
      document.documentElement.classList.remove('halloween');
      localStorage.removeItem('halloweenMode');
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3">
              <Flame className="w-6 h-6 text-primary" />
              <h1 className="font-display font-bold text-xl">
                {halloween ? '🎃 The Spooky Burner 3000' : 'The Money Burner 3000'}
              </h1>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Link href="/" data-testid="link-dashboard">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"} 
                size="default"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/setup" data-testid="link-setup">
              <Button 
                variant={location === "/setup" ? "secondary" : "ghost"}
                size="default"
              >
                New Meeting
              </Button>
            </Link>
            {/* Connect Google removed per request */}
            <Button variant="ghost" size="icon" onClick={toggleHalloween} aria-pressed={halloween} title="Toggle Halloween Mode">
              {halloween ? <Zap className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
