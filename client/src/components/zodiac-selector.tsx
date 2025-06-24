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
    <Card className="article-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold title-font sky-blue flex items-center">
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
              className={`aspect-square bg-soft-gray hover:bg-sky-blue/20 transition-colors ${
                selectedSign === sign.en ? "bg-sky-blue/20 border border-sky-blue" : ""
              }`}
              title={sign.ka}
            >
              <span className="sky-blue text-lg">{sign.symbol}</span>
            </Button>
          ))}
        </div>
        
        {/* Horoscope content */}
        <div className="bg-soft-gray p-4 rounded-lg">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : horoscope ? (
            <>
              <h5 className="sky-blue font-semibold mb-2 flex items-center">
                {horoscope.zodiacSignGeorgian} {selectedZodiac?.symbol}
              </h5>
              <p className="sky-text text-sm leading-relaxed">
                {horoscope.content}
              </p>
            </>
          ) : (
            <div className="text-center sky-text">
              <p className="text-sm">ჰოროსკოპი ხელმიუწვდომელია</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
