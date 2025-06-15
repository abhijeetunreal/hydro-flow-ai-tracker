
import useWaterData from "@/hooks/useWaterData";
import WaterGlass from "@/components/WaterGlass";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import HealthTips from "@/components/HealthTips";
import Reminder from "@/components/Reminder";
import HistoryCalendar from "@/components/HistoryCalendar";
import { Droplet, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/auth/Login";
import UserProfile from "@/components/auth/UserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, isLoggingIn } = useAuth();
  const { currentIntake, dailyGoal, addWater, streak, history, todaysLogs, isSyncing } = useWaterData(user);

  const intakeOptions = [250, 500, 750];

  if (isLoggingIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md md:max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen w-full bg-background bg-grid">
      <div className="w-full max-w-md md:max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <header className="flex justify-between items-center w-full pt-4">
          <div className="flex items-center gap-3">
            <Droplet className="h-8 w-8 text-primary"/>
            <h1 className="text-3xl font-bold text-foreground text-glow">AquaTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            {isSyncing && <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />}
            <UserProfile />
          </div>
        </header>

        <main className="space-y-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>Today's Hydration</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <WaterGlass intake={currentIntake} goal={dailyGoal} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Log Your Intake</CardTitle>
              <CardDescription>Select an amount to add to your daily total.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-3">
              {intakeOptions.map((amount) => (
                <Button key={amount} onClick={() => addWater(amount)} variant="default" size="lg" className="rounded-full !h-20 !w-20 text-lg">
                  +{amount}ml
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-4">
            <StatsCard title="Daily Goal" value={`${dailyGoal / 1000}L`} Icon={Droplet} />
            <HistoryCalendar history={history} dailyGoal={dailyGoal} streak={streak} />
          </div>

          <HealthTips />
          
          <Reminder />
        </main>
      </div>
    </div>
  );
};

export default Index;
