import { useNavigate, type NavigateFunction } from "react-router";
import { toast } from "sonner";

import { cn } from "~/lib/utils";

export const themeToast = (
  type: "success" | "fail",
  message: string,
  location?: "/collection/my-collection" | "/home" | string,
  navigate?: NavigateFunction
) => {
  //   const content = () => {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <span>
  //           <img src="/images/logo/autobot_color.svg" alt="Autobot Logo" />
  //         </span>
  //         {message}
  //       </div>
  //     );
  //   };

  if (type === "success") {
    return toast.custom(
      (id) => (
        <div
          className={cn(
            "flex font-special text-xl text-shadow-md justify-center items-center p-4 m-auto rounded-lg min-w-sm max-w-1/2 [perspective:1000px] bg-background/50 backdrop-blur-md shadow-lg" // Added bg-white/80 for semi-transparent background, backdrop-blur-md for blur effect, and shadow-lg for better visibility
          )}
        >
          <img
            src="/images/logo/autobot_color.svg"
            alt="Autobot Logo"
            className="mr-2 w-10 h-10 flex-shrink-0 animate-logo-revolve" //animate-logo-revolve is a custom animation utility configured in app.css.
          />
          <span>{message}</span>

          {/* optional close button */}
          <button
            onClick={() => toast.dismiss(id)}
            className="ml-4 text-sm opacity-70"
            aria-label="close"
          >
            ✕
          </button>
        </div>
      ),
      {
        duration: 4000,
        // keep any options you need (onAutoClose, etc.)
        onAutoClose: () => {
          if (location && navigate) {
            console.log("Navigating to:", location);
            navigate(location);
          }
        },
      }
    );
  } else {
    return toast.custom(
      (id) => (
        <div
          className={cn(
            "flex font-special text-xl text-shadow-md justify-center items-center p-4 m-auto rounded-lg min-w-sm max-w-1/2 [perspective:1000px] bg-background/50 backdrop-blur-md shadow-lg" //Using "perspective" to ensure 3D perspective for any 3D animation
          )}
        >
          <img
            src="/images/logo/decepticon_color.svg"
            alt="Decepticon Logo"
            className="mr-2 w-10 h-10 flex-shrink-0 animate-logo-revolve" //animate-logo-revolve is a custom animation utility configured in app.css.
          />
          <span>{message}</span>

          {/* optional close button */}
          <button
            onClick={() => toast.dismiss(id)}
            className="ml-4 text-sm opacity-70"
            aria-label="close"
          >
            ✕
          </button>
        </div>
      ),
      {
        duration: 4000,
        // keep any options you need (onAutoClose, etc.)
        // onAutoClose: () => {
        //   if (navigate) {
        //     if (typeof autoNaviPath === "string") {
        //       navigate(autoNaviPath);
        //     } else if (typeof autoNaviPath === "number") {
        //       navigate(autoNaviPath);
        //     }
        //   }
        // },
      }
    );
  }
};
