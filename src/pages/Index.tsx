
import useWaterData from "@/hooks/useWaterData";
import WaterGlass from "@/components/WaterGlass";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import HealthTips from "@/components/HealthTips";
import Reminder from "@/components/Reminder";
import HistoryCalendar from "@/components/HistoryCalendar";
import IntakeLog from "@/components/IntakeLog";
import { Droplet } from "lucide-react";

const Index = () => {
  const { currentIntake, dailyGoal, addWater, streak, history, todaysLogs } = useWaterData();

  const intakeOptions = [250, 500, 750];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md md:max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AquaTrack</h1>
          <p className="text-muted-foreground">Stay hydrated, stay healthy.</p>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex justify-center">
              <WaterGlass intake={currentIntake} goal={dailyGoal} />
            </div>
            <IntakeLog logs={todaysLogs} />
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
