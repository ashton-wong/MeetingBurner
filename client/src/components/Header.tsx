import { Flame } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3">
              <Flame className="w-6 h-6 text-primary" />
              <h1 className="font-display font-bold text-xl">
                The Money Burner 3000
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
          </nav>
        </div>
      </div>
    </header>
  );
}
