import { HomeIcon, Library, LogOut, Plus, Star, User } from "lucide-react";
import { Info } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router";
import SignOutButton from "./SignOutButton";

function NavMenu() {
  const navigate = useNavigate();
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              {/* Got rid of NavigationMenuLink becuase it is conflicting with the Link component */}
              <NavigationMenuLink
                href="/home"
                className={cn(" flex-row items-center gap-2 flex")}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:flex"> Home</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/about"
                className={cn("flex flex-row items-center gap-2")}
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:flex"> About</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/user/my-profile"
                className={cn("flex flex-row items-center gap-2")}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:flex"> Profile</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/collection/my-collection"
                className="flex flex-row items-center gap-2"
              >
                <Library className="w-4 h-4" />
                <span className="hidden sm:flex"> Collection</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/collection/my-favorites"
                className="flex flex-row items-center gap-2"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:flex"> Favorites</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto">
          {/* <Button asChild size="sm">
            <Link
              to="/collection/my-collection/add"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </Link>
          </Button> */}
          <SignOutButton variant={"theme_decepticon"} />
        </div>
      </div>
    </div>
  );
}

export default NavMenu;
