// HỢP ĐỒNG DÙNG CHUNG — chỉ Lead được sửa, mọi thay đổi ghi vào docs/DECISIONS.md

export type Body = 'moon' | 'mars' | 'deep-space';

export type ArtifactId =
  // Moon (4)
  | 'surveyor-3'
  | 'apollo-11-eagle-descent-stage'
  | 'apollo-15-lrv'
  | 'apollo-12-alsep'
  // Mars (8)
  | 'sojourner'
  | 'spirit'
  | 'opportunity'
  | 'viking-1'
  | 'viking-2'
  | 'phoenix'
  | 'insight'
  | 'ingenuity'
  // Deep space (5)
  | 'dawn'
  | 'near-shoemaker'
  | 'pioneer-10'
  | 'pioneer-11'
  | 'kepler';

export type ViewState =
  | { level: 'solar' }
  | { level: 'surface'; body: 'moon' | 'mars' }
  | {
      level: 'artifact';
      artifactId: ArtifactId;
      returnTo: { level: 'solar' } | { level: 'surface'; body: 'moon' | 'mars' };
    };

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string; // "NASA NSSDCA", "NASA Science", "NASA/JPL", ...
  accessedAt: string; // ISO date
  locator: string; // chỗ tìm lại trên trang: tên mục, đoạn, bảng
}

export interface Fact {
  id: string; // ví dụ "opp-017"
  artifactId: ArtifactId;
  text: string; // tiếng Anh, một ý, tự đứng được
  sourceIds: string[]; // >= 1
  tags: string[]; // 'launch' | 'journey' | 'landing' | 'instruments' | 'discovery' | 'incident' | 'end' | 'legacy'
  date: string | null; // ISO date của sự kiện, null nếu không gắn ngày
  imageAssetId: string | null; // bưu thiếp kèm dữ kiện, nếu có
  reviewStatus: 'pending' | 'approved'; // CHỈ người thật chuyển sang approved
}

export interface SurfaceLocation {
  kind: 'landing' | 'final-resting' | 'deployment';
  latitudeDeg: number;
  longitudeDeg: number;
  convention: string; // ghi đúng quy ước của NGUỒN, ví dụ 'planetocentric, east-positive, 0-360'
  sourceIds: string[];
  label: string; // "Chryse Planitia", "Valinor Hills", ...
}

export interface Artifact {
  id: ArtifactId;
  name: string;
  body: Body;
  mode: 'card' | 'chat';
  intro: string; // 2-3 câu tự giới thiệu, giọng nhân vật, tiếng Anh
  suggestedQuestions: string[]; // 3 câu gợi ý
  locations: SurfaceLocation[]; // rỗng với deep-space
  markerLocationIndex: number | null; // location nào dùng để vẽ marker
  displayYears: string; // "1976–1982"
  memoryCutoff: string | null; // ISO date robot mất liên lạc; null nếu còn liên hệ kiểu khác
  factIds: string[];
  imageAssetId: string | null;
  modelAssetId: string | null; // null => viewer dùng ảnh fallback
}

export interface Asset {
  id: string;
  localPath: string; // dưới public/assets/
  sourceUrl: string;
  creatorCredit: string;
  usageNotes: string;
  verifiedAvailability: boolean; // người thật đã tải thử và mở được
  format: 'glb' | 'jpg' | 'png' | 'json';
  fileSizeBytes: number | null;
  represents: string; // mô tả nó là gì, phân biệt "nguyên tàu" vs "tầng hạ cánh"
  fallbackAssetId: string | null;
}

export interface ChatRequest {
  artifactId: ArtifactId;
  message: string; // server cắt tại 500 ký tự
  history: { role: 'user' | 'assistant'; content: string }[]; // server giữ tối đa 8 lượt cuối
}

export interface ChatResponse {
  answer: string;
  evidence: { factId: string; sourceIds: string[] }[];
  status: 'grounded' | 'insufficient-evidence' | 'unavailable';
  mocked: boolean; // true khi LLM_PROVIDER=mock, UI phải hiện nhãn
}

// Sự kiện từ scene 3D lên App — 3D và UI không tự tạo hệ điều hướng riêng
export interface SceneCallbacks {
  onSelectBody: (body: 'moon' | 'mars') => void;
  onSelectArtifact: (artifactId: ArtifactId) => void;
  onBack: () => void;
}
