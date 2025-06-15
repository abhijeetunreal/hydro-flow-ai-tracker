
import useWaterData from "@/hooks/useWaterData";
import WaterGlass from "@/components/WaterGlass";
import { Button } from "@/components/ui/button";
import HealthTips from "@/components/HealthTips";
import Reminder from "@/components/Reminder";
import HistoryCalendar from "@/components/HistoryCalendar";
import { Droplet, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/auth/Login";
import UserProfile from "@/components/auth/UserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Index = () => {
  const { user, isLoggingIn } = useAuth();
  const { 
    currentIntake, 
    dailyGoal, 
    addWater, 
    streak, 
    history, 
    todaysLogs, 
    isSyncing,
    reminders,
    saveReminder,
    deleteReminder
  } = useWaterData(user);

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
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-lg md:max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="flex justify-between items-center w-full pt-4">
          <div className="flex items-center gap-3">
            <Droplet className="h-8 w-8 text-primary"/>
            <h1 className="text-3xl font-bold text-foreground">AquaTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            {isSyncing && <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />}
            <UserProfile />
          </div>
        </header>

        <main className="space-y-6">
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6 p-6">
              <WaterGlass intake={currentIntake} goal={dailyGoal} />
              <div className="w-full md:w-[55%] space-y-4 text-center md:text-left">
                <div className="border-b pb-4">
                  <p className="text-5xl font-black text-primary leading-none">
                    {dailyGoal > 0 ? Math.round((currentIntake / dailyGoal) * 100) : 0}%
                  </p>
                  <p className="text-muted-foreground font-medium">{currentIntake.toLocaleString()} / {dailyGoal.toLocaleString()} ml</p>
                </div>
                <div className="space-y-2 pt-2">
                  <h4 className="font-semibold text-sm text-foreground">Today's Log</h4>
                  <div className="h-24 overflow-y-auto space-y-1 text-sm pr-2">
                    {todaysLogs.length > 0 ? (
                      todaysLogs.slice().reverse().map((log, i) => (
                        <div key={i} className="flex justify-between items-center text-muted-foreground">
                          <span>+{log.amount}ml</span>
                          <span>{format(new Date(log.time), 'p')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center pt-6">Log your first drink!</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Log Your Intake</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center gap-3">
              {intakeOptions.map((amount) => (
                <Button key={amount} onClick={() => addWater(amount)} variant="outline" size="lg" className="!h-16 !w-16 rounded-full text-base">
                  +{amount}
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <HistoryCalendar history={history} dailyGoal={dailyGoal} streak={streak} />

          <HealthTips />
          
          <Reminder 
            reminders={reminders}
            saveReminder={saveReminder}
            deleteReminder={deleteReminder}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
