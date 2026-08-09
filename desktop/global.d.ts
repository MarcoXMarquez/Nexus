export {};

declare global {
  interface Window {
    nexusDesktop?: {
      platform: string;
      exportProgress(
        payload: Record<string, unknown> & {
          watched: string[];
          episodes: Record<string, number[]>;
        },
      ): Promise<{ ok: boolean; error?: string; canceled?: boolean }>;
      importProgress(): Promise<{
        ok: boolean;
        payload?: Record<string, any> & { watched: string[]; episodes: Record<string, number[]> };
        error?: string;
        canceled?: boolean;
      }>;
      exportMarathon(
        payload: Record<string, unknown>,
      ): Promise<{ ok: boolean; filePath?: string; error?: string; canceled?: boolean }>;
      importMarathon(): Promise<{ ok: boolean; payload?: any; error?: string; canceled?: boolean }>;
      authGet(key: string): Promise<string | null>;
      authSet(key: string, value: string): Promise<void>;
      authRemove(key: string): Promise<void>;
      cloudSaveSnapshot(
        profileId: string,
        snapshot: import("../app/cloud/types").NexusSnapshot,
      ): Promise<void>;
      cloudLoadSnapshot(
        profileId: string,
      ): Promise<import("../app/cloud/types").NexusSnapshot | null>;
      cloudQueueMutation(mutation: import("../app/cloud/types").QueuedMutation): Promise<void>;
      cloudPendingMutations(): Promise<import("../app/cloud/types").QueuedMutation[]>;
      cloudCompleteMutation(id: string): Promise<void>;
    };
  }
}
