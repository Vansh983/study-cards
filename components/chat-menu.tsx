'use client';

import { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Chat } from '@/lib/types';

interface ChatMenuProps {
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
  currentUser: string | undefined;
  onChatsChange: (chats: Chat[]) => void;
  onNewChat: () => void;
  isLoading?: boolean;
}

export function ChatMenu({ 
  chats, 
  onChatSelect, 
  currentUser, 
  onChatsChange, 
  onNewChat,
  isLoading = false 
}: ChatMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 left-4">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Your Chats</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button 
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }} 
            className="w-full"
            disabled={!currentUser}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="text-center text-muted-foreground">No chats yet</div>
            ) : (
              chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    onChatSelect(chat);
                    setIsOpen(false);
                  }}
                >
                  {chat.title || 'Untitled Chat'}
                </Button>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 