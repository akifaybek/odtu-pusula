import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-lg border-muted-foreground/20 bg-muted/5",
                className
            )}
        >
            {Icon && (
                <div className="bg-background p-3 rounded-full mb-4 shadow-sm ring-1 ring-border">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6 text-balance">
                {description}
            </p>

            {action && (
                <>
                    {action.href ? (
                        <Link href={action.href}>
                            <Button>{action.label}</Button>
                        </Link>
                    ) : (
                        <Button onClick={action.onClick}>{action.label}</Button>
                    )}
                </>
            )}
        </div>
    );
}
