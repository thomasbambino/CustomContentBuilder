import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  linkText?: string;
  linkHref?: string;
  onClick?: () => void;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600",
  linkText,
  linkHref,
  onClick
}: StatsCardProps) {
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg border">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-bold text-foreground">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {(linkText && linkHref) && (
        <div className="bg-muted/50 px-5 py-3">
          <div className="text-sm">
            <a 
              href={linkHref}
              onClick={(e) => {
                if (onClick) {
                  e.preventDefault();
                  onClick();
                }
              }}
              className="font-medium text-primary hover:text-primary/80"
            >
              {linkText}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
