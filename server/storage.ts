import { articles, categories, horoscopes, type Article, type InsertArticle, type Category, type InsertCategory, type Horoscope, type InsertHoroscope } from "@shared/schema";

export interface IStorage {
  // Articles
  getArticles(limit?: number, offset?: number, category?: string, featured?: boolean): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;
  searchArticles(query: string): Promise<Article[]>;
  getPopularArticles(limit?: number): Promise<Article[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Horoscopes
  getDailyHoroscope(zodiacSign: string): Promise<Horoscope | undefined>;
  createHoroscope(horoscope: InsertHoroscope): Promise<Horoscope>;
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private categories: Map<string, Category>;
  private horoscopes: Map<string, Horoscope>;
  private currentArticleId: number;
  private currentCategoryId: number;
  private currentHoroscopeId: number;

  constructor() {
    this.articles = new Map();
    this.categories = new Map();
    this.horoscopes = new Map();
    this.currentArticleId = 1;
    this.currentCategoryId = 1;
    this.currentHoroscopeId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoryData: InsertCategory[] = [
      { name: "horoscope", nameGeorgian: "ჰოროსკოპი", description: "Daily and weekly horoscopes", color: "celestial-gold" },
      { name: "zodiac", nameGeorgian: "ზოდიაქო", description: "Zodiac signs and their meanings", color: "mystic-purple" },
      { name: "tarot", nameGeorgian: "ტარო", description: "Tarot card readings and interpretations", color: "lavender" },
      { name: "crystals", nameGeorgian: "კრისტალები", description: "Healing crystals and their properties", color: "stardust-gold" },
      { name: "moon-phases", nameGeorgian: "მთვარის ფაზები", description: "Moon phases and their influence", color: "midnight-blue" },
      { name: "predictions", nameGeorgian: "პროგნოზები", description: "Astrological predictions and forecasts", color: "deep-space" }
    ];

    categoryData.forEach(cat => {
      const category: Category = { ...cat, id: this.currentCategoryId++ };
      this.categories.set(cat.name, category);
    });

    // Seed articles
    const articleData: InsertArticle[] = [
      {
        title: "2024 წლის ასტროლოგიური პროგნოზი - რა გველოდება?",
        excerpt: "ახალი წელი ახალ შესაძლებლობებს მოგვანიჭებს. ასტროლოგიური კონფიგურაციები იმდენად ძლიერია, რომ ყოველი ზოდიაქოს ნიშნისთვის უნიკალური გამოცდილება გათვალისწინებულია...",
        content: "ახალი წელი ახალ შესაძლებლობებს მოგვანიჭებს. ასტროლოგიური კონფიგურაციები იმდენად ძლიერია, რომ ყოველი ზოდიაქოს ნიშნისთვის უნიკალური გამოცდილება გათვალისწინებულია. ამ წელს ვარსკვლავები განსაკუთრებულ ყურადღებას აქცევენ პირად ზრდასა და სულიერ განვითარებას.",
        category: "predictions",
        author: "ნინო ასტროლოგი",
        authorRole: "ასტროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-01-15"),
        likes: 247,
        comments: 18,
        featured: true,
        views: 1520
      },
      {
        title: "ტაროს კარტების საიდუმლოებები თქვენთვის",
        excerpt: "ტაროს კარტები ძველი ბრძნულების ცოდნას ატარებს. თითოეული კარტა უნიკალურ ენერგიას ფლობს...",
        content: "ტაროს კარტები ძველი ბრძნულების ცოდნას ატარებს. თითოეული კარტა უნიკალურ ენერგიას ფლობს და სიმბოლურ მესიჯებს გვაწვდის. ტაროს წაკითხვა არ არის მომავლის გაუქმებადი წინასწარმეტყველება, არამედ სულიერი გზამკვლევი.",
        category: "tarot",
        author: "მარიამ ტაროლოგი",
        authorRole: "ტაროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        publishedAt: new Date("2024-01-12"),
        likes: 89,
        comments: 12,
        featured: false,
        views: 654
      },
      {
        title: "მკურნალი კრისტალების ძალა",
        excerpt: "კრისტალები ღია ენერგიული ველების მქონე ქვებია, რომლებიც ჩვენს ჩაკრებზე მოქმედებენ...",
        content: "კრისტალები ღია ენერგიული ველების მქონე ქვებია, რომლებიც ჩვენს ჩაკრებზე მოქმედებენ. ისინი ძველი დროიდან გამოიყენებოდა მკურნალობისა და სულიერი განწმენდისთვის. თითოეული კრისტალი განსაკუთრებული თვისებებით ხასიათდება.",
        category: "crystals",
        author: "ანა კრისტალოთერაპევტი",
        authorRole: "კრისტალოთერაპევტი",
        imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        publishedAt: new Date("2024-01-10"),
        likes: 156,
        comments: 24,
        featured: false,
        views: 892
      },
      {
        title: "მთვარის ფაზები და მათი გავლენა",
        excerpt: "მთვარის ფაზები ღრმა გავლენას ახდენენ ჩვენს ემოციურ მდგომარეობაზე და ენერგეტიკაზე...",
        content: "მთვარის ფაზები ღრმა გავლენას ახდენენ ჩვენს ემოციურ მდგომარეობაზე და ენერგეტიკაზე. ახალი მთვარე იდეალურია ახალი დაწყებებისთვის, ხოლო სავსე მთვარე - განზრახვების რეალიზაციისთვის.",
        category: "moon-phases",
        author: "დავით ლუნოლოგი",
        authorRole: "ლუნოლოგი",
        imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        publishedAt: new Date("2024-01-08"),
        likes: 203,
        comments: 31,
        featured: false,
        views: 1127
      },
      {
        title: "ნატალური რუკის ანალიზი",
        excerpt: "ნატალური რუკა თქვენი ცხოვრების გეგმას წარმოადგენს, რომელიც დაბადების მომენტში ჩაიწერა...",
        content: "ნატალური რუკა თქვენი ცხოვრების გეგმას წარმოადგენს, რომელიც დაბადების მომენტში ჩაიწერა. ის გვიჩვენებს ჩვენს უნარებს, გამოწვევებს და საცხოვრებელ მიმართულებებს.",
        category: "zodiac",
        author: "ნინო ასტროლოგი",
        authorRole: "ასტროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        publishedAt: new Date("2024-01-05"),
        likes: 178,
        comments: 19,
        featured: false,
        views: 743
      }
    ];

    articleData.forEach(art => {
      const article: Article = { ...art, id: this.currentArticleId++ };
      this.articles.set(article.id, article);
    });

    // Seed horoscopes
    const horoscopeData: InsertHoroscope[] = [
      {
        zodiacSign: "leo",
        zodiacSignGeorgian: "ლომი",
        content: "დღეს შემოქმედებითი ენერგია განსაკუთრებით ძლიერია. ვარსკვლავები გირჩევენ ახალი პროექტების დაწყებას.",
        date: new Date()
      },
      {
        zodiacSign: "aries",
        zodiacSignGeorgian: "ვერძი",
        content: "თქვენი ენერგია დღეს შეუდარებელია. სამუშაო პროექტებში დიდი წარმატება გელოდებათ.",
        date: new Date()
      }
    ];

    horoscopeData.forEach(hor => {
      const horoscope: Horoscope = { ...hor, id: this.currentHoroscopeId++ };
      this.horoscopes.set(horoscope.zodiacSign, horoscope);
    });
  }

  async getArticles(limit = 10, offset = 0, category?: string, featured?: boolean): Promise<Article[]> {
    let articlesArray = Array.from(this.articles.values());
    
    if (category) {
      articlesArray = articlesArray.filter(article => article.category === category);
    }
    
    if (featured !== undefined) {
      articlesArray = articlesArray.filter(article => article.featured === featured);
    }
    
    return articlesArray
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const article: Article = {
      ...insertArticle,
      id: this.currentArticleId++,
      likes: 0,
      comments: 0,
      views: 0,
    };
    this.articles.set(article.id, article);
    return article;
  }

  async updateArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.articles.set(id, article);
    }
  }

  async searchArticles(query: string): Promise<Article[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getPopularArticles(limit = 5): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(name: string): Promise<Category | undefined> {
    return this.categories.get(name);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      id: this.currentCategoryId++,
    };
    this.categories.set(category.name, category);
    return category;
  }

  async getDailyHoroscope(zodiacSign: string): Promise<Horoscope | undefined> {
    return this.horoscopes.get(zodiacSign);
  }

  async createHoroscope(insertHoroscope: InsertHoroscope): Promise<Horoscope> {
    const horoscope: Horoscope = {
      ...insertHoroscope,
      id: this.currentHoroscopeId++,
    };
    this.horoscopes.set(horoscope.zodiacSign, horoscope);
    return horoscope;
  }
}

export const storage = new MemStorage();
