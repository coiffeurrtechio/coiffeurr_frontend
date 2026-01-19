import { Button } from "../components/ui_components/button"
import { Card, CardContent } from "../components/ui_components/card"
import { ServiceCard } from "../components/service_card"
import {
  Scissors,
  Sparkles,
  Heart,
  Star,
  MapPin,
  Phone,
  ChevronRight,
  Users,
  Award,
  Calendar,
  ScissorsLineDashed,
  User,
} from "lucide-react"

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Salon } from "../Interfaces/SaloInterface";
import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import SalonInfo from "./SalonInfo";



export default function HomePage() {
  const [active, setActive] = useState("salon");


  const services = [
    {
      title: "Premium Haircut & Styling",
      description: "Expert cuts and styling for all hair types with premium products",
      price: "$85",
      duration: "60 min",
      icon: <Scissors className="w-6 h-6 text-accent-foreground" />,
    },
    {
      title: "Luxury Manicure",
      description: "Complete nail care with gel polish and cuticle treatment",
      price: "$45",
      duration: "45 min",
      icon: <Sparkles className="w-6 h-6 text-accent-foreground" />,
    },
    {
      title: "Signature Pedicure",
      description: "Relaxing foot treatment with massage and premium polish",
      price: "$55",
      duration: "60 min",
      icon: <Heart className="w-6 h-6 text-accent-foreground" />,
    },
    {
      title: "Rejuvenating Facial",
      description: "Deep cleansing facial with personalized skincare treatment",
      price: "$95",
      duration: "75 min",
      icon: <Star className="w-6 h-6 text-accent-foreground" />,
    },
    {
      title: "Hair Coloring",
      description: "Professional color services from highlights to full color",
      price: "$120",
      duration: "120 min",
      icon: <Sparkles className="w-6 h-6 text-accent-foreground" />,
    },
    {
      title: "Bridal Package",
      description: "Complete bridal beauty package for your special day",
      price: "$250",
      duration: "180 min",
      icon: <Heart className="w-6 h-6 text-accent-foreground" />,
    },
  ]

  const artists = [
    {
      name: "Sofia Martinez",
      specialty: "Hair Styling & Color",
      experience: "8 years",
      image: "/professional-female-hairstylist.jpg",
    },
    {
      name: "Emma Chen",
      specialty: "Nail Art & Manicure",
      experience: "6 years",
      image: "/facial_service.jpg",
    },
    {
      name: "Isabella Rodriguez",
      specialty: "Skincare & Facials",
      experience: "10 years",
      image: "/professional-esthetician.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-background">


            <Header/>
     <div className="w-full sticky bg-background top-0 z-50">
      {/* Tabs */}
      <div className="relative flex w-full justify-center border-b border-gray-300">
        <button
          onClick={() => setActive("salon")}
          className="relative w-1/2 py-3 text-center font-semibold flex justify-center items-center gap-2"
        >
          <ScissorsLineDashed />
          Salon
        </button>

        <button
          onClick={() => setActive("artist")}
          className="relative w-1/2 py-3 text-center font-semibold flex justify-center items-center gap-2"
        >
          <User />
          Artist
        </button>

        {/* SUPER SMOOTH SLIDING BAR */}
        <div
          className={`absolute bottom-0 h-1.5 bg-black rounded-full 
            transition-all duration-500 ease-[cubic-bezier(.25,.8,.25,1)]
          `}
          style={{
            width: "25%",           // matches w-1/4 width
            left: active === "salon" ? "12.5%" : "62.5%", // perfect smooth slide
          }}
        ></div>
      </div>

      

      {/* Inline CSS for fade + slide animation */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide {
          animation: fadeSlide 0.5s ease-out;
        }
      `}</style>
    </div>


      {active === "salon" 
      ? (<SalonInfo/>)
    :<></>
    }

    </div>
  )
}
