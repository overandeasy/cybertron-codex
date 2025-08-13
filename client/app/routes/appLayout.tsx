import { Outlet } from "react-router";
import { getActiveUserProfile } from "~/api/user";
import type { Route } from "./+types/appLayout";

export const handle = { breadcrumb: "Home" };

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token, just return the server's "logged out" state.
    console.warn("No auth token found in localStorage.");
    return { userProfile: null };
  }

  try {
    // If a token exists, fetch the user profile.
    const userProfile = await getActiveUserProfile();
    console.log(
      "User profile fetched successfully on the client: ",
      userProfile
    );
    return { userProfile };
  } catch (error) {
    console.error(
      "Failed to fetch user profile, token might be invalid.",
      error
    );
    return { userProfile: null };
  }
}
function HomeLayout({ loaderData }: Route.ComponentProps) {
  const { userProfile } = loaderData;
  return <Outlet />;
}

export default HomeLayout;
