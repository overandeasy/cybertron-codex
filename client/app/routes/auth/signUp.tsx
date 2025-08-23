import SignInForm from "@/components/SignInForm";
import type { Route } from "../+types/home";
import SignUpForm from "~/components/SignUpForm";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Sign up for a new account" },
  ];
}
export default function SignUp() {
  return (
    <div className="flex w-full max-w-md items-center justify-center">
      <Card className="w-full max-w-md self-center text-center">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter className="self-center text-sm">
          <CardAction>
            <p className=" text-gray-500">
              Already have an account?{" "}
              <Link
                to="/auth/sign-in"
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
  // return <div>Sign Up</div>; // IGNORE
}
