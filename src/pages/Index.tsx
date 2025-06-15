
import useWaterData from "@/hooks/useWaterData";
import WaterGlass from "@/components/WaterGlass";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import HealthTips from "@/components/HealthTips";
import Reminder from "@/components/Reminder";
import { Star, Droplet } from "lucide-react";

const Index = () => {
  const { currentIntake, dailyGoal, addWater, streak } = useWaterData();

  const intakeOptions = [250, 500, 750];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AquaTrack</h1>
          <p className="text-muted-foreground">Stay hydrated, stay healthy.</p>
        </header>

        <main className="space-y-6">
          <WaterGlass intake={currentIntake} goal={dailyGoal} />

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

          <div className="grid grid-cols-2 gap-4">
            <StatsCard title="Daily Goal" value={`${dailyGoal / 1000}L`} Icon={Droplet} />
            <StatsCard title="Hydration Streak" value={`${streak} days`} Icon={Star} />
          </div>

          <HealthTips />
          
          <Reminder />
        </main>
      </div>
    </div>
  );
};

export default Index;
