"use client";

import { deleteGame, updateGame } from "@/app/actions/gameActions";
import { getPlatforms } from "@/app/actions/platformActions";

import { addGameToSet, getSets } from "@/app/actions/setsActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectSet } from "@/db/schema";
import type { SelectGameEntry } from "@/db/schema/gameEntry";
import type { SelectPlatform } from "@/db/schema/platforms";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
export default function GameDetailsModal({
  game,
  isOpen,
  onOpenChange,
  onGameDeleted,
}: {
  game: SelectGameEntry;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGameDeleted: () => void;
}) {
  const [formResult, formAction] = useActionState(updateGame, undefined);
  const [platforms, setPlatforms] = useState<SelectPlatform[]>([]);
  const [sets, setSets] = useState<SelectSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPlatforms() {
      const fetchedPlatforms = await getPlatforms();
      setPlatforms(fetchedPlatforms);
    }

    async function fetchSets() {
      const fetchedSets = await getSets();
      setSets(fetchedSets.data || []);
    }
    fetchPlatforms();
    fetchSets();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", game.id);
    await formAction(formData);
    if (formResult?.error) {
      toast({
        title: "Error",
        description: formResult.error.toString(),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Game updated!",
      });
      onOpenChange(false);
    }
  };

  const handleAddToSet = async () => {
    if (!selectedSetId) {
      toast({
        title: "Error",
        description: "Please select a set.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Call your action to add the game to the set here
      await addGameToSet(selectedSetId, game.id);
      toast({
        title: "Success",
        description: "Game added to set!",
      });
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to add game to set.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGame(game.id);
      toast({
        title: "Success",
        description: "Game deleted!",
      });
      onGameDeleted();
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to delete game.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-md font-semibold">
              Game Title
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={game.title ?? ""}
              className="mt-1 block w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-md font-semibold">Game Image</Label>
            <Image
              src={game.imageUrl || "/placeholder.svg"}
              alt={game.title ?? "Game image"}
              width={200}
              height={300}
              className="rounded-md object-cover mx-auto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-md font-semibold">
              Platform
            </Label>
            <Select name="platform" defaultValue={game.platformId}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boughtStatus" className="text-md font-semibold">
              Bought Status
            </Label>
            <RadioGroup
              name="boughtStatus"
              defaultValue={game.bought ? "owned" : "wanted"}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owned" id="owned" />
                <Label htmlFor="owned">Owned</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wanted" id="wanted" />
                <Label htmlFor="wanted">Wanted</Label>
              </div>
            </RadioGroup>
          </div>

          {game.bought && (
            <div className="space-y-2">
              <Label className="text-md font-semibold" htmlFor="boughtDate">
                Bought Date
              </Label>
              <Input
                id="boughtDate"
                name="boughtDate"
                type="date"
                defaultValue={
                  game.boughtDate
                    ? game.boughtDate.toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit">Save Changes</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the game from your collection.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                  Add to Set
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to a set</DialogTitle>

                  <Select
                    name="platform"
                    value={selectedSetId}
                    onValueChange={setSelectedSetId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select set" />
                    </SelectTrigger>
                    <SelectContent>
                      {sets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddToSet}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
