import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ArticleCard from "@/components/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Article, Category } from "@shared/schema";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = params.name || "";

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryName}`],
    enabled: !!categoryName,
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles?category=${categoryName}&limit=20`],
    enabled: !!categoryName,
  });

  const getCategoryTitle = (name: string) => {
    switch (name) {
      case "horoscope": return "ჰოროსკოპი";
      case "zodiac": return "ზოდიაქო";
      case "tarot": return "ტარო";
      case "crystals": return "კრისტალები";
      case "moon-phases": return "მთვარის ფაზები";
      case "predictions": return "პროგნოზები";
      default: return name;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Category Header */}
      <section className="pt-24 pb-12 mystical-bg">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            {categoryLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            ) : category ? (
              <>
                <Badge className="bg-celestial-gold text-cosmic-black font-semibold mb-4 text-lg px-4 py-2">
                  {category.nameGeorgian}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
                  {category.nameGeorgian}
                </h1>
                {category.description && (
                  <p className="text-lg lavender leading-relaxed">
                    {category.description}
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
                  {getCategoryTitle(categoryName)}
                </h1>
                <p className="text-lg lavender leading-relaxed">
                  აღმოაჩინე {getCategoryTitle(categoryName)} კატეგორიის სტატიები
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Articles */}
      <main className="py-16 bg-cosmic-black">
        <div className="container mx-auto px-4">
          {articlesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold star-white mb-2">
                  სულ {articles.length} სტატია
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-celestial-gold to-stardust-gold rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold lavender mb-4">
                სტატიები ვერ მოიძებნა
              </h2>
              <p className="lavender">
                ამ კატეგორიაში სტატიები ჯერ არ არის დამატებული.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
