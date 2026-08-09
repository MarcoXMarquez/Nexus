export type SocialVisibility = "private" | "friends" | "public";
export type Discoverability = "hidden" | "exact" | "searchable";
export type SocialRelationship = "none" | "sent" | "received" | "friends";

export type SocialIdentity = {
  profileId: string;
  handle: string;
  name: string;
  avatar: string;
  color: string;
};

export type SocialSettings = {
  profileId: string;
  discoverability: Discoverability;
  progressVisibility: SocialVisibility;
  achievementsVisibility: SocialVisibility;
  activityVisibility: SocialVisibility;
  marathonsVisibility: SocialVisibility;
  allowFriendRequests: boolean;
};

export type SocialContext = {
  identity: SocialIdentity;
  settings: SocialSettings;
};

export type SocialSearchResult = SocialIdentity & {
  relationship: SocialRelationship;
};

export type FriendSummary = SocialIdentity & {
  completedTitles: number | null;
  totalTitles: number | null;
  achievementCount: number | null;
  friendsSince: string;
};

export type FriendRequest = SocialIdentity & {
  requestId: string;
  direction: "sent" | "received";
  createdAt: string;
};

export type FriendProfile = SocialIdentity & {
  relationship: SocialRelationship;
  completedTitles: number | null;
  totalTitles: number | null;
  completedMovies: number | null;
  completedSeries: number | null;
  achievementCount: number | null;
  friendsSince: string | null;
};

export type TrackComparison = {
  trackId: string;
  total: number;
  viewerCompleted: number;
  friendCompleted: number;
};

export type FriendComparison = {
  viewerCompleted: string[];
  friendCompleted: string[];
  sharedTitleIds: string[];
  onlyViewerTitleIds: string[];
  onlyFriendTitleIds: string[];
  togetherPendingTitleIds: string[];
  viewerAchievementIds: string[];
  friendAchievementIds: string[];
  sharedAchievementIds: string[];
  trackProgress: TrackComparison[];
};

export type FriendActivity = SocialIdentity & {
  eventType: "watched" | "achievement" | "marathon_completed";
  titleId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SocialHubData = {
  friends: FriendSummary[];
  requests: FriendRequest[];
  activity: FriendActivity[];
};
