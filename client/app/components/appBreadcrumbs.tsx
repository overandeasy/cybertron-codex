import React from "react";
import { Link, useMatches } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

type Crumb = {
  id: string;
  to: string;
  label: React.ReactNode;
};

export function AppBreadcrumbs() {
  const matches = useMatches();

  // Collect crumbs from route handles
  const crumbs: Crumb[] = matches
    .filter((m) => m.handle && (m.handle as any).breadcrumb)
    .map((m) => {
      const h = (m.handle as any).breadcrumb;
      const label = typeof h === "function" ? h(m) : (h as React.ReactNode);
      return { id: m.id, to: m.pathname || "/", label };
    });

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={c.id}>
              <BreadcrumbItem
                className={
                  i < crumbs.length - 1 ? "hidden md:block" : undefined
                }
              >
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={c.to}
                      className="hover:text-foreground transition-colors"
                    >
                      {c.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default AppBreadcrumbs;
