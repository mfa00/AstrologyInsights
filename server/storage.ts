import { eq, desc, like, or, sql, and } from 'drizzle-orm';
import { db } from './db';
import { articles, categories, horoscopes, articleViews, type Article, type InsertArticle, type Category, type InsertCategory, type Horoscope, type InsertHoroscope, type ArticleView, type InsertArticleView } from "@shared/schema";

export interface IStorage {
  // Articles
  getArticles(limit?: number, offset?: number, category?: string, featured?: boolean): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number, sessionId: string, ipAddress?: string, userAgent?: string): Promise<boolean>;
  searchArticles(query: string): Promise<Article[]>;
  getPopularArticles(limit?: number): Promise<Article[]>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // View tracking
  hasViewedArticle(articleId: number, sessionId: string): Promise<boolean>;
  recordArticleView(view: InsertArticleView): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Horoscopes
  getAllHoroscopes(): Promise<Horoscope[]>;
  getDailyHoroscope(zodiacSign: string): Promise<Horoscope | undefined>;
  createHoroscope(horoscope: InsertHoroscope): Promise<Horoscope>;
  
  // Users (for admin)
  getAllUsers(): Promise<any[]>;
  createUser(user: { username: string; email: string; role: string }): Promise<any>;
  
  // Database management
  initializeDatabase(): Promise<void>;
  
  // Analytics
  getViewStatistics(): Promise<{ totalViews: number; totalLikes: number; totalArticles: number }>;
  initializeHistoricalViewCounts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeDatabase(): Promise<void> {
    console.log('🔄 Initializing database...');
    
    try {
      // Check if tables exist by querying categories (one of our main tables)
      const existingCategories = await db.select().from(categories).limit(1);
      
      if (existingCategories.length === 0) {
        console.log('📊 Seeding database with initial data...');
        await this.seedData();
      } else {
        console.log('✅ Database already initialized');
      }
    } catch (error) {
      console.log('📊 Database appears empty, seeding with initial data...');
      await this.seedData();
    }
  }

  private async seedData(): Promise<void> {
    try {
    // Seed categories
    const categoryData: InsertCategory[] = [
      { name: "horoscope", nameGeorgian: "ჰოროსკოპი", description: "Daily and weekly horoscopes", color: "sky-blue" },
      { name: "crystals", nameGeorgian: "კრისტალები", description: "Healing crystals and their properties", color: "deep-sky" },
      { name: "moon-phases", nameGeorgian: "მთვარის ფაზები", description: "Moon phases and their influence", color: "ocean-blue" },
      { name: "spirituality", nameGeorgian: "სულიერება", description: "Spiritual growth and enlightenment", color: "sky-blue" },
      { name: "meditation", nameGeorgian: "მედიტაცია", description: "Meditation practices and mindfulness", color: "deep-sky" }
    ];

      console.log('📂 Seeding categories...');
      for (const cat of categoryData) {
        await db.insert(categories).values(cat).onConflictDoNothing();
      }

      // Seed articles
    const articleData: InsertArticle[] = [
      {
        title: "2024 წლის ასტროლოგიური პროგნოზი - ყველა ზოდიაქოს ნიშნისთვის",
        excerpt: "ახალი წელი ახალ შესაძლებლობებს მოგვანიჭებს. ვარსკვლავების კონფიგურაცია განსაკუთრებულ ენერგიას გვპირდება ყველა ზოდიაქოს ნიშნისთვის...",
        content: "2024 წელი განსაკუთრებული წელია ასტროლოგიური თვალსაზრისით. მარსი და ვენერის კონიუნქცია აპრილში ახალ შესაძლებლობებს გვპირდება სიყვარულის სფეროში. იუპიტერის გადასვლა ტყუპებში მატერიალურ კეთილდღეობასა და სტაბილურობას ნიშნავს. სატურნი კი მიგვიტანს სტაბილურობასა და დისციპლინაში. ამ წელს განსაკუთრებით მნიშვნელოვანია ინტუიციის მოსმენა და სულიერი განვითარების გზაზე წინსვლა.",
        category: "horoscope",
        author: "ნინო ასტროლოგი",
        authorRole: "პროფესიონალი ასტროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-01-15"),
        featured: true
      },
      {
        title: "კრისტალების მკურნალი ძალა და თანამედროვე ცხოვრება",
        excerpt: "კრისტალები ძველი დროიდან გამოიყენებოდა მკურნალობისა და სულიერი განწმენდისთვის. დღეს მეცნიერებაც აღიარებს მათ უნიკალურ თვისებებს...",
        content: "კრისტალები უნიკალური ენერგეტიკული სტრუქტურების მქონე მინერალებია, რომლებიც ათასწლეულების მანძილზე გამოიყენებოდა სხვადასხვა კულტურებში. ამეთისტი აძლიერებს ინტუიციას და იცავს ნეგატიური ენერგიისგან. როზე კვარცი სიყვარულისა და თანაგრძნობის ქვაა. ციტრინი კი მატერიალურ წარმატებასა და სიხარულს იზიდავს. მნიშვნელოვანია კრისტალების რეგულარული წმენდა მთვარის შუქზე ან მარილიან წყალში.",
        category: "crystals",
        author: "მარიამ კრისტალოთერაპევტი",
        authorRole: "კრისტალოთერაპევტი",
        imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-01-10"),
        featured: false
      },
      {
        title: "მთვარის ფაზებისა და ჩვენი ცხოვრების ღრმა კავშირი",
        excerpt: "მთვარის ფაზები ღრმა გავლენას ახდენენ ჩვენს ემოციურ მდგომარეობაზე, ენერგეტიკაზე და მთლიანად ცხოვრების რიტმზე...",
        content: "მთვარის ციკლი 29.5 დღისაა და ყოველი ფაზა განსხვავებულ ენერგიას ატარებს. ახალი მთვარე იდეალურია ახალი დაწყებებისთვის, ნოვებისა და გეგმების შედგენისთვის. მზარდი მთვარე ზრდასა და მიზნებისკენ სვლას ხელს უწყობს. სავსე მთვარე შედეგების მიღებისა და რეალიზაციის დროა. კლებადი მთვარე კი განწმენდასა და გათავისუფლებას ემსახურება.",
        category: "moon-phases",
        author: "დავით ლუნოლოგი",
        authorRole: "მთვარის ციკლების სპეციალისტი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-01-08"),
        featured: false
      },
      {
        title: "მედიტაციის სულიერი ძალა თანამედროვე საზოგადოებაში",
        excerpt: "მედიტაცია არის ძველი პრაქტიკა, რომელიც გვეხმარება შინაგანი მშვიდობის მოძებნაში და სულიერი განვითარების გზაზე წინსვლაში...",
        content: "მედიტაცია ათასწლეულების მანძილზე გამოიყენებოდა სულიერი განვითარებისთვის სხვადასხვა კულტურებსა და ტრადიციებში. თანამედროვე მეცნიერება ადასტურებს მედიტაციის დადებით გავლენას ტვინის მუშაობაზე. რეგულარული პრაქტიკა ამცირებს სტრესს, აუმჯობესებს კონცენტრაციას და ზრდის შინაგან მშვიდობას.",
        category: "meditation",
        author: "ანა სულიერი მასწავლებელი",
        authorRole: "მედიტაციის ინსტრუქტორი",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-01-05"),
        featured: false
      },
      {
        title: "სულიერი განწმენდა და ენერგეტიკული დაცვა",
        excerpt: "ყოველდღიური ცხოვრებაში ჩვენ ვხვდებით სხვადასხვა ნეგატიურ ენერგიებს. მნიშვნელოვანია ვიცოდეთ, როგორ დავიცვათ ჩვენი ენერგეტიკული ველი...",
        content: "ენერგეტიკული დაცვა მნიშვნელოვანი ნაწილია სულიერი პრაქტიკისა. სპირიტუალური განწმენდის მეთოდებს შორის ყველაზე ეფექტურია: თეთრი შუქის ვიზუალიზაცია, დამცავი მანტრების განმეორება, კურამის გადაკვევა და მარილის ბანაო. ასევე მნიშვნელოვანია უარყოფითი ადამიანებისგან დისტანცია და რეგულარული მედიტაცია.",
        category: "spirituality",
        author: "გიორგი შამანი",
        authorRole: "ენერგეტიკული პრაქტიკების სპეციალისტი",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2023-12-28"),
        featured: true
        }
      ];

      console.log('📰 Seeding articles...');
      for (const article of articleData) {
        await db.insert(articles).values(article).onConflictDoNothing();
      }

      // Seed horoscopes
      const horoscopeData: InsertHoroscope[] = [
        {
          zodiacSign: "aries",
          zodiacSignGeorgian: "ვერძი",
          content: "დღეს ვერძებისთვის განსაკუთრებული დღეა ენერგიისა და მოტივაციის თვალსაზრისით. მარსის გავლენით თქვენ იღებთ დამატებით ძალას ახალი პროექტების დასაწყებად.",
          date: new Date()
        },
        {
          zodiacSign: "taurus",
          zodiacSignGeorgian: "ხარი",
          content: "ხრებისთვის დღეს მნიშვნელოვანია სტაბილურობა და განმეორებითი ღონისძიებები. ვენერის დადებითი ასპექტი სიყვარულის სფეროში წარმატებას პირდება.",
          date: new Date()
        },
        {
          zodiacSign: "gemini",
          zodiacSignGeorgian: "ტყუპები",
          content: "ტყუპებისთვის დღეს კომუნიკაცია წინა პლანზეა. მერკურის გავლენით იღებთ ახალ ინფორმაციას რომელიც სასარგებლო იქნება მომავლისთვის.",
          date: new Date()
        },
        {
          zodiacSign: "cancer",
          zodiacSignGeorgian: "კანჩხი",
          content: "კანჩხებისთვის დღეს ემოციური ბალანსი მნიშვნელოვანია. მთვარის ფაზა ხელს უწყობს ოჯახურ ურთიერთობებში ჰარმონიის დამყარებას.",
          date: new Date()
        },
        {
          zodiacSign: "leo",
          zodiacSignGeorgian: "ლომი",
          content: "ლომებისთვის დღეს კრეატიულობა და თვითგამოხატვა წინა პლანზეა. მზის ენერგია მოგცემთ დამატებით ნდობას თქვენს შესაძლებლობებში.",
          date: new Date()
        },
        {
          zodiacSign: "virgo",
          zodiacSignGeorgian: "ქალწული",
          content: "ქალწულებისთვის დღეს დეტალებზე ყურადღება და სისტემატურობა მნიშვნელოვანია. თქვენი ანალიტიკური უნარები განსაკუთრებით მოქმედია.",
          date: new Date()
        },
        {
          zodiacSign: "libra",
          zodiacSignGeorgian: "სასწორი",
          content: "სასწორებისთვის დღეს ბალანსი და ჰარმონია მნიშვნელოვანია. ვენერის გავლენით პარტნიორობაში ახალი შესაძლებლობები იხსნება.",
          date: new Date()
        },
        {
          zodiacSign: "scorpio",
          zodiacSignGeorgian: "მორიელი",
          content: "მორიელებისთვის დღეს ღრმა ინტუიცია და სულიერი ზრდა წინა პლანზეა. პლუტონის ენერგია ტრანსფორმაციის პროცესს აყენებს.",
          date: new Date()
        },
        {
          zodiacSign: "sagittarius",
          zodiacSignGeorgian: "მშვილდოსანი",
          content: "მშვილდოსნებისთვის დღეს ახალი შესაძლებლობები და თავგადასავალი წინა პლანზეა. იუპიტერის გავლენით გაფართოების პერსპექტივები იხსნება.",
          date: new Date()
        },
        {
          zodiacSign: "capricorn",
          zodiacSignGeorgian: "ღორი",
          content: "ღორებისთვის დღეს პრაქტიკული საკითხები და კარიერული წინსვლა მნიშვნელოვანია. სატურნის გავლენით დისციპლინა გამოგადგებათ.",
          date: new Date()
        },
        {
          zodiacSign: "aquarius",
          zodiacSignGeorgian: "წყალმცოცავი",
          content: "წყალმცოცავებისთვის დღეს ინოვაციები და ახალი იდეები წინა პლანზეა. ურანის ენერგია არასტანდარტულ გადაწყვეტილებებს ხელს უწყობს.",
        date: new Date()
      },
      {
          zodiacSign: "pisces",
          zodiacSignGeorgian: "თევზები",
          content: "თევზებისთვის დღეს ინტუიცია და სულიერი ზრდა განსაკუთრებით მნიშვნელოვანია. ნეპტუნის გავლენით კრეატიული ენერგია იზრდება.",
        date: new Date()
      }
    ];

      console.log('🔮 Seeding horoscopes...');
      for (const horoscope of horoscopeData) {
        await db.insert(horoscopes).values(horoscope).onConflictDoNothing();
      }

      // Initialize realistic view counts for historical articles
      console.log('📊 Initializing historical view counts...');
      await this.initializeHistoricalViewCounts();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  async initializeHistoricalViewCounts(): Promise<void> {
    try {
      // Set realistic view counts based on article age and popularity
      const historicalViewData = [
        { id: 1, views: 2847, likes: 156 }, // Featured horoscope article
        { id: 2, views: 1923, likes: 84 },  // Crystals article
        { id: 3, views: 1456, likes: 67 },  // Moon phases article  
        { id: 4, views: 1122, likes: 45 },  // Meditation article
        { id: 5, views: 1678, likes: 89 }   // Featured spirituality article
      ];

      for (const viewData of historicalViewData) {
        await db.update(articles)
          .set({ 
            views: viewData.views,
            likes: viewData.likes 
          })
          .where(eq(articles.id, viewData.id));
      }

      console.log('📊 Historical view counts initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing historical view counts:', error);
      // Don't throw error for view count initialization as it's not critical
    }
  }

  async getArticles(limit = 10, offset = 0, category?: string, featured?: boolean): Promise<Article[]> {
    try {
      const conditions = [];
      if (category) {
        conditions.push(eq(articles.category, category));
      }
      if (featured !== undefined) {
        conditions.push(eq(articles.featured, featured));
      }
      
      if (conditions.length > 0) {
        return await db.select().from(articles)
          .where(and(...conditions))
          .orderBy(desc(articles.publishedAt))
          .limit(limit)
          .offset(offset);
      } else {
        return await db.select().from(articles)
          .orderBy(desc(articles.publishedAt))
          .limit(limit)
          .offset(offset);
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      throw new Error('Failed to fetch articles');
    }
  }

  async getArticle(id: number): Promise<Article | undefined> {
    try {
      const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error(`❌ Error fetching article ${id}:`, error);
      throw new Error('Failed to fetch article');
    }
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    try {
      const result = await db.insert(articles).values(insertArticle).returning();
      return result[0];
    } catch (error) {
      console.error('❌ Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  async updateArticleViews(id: number, sessionId: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      // First check if this session has already viewed this article
      const hasViewed = await this.hasViewedArticle(id, sessionId);
      if (hasViewed) {
        console.log(`🔍 Session ${sessionId} has already viewed article ${id}, skipping view count`);
        return false; // View not counted as it's duplicate
      }

      // Record the view in the tracking table
      await this.recordArticleView({
        articleId: id,
        sessionId,
        ipAddress,
        userAgent
      });

      // Increment the view count in the articles table
      await db.update(articles)
        .set({ views: sql`${articles.views} + 1` })
        .where(eq(articles.id, id));

      console.log(`📊 New view recorded for article ${id} from session ${sessionId}`);
      return true; // View was successfully counted
    } catch (error) {
      console.error(`❌ Error updating article views for ${id}:`, error);
      // Don't throw error for view updates as it's not critical
      return false;
    }
  }

  async searchArticles(query: string): Promise<Article[]> {
    try {
      const searchTerm = `%${query}%`;
      return await db.select().from(articles)
        .where(
          or(
            like(articles.title, searchTerm),
            like(articles.excerpt, searchTerm),
            like(articles.content, searchTerm)
          )
        )
        .orderBy(desc(articles.publishedAt))
        .limit(20);
    } catch (error) {
      console.error('❌ Error searching articles:', error);
      throw new Error('Failed to search articles');
    }
  }

  async getPopularArticles(limit = 5): Promise<Article[]> {
    try {
      return await db.select().from(articles)
        .orderBy(desc(articles.views), desc(articles.likes))
        .limit(limit);
    } catch (error) {
      console.error('❌ Error fetching popular articles:', error);
      throw new Error('Failed to fetch popular articles');
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories).orderBy(categories.name);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getCategory(name: string): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
      return result[0];
    } catch (error) {
      console.error(`❌ Error fetching category ${name}:`, error);
      throw new Error('Failed to fetch category');
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const result = await db.insert(categories).values(insertCategory).returning();
      return result[0];
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  async getAllHoroscopes(): Promise<Horoscope[]> {
    try {
      const result = await db.select().from(horoscopes).orderBy(horoscopes.zodiacSign);
      return result;
    } catch (error) {
      console.error('❌ Error fetching all horoscopes:', error);
      throw new Error('Failed to fetch horoscopes');
    }
  }

  async getDailyHoroscope(zodiacSign: string): Promise<Horoscope | undefined> {
    try {
      // For simplicity, just get the latest horoscope for the zodiac sign
      // In a real app, you'd want proper date-based filtering
      const result = await db.select().from(horoscopes)
        .where(eq(horoscopes.zodiacSign, zodiacSign))
        .orderBy(desc(horoscopes.date))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error(`❌ Error fetching horoscope for ${zodiacSign}:`, error);
      throw new Error('Failed to fetch horoscope');
    }
  }

  async createHoroscope(insertHoroscope: InsertHoroscope): Promise<Horoscope> {
    try {
      const result = await db.insert(horoscopes).values(insertHoroscope).returning();
      return result[0];
    } catch (error) {
      console.error('❌ Error creating horoscope:', error);
      throw new Error('Failed to create horoscope');
    }
  }

  async updateArticle(id: number, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    try {
      const result = await db.update(articles)
        .set(updates)
        .where(eq(articles.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`❌ Error updating article ${id}:`, error);
      throw new Error('Failed to update article');
    }
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      const result = await db.delete(articles).where(eq(articles.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`❌ Error deleting article ${id}:`, error);
      throw new Error('Failed to delete article');
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      // For now, return mock data since we don't have a users table yet
      // This would be replaced with actual user queries when authentication is fully implemented
    return [
        { id: 1, username: 'admin', email: 'admin@astrologyinsights.ge', role: 'admin', createdAt: new Date() },
        { id: 2, username: 'editor', email: 'editor@astrologyinsights.ge', role: 'editor', createdAt: new Date() }
    ];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async createUser(user: { username: string; email: string; role: string }): Promise<any> {
    try {
      // Mock user creation - would be replaced with actual database insert
    const newUser = {
        id: Date.now(),
      ...user,
      createdAt: new Date()
    };
      console.log('👤 User created (mock):', newUser);
    return newUser;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getViewStatistics(): Promise<{ totalViews: number; totalLikes: number; totalArticles: number }> {
    try {
      const result = await db.select({
        totalViews: sql<number>`sum(${articles.views})`,
        totalLikes: sql<number>`sum(${articles.likes})`,
        totalArticles: sql<number>`count(${articles.id})`
      }).from(articles);

      return {
        totalViews: result[0]?.totalViews || 0,
        totalLikes: result[0]?.totalLikes || 0,
        totalArticles: result[0]?.totalArticles || 0
      };
    } catch (error) {
      console.error('❌ Error fetching view statistics:', error);
      throw new Error('Failed to fetch view statistics');
    }
  }

  async hasViewedArticle(articleId: number, sessionId: string): Promise<boolean> {
    try {
      const result = await db.select().from(articleViews)
        .where(and(
          eq(articleViews.articleId, articleId),
          eq(articleViews.sessionId, sessionId)
        ));
      return result.length > 0;
    } catch (error) {
      console.error(`❌ Error checking if article ${articleId} has been viewed by session ${sessionId}:`, error);
      throw new Error('Failed to check if article has been viewed');
    }
  }

  async recordArticleView(view: InsertArticleView): Promise<void> {
    try {
      await db.insert(articleViews).values(view).onConflictDoNothing();
    } catch (error) {
      console.error('❌ Error recording article view:', error);
      throw new Error('Failed to record article view');
    }
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
