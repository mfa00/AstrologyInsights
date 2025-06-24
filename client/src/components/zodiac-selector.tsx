import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodiacSigns } from "@/lib/utils";
import { Star } from "lucide-react";
import type { Horoscope } from "@shared/schema";

export default function ZodiacSelector() {
  const [selectedSign, setSelectedSign] = useState("leo");

  const { data: horoscope, isLoading } = useQuery<Horoscope>({
    queryKey: ["/api/horoscopes", selectedSign],
    queryFn: async () => {
      const response = await fetch(`/api/horoscopes/${selectedSign}`);
      if (!response.ok) {
        throw new Error("Failed to fetch horoscope");
      }
      return response.json();
    },
  });

  const selectedZodiac = zodiacSigns.find(sign => sign.en === selectedSign);

  return (
    <Card className="article-card bg-gradient-to-br from-deep-space/60 to-mystic-purple/40">
      <CardHeader>
        <CardTitle className="text-xl font-bold celestial-gold flex items-center">
          <Star className="mr-2 w-5 h-5" />
          დღევანდელი ჰოროსკოპი
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Zodiac sign selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {zodiacSigns.map((sign) => (
            <Button
              key={sign.en}
              variant="ghost"
              size="icon"
              onClick={() => setSelectedSign(sign.en)}
              className={`aspect-square bg-midnight-blue/50 hover:bg-celestial-gold/20 transition-colors ${
                selectedSign === sign.en ? "bg-celestial-gold/20 border border-celestial-gold" : ""
              }`}
              title={sign.ka}
            >
              <span className="celestial-gold text-lg">{sign.symbol}</span>
            </Button>
          ))}
        </div>
        
        {/* Horoscope content */}
        <div className="bg-midnight-blue/30 p-4 rounded-lg">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : horoscope ? (
            <>
              <h5 className="celestial-gold font-semibold mb-2 flex items-center">
                {horoscope.zodiacSignGeorgian} {selectedZodiac?.symbol}
              </h5>
              <p className="lavender text-sm leading-relaxed">
                {horoscope.content}
              </p>
            </>
          ) : (
            <div className="text-center lavender">
              <p className="text-sm">ჰოროსკოპი ხელმიუწვდომელია</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
