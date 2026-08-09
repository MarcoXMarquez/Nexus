export const APP_VIEWS = [
  "dashboard",
  "map",
  "list",
  "routes",
  "planner",
  "explore",
  "calendar",
  "achievements",
  "profiles",
  "friends",
] as const;

export type AppView = (typeof APP_VIEWS)[number];

export type NexusNavigationState = {
  view: AppView;
  titleId: string | null;
  friendHandle: string | null;
  compareHandle: string | null;
};

export const DEFAULT_NAVIGATION_STATE: NexusNavigationState = {
  view: "dashboard",
  titleId: null,
  friendHandle: null,
  compareHandle: null,
};

function isAppView(value: string | null): value is AppView {
  return APP_VIEWS.includes(value as AppView);
}

export function readNavigationState(search = ""): NexusNavigationState {
  const params = new URLSearchParams(search);
  const view = params.get("view");

  return {
    view: isAppView(view) ? view : DEFAULT_NAVIGATION_STATE.view,
    titleId: params.get("title") || null,
    friendHandle: params.get("profile") || null,
    compareHandle: params.get("compare") || null,
  };
}

export function navigationSearch(state: NexusNavigationState): string {
  const params = new URLSearchParams();

  if (state.view !== DEFAULT_NAVIGATION_STATE.view) params.set("view", state.view);
  if (state.titleId) params.set("title", state.titleId);
  if (state.friendHandle) params.set("profile", state.friendHandle);
  if (state.compareHandle) params.set("compare", state.compareHandle);

  const query = params.toString();
  return query ? `?${query}` : "";
}
