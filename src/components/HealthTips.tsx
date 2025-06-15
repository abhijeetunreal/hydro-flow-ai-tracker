
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const tips = [
  "Add a slice of lemon to your water for a flavor boost and vitamin C.",
  "Drink a glass of water before every meal to aid digestion.",
  "Keep a reusable water bottle with you throughout the day.",
  "Feeling tired? You might just be dehydrated. Try drinking a glass of water.",
  "Herbal tea counts towards your daily water intake!",
];

const HealthTips = () => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Health Tip</CardTitle>
        <Heart className="h-4 w-4 text-pink-400" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{tip}</p>
      </CardContent>
    </Card>
  );
};

export default HealthTips;
