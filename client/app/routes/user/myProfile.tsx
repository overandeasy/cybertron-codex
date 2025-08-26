import { Navigate, useRouteLoaderData } from "react-router";
import UserProfileDisplay from "~/components/UserProfileDisplay";
import type { Route } from "./+types/myProfile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile" },
    { name: "description", content: "View and edit your profile information" },
  ];
}
export default function MyProfile() {
  const loaderData = useRouteLoaderData("root") as { userProfile?: any };
  const userProfile = loaderData?.userProfile;
  if (localStorage.getItem("token") === null) {
    console.warn("No auth token found in localStorage.");
    return <Navigate to="/auth/sign-in" replace />;
  }
  if (!userProfile) return <div>Loading profile...</div>;

  return <UserProfileDisplay userProfile={userProfile} />;
}
