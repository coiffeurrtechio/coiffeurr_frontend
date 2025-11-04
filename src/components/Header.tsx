import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui_components/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "../components/ui_components/avatar"

export function Header() {

  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const userDetails = useSelector((state: any) => state.auth.user);

  console.log("isAuthenticated =",isAuthenticated);
  
  const menuItems = [
    { name: "About", href: "#" },
    { name: "Services", href: "#" },
    { name: "Artists", href: "#" },
    { name: "Salons", href: "salons" },
  ];
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-2">
                <img src="/dummy_logo.png" alt="" fetchPriority="high" className="h-10" />
                <h1 className="text-2xl font-bold tracking-tight">Coiffure</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated
                ? (<Link to="/profile">
                  <Avatar className="w-14 h-14 mx-auto border-4 border-accent/20">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
                      {userDetails.username
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Link>)
                :
                (<Link to="/login">
                  <Button className="sm:inline-flex cursor-pointer">Login</Button>
                </Link>)
              }

              {/* Hamburger button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-black p-2 rounded-md transition-colors"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay (outside header) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer sliding from top */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-white p-6 shadow-2xl transition-transform duration-500 ${isOpen ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <div className="flex items-center justify-between">
            {/* <h2 className="text-lg font-semibold text-rose-900">Menu</h2> */}
            <div className="flex items-center gap-2">
              <img src="/dummy_logo.png" alt="" className="h-10" fetchPriority="high" />
              <h1 className="text-2xl font-bold tracking-tight">Coiffure</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="mt-8">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block py-3 px-4 text-lg font-medium text-rose-800 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-rose-200">
              <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                Book Appointment
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

