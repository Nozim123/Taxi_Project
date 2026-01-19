import React from "react";

interface TaxiLogoProps {
  className?: string;
  size?: number;
}

const TaxiLogo: React.FC<TaxiLogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Car body */}
      <rect
        x="4"
        y="20"
        width="40"
        height="16"
        rx="4"
        fill="currentColor"
        className="text-primary"
      />
      {/* Car roof */}
      <path
        d="M12 20L16 10H32L36 20"
        fill="currentColor"
        className="text-primary"
      />
      {/* Windows */}
      <path
        d="M14 19L17 12H23V19H14Z"
        fill="currentColor"
        className="text-primary-foreground"
        fillOpacity="0.3"
      />
      <path
        d="M25 19V12H31L34 19H25Z"
        fill="currentColor"
        className="text-primary-foreground"
        fillOpacity="0.3"
      />
      {/* Taxi sign */}
      <rect
        x="19"
        y="6"
        width="10"
        height="5"
        rx="1.5"
        fill="currentColor"
        className="text-foreground"
      />
      {/* Wheels */}
      <circle
        cx="13"
        cy="36"
        r="5"
        fill="currentColor"
        className="text-foreground"
      />
      <circle
        cx="13"
        cy="36"
        r="2.5"
        fill="currentColor"
        className="text-muted"
      />
      <circle
        cx="35"
        cy="36"
        r="5"
        fill="currentColor"
        className="text-foreground"
      />
      <circle
        cx="35"
        cy="36"
        r="2.5"
        fill="currentColor"
        className="text-muted"
      />
      {/* Headlights */}
      <rect
        x="4"
        y="24"
        width="3"
        height="4"
        rx="1"
        fill="currentColor"
        className="text-accent"
      />
      <rect
        x="41"
        y="24"
        width="3"
        height="4"
        rx="1"
        fill="currentColor"
        className="text-destructive"
      />
    </svg>
  );
};

export default TaxiLogo;
