import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [layout("routes/appLayout.tsx", [
    index("routes/home.tsx"),
    ...prefix("auth", [
        layout("routes/auth/layout.tsx", [
            route("sign-in", "routes/auth/signIn.tsx"),
            route("sign-up", "routes/auth/signUp.tsx")])
    ]),
    ...prefix("user", [
        layout("routes/user/layout.tsx", [

            route("my-profile", "routes/user/myProfileLayout.tsx", [
                index("routes/user/myProfile.tsx"),
                route("edit", "routes/user/editMyProfile.tsx"),
            ]),

        ])
    ]),

]),

] satisfies RouteConfig;

