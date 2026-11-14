// Catalog THẬT: gộp content/*.json (nasa-research) với intro + câu gợi ý (ui-story).
// Dữ liệu được đóng gói lúc build; không gọi mạng. Mọi fact giữ nguyên reviewStatus
// từ file: UI hiện nhãn "Awaiting review" cho fact còn "pending".

import type { Artifact, Asset, Fact, Source } from './contracts';
import type { Catalog } from './app-types';
import catalogJson from '../../content/catalog.json';
import factsJson from '../../content/facts.json';
import sourcesJson from '../../content/sources.json';
import assetsJson from '../../content/assets.json';
import storyJson from '../../prompts/personas/catalog-story.json';

interface StoryEntry {
  intro: string;
  suggestedQuestions: string[];
}

const story = (storyJson as unknown as { artifacts: Record<string, StoryEntry | undefined> }).artifacts;
const rawArtifacts = (catalogJson as unknown as { artifacts: Artifact[] }).artifacts;
const facts = factsJson as unknown as Fact[];
const sources = sourcesJson as unknown as Source[];
const assets = (assetsJson as unknown as { assets: Asset[] }).assets;

const assetIds = new Set(assets.map((a) => a.id));
const factIds = new Set(facts.map((f) => f.id));

const artifacts: Artifact[] = rawArtifacts.map((artifact) => {
  const text = story[artifact.id];
  return {
    ...artifact,
    // Lời của ui-story chỉ điền vào chỗ research để trống.
    intro: artifact.intro || text?.intro || '',
    suggestedQuestions: artifact.suggestedQuestions.length > 0 ? artifact.suggestedQuestions : (text?.suggestedQuestions ?? []),
    // Tham chiếu hỏng thì bỏ, không để viewer tải đường dẫn không tồn tại.
    factIds: artifact.factIds.filter((id) => factIds.has(id)),
    imageAssetId: artifact.imageAssetId && assetIds.has(artifact.imageAssetId) ? artifact.imageAssetId : null,
    modelAssetId: artifact.modelAssetId && assetIds.has(artifact.modelAssetId) ? artifact.modelAssetId : null,
  };
});

export const realCatalog: Catalog = {
  artifacts,
  facts,
  sources,
  assets,
  isMock: false,
};
