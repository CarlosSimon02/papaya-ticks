'use client';

import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex-1">
          <Link href="/">
            <h1 className="text-xl font-bold">PapayaTicks</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.photoURL || 'no-image'} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2">
                  <Link href="/profile">
                    <User size={14} />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 