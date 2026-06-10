export type ArtistProfile = {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  whatsapp: string;
  telegram: string;
};

export type ArtistProfileRow = {
  id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  telegram: string | null;
};

export const defaultArtistProfile: ArtistProfile = {
  id: "main",
  name: "Cartina Artist",
  bio: "Авторские картины маслом и акрилом.",
  avatarUrl: "",
  whatsapp: "",
  telegram: "",
};

export function artistProfileFromRow(row: ArtistProfileRow): ArtistProfile {
  return {
    id: row.id,
    name: row.name ?? defaultArtistProfile.name,
    bio: row.bio ?? defaultArtistProfile.bio,
    avatarUrl: row.avatar_url ?? "",
    whatsapp: row.whatsapp ?? "",
    telegram: row.telegram ?? "",
  };
}
