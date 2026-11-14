// MOCK — dữ liệu giả ĐÚNG HỢP ĐỒNG để world3d và ui-story làm việc trước khi
// nasa-research bàn giao content/catalog.json + facts.json + sources.json.
//
// KHÔNG phải dữ kiện đã kiểm chứng. Mọi fact ở đây mang reviewStatus "pending",
// trỏ tới nguồn giả "mock-src" và có tiền tố [MOCK]. Tọa độ là xấp xỉ để thử
// marker, KHÔNG được chép sang nội dung thật. Hai mốc ngày của Opportunity lấy
// từ mục "Sự thật khoa học bắt buộc" trong CLAUDE.md.

import type { Artifact, Asset, ChatRequest, ChatResponse, Fact, Source } from './contracts';
import type { Catalog, ChatAdapter } from './app-types';

const MOCK_SOURCE: Source = {
  id: 'mock-src',
  title: '[MOCK] Placeholder source: not a real citation',
  url: 'https://science.nasa.gov/',
  publisher: 'MOCK',
  accessedAt: '2026-11-14',
  locator: 'none (mock data)',
};

const artifacts: Artifact[] = [
  {
    id: 'opportunity',
    name: 'Opportunity (MER-B)',
    body: 'mars',
    mode: 'chat',
    intro:
      '[MOCK] Hello, night-shift operator. I am the Opportunity rover character. My signal is weak, but I still have stories from Mars.',
    suggestedQuestions: ['Where did you land?', 'When did you go quiet?', 'What did you look for on Mars?'],
    locations: [
      {
        kind: 'landing',
        latitudeDeg: -1.95,
        longitudeDeg: 354.47,
        convention: 'MOCK approx; planetocentric, east-positive, 0-360',
        sourceIds: ['mock-src'],
        label: 'Meridiani Planum (mock position)',
      },
    ],
    markerLocationIndex: 0,
    displayYears: '2004–2018 (mission declared complete 2019)',
    memoryCutoff: '2018-06-10',
    factIds: ['mock-opp-001', 'mock-opp-002', 'mock-opp-003'],
    imageAssetId: null,
    modelAssetId: 'model-mer-opportunity',
  },
  {
    id: 'surveyor-3',
    name: 'Surveyor 3',
    body: 'moon',
    mode: 'chat',
    intro:
      '[MOCK] Operator, this is the Surveyor 3 character calling from the Moon. I have been sitting here quietly for a long time.',
    suggestedQuestions: ['What was your job on the Moon?', 'Who came to visit you?', 'How did you land?'],
    locations: [
      {
        kind: 'landing',
        latitudeDeg: -3.0,
        longitudeDeg: -23.4,
        convention: 'MOCK approx; planetocentric, east-positive, -180..180',
        sourceIds: ['mock-src'],
        label: 'Oceanus Procellarum (mock position)',
      },
    ],
    markerLocationIndex: 0,
    displayYears: '1967–',
    memoryCutoff: null,
    factIds: ['mock-sur-001', 'mock-sur-002'],
    imageAssetId: null,
    modelAssetId: null, // không có model chính thức => viewer dùng ảnh fallback
  },
  {
    id: 'pioneer-10',
    name: 'Pioneer 10',
    body: 'deep-space',
    mode: 'card',
    intro: '[MOCK] I am the Pioneer 10 character. I am far, far away and still travelling outward.',
    suggestedQuestions: ['Where are you going?', 'Which planet did you fly past?', 'When did we last hear you?'],
    locations: [],
    markerLocationIndex: null,
    displayYears: '1972–2003',
    memoryCutoff: '2003-01-23',
    factIds: ['mock-p10-001', 'mock-p10-002'],
    imageAssetId: null,
    modelAssetId: 'model-pioneer-10',
  },
];

function mockFact(id: string, artifactId: Fact['artifactId'], text: string, tags: string[], date: string | null): Fact {
  return {
    id,
    artifactId,
    text: `[MOCK] ${text}`,
    sourceIds: ['mock-src'],
    tags,
    date,
    imageAssetId: null,
    reviewStatus: 'pending',
  };
}

const facts: Fact[] = [
  mockFact('mock-opp-001', 'opportunity', 'Opportunity was a NASA rover that explored the surface of Mars.', ['journey'], null),
  mockFact('mock-opp-002', 'opportunity', 'The last contact with Opportunity was on June 10, 2018.', ['end'], '2018-06-10'),
  mockFact(
    'mock-opp-003',
    'opportunity',
    'NASA declared the Opportunity mission complete on February 13, 2019.',
    ['end'],
    '2019-02-13',
  ),
  mockFact('mock-sur-001', 'surveyor-3', 'Surveyor 3 was a robotic lander on the Moon.', ['landing'], null),
  mockFact('mock-sur-002', 'surveyor-3', 'Placeholder fact: replaced when research delivers real data.', ['legacy'], null),
  mockFact('mock-p10-001', 'pioneer-10', 'Pioneer 10 is leaving the solar system. It is not at Mars.', ['journey'], null),
  mockFact('mock-p10-002', 'pioneer-10', 'Placeholder fact: replaced when research delivers real data.', ['legacy'], null),
];

// Hai asset thật (đường dẫn, kích thước chép từ content/assets.json) để viewer thử tải GLB.
const assets: Asset[] = [
  {
    id: 'model-mer-opportunity',
    localPath: 'models/mer-opportunity.glb',
    sourceUrl:
      'https://github.com/nasa/NASA-3D-Resources/blob/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29.glb',
    creatorCredit: 'NASA (NASA 3D Resources)',
    usageNotes: 'Unmodified file from the official nasa/NASA-3D-Resources repository.',
    verifiedAvailability: true,
    format: 'glb',
    fileSizeBytes: 36668,
    represents: 'Mars Exploration Rover Opportunity (MER-B). Very low-detail model.',
    fallbackAssetId: null,
  },
  {
    id: 'model-pioneer-10',
    localPath: 'models/pioneer-10.glb',
    sourceUrl:
      'https://github.com/nasa/NASA-3D-Resources/blob/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Pioneer%2010/Pioneer%2010.glb',
    creatorCredit: 'NASA (NASA 3D Resources)',
    usageNotes: 'Unmodified file from the official nasa/NASA-3D-Resources repository.',
    verifiedAvailability: true,
    format: 'glb',
    fileSizeBytes: 2049840,
    represents: 'Pioneer 10 spacecraft.',
    fallbackAssetId: null,
  },
];

export const mockCatalog: Catalog = {
  artifacts,
  facts,
  sources: [MOCK_SOURCE],
  assets,
  isMock: true,
};

const MOCK_DELAY_MS = 600;

/**
 * Chat adapter giả, chạy trong trình duyệt, không gọi mạng. Trả một fact của đúng hiện vật có từ
 * khóa trùng câu hỏi (status "grounded"), ngược lại trả "insufficient-evidence".
 * Luôn đặt mocked=true để UI hiện nhãn. Không lọc memoryCutoff, không kiểm chứng: chỉ để thử UI.
 */
export function createMockChatAdapter(source: Fact[]): ChatAdapter {
  return async (request: ChatRequest): Promise<ChatResponse> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

    const words = request.message
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3);
    const own = source.filter((f) => f.artifactId === request.artifactId);
    const hit = own.find((f) => words.some((w) => f.text.toLowerCase().includes(w)));

    if (!hit) {
      return {
        answer: '[MOCK] I do not have a memory about that yet. Try asking me about my mission.',
        evidence: [],
        status: 'insufficient-evidence',
        mocked: true,
      };
    }
    return {
      answer: hit.text,
      evidence: [{ factId: hit.id, sourceIds: hit.sourceIds }],
      status: 'grounded',
      mocked: true,
    };
  };
}

export const mockChatAdapter: ChatAdapter = createMockChatAdapter(facts);
