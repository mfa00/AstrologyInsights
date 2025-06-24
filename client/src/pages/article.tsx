import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Share2, ArrowLeft } from "lucide-react";
import type { Article } from "@shared/schema";

export default function ArticleDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const articleId = parseInt(params.id || "0");

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !isNaN(articleId) && articleId > 0,
  });

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">შეცდომა</h1>
                <p className="lavender mb-4">სტატია ვერ მოიძებნა</p>
                <Button onClick={() => navigate("/")} variant="outline">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  მთავარ გვერდზე დაბრუნება
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="w-full h-96 rounded-xl mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : article ? (
            <article className="max-w-4xl mx-auto">
              {/* Back button */}
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="lavender hover:celestial-gold"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  უკან დაბრუნება
                </Button>
              </div>

              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold star-white mb-4 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Badge className="bg-celestial-gold text-cosmic-black font-semibold">
                    {article.category}
                  </Badge>
                  <span className="lavender">{formatDate(article.publishedAt)}</span>
                  
                  <div className="flex items-center space-x-4 text-sm lavender">
                    <span className="flex items-center">
                      <Heart className="mr-1 w-4 h-4" />
                      {article.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="mr-1 w-4 h-4" />
                      {article.comments}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 w-4 h-4" />
                      {article.views}
                    </span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-celestial-gold to-stardust-gold rounded-full flex items-center justify-center text-cosmic-black font-bold">
                      {article.author.charAt(0)}
                    </div>
                    <div>
                      <p className="star-white font-semibold">{article.author}</p>
                      <p className="lavender text-sm">{article.authorRole}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="border-celestial-gold text-celestial-gold hover:bg-celestial-gold hover:text-cosmic-black">
                    <Share2 className="mr-2 w-4 h-4" />
                    გაზიარება
                  </Button>
                </div>
              </header>

              {/* Featured Image */}
              <div className="mb-8">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                <div className="text-lg leading-relaxed lavender mb-6">
                  {article.excerpt}
                </div>
                
                <div className="text-base leading-relaxed star-white whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              {/* Article Actions */}
              <div className="mt-12 pt-8 border-t border-celestial-gold/20">
                <div className="flex items-center justify-center space-x-6">
                  <Button variant="outline" className="border-celestial-gold text-celestial-gold hover:bg-celestial-gold hover:text-cosmic-black">
                    <Heart className="mr-2 w-4 h-4" />
                    მოწონება ({article.likes})
                  </Button>
                  <Button variant="outline" className="border-celestial-gold text-celestial-gold hover:bg-celestial-gold hover:text-cosmic-black">
                    <MessageCircle className="mr-2 w-4 h-4" />
                    კომენტარი ({article.comments})
                  </Button>
                  <Button variant="outline" className="border-celestial-gold text-celestial-gold hover:bg-celestial-gold hover:text-cosmic-black">
                    <Share2 className="mr-2 w-4 h-4" />
                    გაზიარება
                  </Button>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
