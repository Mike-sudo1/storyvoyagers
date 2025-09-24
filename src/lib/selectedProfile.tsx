import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Profile = { id: string; name: string; avatar_url?: string | null };

type Ctx = {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  loading: boolean;
};

const SelectedProfileContext = createContext<Ctx>({ profile: null, setProfile: () => {}, loading: true });
const LS_KEY = "sv:selectedProfile";

export function SelectedProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setProfileState(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    if (p) localStorage.setItem(LS_KEY, JSON.stringify(p));
    else localStorage.removeItem(LS_KEY);
  };

  const value = useMemo(() => ({ profile, setProfile, loading }), [profile, loading]);
  return <SelectedProfileContext.Provider value={value}>{children}</SelectedProfileContext.Provider>;
}

export const useSelectedProfile = () => useContext(SelectedProfileContext);
