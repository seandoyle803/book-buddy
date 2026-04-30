import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogOut, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const settingsSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  dailyGoalMinutes: z.coerce.number().min(5).max(120),
  reminderEnabled: z.boolean(),
  reminderTime: z.string().optional(),
  burnoutWindowEnabled: z.boolean(),
  burnoutWindowStart: z.string().optional(),
  burnoutWindowEnd: z.string().optional(),
  darkMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: profile?.display_name || "",
      dailyGoalMinutes: profile?.daily_goal_minutes || 15,
      reminderEnabled: profile?.reminder_enabled || false,
      reminderTime: profile?.reminder_time || "20:00",
      burnoutWindowEnabled: !!(profile?.burnout_window_start && profile?.burnout_window_end),
      burnoutWindowStart: profile?.burnout_window_start || "22:00",
      burnoutWindowEnd: profile?.burnout_window_end || "08:00",
      darkMode: profile?.dark_mode ?? true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.display_name || "",
        dailyGoalMinutes: profile.daily_goal_minutes || 15,
        reminderEnabled: profile.reminder_enabled || false,
        reminderTime: profile.reminder_time || "20:00",
        burnoutWindowEnabled: !!(profile.burnout_window_start && profile.burnout_window_end),
        burnoutWindowStart: profile.burnout_window_start || "22:00",
        burnoutWindowEnd: profile.burnout_window_end || "08:00",
        darkMode: profile.dark_mode ?? true,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!profile?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          display_name: data.displayName,
          daily_goal_minutes: data.dailyGoalMinutes,
          reminder_enabled: data.reminderEnabled,
          reminder_time: data.reminderEnabled ? (data.reminderTime ?? null) : null,
          burnout_window_start: data.burnoutWindowEnabled ? (data.burnoutWindowStart ?? null) : null,
          burnout_window_end: data.burnoutWindowEnabled ? (data.burnoutWindowEnd ?? null) : null,
          dark_mode: data.darkMode,
        })
        .eq("id", profile.id);

      if (error) throw error;

      if (data.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      await refreshProfile();

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-10 pb-24">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your reading preferences.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Profile</CardTitle>
                <CardDescription>How you appear in the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-display-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Reading Goals</CardTitle>
                <CardDescription>Set your daily intentions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dailyGoalMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Goal (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-daily-goal" />
                      </FormControl>
                      <FormDescription>
                        We recommend 15–30 minutes for a sustainable habit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Reminders</CardTitle>
                <CardDescription>Gentle nudges to keep you on track.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="reminderEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Daily Reminder</FormLabel>
                        <FormDescription>Receive a notification to read.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-reminder"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("reminderEnabled") && (
                  <FormField
                    control={form.control}
                    name="reminderTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-reminder-time" />
                        </FormControl>
                        <FormDescription className="text-primary/80">
                          Push notifications will be available in a future update.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Burnout Protection</CardTitle>
                <CardDescription>
                  Set a quiet window when reading reminders and pressure are paused — useful during exams or stressful periods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="burnoutWindowEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Quiet Window</FormLabel>
                        <FormDescription>Pause nudges during your protected hours.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-burnout-window"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("burnoutWindowEnabled") && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="burnoutWindowStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-burnout-start" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="burnoutWindowEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Until</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-burnout-end" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Appearance</CardTitle>
                <CardDescription>Customize how BookBuddy looks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="darkMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dark Mode</FormLabel>
                        <FormDescription>For reading in the evening.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-dark-mode"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto min-w-[150px]"
                data-testid="button-save-settings"
              >
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="pt-12 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
            data-testid="button-sign-out"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
