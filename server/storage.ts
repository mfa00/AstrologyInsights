import { articles, categories, horoscopes, type Article, type InsertArticle, type Category, type InsertCategory, type Horoscope, type InsertHoroscope } from "@shared/schema";

export interface IStorage {
  // Articles
  getArticles(limit?: number, offset?: number, category?: string, featured?: boolean): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;
  searchArticles(query: string): Promise<Article[]>;
  getPopularArticles(limit?: number): Promise<Article[]>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Horoscopes
  getDailyHoroscope(zodiacSign: string): Promise<Horoscope | undefined>;
  createHoroscope(horoscope: InsertHoroscope): Promise<Horoscope>;
  
  // Users (for admin)
  getAllUsers(): Promise<any[]>;
  createUser(user: { username: string; email: string; role: string }): Promise<any>;
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
      { name: "horoscope", nameGeorgian: "ჰოროსკოპი", description: "Daily and weekly horoscopes", color: "sky-blue" },
      { name: "crystals", nameGeorgian: "კრისტალები", description: "Healing crystals and their properties", color: "deep-sky" },
      { name: "moon-phases", nameGeorgian: "მთვარის ფაზები", description: "Moon phases and their influence", color: "ocean-blue" },
      { name: "spirituality", nameGeorgian: "სულიერება", description: "Spiritual growth and enlightenment", color: "sky-blue" },
      { name: "meditation", nameGeorgian: "მედიტაცია", description: "Meditation practices and mindfulness", color: "deep-sky" }
    ];

    categoryData.forEach(cat => {
      const category: Category = { 
        ...cat, 
        id: this.currentCategoryId++,
        description: cat.description || null
      };
      this.categories.set(cat.name, category);
    });

    // Seed articles - comprehensive Georgian astrology content
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
      },
      {
        title: "ნატალური რუკის ანალიზი - თქვენი ციური იდენტობის აღმოჩენა",
        excerpt: "ნატალური რუკა თქვენი სულის რუკაა, რომელიც გიჩვენებთ თქვენს ღრმა ბუნებას, ტალანტებს და ცხოვრებისეულ მისიას...",
        content: "ნატალური რუკა დაბადების მომენტში ციური სხეულების პოზიციებს ასახავს და გიჩვენებთ თქვენს უნიკალურ ასტროლოგიურ ხასიათს. მზე გიჩვენებთ თქვენს ძირითად ნებას, მთვარე - ემოციურ ბუნებას, ხოლო ასცენდენტი - რას ხედავენ სხვები თქვენში. ყოველი პლანეტა განსაზღვრავს ცხოვრების კონკრეტულ ასპექტს.",
        category: "horoscope",
        author: "ნინო ასტროლოგი",
        authorRole: "პროფესიონალი ასტროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2023-12-15"),
        featured: false
      },
      {
        title: "ჩაკრების სისტემა და ენერგეტიკული ბალანსი",
        excerpt: "ჩაკრები ენერგეტიკული ცენტრებია ჩვენს სხეულში, რომელთა ბალანსი მნიშვნელოვანია ფიზიკური და სულიერი ჯანმრთელობისთვის...",
        content: "ჩაკრების სისტემა შედგება შვიდი ძირითადი ენერგეტიკული ცენტრისგან: ღრუბლის, საკრალური, მზისუნის, გულის, ყელის, შუბლის და გვერდის ჩაკრები. ყოველი ჩაკრა განსაზღვრავს კონკრეტულ ცხოვრებისეულ ასპექტს და საჭიროებს სპეციალურ ყურადღებას ბალანსის შესანარჩუნებლად.",
        category: "spirituality",
        author: "მაია ენერგოთერაპევტი",
        authorRole: "ჩაკრების სპეციალისტი",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2023-11-20"),
        featured: false
      },
      {
        title: "ეზოთერული პრაქტიკები და სულიერი ზრდა",
        excerpt: "ეზოთერული ცოდნა ისტორიის მანძილზე ეხმარებოდა ადამიანებს სულიერი განვითარების გზაზე წინსვლაში...",
        content: "ეზოთერული პრაქტიკები მოიცავს ფართო სპექტრს სულიერი განვითარების ინსტრუმენტებისა: ვიზუალიზაცია, მანტრების განმეორება, ენერგეტიკული სავარჯიშოები, ჩაკრების მუშაობა. ეს პრაქტიკები გვეხმარება დავუკავშირდეთ ჩვენს უმაღლეს თვითს და მივიღოთ სულიერი სიბრძნე.",
        category: "spirituality",
        author: "ლევანი ეზოთერიკოსი",
        authorRole: "სულიერი პრაქტიკების მასწავლებელი",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2023-11-10"),
        featured: false
      },
      {
        title: "2024 წლის ზაფხულის ასტროლოგიური გავლენები",
        excerpt: "ზაფხული არის ენერგიისა და სიცოცხლისუნარიანობის დრო. ვარსკვლავების მიმდინარე კონფიგურაცია განსაკუთრებულ შესაძლებლობებს ითვალისწინებს...",
        content: "2024 წლის ზაფხული გამორჩეულია ასტროლოგიური ძლიერი ასპექტებით. მზე კიბოში ღრმა ემოციურ განწმენდას ნიშნავს, ხოლო იუპიტერი ტყუპებში მატერიალურ სტაბილურობას პირდება. ზაფხულის მზე მზის სიმულს განსაკუთრებით ძლიერი ენერგია იქნება სიყვარულისა და კრეატიულობისთვის.",
        category: "horoscope",
        author: "ნინო ასტროლოგი",
        authorRole: "პროფესიონალი ასტროლოგი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-06-15"),
        featured: true
      },
      {
        title: "ღრმა მედიტაციური სტანები და მათი მიღწევის გზები",
        excerpt: "მედიტაციის ღრმა სტანები ეხმარება პრაქტიკანტს მიაღწიოს შინაგან მშვიდობასა და სულიერ ზრდას...",
        content: "ღრმა მედიტაციური სტანები - ეს არის ცნობიერების განსაკუთრებული მდგომარეობა, როცა გონება მყუდროდება და სული ეუღლება უმაღლეს თვითს. ეს სტანების მისაღწევად საჭიროა რეგულარული პრაქტიკა, სწორი სუნთქვის ტექნიკა და ყურადღების კონცენტრაცია.",
        category: "meditation",
        author: "ანა სულიერი მასწავლებელი",
        authorRole: "მედიტაციის ინსტრუქტორი",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-06-05"),
        featured: false
      },
      {
        title: "შემოდგომის ეკვინოქსი და ენერგეტიკული ბალანსი",
        excerpt: "შემოდგომის ეკვინოქსი არის ბალანსის და ჰარმონიის დრო, როცა დღე და ღამე თანაბრად იყოფა...",
        content: "შემოდგომის ეკვინოქსი არის ბალანსისა და ჰარმონიის სიმბოლო. ეს არის დრო თანაზომიერებისა და წონასწორობისთვის ცხოვრების ყველა ასპექტში. ამ პერიოდში მნიშვნელოვანია ენერგეტიკული ბალანსის აღდგენა და სულიერი პრაქტიკების გაღრმავება.",
        category: "spirituality",
        author: "მაია ენერგოთერაპევტი",
        authorRole: "სეზონური რიტმების სპეციალისტი",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-05-20"),
        featured: true
      },
      {
        title: "დოშებისა და ინდივიდუალური კონსტიტუციის როლი ასტროლოგიაში",
        excerpt: "აიურვედული დოშები და ასტროლოგიური ტიპები ღრმად კავშირშია. ვატა, პიტა და კაფა დოშები...",
        content: "აიურვედული სისტემის მიხედვით, ყოველი ადამიანი კონკრეტული კონსტიტუციით იბადება, რომელიც სამი დოშიდან შედგება: ვატა, პიტა და კაფა. ეს დოშები კავშირშია ასტროლოგიურ ელემენტებთან და ეხმარება უკეთ გაიგოთ თქვენი ტემპერამენტი.",
        category: "horoscope",
        author: "ნინო ასტროლოგი",
        authorRole: "ასტრო-აიურვედის სპეციალისტი",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date("2024-05-05"),
        featured: false
      }
    ];

    articleData.forEach(art => {
      const article: Article = { 
        ...art, 
        id: this.currentArticleId++,
        likes: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 25) + 1,
        views: Math.floor(Math.random() * 1000) + 100,
        featured: art.featured || null
      };
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
      featured: insertArticle.featured || null,
      publishedAt: insertArticle.publishedAt || new Date()
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
      description: insertCategory.description || null
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

  async updateArticle(id: number, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle: Article = {
      ...article,
      ...updates,
      featured: updates.featured !== undefined ? updates.featured : article.featured
    };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  async getAllUsers(): Promise<any[]> {
    return [
      { id: 1, username: 'admin', email: 'admin@mnatobi.ge', role: 'admin', createdAt: new Date('2024-01-01') },
      { id: 2, username: 'editor', email: 'editor@mnatobi.ge', role: 'editor', createdAt: new Date('2024-01-15') }
    ];
  }

  async createUser(user: { username: string; email: string; role: string }): Promise<any> {
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...user,
      createdAt: new Date()
    };
    return newUser;
  }
}

export const storage = new MemStorage();
