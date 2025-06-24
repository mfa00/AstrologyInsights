import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ArticleCard from "@/components/article-card";
import ZodiacSelector from "@/components/zodiac-selector";
import PopularArticles from "@/components/popular-articles";
import NewsletterSignup from "@/components/newsletter-signup";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Moon, ChevronDown } from "lucide-react";
import type { Article } from "@shared/schema";

export default function Home() {
  const [articlesOffset, setArticlesOffset] = useState(0);
  const articlesLimit = 6;

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles?featured=true&limit=1"],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles?limit=${articlesLimit}&offset=${articlesOffset}&featured=false`],
  });

  const loadMoreArticles = () => {
    setArticlesOffset(prev => prev + articlesLimit);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 sky-bg">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600" 
                alt="Celestial night sky with constellations" 
                className="w-full h-64 object-cover rounded-2xl opacity-70"
              />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              ასტროლოგიის სამყარო
            </h2>
            <p className="text-xl md:text-2xl sky-text mb-8 leading-relaxed">
              აღმოაჩინე ვარსკვლავების საიდუმლოებები და შენი ზოდიაქოს ნიშნის ეზოთერული ბუნება
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/category/horoscope">
                <Button className="bg-gradient-to-r from-sky-blue to-deep-sky text-pure-white hover:shadow-lg transition-all duration-300">
                  <Star className="mr-2 w-4 h-4" />
                  დღევანდელი ჰოროსკოპი
                </Button>
              </Link>
              <Link href="/category/zodiac">
                <Button variant="outline" className="border-2 border-sky-blue text-sky-blue hover:bg-sky-blue hover:text-pure-white transition-all duration-300">
                  <Moon className="mr-2 w-4 h-4" />
                  ზოდიაქოს რუკა
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 bg-pure-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Articles Section */}
            <div className="lg:col-span-2">
              <div className="mb-12">
                <h3 className="text-3xl font-bold sky-blue mb-2">განსაკუთრებული სტატიები</h3>
                <div className="w-20 h-1 bg-gradient-to-r from-sky-blue to-deep-sky rounded-full"></div>
              </div>
              
              {/* Featured Article */}
              {featuredLoading ? (
                <div className="article-card rounded-2xl p-8 mb-8">
                  <Skeleton className="w-full h-64 rounded-xl mb-6" />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ) : featuredArticles && featuredArticles.length > 0 ? (
                <div className="mb-8">
                  <ArticleCard article={featuredArticles[0]} featured={true} />
                </div>
              ) : null}
              
              {/* Articles Grid */}
              {articlesLoading ? (
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="article-card rounded-xl p-6">
                      <Skeleton className="w-full h-40 rounded-lg mb-4" />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : articles && articles.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  <div className="text-center">
                    <Button 
                      onClick={loadMoreArticles}
                      className="bg-gradient-to-r from-sky-blue to-deep-sky text-pure-white hover:shadow-lg transition-all duration-300"
                    >
                      <ChevronDown className="mr-2 w-4 h-4" />
                      მეტის ნახვა
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center sky-text py-12">
                  <p>სტატიები ვერ მოიძებნა</p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <ZodiacSelector />
              <PopularArticles />
              <NewsletterSignup />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
