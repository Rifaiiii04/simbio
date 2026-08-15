// Public user profile — excludes passwordHash, latitude, longitude (privacy)
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string | null;
  createdAt: Date;
}

// Own profile includes location metadata
export interface OwnProfile extends PublicUser {
  locationEnabled: boolean;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationEnabled?: boolean;
}
