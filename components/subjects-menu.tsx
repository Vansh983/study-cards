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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Subject } from '@/lib/types';

interface SubjectsMenuProps {
  subjects: Subject[];
  onSubjectSelect: (subject: Subject) => void;
  currentUser: string | undefined;
  onSubjectsChange: (subjects: Subject[]) => void;
}

export function SubjectsMenu({ subjects, onSubjectSelect, currentUser, onSubjectsChange }: SubjectsMenuProps) {
  const [newSubject, setNewSubject] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddSubject = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Please sign in to create subjects',
        variant: 'destructive',
      });
      return;
    }

    if (!newSubject.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a subject name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'subjects'), {
        name: newSubject.trim(),
        user_id: currentUser,
        created_at: serverTimestamp(),
      });

      const newSubjectData: Subject = {
        id: docRef.id,
        name: newSubject.trim(),
        user_id: currentUser,
        created_at: new Date().toISOString(),
      };

      onSubjectsChange([...subjects, newSubjectData]);
      setNewSubject('');
      toast({
        title: 'Success',
        description: 'Subject added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add subject',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 left-4">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Your Subjects</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddSubject();
              }}
            />
            <Button onClick={handleAddSubject} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  onSubjectSelect(subject);
                  setIsOpen(false);
                }}
              >
                {subject.name}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 