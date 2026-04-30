import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useCreateBook } from "@/hooks/use-books";

const onboardingSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  bookTitle: z.string().min(1, "Book title is required"),
  bookAuthor: z.string().optional(),
  totalPages: z.coerce.number().min(1, "Must be at least 1 page"),
  currentPage: z.coerce.number().min(0, "Cannot be negative"),
  dailyGoalMinutes: z.coerce.number().min(5).max(120),
  reminderEnabled: z.boolean(),
  reminderTime: z.string().optional(),
  burnoutWindowEnabled: z.boolean(),
  burnoutWindowStart: z.string().optional(),
  burnoutWindowEnd: z.string().optional(),
}).refine(data => data.currentPage <= data.totalPages, {
  message: "Current page cannot exceed total pages",
  path: ["currentPage"],
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const updateProfile = useUpdateProfile();
  const createBook = useCreateBook();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      bookTitle: "",
      bookAuthor: "",
      totalPages: 300,
      currentPage: 0,
      dailyGoalMinutes: 15,
      reminderEnabled: false,
      reminderTime: "20:00",
      burnoutWindowEnabled: false,
      burnoutWindowStart: "22:00",
      burnoutWindowEnd: "08:00",
    },
  });

  async function onSubmit(data: OnboardingFormValues) {
    setIsLoading(true);

    try {
      await updateProfile.mutateAsync({
        data: {
          display_name: data.displayName,
          daily_goal_minutes: data.dailyGoalMinutes,
          reminder_enabled: data.reminderEnabled,
          reminder_time: data.reminderEnabled ? (data.reminderTime ?? null) : null,
          burnout_window_start: data.burnoutWindowEnabled ? (data.burnoutWindowStart ?? null) : null,
          burnout_window_end: data.burnoutWindowEnabled ? (data.burnoutWindowEnd ?? null) : null,
        },
      });

      await createBook.mutateAsync({
        title: data.bookTitle,
        author: data.bookAuthor || null,
        total_pages: data.totalPages,
        current_page: data.currentPage,
        is_completed: data.currentPage >= data.totalPages,
        completed_at: data.currentPage >= data.totalPages ? new Date().toISOString() : null,
        last_read_at: null,
        is_current: true,
      });

      await refreshProfile();
      setLocation("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold">Welcome to BookBuddy</h1>
        <p className="text-muted-foreground mt-2">Let's set up your reading space.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2">About you</h2>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What should we call you?</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyGoalMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily reading goal (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} data-testid="input-goal" />
                  </FormControl>
                  <FormDescription>Start small. 15 minutes is a great habit.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-medium border-b pb-2">Reminders & protection</h2>

            <FormField
              control={form.control}
              name="reminderEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Daily reminder</FormLabel>
                    <FormDescription>Get a nudge to read each day.</FormDescription>
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
                    <FormLabel>Reminder time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-reminder-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="burnoutWindowEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Burnout protection window</FormLabel>
                    <FormDescription>Pause pressure during exams or stressful periods.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-burnout"
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
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-medium border-b pb-2">Your current book</h2>
            <FormField
              control={form.control}
              name="bookTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dune" {...field} data-testid="input-book-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookAuthor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frank Herbert" {...field} data-testid="input-book-author" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalPages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Pages</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-total-pages" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Page</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-current-page" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
