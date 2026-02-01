import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-bold ${sizeClasses[size]} hover:opacity-80 transition-opacity`}
    >
      <div className="flex items-center">
        <span className="text-primary">ODTÜ</span>
        {showText && <span className="text-foreground ml-1">Pusula</span>}
      </div>
    </Link>
  );
}
