import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
    index("routes/landingPage.tsx"),

    route("home", "routes/home.tsx"),
    ...prefix("auth", [
        // This is the auth layout that wraps around the sign-in and sign-up pages and provide a unified layout UI. 
        layout("routes/auth/layout.tsx", [
            route("sign-in", "routes/auth/signIn.tsx"),
            route("sign-up", "routes/auth/signUp.tsx")
        ])
    ]),
    // This is the main layout that provides a sidebar and breadcrumb navigation.
    layout("routes/sidebarLayout.tsx", [
        ...prefix("user/my-profile", [
            index("routes/user/myProfile.tsx"),
            route("edit", "routes/user/editMyProfile.tsx"),
        ]),
        ...prefix("collection", [
            ...prefix("my-collection", [
                layout("routes/collection/layout.tsx", [
                    index("routes/collection/myCollection.tsx"),
                    route(":_id", "routes/collection/myCollectionItem.tsx"),
                    route(":_id/edit", "routes/collection/editMyCollectionItem.tsx"),
                    route("add", "routes/collection/addMyCollectionItem.tsx"),
                ])
            ]),
            ...prefix("my-favorites", [
                layout("routes/collection/favorite/layout.tsx", [
                    index("routes/collection/favorite/myFavorites.tsx"),
                    // route(":_id", "routes/favorite/myFavoriteItem.tsx"),
                ])
            ])
        ]),

    ]),
] satisfies RouteConfig;