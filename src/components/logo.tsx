import Image from "next/image";

export function LogoMark({
  size = 32,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/hage-logo.png"
      alt="HAGE"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-primary">hage</span>
      <span>book</span>
    </span>
  );
}
