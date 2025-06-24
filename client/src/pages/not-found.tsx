import { Link } from "wouter";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="premium-card p-12 md:p-16">
            <div className="mb-12">
              <h1 className="text-9xl md:text-[12rem] font-bold title-font gradient-text mb-6 tracking-tight">404</h1>
              <h2 className="text-3xl md:text-4xl font-bold title-font dark-text mb-6">გვერდი ვერ მოიძებნა</h2>
              <p className="sky-text text-lg md:text-xl leading-relaxed font-light">
                ვიბოდიშებთ, მოთხოვნილი გვერდი ვერ მოიძებნა. შესაძლოა იგი წაშლილი, 
                გადატანილი ან არასწორად შეყვანილი იყოს URL მისამართი.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-sky-blue to-deep-sky text-pure-white elegant-shadow px-8 py-4">
                  <Home className="mr-3 w-5 h-5" />
                  მთავარი
                </Button>
              </Link>

            </div>
            
            <div className="mt-12 pt-8 border-t border-sky-blue/20">
              <p className="sky-text text-sm mb-4">ძიება განსაკუთრებულ შინაარსს?</p>
              <Link href="/category/horoscope">
                <Button variant="ghost" size="sm" className="text-sky-blue hover:bg-sky-blue/10">
                  <Search className="mr-2 w-4 h-4" />
                  ჰოროსკოპების კატეგორია
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}