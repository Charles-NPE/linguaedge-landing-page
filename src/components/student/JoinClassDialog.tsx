
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JoinClassDialogProps {
  trigger?: React.ReactNode;
  onJoin: (code: string) => Promise<void>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JoinClassDialog({ 
  trigger, 
  onJoin,
  isOpen,
  onOpenChange
}: JoinClassDialogProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      await onJoin(code.trim());
      setCode("");
    } catch (error) {
      console.error("Error joining class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join a class</DialogTitle>
            <DialogDescription>
              Enter the class code provided by your teacher to join.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="code"
              placeholder="Enter class code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full"
              autoComplete="off"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange?.(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!code.trim() || isLoading}>
              {isLoading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
