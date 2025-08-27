import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

function SignOutButton(props: React.ComponentProps<typeof Button>) {
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      size="sm"
      onClick={() => {
        localStorage.removeItem("token");
        console.log("User logged out");
        navigate("/");
      }}
    >
      <LogOut />
      <span className="hidden sm:flex"> Sign Out</span>
    </Button>
  );
}

export default SignOutButton;
