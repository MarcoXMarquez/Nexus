export {};

declare global {
  interface Window {
    nexusDesktop?: {
      platform: string;
      exportProgress(payload: { watched: string[]; episodes: Record<string, number[]> }): Promise<{ ok: boolean; error?: string; canceled?: boolean }>;
      importProgress(): Promise<{ ok: boolean; payload?: { watched: string[]; episodes: Record<string, number[]> }; error?: string; canceled?: boolean }>;
    };
  }
}
