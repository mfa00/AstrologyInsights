import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, isAuthenticated, setAuthToken, logout } from '@/lib/queryClient';
import { ArrowLeft, Plus, Edit, Trash2, Users, FileText, Settings, Save, LogOut, Eye, EyeOff } from 'lucide-react';
import { formatDate, formatViews } from '@/lib/utils';
import type { Article, Category, InsertArticle } from '@shared/schema';
import Header from '@/components/layout/header';

// Login Component
function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა ველი",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        }
        toast({
          title: "წარმატება",
          description: `კეთილი იყოს თქვენი მობრძანება, ${data.data.user.username}!`,
        });
        onLoginSuccess();
      } else {
        throw new Error(data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "შეცდომა",
        description: error.message || "ავტორიზაცია ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">ადმინისტრაციული პანელი</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            შედით თქვენი ანგარიშით
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">მომხმარებლის სახელი</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">პაროლი</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="admin123"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "მუშავდება..." : "შესვლა"}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium text-blue-900">ტესტის მონაცემები:</p>
            <p className="text-blue-700">Admin: admin / admin123</p>
            <p className="text-blue-700">Editor: editor / editor123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('articles');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Article form state - MUST be declared before any early returns
  const [articleForm, setArticleForm] = useState<Partial<InsertArticle>>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    authorRole: '',
    imageUrl: '',
    featured: false
  });

  // User form state - MUST be declared before any early returns
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'editor'
  });

  // Get user info from localStorage (safe for SSR)
  const userInfo = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('admin_user') || '{}')
    : {};

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Queries - Always call hooks, but disable them when not logged in
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles?limit=50'],
    enabled: isLoggedIn,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isLoggedIn,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isLoggedIn,
  });

  // Mutations - MUST be declared before any early returns
  const createArticleMutation = useMutation({
    mutationFn: async (article: InsertArticle) => {
      return await apiRequest('/api/articles', {
        method: 'POST',
        body: JSON.stringify(article)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setIsCreateDialogOpen(false);
      resetArticleForm();
      toast({
        title: "წარმატება",
        description: "სტატია შეიქმნა წარმატებით",
      });
    },
    onError: (error: any) => {
      console.error('Create article error:', error);
      toast({
        title: "შეცდომა",
        description: "სტატიის შექმნა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, article }: { id: number; article: Partial<InsertArticle> }) => {
      return await apiRequest(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setEditingArticle(null);
      resetArticleForm();
      toast({
        title: "წარმატება",
        description: "სტატია განახლდა წარმატებით",
      });
    },
    onError: (error: any) => {
      console.error('Update article error:', error);
      toast({
        title: "შეცდომა",
        description: "სტატიის განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/articles/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "წარმატება",
        description: "სტატია წაიშალა წარმატებით",
      });
    },
    onError: (error: any) => {
      console.error('Delete article error:', error);
      toast({
        title: "შეცდომა",
        description: "სტატიის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (user: { username: string; email: string; role: string }) => {
      return await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(user)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setUserForm({ username: '', email: '', role: 'editor' });
      toast({
        title: "წარმატება",
        description: "მომხმარებელი შეიქმნა წარმატებით",
      });
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast({
        title: "შეცდომა",
        description: "მომხმარებლის შექმნა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  // Show login form if not authenticated - AFTER all hooks are called
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    queryClient.clear();
    toast({
      title: "გამოსვლა",
      description: "თქვენ წარმატებით გამოხვედით სისტემიდან",
    });
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      author: '',
      authorRole: '',
      imageUrl: '',
      featured: false
    });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      authorRole: article.authorRole,
      imageUrl: article.imageUrl,
                              featured: Boolean(article.featured)
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmitArticle = () => {
    if (!articleForm.title || !articleForm.content || !articleForm.category) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა საჭირო ველი",
        variant: "destructive",
      });
      return;
    }

    if (editingArticle) {
      // For updates, exclude publishedAt to preserve original publication date
      const updateData = {
        title: articleForm.title!,
        excerpt: articleForm.excerpt || '',
        content: articleForm.content!,
        category: articleForm.category!,
        author: articleForm.author || userInfo.username || 'ადმინი',
        authorRole: articleForm.authorRole || userInfo.role || 'რედაქტორი',
        imageUrl: articleForm.imageUrl || '',
        featured: !!articleForm.featured || false
      };
      console.log('📝 Updating article:', editingArticle.id, updateData);
      updateArticleMutation.mutate({ id: editingArticle.id, article: updateData });
    } else {
      // For new articles, include publishedAt
      const articleData: InsertArticle = {
        title: articleForm.title!,
        excerpt: articleForm.excerpt || '',
        content: articleForm.content!,
        category: articleForm.category!,
        author: articleForm.author || userInfo.username || 'ადმინი',
        authorRole: articleForm.authorRole || userInfo.role || 'რედაქტორი',
        imageUrl: articleForm.imageUrl || '',
        publishedAt: new Date(),
        featured: !!articleForm.featured || false
      };
      createArticleMutation.mutate(articleData);
    }
  };

  const handleDeleteArticle = (id: number) => {
    if (confirm('დარწმუნებული ხართ რომ გსურთ ამ სტატიის წაშლა?')) {
      deleteArticleMutation.mutate(id);
    }
  };

  const handleCreateUser = () => {
    if (!userForm.username || !userForm.email) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა საჭირო ველი",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(userForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  მთავარ გვერდზე
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ადმინისტრაციული პანელი</h1>
                <p className="text-sm text-gray-600">
                  კეთილი იყოს თქვენი მობრძანება, {userInfo.username} ({userInfo.role})
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              გამოსვლა
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              სტატიები
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              მომხმარებლები
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              პარამეტრები
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">სტატიების მართვა</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetArticleForm(); setEditingArticle(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    ახალი სტატია
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingArticle ? 'სტატიის რედაქტირება' : 'ახალი სტატიის შექმნა'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">სათაური *</Label>
                        <Input
                          id="title"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="სტატიის სათაური"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">კატეგორია *</Label>
                        <Select
                          value={articleForm.category}
                          onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ კატეგორია" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories && Array.isArray(categories) ? categories.map((cat: Category) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.nameGeorgian}
                              </SelectItem>
                            )) : null}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="excerpt">შესავალი</Label>
                      <Textarea
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="სტატიის მოკლე აღწერა"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">შინაარსი *</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="სტატიის მთლიანი შინაარსი"
                        rows={10}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="author">ავტორი</Label>
                        <Input
                          id="author"
                          value={articleForm.author}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, author: e.target.value }))}
                          placeholder={userInfo.username || "ავტორის სახელი"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorRole">ავტორის როლი</Label>
                        <Input
                          id="authorRole"
                          value={articleForm.authorRole}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, authorRole: e.target.value }))}
                          placeholder={userInfo.role || "რედაქტორი"}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">სურათის URL</Label>
                      <Input
                        id="imageUrl"
                        value={articleForm.imageUrl}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={Boolean(articleForm.featured)}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="featured">რჩეული სტატია</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      გაუქმება
                    </Button>
                    <Button onClick={handleSubmitArticle}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingArticle ? 'განახლება' : 'შექმნა'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {articlesLoading ? (
              <div className="text-center py-8">მუშავდება...</div>
            ) : (
              <div className="grid gap-4">
                                 {(articles as any)?.data?.map((article: Article) => (
                  <Card key={article.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{article.title}</h3>
                            {article.featured && (
                              <Badge variant="secondary">რჩეული</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>ავტორი: {article.author}</span>
                            <span>კატეგორია: {article.category}</span>
                            <span>თარიღი: {formatDate(article.publishedAt)}</span>
                            <span>ნახვები: {formatViews(article.views || 0)}</span>
                            <span>ლაიქები: {formatViews(article.likes || 0)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditArticle(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">მომხმარებლების მართვა</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ახალი მომხმარებლის დამატება</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">მომხმარებლის სახელი *</Label>
                    <Input
                      id="username"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="მომხმარებლის სახელი"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">იმეილი *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">როლი</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">ადმინი</SelectItem>
                        <SelectItem value="editor">რედაქტორი</SelectItem>
                        <SelectItem value="reader">მკითხველი</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCreateUser} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      დამატება
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {usersLoading ? (
              <div className="text-center py-8">მუშავდება...</div>
            ) : (
              <div className="grid gap-4">
                {(users as any)?.data?.map((user: any) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.username}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'editor' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>სისტემის ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">სტატიების რაოდენობა:</span>
                                         <span className="ml-2">{(articles as any)?.data?.length || 0}</span>
                   </div>
                   <div>
                     <span className="font-medium">მომხმარებლების რაოდენობა:</span>
                     <span className="ml-2">{(users as any)?.data?.length || 0}</span>
                   </div>
                   <div>
                     <span className="font-medium">კატეგორიების რაოდენობა:</span>
                     <span className="ml-2">{Array.isArray(categories) ? categories.length : 0}</span>
                  </div>
                  <div>
                    <span className="font-medium">მიმდინარე მომხმარებელი:</span>
                    <span className="ml-2">{userInfo.username} ({userInfo.role})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}