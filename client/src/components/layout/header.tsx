import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "მთავარი", href: "/" },
  { name: "ჰოროსკოპი", href: "/category/horoscope" },
  { name: "ზოდიაქო", href: "/category/zodiac" },
  { name: "პროგნოზები", href: "/category/predictions" },
  { name: "ტარო", href: "/category/tarot" }
];

export default function Header() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-pure-white/95 backdrop-blur-sm border-b border-sky-blue/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="https://mnatobi.ge/wp-content/uploads/2022/10/1.jpg" 
              alt="მნათობი - ასტროლოგია" 
              className="w-10 h-10 rounded-full sky-glow"
            />
            <h1 className="text-2xl font-bold sky-blue">მნათობი</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors hover:sky-blue ${
                  location === item.href ? "sky-blue" : "dark-text"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="ძებნა..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-soft-gray border-sky-blue/30 text-dark-text pl-10 focus:border-sky-blue"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 sky-blue w-4 h-4" />
            </form>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden sky-blue hover:bg-sky-blue/20"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-pure-white border-sky-blue/20">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="ძებნა..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-soft-gray border-sky-blue/30 text-dark-text pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 sky-blue w-4 h-4" />
                  </form>
                  
                  {/* Mobile Navigation */}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg transition-colors hover:sky-blue ${
                        location === item.href ? "sky-blue" : "dark-text"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
