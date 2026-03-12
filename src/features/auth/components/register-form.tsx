"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { checkUsernameAvailability } from "../api/auth.api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAction } from "../actions";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  display_name: z
    .string()
    .min(1, { message: "Display name is required" })
    .max(100, { message: "Max 100 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const watchUsername = form.watch("username");
  const debouncedUsername = useDebounce(watchUsername, 500);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");

  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus("checking");
      try {
        const data = await checkUsernameAvailability(debouncedUsername);

        if (data.available) {
          setUsernameStatus("available");
          form.clearErrors("username");
        } else {
          setUsernameStatus("taken");
          form.setError("username", {
            type: "manual",
            message: "This username is already taken",
          });
        }
      } catch (err) {
        console.error(err);
        setUsernameStatus("error");
      }
    }
    checkUsername();
  }, [debouncedUsername, form]);

  function onSubmit(values: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      const res = await registerAction(values);
      if (res?.error) {
        form.setError("root", { message: res.error });
      } else if (res?.success) {
        toast.success("Account created successfully", {
          description: "You'll receive a confirmation email shortly.",
        });
        form.reset();
        router.push("/login"); // Redirect to login without auto-login
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      placeholder="johndoe"
                      {...field}
                      disabled={isPending}
                      className={
                        usernameStatus === "taken"
                          ? "border-danger focus-visible:ring-danger"
                          : ""
                      }
                    />
                    <div className="absolute right-3">
                      {usernameStatus === "checking" && (
                        <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
                      )}
                      {usernameStatus === "available" && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                      {usernameStatus === "taken" && (
                        <X className="h-4 w-4 text-danger" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                    disabled={isPending}
                  />
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
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-4 w-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          className="h-4 w-4 text-text-secondary"
                          aria-hidden="true"
                        />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          className="w-full cursor-pointer"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
