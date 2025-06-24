import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "წარმატებით გამოწერა!",
        description: "თქვენ წარმატებით გამოიწერეთ ჩვენი ასტროლოგიური სიახლეები 🌟",
      });
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "შეცდომა",
        description: "გამოწერა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      mutation.mutate(email);
    } else {
      toast({
        title: "არასწორი ემაილი",
        description: "გთხოვთ შეიყვანოთ სწორი ემაილის მისამართი.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="article-card bg-gradient-to-br from-sky-blue/10 to-light-sky/20 border-sky-blue/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold sky-blue flex items-center">
          <Mail className="mr-2 w-5 h-5" />
          ასტროლოგიური სიახლეები
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="sky-text text-sm mb-4 leading-relaxed">
          მიიღეთ ყოველკვირეული ჰოროსკოპი და ასტროლოგიური რჩევები პირდაპირ თქვენს ემაილზე.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="თქვენი ემაილი"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-soft-gray border-sky-blue/30 text-dark-text focus:border-sky-blue"
            required
          />
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-sky-blue to-deep-sky text-pure-white hover:shadow-lg transition-all duration-300"
            disabled={mutation.isPending}
          >
            <Send className="mr-2 w-4 h-4" />
            {mutation.isPending ? "იგზავნება..." : "გამოწერა"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
