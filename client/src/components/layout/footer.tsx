import { Link } from "wouter";
import { Mail, Facebook, Instagram, Youtube, Send } from "lucide-react";

const categories = [
  { name: "ჰოროსკოპი", href: "/category/horoscope" },
  { name: "ზოდიაქოს ნიშნები", href: "/category/zodiac" },
  { name: "ტაროს კარტები", href: "/category/tarot" },
  { name: "მთვარის ფაზები", href: "/category/moon-phases" }
];

const services = [
  { name: "პირადი კონსულტაცია", href: "#" },
  { name: "ნატალური რუკა", href: "#" },
  { name: "თავსებადობის ანალიზი", href: "#" },
  { name: "ასტროლოგიური პროგნოზი", href: "#" }
];

export default function Footer() {
  return (
    <footer className="bg-deep-space border-t border-celestial-gold/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://mnatobi.ge/wp-content/uploads/2022/10/1.jpg" 
                alt="მნათობი" 
                className="w-8 h-8 rounded-full star-glow"
              />
              <h5 className="text-xl font-bold celestial-gold">მნათობი</h5>
            </div>
            <p className="lavender text-sm leading-relaxed">
              ვარსკვლავების ენაზე ვისაუბრებთ და ასტროლოგიის საიდუმლოებებს ვყოფთ ყველასთან.
            </p>
          </div>
          
          {/* Categories */}
          <div>
            <h6 className="star-white font-semibold mb-4">კატეგორიები</h6>
            <ul className="space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    href={category.href} 
                    className="lavender hover:celestial-gold transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h6 className="star-white font-semibold mb-4">სერვისები</h6>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href} 
                    className="lavender hover:celestial-gold transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social & Contact */}
          <div>
            <h6 className="star-white font-semibold mb-4">გამოგვყეთ</h6>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="lavender hover:celestial-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="lavender hover:celestial-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="lavender hover:celestial-gold transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="lavender hover:celestial-gold transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
            <p className="lavender text-xs flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              info@mnatobi.ge
            </p>
          </div>
        </div>
        
        <div className="border-t border-celestial-gold/20 mt-8 pt-8 text-center">
          <p className="lavender text-sm">
            © 2024 მნათობი. ყველა უფლება დაცულია. 
            <span className="celestial-gold ml-2">✨ ვარსკვლავებით შექმნილია</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
