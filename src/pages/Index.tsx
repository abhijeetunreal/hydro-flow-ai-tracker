
import useWaterData from "@/hooks/useWaterData";
import WaterGlass from "@/components/WaterGlass";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import HealthTips from "@/components/HealthTips";
import Reminder from "@/components/Reminder";
import HistoryCalendar from "@/components/HistoryCalendar";
import { Droplet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/auth/Login";
import UserProfile from "@/components/auth/UserProfile";

const Index = () => {
  const { user } = useAuth();
  const { currentIntake, dailyGoal, addWater, streak, history, todaysLogs } = useWaterData();

  const intakeOptions = [250, 500, 750];

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md md:max-w-2xl mx-auto space-y-6">
        <header className="flex justify-between items-center w-full">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">AquaTrack</h1>
            <p className="text-muted-foreground">Stay hydrated, stay healthy.</p>
          </div>
          <UserProfile />
        </header>

        <main className="space-y-6">
          <div className="flex justify-center py-8">
            <WaterGlass intake={currentIntake} goal={dailyGoal} logs={todaysLogs} />
          </div>

          <div className="text-center">
            <p className="font-semibold mb-2 text-lg">Log your intake</p>
            <div className="flex justify-center gap-3">
              {intakeOptions.map((amount) => (
                <Button key={amount} onClick={() => addWater(amount)} variant="default" size="lg" className="rounded-full shadow-lg">
                  +{amount}ml
                </Button>
              ))}
            </div>
          </div>
          
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
