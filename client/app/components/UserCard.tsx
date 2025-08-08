import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";

// import { EyeIcon, EyeOffIcon } from "lucide-react";

function UserCard() {
  const { user, signOut } = UserAuth() || {};
  return (
    <div className="space-x-2 ">
      {user ? (
        <div className="flex items-center space-x-2 ">
          <img
            src={user?.photoURL || "/defaultAvatar.png"}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full hidden min-[464px]:flex"
          />
          <span className="hidden min-[464px]:flex">
            Hi, {user.displayName?.split(" ")[0]}.
          </span>
          <Button className="hover:cursor-pointer" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="items-center space-x-2 hidden min-[464px]:flex ">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/defaultAvatar.png" />
            <AvatarFallback>User Avatar</AvatarFallback>
          </Avatar>
          <span>Welcome.</span>
        </div>
      )}
    </div>
  );
}

export default UserCard;
