export type Lang = "en" | "zh";
export type LangMode = Lang | "both";

export interface Bilingual {
  en: string;
  zh: string;
}

export type TrackId = "A" | "B" | "C" | "D";

export interface KeyTerm {
  term: string;
  def: Bilingual;
}

export interface CheckQuestion {
  id: string;
  prompt: Bilingual;
  answer: Bilingual;
  hint?: Bilingual;
}

export interface PaperRef {
  title: string;
  year?: number;
  note?: Bilingual;
  url?: string; // direct link; falls back to a scholar search by title
}

export type ResourceKind = "wiki" | "video" | "dataset" | "model" | "code" | "paper" | "web";

export interface ResourceLink {
  kind: ResourceKind;
  label: string;
  url: string;
}

export interface Lesson {
  id: string; // e.g. "C3"
  trackId: TrackId;
  index: number; // 1..N within the track
  title: Bilingual;
  summary: Bilingual; // one-line hook
  body: Bilingual; // main lesson, markdown + $math$ + code
  keyTerms?: KeyTerm[];
  checks: CheckQuestion[];
  links?: string[]; // related lesson ids across tracks
  papers?: PaperRef[];
}

export interface Track {
  id: TrackId;
  title: Bilingual;
  subtitle: Bilingual;
  blurb: Bilingual;
  focus: Bilingual; // research-direction focus areas
  background: Bilingual; // preferred background
  accent: string; // hex accent color
  lessons: Lesson[];
}
