import {
  Outlet,
  useRouteLoaderData,
  type ClientLoaderFunctionArgs,
} from "react-router";
import { getActiveUserProfile } from "~/api/user";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

import { Separator } from "~/components/ui/separator";
import { Toaster } from "~/components/ui/sonner";
import AppBreadcrumbs from "~/components/appBreadcrumbs";
import type { Route } from "../user/+types/layout";

function AppLayout() {
  const { userProfile } = useRouteLoaderData("routes/appLayout");
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

      <Toaster position="top-center" />
    </>
  );
}

export default AppLayout;
