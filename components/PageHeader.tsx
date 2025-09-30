interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export default function PageHeader({ title, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="text-center sm:text-left">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}