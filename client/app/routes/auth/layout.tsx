import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-2xl text-center font-bold mb-4 font-special">
        Welcome to Cybertron Codex
      </h1>
      <img src="/images/logo/favicon.ico" alt="Logo" className="mb-6 size-20" />
      <Outlet />
    </div>
  );
}

export default AuthLayout;
