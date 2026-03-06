import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function MarqueeText({
  children,
  className,
  speed = 10,
}: MarqueeTextProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkTruncated = () => {
      if (textRef.current && containerRef.current) {
        // Un margen de 2px para evitar errores de redondeo en navegadores
        const hasOverflow =
          textRef.current.scrollWidth > containerRef.current.clientWidth + 2;
        setIsTruncated(hasOverflow);
      }
    };

    checkTruncated();
    const observer = new ResizeObserver(checkTruncated);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [children]);

  // Si no hay desbordamiento, render normal
  if (!isTruncated) {
    return (
      <div ref={containerRef} className={cn("w-full truncate", className)}>
        <span ref={textRef}>{children}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden relative whitespace-nowrap",
        className,
      )}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
      }}
    >
      <div
        className="flex min-w-max animate-marquee [animation-play-state:paused] group-hover:[animation-play-state:running]"
        style={
          {
            animationDuration: `${speed}s`,
            "--duration": `${speed}s`,
            willChange: "transform",
          } as React.CSSProperties
        }
      >
        <span ref={textRef} className="inline-block pr-12">
          {children}
        </span>
        <span className="inline-block pr-12">{children}</span>
      </div>
    </div>
  );
}
