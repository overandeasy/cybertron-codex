import { useLocation, Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function AppBreadcrumbs() {
  const location = useLocation();
  // console.log("Current location:", location);

  const crumbs = location.pathname.split("/").filter((c) => c !== "");
  // console.log("Crumbs:", crumbs);
  let link = "";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="px-2">
          <BreadcrumbLink asChild>
            <Link to="/home">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {crumbs.map((crumb, index) => {
          link += `/${crumb}`;
          const formattedCrumb = crumb
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
          // console.log("Current link:", link);
          const isLast = index === crumbs.length - 1;

          return (
            !["collection", "user", "auth"].includes(crumb) && (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{formattedCrumb}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={link}>{formattedCrumb}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            )
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
