import { Outlet } from "react-router";

import type { UserCollection } from "~/lib/zod";

import { getMyCollection } from "~/api/collection";
import type { Route } from "./+types/layout";

export const handle = { breadcrumb: "Collection" };

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token, just return the server's "logged out" state.
    console.warn("No auth token found in localStorage.");
    return { userCollection: null };
  }

  try {
    // If a token exists, fetch the user profile.
    const userCollection = await getMyCollection();
    console.log("My collection fetched successfully on the collection layout.");
    return { userCollection };
  } catch (error) {
    console.error(
      "Failed to fetch user collection, token might be invalid.",
      error
    );
    return { userCollection: null };
  }
}

function CollectionLayout({ loaderData }: Route.ComponentProps) {
  const { userCollection } = (loaderData ?? { userCollection: null }) as {
    userCollection: UserCollection | null;
  };

  return <Outlet />;
}

export default CollectionLayout;
