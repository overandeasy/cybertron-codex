import SignInForm from "@/components/SignInForm";
import type { Route } from "../+types/home";
import { Link, Navigate, useNavigate, useRouteLoaderData } from "react-router";
import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Sign in to access your account" },
  ];
}
export default function SignIn() {
  const { userProfile } = useRouteLoaderData("root");
  const route = useNavigate();
  const [countdown, setCountdown] = useState(3); // seconds
  let interval: number | null;

  if (userProfile) {
    // If the user is already logged in, redirect to their profile or home.
    useEffect(() => {
      console.log("User is already signed in, redirecting...");
      interval = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.clearInterval(interval as number);
            route("/home");
            return 0;
          }
          console.log(`Redirecting in ${prev - 1}...`);
          return prev - 1;
        });
      }, 1000);

      return () => {
        window.clearInterval(interval as number);
      };
    }, []);
    return (
      <div>{`You are already signed in. Redirecting in ${countdown}...`}</div>
    );
  }
  return (
    <div className="flex w-full max-w-md items-center justify-center">
      <Card className="w-full max-w-md self-center text-center">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
        <CardFooter className="self-center text-sm">
          <CardAction>
            <p className=" text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/auth/sign-up"
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  );
  // return <div>Sign In</div>; // IGNORE
}
