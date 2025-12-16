export interface EngineOutput {
  title: string;
  content: string; // Markdown content
  isFullReport: boolean; // True if it's the whole doc, False if it's a specific section revision
}

export interface AppState {
  topic: string;
  isProcessing: boolean;
  output: EngineOutput | null;
  error: string | null;
}
