"use client";

import { deleteSet, removeGameFromSet } from "@/app/actions/setsActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectGameEntry } from "@/db/schema/gameEntry";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { MoreVertical, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DialogFooter, DialogHeader } from "../ui/dialog";

type SetWithGames = {
  id: string;
  name: string;
  description: string | null;
  games: {
    game: SelectGameEntry;
  }[];
};

type SetCardProps = {
  set: SetWithGames;
};

export function SetCard({ set }: SetCardProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [removingGameId, setRemovingGameId] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteSet(set.id);

    if (result.success) {
      toast({ title: "Set deleted successfully!" });
      setShowDeleteDialog(false);
    } else {
      toast({ title: result.error || "Failed to delete set" });
    }
    setIsDeleting(false);
  };

  const handleRemoveGame = async (gameId: string) => {
    setRemovingGameId(gameId);
    const result = await removeGameFromSet(set.id, gameId);

    if (result.success) {
      toast({ title: "Game removed from set" });
    } else {
      toast({ title: result.error || "Failed to remove game" });
    }
    setRemovingGameId(null);
  };

  const totalGames = set.games.length;
  const ownedGames = set.games.filter((g) => g.game.bought !== false).length;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{set.name}</CardTitle>
            {set.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {set.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant={isEditMode ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {set.games.map(({ game }) => (
                <div
                  key={game.id}
                  className={cn(
                    "relative aspect-[3/4] h-32 flex-shrink-0 rounded-md overflow-hidden bg-muted",
                    !game.bought && "opacity-40 grayscale"
                  )}
                >
                  {game.imageUrl ? (
                    <Image
                      src={game.imageUrl || "/placeholder.svg"}
                      alt={game.title as string}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-center p-2 text-muted-foreground">
                      {game.title}
                    </div>
                  )}
                  {!game.bought && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-xs font-semibold text-white px-2 py-1 bg-black/40 rounded">
                        Not Owned
                      </span>
                    </div>
                  )}
                  {isEditMode && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveGame(game.id)}
                      disabled={removingGameId === game.id}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {ownedGames} / {totalGames} owned
              </span>
              <span>{Math.round((ownedGames / totalGames) * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Set</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete "${set.name}"? This action cannot
              be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
