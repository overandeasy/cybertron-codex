import SignInForm from "@/components/SignInForm";
import type { Route } from "../+types/home";
import SignUpForm from "~/components/SignUpForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Sign up for a new account" },
  ];
}
export default function SignUp() {
  // return <SignUpForm />;
  return <div>Sign Up</div>; // IGNORE
}
