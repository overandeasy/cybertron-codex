"use client";

import {
  Navigate,
  Outlet,
  useRouteLoaderData,
  type ClientLoaderFunctionArgs,
} from "react-router";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { Separator } from "~/components/ui/separator";

import { AppSidebar } from "~/components/Navigation/Sidebar/app-sidebar";
import { AppBreadcrumbs } from "~/components/Navigation/AppBreadcrumbs";

function SidebarLayout() {
  const { userProfile } = useRouteLoaderData("root");
  if (!userProfile) {
    console.warn("No user profile found in loader data.");
    return <Navigate to="/auth/sign-in" />;
  }
  return (
    <>
      <SidebarProvider className="">
        <AppSidebar userProfile={userProfile} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <AppBreadcrumbs />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="bg-muted/50  p-2 flex-1 rounded-xl md:min-h-min">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default SidebarLayout;
