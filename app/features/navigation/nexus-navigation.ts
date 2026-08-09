import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_NAVIGATION_STATE,
  navigationSearch,
  readNavigationState,
  type AppView,
  type NexusNavigationState,
} from "./url-state";

export type { AppView, NexusNavigationState } from "./url-state";

function browserState(): NexusNavigationState {
  if (typeof window === "undefined") return DEFAULT_NAVIGATION_STATE;
  return readNavigationState(window.location.search);
}

/**
 * Keeps the SPA state in the browser history without forcing a server navigation.
 * Multiple state changes made in the same React event become one history entry.
 */
export function useNexusNavigation() {
  const initial = useMemo(() => browserState(), []);
  const [view, setView] = useState<AppView>(initial.view);
  const [titleId, setTitleId] = useState<string | null>(initial.titleId);
  const [friendHandle, setFriendHandle] = useState<string | null>(initial.friendHandle);
  const [compareHandle, setCompareHandle] = useState<string | null>(initial.compareHandle);
  const initialized = useRef(false);
  const popTarget = useRef<string | null>(null);
  const lastSearch = useRef(navigationSearch(initial));
  const historyDepth = useRef(0);
  const historyWriteMode = useRef<"push" | "replace">("push");

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const next = readNavigationState(window.location.search);
      const nextSearch = navigationSearch(next);

      historyDepth.current = Number(event.state?.nexusDepth) || 0;
      popTarget.current = nextSearch;
      setView(next.view);
      setTitleId(next.titleId);
      setFriendHandle(next.friendHandle);
      setCompareHandle(next.compareHandle);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setCompareHandle, setFriendHandle, setTitleId, setView]);

  useEffect(() => {
    const state = { view, titleId, friendHandle, compareHandle };
    const search = navigationSearch(state);
    const url = `${window.location.pathname}${search}${window.location.hash}`;

    if (!initialized.current) {
      initialized.current = true;
      lastSearch.current = search;
      window.history.replaceState({ nexus: state, nexusDepth: historyDepth.current }, "", url);
      return;
    }

    if (popTarget.current === search) {
      popTarget.current = null;
      lastSearch.current = search;
      return;
    }

    if (lastSearch.current === search) return;
    lastSearch.current = search;

    if (historyWriteMode.current === "replace") {
      historyWriteMode.current = "push";
      window.history.replaceState({ nexus: state, nexusDepth: historyDepth.current }, "", url);
      return;
    }

    historyDepth.current += 1;
    window.history.pushState({ nexus: state, nexusDepth: historyDepth.current }, "", url);
  }, [compareHandle, friendHandle, titleId, view]);

  const openView = useCallback(
    (nextView: AppView) => {
      setView(nextView);
      setTitleId(null);
      if (nextView !== "friends") {
        setFriendHandle(null);
        setCompareHandle(null);
      }
    },
    [setCompareHandle, setFriendHandle, setTitleId, setView],
  );

  const openTitle = useCallback(
    (nextTitleId: string | null) => {
      setTitleId((currentTitleId) => {
        // A detail panel is a single navigation layer. Moving between titles
        // replaces that layer so one close action dismisses the whole session.
        if (currentTitleId && nextTitleId && currentTitleId !== nextTitleId) {
          historyWriteMode.current = "replace";
        }
        return nextTitleId;
      });
    },
    [setTitleId],
  );

  const openFriend = useCallback(
    (handle: string | null) => {
      setView("friends");
      setTitleId(null);
      setFriendHandle(handle);
      setCompareHandle(null);
    },
    [setCompareHandle, setFriendHandle, setTitleId, setView],
  );

  const compareWith = useCallback(
    (handle: string | null) => {
      setView("friends");
      setTitleId(null);
      setFriendHandle(handle);
      setCompareHandle(handle);
    },
    [setCompareHandle, setFriendHandle, setTitleId, setView],
  );

  const closeTopLayer = useCallback(() => {
    if (titleId) {
      if (historyDepth.current > 0) {
        window.history.back();
      } else {
        historyWriteMode.current = "replace";
        setTitleId(null);
      }
      return true;
    }
    if (friendHandle || compareHandle) {
      if (historyDepth.current > 0) {
        window.history.back();
      } else if (compareHandle) {
        setCompareHandle(null);
      } else {
        setFriendHandle(null);
      }
      return true;
    }
    return false;
  }, [compareHandle, friendHandle, setCompareHandle, setFriendHandle, setTitleId, titleId]);

  return {
    view,
    titleId,
    friendHandle,
    compareHandle,
    setView: openView,
    setTitleId: openTitle,
    openFriend,
    compareWith,
    closeTopLayer,
  };
}
