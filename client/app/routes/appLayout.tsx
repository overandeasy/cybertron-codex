import { Outlet, type ClientLoaderFunctionArgs } from "react-router";
import { getActiveUserProfile } from "~/api/user";
import type { Route } from "./+types/appLayout";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";

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

function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
