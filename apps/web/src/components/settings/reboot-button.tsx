"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

export function RebootButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReboot() {
    setLoading(true);
    try {
      await api.reboot();
    } catch {
      // Server will go down — expected
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="h-4 w-4" />
        Starta om Home_OS
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Starta om?</DialogTitle>
          <DialogDescription>
            Alla tjänster kommer att stoppas tillfälligt. Är du säker?
          </DialogDescription>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReboot}
              disabled={loading}
            >
              {loading ? "Startar om..." : "Starta om"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
