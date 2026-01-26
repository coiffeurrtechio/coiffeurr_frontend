import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui_components/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "../components/ui_components/avatar";

export function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const userDetails = useSelector((state: any) => state.auth.user);

  // ⭐ Hide / Show Header Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Scroll Down → Hide Header
      if (currentScroll > lastScrollY && currentScroll > 80) {
        setShowHeader(false);
      } 
      // Scroll Up → Show Header
      else if (currentScroll < lastScrollY - 20) {
        setShowHeader(true);
      }

      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menuItems = [
    { name: "About", href: "#" },
    { name: "Services", href: "#" },
    { name: "Artists", href: "#" },
    { name: "Salons", href: "salons" },
  ];

  return (
    <>
      {/* ⭐ Animated Sticky Header */}
      <header
        className={`
          sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur bg-blur 
          transition-transform duration-500 
          ${showHeader ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            <Link to="/">
              <div className="flex items-center gap-2">
                <img src="/dummy_logo.png" alt="" className="h-10" />
                <h1 className="text-2xl font-bold tracking-tight">Coiffeurr</h1>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-accent-foreground transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="mx-auto border-4 p-1 border-accent/20 rounded-full">
                <Bell />
              </div>

              {isAuthenticated ? (
                <Link to="/profile">
                  <Avatar className="w-14 h-14 mx-auto border-4 border-accent/20">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
                      {userDetails?.username
                        ?.split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="cursor-pointer">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
