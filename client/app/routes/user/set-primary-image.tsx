import { baseUrl } from "~/lib/baseUrl";

// clientAction runs in the browser (Framework mode). It proxies the request
// to the existing server API so that React Router will treat this as a route
// action and trigger revalidation of loaders after completion.
export const clientAction = async ({ request }: any) => {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${baseUrl}/user/my-profile/primary-image`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl: image }),
    });

    const resJson = await response.json();
    if (!response.ok) {
      return { ok: false, error: resJson };
    }

    // Return the API payload so client components can inspect fetcher.data
    return { ok: true, data: resJson.data };
  } catch (err: any) {
    return { ok: false, error: { message: err?.message || String(err) } };
  }
};

export default function Route() {
  // This file only exports a clientAction; the default export can be an empty
  // component because it will never be rendered as a route UI in our app.
  return null;
}
