import React from "react";

export default function IconButton({
  icon,
  onClick,
  label,
  danger,
  padding = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
  padding?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`m-2 cursor-pointer transition-colors ${danger ? "text-neutral-05 hover:text-danger-400" : "text-neutral-05 hover:text-brand-accent"} ${padding ? "p-2" : "p-0"}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
