import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signUp } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setError(null);
    
    const result = await signUp(data.email, data.password);
    
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setLocation("/onboarding");
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-8">
        <div className="bg-primary/10 p-3 rounded-xl mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-serif font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-2">Start your reading habit.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" type="email" {...field} data-testid="input-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} data-testid="input-confirm-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-6" disabled={isLoading} data-testid="button-submit">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
