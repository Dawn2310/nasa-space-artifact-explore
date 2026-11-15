// KIỂU TÍCH HỢP — Lead sở hữu. Bổ sung cho contracts.ts: hình dạng props mà App
// truyền xuống world (3D) và explorer (UI). Thay đổi ghi vào docs/DECISIONS.md.

import type {
  Artifact,
  ArtifactId,
  Asset,
  ChatRequest,
  ChatResponse,
  Fact,
  SceneCallbacks,
  Source,
  ViewState,
} from './contracts';

/** Toàn bộ dữ liệu nội dung mà client cần. `isMock` = true khi đến từ src/shared/mock.ts. */
export interface Catalog {
  artifacts: Artifact[];
  facts: Fact[];
  sources: Source[];
  assets: Asset[];
  isMock: boolean;
}

/** Một hàm duy nhất cho chat: mock adapter và adapter gọi /api/chat cùng kiểu này. */
export type ChatAdapter = (request: ChatRequest) => Promise<ChatResponse>;

/**
 * Legacy Voyage đang chạy (src/features/voyage): cảnh do chuyến bay điều khiển.
 * focus: id thiên thể/tàu để camera solar bám theo; mission: id thiết bị mở thẳng trong bản đồ Mars/Moon.
 */
export interface VoyageTour {
  focus?: string;
  mission?: string;
}

/** A visible, cancellable transfer in the solar scene, before opening a destination. */
export interface SolarFlight {
  id: string;
  targetId: string;
  label: string;
}

/** Props của src/features/world (agent world3d). */
export interface WorldProps {
  view: ViewState;
  catalog: Catalog;
  callbacks: SceneCallbacks;
  tour?: VoyageTour;
  flight?: SolarFlight;
  onFlightArrival?: (id: string) => void;
  onFlightCancel?: () => void;
}

/** Props của src/features/explorer (agent ui-story). */
export interface ExplorerProps {
  view: ViewState;
  catalog: Catalog;
  chat: ChatAdapter;
  callbacks: SceneCallbacks;
  tour?: VoyageTour;
}

// ---- helper tra cứu dùng chung (thuần, không state) ----

export function findArtifact(catalog: Catalog, id: ArtifactId): Artifact | undefined {
  return catalog.artifacts.find((a) => a.id === id);
}

export function findAsset(catalog: Catalog, id: string | null): Asset | undefined {
  if (!id) return undefined;
  return catalog.assets.find((a) => a.id === id);
}

export function factsFor(catalog: Catalog, id: ArtifactId): Fact[] {
  return catalog.facts.filter((f) => f.artifactId === id);
}

export function findSource(catalog: Catalog, id: string): Source | undefined {
  return catalog.sources.find((s) => s.id === id);
}

/** URL công khai của một asset (localPath nằm dưới public/assets/). */
export function assetUrl(asset: Asset): string {
  return `/assets/${asset.localPath}`;
}

/** Tầng mà nút Back của một hiện vật quay về. Deep-space luôn về solar. */
export function returnTargetFor(artifact: Artifact): { level: 'solar' } | { level: 'surface'; body: 'moon' | 'mars' } {
  return artifact.body === 'deep-space' ? { level: 'solar' } : { level: 'surface', body: artifact.body };
}
