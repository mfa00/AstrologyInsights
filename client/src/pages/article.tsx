import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import type { Article } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ArticleDetail() {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const articleId = parseInt(params.id || "0");

  const { data: articleResponse, isLoading, error } = useQuery<{success: boolean, data: Article}>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !isNaN(articleId) && articleId > 0,
  });

  const article = articleResponse?.data;

  const likeMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would make an API call
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "მოწონება დაემატა",
        description: "თქვენ მოიწონეთ ეს სტატია",
      });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "ლინკი დაკოპირდა",
        description: "სტატიის ლინკი დაკოპირდა clipboard-ში",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen hero-bg">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <div className="premium-card max-w-2xl mx-auto p-12 text-center">
              <h1 className="text-3xl font-bold title-font text-red-500 mb-6">შეცდომა</h1>
              <p className="sky-text text-lg mb-8">სტატია ვერ მოიძებნა</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-sky-blue to-deep-sky text-white elegant-shadow">
                  მთავარი გვერდი
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg">
      <Header />
      
      <main className="pt-20">
        {isLoading ? (
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-5xl mx-auto">
              <Skeleton className="h-12 w-1/3 mb-6" />
              <Skeleton className="h-80 w-full mb-12 rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          </div>
        ) : article ? (
          <article className="container mx-auto px-6 py-12">
            <div className="max-w-5xl mx-auto">


              {/* Article Header */}
              <header className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="bg-sky-blue/15 text-sky-blue px-4 py-2 text-sm font-medium">
                    {article.category}
                  </Badge>
                  {article.featured && (
                    <Badge variant="default" className="bg-gradient-to-r from-sky-blue to-deep-sky text-white px-4 py-2 text-sm font-medium">
                      განსაკუთრებული
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold title-font gradient-text mb-8 leading-tight tracking-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-8 text-base sky-text mb-8">
                  <div className="flex items-center">
                    <User className="mr-3 w-5 h-5" />
                    <span className="font-medium">{article.author} - {article.authorRole}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 w-5 h-5" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-3 w-5 h-5" />
                    <span>{article.views} ნახვა</span>
                  </div>
                </div>
                
                {article.excerpt && (
                  <p className="text-xl md:text-2xl sky-text leading-relaxed mb-12 font-light max-w-4xl">
                    {article.excerpt}
                  </p>
                )}
              </header>

              {/* Article Image */}
              {article.imageUrl && (
                <div className="mb-16">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-[500px] md:h-[600px] object-cover rounded-3xl elegant-shadow"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="premium-card p-8 md:p-12 mb-16">
                <div className="prose prose-xl max-w-none">
                  <div className="text-dark-text leading-relaxed whitespace-pre-wrap text-lg md:text-xl font-light body-font">
                    {article.content}
                  </div>
                </div>
              </div>

              {/* Engagement Section */}
              <div className="premium-card p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <button 
                      onClick={() => handleLike()}
                      disabled={likeMutation.isPending}
                      className="flex items-center space-x-3 text-sky-text hover:text-sky-blue transition-colors text-lg"
                    >
                      <Heart className="w-6 h-6" />
                      <span className="font-medium">{article.likes}</span>
                    </button>
                    <div className="flex items-center space-x-3 text-sky-text text-lg">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-medium">{article.comments}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleShare()}
                    className="flex items-center space-x-3 elegant-shadow border-sky-blue/30 hover:bg-sky-blue hover:text-white"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>გაზიარება</span>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}