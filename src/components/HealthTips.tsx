
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

const HealthTips = () => {
  const [tip, setTip] = useState("Add a slice of lemon to your water for a flavor boost and vitamin C.");
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAITip = async () => {
    if (!apiKey) {
      toast.error("Please enter your Gemini API key.");
      return;
    }
    setIsLoading(true);
    toast.loading("Getting a new tip from AI...");

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Give me one short, insightful, and actionable health tip related to water hydration. Make it sound encouraging."
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newTip = data.candidates[0]?.content?.parts[0]?.text;
      
      if (newTip) {
        setTip(newTip);
        toast.success("Here's a fresh tip!");
      } else {
        throw new Error("Could not parse tip from API response.");
      }
    } catch (error) {
      console.error("Failed to fetch AI tip:", error);
      toast.error("Could not fetch AI tip. Please check your key and try again.");
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Health Tip</CardTitle>
        <Heart className="h-4 w-4 text-pink-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground min-h-[40px]">{tip}</p>
        <div className="space-y-2">
           <div className="flex gap-2">
             <Input 
               type="password"
               placeholder="Your Gemini API Key"
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               disabled={isLoading}
             />
             <Button onClick={getAITip} disabled={isLoading} size="icon" variant="secondary">
               <BrainCircuit className="h-4 w-4" />
             </Button>
           </div>
           <p className="text-xs text-muted-foreground">
             For better security, store API keys using the Supabase integration.
           </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTips;
