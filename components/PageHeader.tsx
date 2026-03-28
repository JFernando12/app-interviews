import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}

export default function PageHeader({
  breadcrumbs,
  className = '',
}: PageHeaderProps) {
  return (
    <nav
      className={`mb-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-600">›</span>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
