import { Outlet } from "react-router";
export const handle = { breadcrumb: "My Profile" };
function myProfileLayout() {
  return <Outlet />;
}

export default myProfileLayout;
