"use client";

import { useState } from "react";

interface ProviderLogoProps {
  provider: string;
  size?: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d4a27f",
  google: "#4285f4",
  deepseek: "#4f46e5",
  mistral: "#f97316",
  xai: "#000000",
};

const PROVIDER_INITIALS: Record<string, string> = {
  openai: "O",
  anthropic: "A",
  google: "G",
  deepseek: "D",
  mistral: "M",
  xai: "X",
};

const PROVIDER_LOGO_FORMAT: Record<string, "svg" | "png"> = {
  openai: "svg",
  anthropic: "png",
  google: "png",
  deepseek: "svg",
  mistral: "svg",
};

export default function ProviderLogo({ provider, size = 24 }: ProviderLogoProps) {
  const [useFallback, setUseFallback] = useState(false);

  const color = PROVIDER_COLORS[provider] || "#6b7280";
  const initial = PROVIDER_INITIALS[provider] || provider[0]?.toUpperCase() || "?";
  const format = PROVIDER_LOGO_FORMAT[provider];

  if (useFallback || !format) {
    return (
      <div
        className="flex items-center justify-center rounded-md font-bold text-white flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: size * 0.5,
        }}
      >
        {initial}
      </div>
    );
  }

  const logoPath = `/logos/${provider}.${format}`;

  return (
    <img
      src={logoPath}
      alt={`${provider} logo`}
      width={size}
      height={size}
      className="rounded-md flex-shrink-0 object-contain"
      onError={() => setUseFallback(true)}
    />
  );
}
