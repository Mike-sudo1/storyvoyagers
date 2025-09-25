import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // shadcn
import { Button } from "@/components/ui/button";
import { useSelectedProfile } from "@/lib/selectedProfile";
import { supabase } from "@/integrations/supabase/client";

type P = { id: string; full_name: string; avatar_url?: string | null };

export function ProfilePickerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { setProfile } = useSelectedProfile();
  const [profiles, setProfiles] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("id,full_name,avatar_url").order("full_name", { ascending: true });
      setProfiles(data ?? []);
      setLoading(false);
    })();
  }, [open]);

  const empty = useMemo(() => !loading && profiles.length === 0, [loading, profiles]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a profile</DialogTitle>
        </DialogHeader>

        {loading && <div className="py-6 text-center">Loading profiles…</div>}

        {empty && (
          <div className="py-6 text-center space-y-4">
            <div>No profiles found.</div>
            <Button onClick={() => (location.href = "/profiles/new")}>Add profile</Button>
          </div>
        )}

        {!loading && !empty && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProfile({ id: p.id, name: p.full_name, avatar_url: p.avatar_url });
                  onOpenChange(false);
                }}
                className="flex flex-col items-center gap-2 rounded-2xl border p-4 hover:shadow"
              >
                <img
                  src={p.avatar_url || "/avatar-placeholder.png"}
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <span className="text-sm font-medium">{p.full_name}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
