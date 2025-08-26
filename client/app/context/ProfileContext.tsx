import React, { createContext, useContext, useState } from "react";
import type { UserProfile } from "~/lib/zod";

type ProfileContextValue = {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

export const ProfileProvider = ({
  children,
  initialProfile,
}: {
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(
    initialProfile ?? null
  );
  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    // Return a safe fallback to avoid runtime crashes if the provider is missing.
    // This helps the app stay usable while ensuring developers see a console warning.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        "useProfile used outside of ProfileProvider; returning fallback."
      );
    }
    return {
      profile: null,
      setProfile: (() => {}) as (p: UserProfile | null) => void,
    } as ProfileContextValue;
  }
  return ctx;
};

export default ProfileContext;
