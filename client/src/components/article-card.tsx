import { Link } from "wouter";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatViews } from "@/lib/utils";
import type { Article } from "@shared/schema";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const cardClassName = featured 
    ? "article-card rounded-2xl p-8 bg-gradient-to-br from-deep-space/50 to-mystic-purple/30"
    : "article-card rounded-xl p-6 bg-gradient-to-br from-deep-space/40 to-midnight-blue/30";

  return (
    <Card className={cardClassName}>
      <CardContent className="p-0">
        <Link href={`/article/${article.id}`}>
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className={`w-full object-cover rounded-lg mb-${featured ? '6' : '4'} hover:opacity-90 transition-opacity cursor-pointer`}
            style={{ height: featured ? '16rem' : '10rem' }}
          />
        </Link>
        
        <div className={`flex items-center mb-${featured ? '4' : '3'}`}>
          <Badge 
            variant="secondary" 
            className="bg-celestial-gold text-cosmic-black mr-3 font-semibold"
          >
            {article.category}
          </Badge>
          <span className="lavender text-sm">{formatDate(article.publishedAt)}</span>
        </div>
        
        <Link href={`/article/${article.id}`}>
          <h4 className={`${featured ? 'text-2xl' : 'text-lg'} font-bold star-white mb-${featured ? '4' : '3'} hover:celestial-gold transition-colors cursor-pointer leading-tight`}>
            {article.title}
          </h4>
        </Link>
        
        <p className={`lavender leading-relaxed mb-${featured ? '6' : '4'} ${featured ? 'text-base' : 'text-sm'}`}>
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-celestial-gold to-stardust-gold rounded-full flex items-center justify-center text-cosmic-black font-bold text-sm">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="star-white font-semibold text-sm">{article.author}</p>
              <p className="lavender text-xs">{article.authorRole}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs">
            <span className="lavender hover:celestial-gold transition-colors cursor-pointer flex items-center">
              <Heart className="mr-1 w-3 h-3" />
              {article.likes}
            </span>
            <span className="lavender hover:celestial-gold transition-colors cursor-pointer flex items-center">
              <MessageCircle className="mr-1 w-3 h-3" />
              {article.comments}
            </span>
            {article.views && (
              <span className="lavender flex items-center">
                <Eye className="mr-1 w-3 h-3" />
                {formatViews(article.views)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
