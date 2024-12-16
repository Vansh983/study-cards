"use client";

import { useState } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  signInWithPopup,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';

export function AuthButton() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    console.log('Starting sign-in process...');
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('Sign-in with popup completed');
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Error',
        description:
          'Failed to sign in. Please check your network connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = async () => {
    console.log('Starting sign-out process...');
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      console.log('Sign-out completed');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast({
        title: 'Error',
        description:
          'Failed to sign out. Please check your network connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                {user.displayName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('') || user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={handleSignIn}
            disabled={loading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In with Google
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
