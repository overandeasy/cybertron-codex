import SignInForm from "@/components/SignInForm";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Sign in to access your account" },
  ];
}
export default function SignIn() {
  return <SignInForm />;
  // return <div>Sign In</div>; // IGNORE
}
