'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";

interface GoogleSignInButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function GoogleSignInButton({
  children,
  onClick,
}: GoogleSignInButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full flex items-center gap-2"
      type="button"
    >
      <Image
        src="/google.svg"
        alt="Google logo"
        width={16}
        height={16}
      />
      {children}
    </Button>
  );
} 