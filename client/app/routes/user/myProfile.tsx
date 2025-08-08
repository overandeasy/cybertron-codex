import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile" },
    { name: "description", content: "Welcome to My Profile!" },
  ];
}

function MyProfile() {
  return <div>My Profile</div>;
}

export default MyProfile;
