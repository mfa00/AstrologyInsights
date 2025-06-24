import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ArticleCard from "@/components/article-card";
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

  return (
    <div className="min-h-screen hero-bg">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <Link href="/">
                <Button variant="outline" size="sm" className="mb-8 elegant-shadow">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  უკან დაბრუნება
                </Button>
              </Link>
              
              {categoryLoading ? (
                <Skeleton className="h-16 w-80 mx-auto mb-6" />
              ) : category ? (
                <>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold title-font gradient-text mb-6 tracking-tight">
                    {category.nameGeorgian}
                  </h1>
                  {category.description && (
                    <p className="text-xl md:text-2xl sky-text leading-relaxed font-light max-w-3xl mx-auto">
                      {category.description}
                    </p>
                  )}
                </>
              ) : (
                <h1 className="text-5xl md:text-7xl font-bold title-font gradient-text mb-6">
                  კატეგორია ვერ მოიძებნა
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              {articlesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-6">
                      <Skeleton className="h-64 w-full rounded-2xl" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : articles && articles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="premium-card p-12 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold title-font sky-blue mb-6">სტატიები ვერ მოიძებნა</h3>
                    <p className="sky-text text-lg mb-10 leading-relaxed">ამ კატეგორიაში ჯერ არ არის დამატებული სტატიები.</p>
                    <Link href="/">
                      <Button size="lg" className="bg-gradient-to-r from-sky-blue to-deep-sky text-white elegant-shadow">
                        უკან დაბრუნება
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}