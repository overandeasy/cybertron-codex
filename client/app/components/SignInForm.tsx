import { signInFormSchema } from "@/lib/zod";
import type { SignInFormData } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useTransition } from "react";
import { signIn } from "~/api/auth";
import { useNavigate } from "react-router";
import { isApiError } from "~/lib/utils";

// Handle form submission

function SignInForm() {
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isSigningIn, startSignInTransition] = useTransition();
  const route = useNavigate();

  const onSubmit = () => {
    startSignInTransition(async () => {
      try {
        const data = await signIn(form.getValues());
        // success path
        form.reset();
        route("/home");
      } catch (err: any) {
        console.error("Sign-in failed:", err);
        // If your helper provides a typed API error, show its message, otherwise a friendly network message
        if (isApiError(err)) {
          form.setError("root", {
            type: "manual",
            message: err.message || "Sign-in failed. Check credentials.",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message:
              "Network error. Please check your connection and try again.",
          });
        }
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
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
                <Input type="password" placeholder="" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors && (
          <div className="text-destructive">
            {form.formState.errors.root?.message}
          </div>
        )}
        <Button
          className="w-full"
          disabled={form.formState.isSubmitting || isSigningIn}
          type="submit"
        >
          {form.formState.isSubmitting || isSigningIn
            ? "Signing In..."
            : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}

export default SignInForm;
