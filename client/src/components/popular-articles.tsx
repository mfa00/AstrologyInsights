import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatViews } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { Article } from "@shared/schema";

export default function PopularArticles() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/popular?limit=3"],
  });

  return (
    <Card className="article-card bg-gradient-to-br from-deep-space/60 to-mystic-purple/40">
      <CardHeader>
        <CardTitle className="text-xl font-bold celestial-gold flex items-center">
          <Flame className="mr-2 w-5 h-5" />
          პოპულარული
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <div key={article.id} className="flex items-center space-x-3">
                <span className="celestial-gold font-bold text-lg w-6 text-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <Link href={`/article/${article.id}`}>
                    <h6 className="star-white text-sm font-semibold leading-tight hover:celestial-gold transition-colors cursor-pointer line-clamp-2">
                      {article.title}
                    </h6>
                  </Link>
                  <p className="lavender text-xs">
                    {formatViews(article.views || 0)} ნახვა
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center lavender">
            <p className="text-sm">პოპულარული სტატიები ვერ მოიძებნა</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
