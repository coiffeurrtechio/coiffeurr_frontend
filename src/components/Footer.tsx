import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Building2,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { Button } from "../components/ui_components/button";

function Footer() {
  const location = useLocation();
  const pathname = location.pathname;
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollY) {
        // scrolling DOWN → hide
        setShow(false);
      } else {
        // scrolling UP → show
        setShow(true);
      }

      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/salons", label: "Salons", icon: Building2 },
  ];

  return (
    <>
      {/* 🌐 Desktop Footer */}
      <footer className="hidden md:block bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Coiffeurr</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Premium beauty services delivered by expert professionals.
                Transform your look with our luxury treatments.
              </p>
              <div className="flex space-x-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                {[
                  "Haircut & Styling",
                  "Hair Coloring",
                  "Manicure & Pedicure",
                  "Facials",
                  "Bridal Packages",
                ].map((s) => (
                  <li key={s}>
                    <a href="#" className="hover:text-primary-foreground transition-colors">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                {["About Us", "Our Artists", "Locations", "Careers", "Contact"].map((c) => (
                  <li key={c}>
                    <a href="#" className="hover:text-primary-foreground transition-colors">
                      {c}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Beauty Street, City</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Mon-Sat: 9AM-8PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; 2025 Coiffeurr. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 📱 Mobile Bottom Navigation */}
      <footer  className={`fixed bottom-0 left-0 right-0 transition-transform duration-300  z-50 bg-card border-t border-border shadow-lg md:hidden 
        ${show ? "translate-y-0" : "translate-y-full"}`}>
      {/* <footer className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-card border-t border-border shadow-lg"> */}
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                to={href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </footer>
    </>
  );
}

export default Footer;
