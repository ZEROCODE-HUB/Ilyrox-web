import React, { useState } from "react";
import { COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  isWithBorder?: boolean;
}

const getInitials = (fullName: string) => {
  if (!fullName || typeof fullName !== "string") return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    const name = parts[0];
    return name.length > 1
      ? (name.charAt(0) + name.charAt(1)).toUpperCase()
      : name.charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = React.memo(
  ({ uri, name = "Usuario", size = 40, className, style, isWithBorder }) => {
    const [imgError, setImgError] = useState(false);

    const containerStyle: React.CSSProperties = {
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: COLORS.primary,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      border: isWithBorder ? `2px solid ${COLORS.white}` : "none",
      ...style,
    };

    const initials = getInitials(name);
    const hasValidUri =
      uri && uri.trim() !== "" && !uri.includes("placehold.co");

    if (hasValidUri && !imgError) {
      return (
        <div
          className={cn("flex-shrink-0 shadow-sm", className)}
          style={containerStyle}
        >
          <img
            src={uri}
            className="w-full h-full object-cover"
            alt={name}
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    return (
      <div
        className={cn("flex-shrink-0 shadow-sm bg-primary", className)}
        style={containerStyle}
      >
        <span
          style={{
            color: COLORS.white,
            fontWeight: "bold",
            fontSize: size * 0.4,
          }}
        >
          {initials}
        </span>
      </div>
    );
  },
);

export const CircularImageWithRays = ({
  uri,
  name = "Usuario",
  imageSize = 180,
  numberOfRays = 30,
  rayLength = 30,
  rayColor = "white",
  rayWidth = 2,
  className,
}: {
  uri?: string;
  name?: string;
  imageSize?: number;
  numberOfRays?: number;
  rayLength?: number;
  rayColor?: string;
  rayWidth?: number;
  className?: string;
}) => {
  const [imgError, setImgError] = useState(false);

  const containerSize = imageSize + rayLength * 2;
  const center = containerSize / 2;
  const innerRadius = imageSize / 2;
  const outerRadius = innerRadius + rayLength;

  const rays = Array.from({ length: numberOfRays }).map((_, index) => {
    const angle = (index * 360) / numberOfRays;
    const radian = (angle * Math.PI) / 180;

    return {
      x1: center + innerRadius * Math.cos(radian),
      y1: center + innerRadius * Math.sin(radian),
      x2: center + outerRadius * Math.cos(radian),
      y2: center + outerRadius * Math.sin(radian),
    };
  });

  const initials = getInitials(name);
  const hasValidUri = uri && uri.trim() !== "" && !uri.includes("placehold.co");

  const renderContent = () => {
    const contentStyle: React.CSSProperties = {
      width: imageSize,
      height: imageSize,
      borderRadius: "50%",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      overflow: "hidden",
      zIndex: 2,
    };

    if (hasValidUri && !imgError) {
      return (
        <div style={contentStyle}>
          <img
            src={uri}
            className="w-full h-full object-cover"
            alt={name}
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          ...contentStyle,
          backgroundColor: COLORS.primary,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: COLORS.white,
            fontWeight: "bold",
            fontSize: imageSize * 0.4,
          }}
        >
          {initials}
        </span>
      </div>
    );
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: containerSize, height: containerSize }}
    >
      <svg
        height={containerSize}
        width={containerSize}
        className="absolute inset-0 pointer-events-none"
      >
        {rays.map((ray, index) => (
          <line
            key={index}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={rayColor}
            strokeWidth={rayWidth}
          />
        ))}
      </svg>
      {renderContent()}
    </div>
  );
};

export default Avatar;
