import * as React from "react";
import { LibraryBigIcon, Star, User } from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import type { UserProfile } from "~/lib/zod";

const data = {
  teams: [
    {
      name: "Autobots",
      logo: "/images/logo/autobot.svg",
      plan: "Til all are one.",
    },
    {
      name: "Decepticons",
      logo: "/images/logo/decepticon.svg",
      plan: "Peace through tyranny.",
    },
  ],
  navMain: [
    {
      title: "Profile",
      url: "/user/myProfile",
      icon: User,
      isActive: true,
      items: [
        {
          title: "My Profile",
          url: "/user/my-profile",
        },
        {
          title: "Edit Profile",
          url: "/user/my-profile/edit",
        },
      ],
    },
  ],
  Collections: [
    {
      name: "My Collections",
      url: "/collection/my-collections",
      icon: LibraryBigIcon,
    },
    {
      name: "Favorites",
      url: "/collection/my-favorites",
      icon: Star,
    },
  ],
};

export function AppSidebar({
  userProfile,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userProfile: UserProfile | null }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.Collections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userProfile?.first_name || "Guest",
            email: userProfile?.user_id.email || "No email",
            avatar:
              userProfile?.images?.[userProfile.images.length - 1] ||
              "/images/defaultUser/energon-glyphs.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
