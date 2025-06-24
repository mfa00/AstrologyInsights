import { useState } from 'react';
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
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Plus, Edit, Trash2, Users, FileText, Settings, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Article, Category, InsertArticle } from '@shared/schema';
import Header from '@/components/layout/header';

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('articles');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Queries
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles?limit=50'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Article form state
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

  // User form state
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'editor'
  });

  // Mutations
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
    onError: () => {
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
    onError: () => {
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
    onError: () => {
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
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "მომხმარებლის შექმნა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

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
      featured: article.featured || false
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

    const articleData: InsertArticle = {
      title: articleForm.title!,
      excerpt: articleForm.excerpt || '',
      content: articleForm.content!,
      category: articleForm.category!,
      author: articleForm.author || 'ადმინი',
      authorRole: articleForm.authorRole || 'რედაქტორი',
      imageUrl: articleForm.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      featured: articleForm.featured,
      publishedAt: new Date()
    };

    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, article: articleData });
    } else {
      createArticleMutation.mutate(articleData);
    }
  };

  const handleDeleteArticle = (id: number) => {
    if (confirm('დარწმუნებული ხართ, რომ გსურთ ამ სტატიის წაშლა?')) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    უკან დაბრუნება
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold title-font gradient-text">ადმინისტრაციული პანელი</h1>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-sky-blue hover:bg-deep-sky text-white">
                    <Plus className="mr-2 w-4 h-4" />
                    ახალი სტატია
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl title-font">
                      {editingArticle ? 'სტატიის რედაქტირება' : 'ახალი სტატიის შექმნა'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">სათაური*</Label>
                        <Input
                          id="title"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="სტატიის სათაური"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">კატეგორია*</Label>
                        <Select 
                          value={articleForm.category}
                          onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ კატეგორია" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat: Category) => (
                              <SelectItem key={cat.name} value={cat.name}>
                                {cat.nameGeorgian}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">მოკლე აღწერა</Label>
                      <Textarea
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="სტატიის მოკლე აღწერა..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">შინაარსი*</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="სტატიის მთავარი შინაარსი..."
                        rows={10}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="author">ავტორი</Label>
                        <Input
                          id="author"
                          value={articleForm.author}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="ავტორის სახელი"
                        />
                      </div>
                      <div>
                        <Label htmlFor="authorRole">ავტორის როლი</Label>
                        <Input
                          id="authorRole"
                          value={articleForm.authorRole}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, authorRole: e.target.value }))}
                          placeholder="ასტროლოგი, რედაქტორი..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="imageUrl">სურათის URL</Label>
                      <Input
                        id="imageUrl"
                        value={articleForm.imageUrl}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={articleForm.featured || false}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="featured">განსაკუთრებული სტატია</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingArticle(null);
                      resetArticleForm();
                    }}>
                      გაუქმება
                    </Button>
                    <Button 
                      onClick={handleSubmitArticle}
                      disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                    >
                      <Save className="mr-2 w-4 h-4" />
                      {editingArticle ? 'განახლება' : 'შექმნა'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="articles" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>სტატიები</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>მომხმარებლები</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>პარამეტრები</span>
              </TabsTrigger>
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl title-font">სტატიების მართვა</CardTitle>
                </CardHeader>
                <CardContent>
                  {articlesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {articles?.map((article: Article) => (
                        <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                                {article.featured && (
                                  <Badge variant="secondary" className="bg-sky-blue/10 text-sky-blue">
                                    განსაკუთრებული
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{article.excerpt}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>ავტორი: {article.author}</span>
                                <span>კატეგორია: {article.category}</span>
                                <span>გამოქვეყნება: {formatDate(article.publishedAt)}</span>
                                <span>{article.views} ნახვა</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="grid gap-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="text-2xl title-font">ახალი მომხმარებლის დამატება</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="username">მომხმარებლის სახელი</Label>
                        <Input
                          id="username"
                          value={userForm.username}
                          onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">ემაილი</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">როლი</Label>
                        <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">ადმინისტრატორი</SelectItem>
                            <SelectItem value="editor">რედაქტორი</SelectItem>
                            <SelectItem value="author">ავტორი</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateUser}
                      disabled={createUserMutation.isPending}
                      className="bg-sky-blue hover:bg-deep-sky"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      მომხმარებლის დამატება
                    </Button>
                  </CardContent>
                </Card>

                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="text-2xl title-font">მომხმარებლების სია</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {users?.map((user: any) => (
                          <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-gray-600 text-sm">{user.email}</p>
                                <p className="text-gray-500 text-xs">შეიქმნა: {formatDate(user.createdAt)}</p>
                              </div>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'ადმინი' : user.role === 'editor' ? 'რედაქტორი' : 'ავტორი'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-2xl title-font">საიტის პარამეტრები</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">კატეგორიები</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {categories?.map((category: Category) => (
                          <Badge key={category.name} variant="outline" className="justify-center py-2">
                            {category.nameGeorgian}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">სტატისტიკა</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-sky-blue/10 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-sky-blue">{articles?.length || 0}</div>
                          <div className="text-sm text-gray-600">სტატია</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{users?.length || 0}</div>
                          <div className="text-sm text-gray-600">მომხმარებელი</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{categories?.length || 0}</div>
                          <div className="text-sm text-gray-600">კატეგორია</div>
                        </div>
                        <div className="bg-orange-100 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {articles?.reduce((sum, article) => sum + (article.views || 0), 0) || 0}
                          </div>
                          <div className="text-sm text-gray-600">ნახვა</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}