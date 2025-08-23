import { signUpFormSchema } from "@/lib/zod";
import type { SignUpFormData } from "@/lib/zod";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import { useTransition } from "react";
import { signUp } from "~/api/auth";
import { useNavigate } from "react-router";

// Handle form submission

function SignUpForm() {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isSigningUp, startSignUpTransition] = useTransition();
  const route = useNavigate();

  const onSubmit = () => {
    startSignUpTransition(async () => {
      const signUpResult = await signUp(form.getValues());
      signUpResult?.error
        ? form.setError("root", {
            type: "manual",
            message: `An error occured. Please try again. ${signUpResult.error.message}`,
          })
        : (form.reset(), route("/home"));
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-md space-x-2"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      type="password"
                      placeholder="Enter a strong password."
                      {...field}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className=" w-full max-w-md text-wrap">
                      Password must be at least 8 characters, including at least
                      one uppercase letter, one lowercase letter, one number,
                      and one special character.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </FormControl>
              <FormDescription></FormDescription>
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
                <Input
                  type="password"
                  placeholder="Re-enter your password."
                  {...field}
                />
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
        <div className="flex w-full gap-2 justify-center">
          <Button
            className="w-1/2"
            disabled={form.formState.isSubmitting || isSigningUp}
            type="submit"
          >
            {form.formState.isSubmitting || isSigningUp
              ? "Signing Up..."
              : "Sign Up"}
          </Button>
          <Button className="w-1/2" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SignUpForm;
