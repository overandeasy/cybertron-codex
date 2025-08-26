import { getMyFavorites } from "~/api/collection";
import type { Route } from "./+types/layout";
import { Outlet } from "react-router";

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token, just return the server's "logged out" state.
    console.warn("No auth token found in localStorage.");
    return { userCollection: null };
  }

  try {
    // If a token exists, fetch the user profile.
    const userFavorites = await getMyFavorites();
    console.log("Favorite items fetched successfully on the favorite layout.");

    return { userFavorites };
  } catch (error) {
    console.error(
      "Failed to fetch user favorites, token might be invalid.",
      error
    );
    return { userFavorites: null };
  }
}

function FavoriteLayout({ loaderData }: Route.ComponentProps) {
  return <Outlet />;
}

export default FavoriteLayout;
