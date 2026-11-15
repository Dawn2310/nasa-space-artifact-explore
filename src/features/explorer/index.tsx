// ExplorerShell (agent ui-story). Overlay UI on top of the full-screen 3D canvas.
// App owns ViewState: this file only reads `view` and navigates through `callbacks`.
// All content comes from `catalog`; chat goes through the `chat` adapter.

import { useCallback, useState } from 'react';
import type { Artifact, ArtifactId, ChatRequest, ViewState } from '../../shared/contracts';
import { findArtifact } from '../../shared/app-types';
import type { ExplorerProps } from '../../shared/app-types';
import Storyteller from './Storyteller';
import Guidance from './Guidance';
import MarsMissionsFrame from './MarsMissionsFrame';
import PassportButton from '../rewards/PassportButton';
import { appendNarrative, buildNarrative } from './narrative';
import { EMPTY_SESSION, MAX_MESSAGE_LENGTH, historyFor, historyForRetry, patchSession } from './session';
import type { Sessions } from './session';
import { APP_TITLE, BODY_NAMES } from './storyText';
import './explorer.css';


function parentName(target: { level: 'solar' } | { level: 'surface'; body: 'moon' | 'mars' }): string {
  return target.level === 'solar' ? 'Solar system' : BODY_NAMES[target.body];
}

function breadcrumb(view: ViewState, artifact: Artifact | undefined): string[] {
  if (view.level === 'solar') return ['Solar system'];
  if (view.level === 'surface') return ['Solar system', BODY_NAMES[view.body]];
  const crumbs = ['Solar system'];
  if (view.returnTo.level === 'surface') crumbs.push(BODY_NAMES[view.returnTo.body]);
  crumbs.push(artifact ? artifact.name : 'Unknown signal');
  return crumbs;
}

function backLabel(view: ViewState): string {
  if (view.level === 'artifact') return `Back to ${parentName(view.returnTo)}`;
  return 'Back to Solar system';
}

export default function Explorer({ view, catalog, chat, callbacks, tour }: ExplorerProps) {
  const [sessions, setSessions] = useState<Sessions>({});
  // Sao Hỏa và Mặt Trăng: bản đồ nhiệm vụ (iframe) tự lo mô hình, hoạt cảnh và chat kể chuyện.

  const artifact = view.level === 'artifact' ? findArtifact(catalog, view.artifactId) : undefined;
  const missionMap = view.level === 'surface' ? view.body : artifact?.body === 'mars' ? 'mars' : null;
  const crumbs = breadcrumb(view, artifact);

  const ask = useCallback(
    (artifactId: ArtifactId, rawQuestion: string, history: ChatRequest['history'], isRetry: boolean) => {
      const question = rawQuestion.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!question) return;

      setSessions((current) =>
        patchSession(current, artifactId, (session) => ({
          ...session,
          messages: isRetry ? session.messages : [...session.messages, { role: 'user', text: question }],
          pending: true,
          failure: null,
        })),
      );

      // Promise.resolve().then(...) also catches an adapter that throws before returning a promise.
      Promise.resolve()
        .then(() => chat({ artifactId, message: question, history }))
        .then((response) => {
          setSessions((current) =>
            patchSession(current, artifactId, (session) => {
              if (response.status === 'unavailable') {
                return {
                  ...session,
                  pending: false,
                  failure: { kind: 'unavailable', question, serverText: response.answer, mocked: response.mocked },
                };
              }
              const unlocked = [...session.unlockedFactIds];
              if (response.status === 'grounded') {
                for (const item of response.evidence) {
                  const known = catalog.facts.some((f) => f.id === item.factId && f.artifactId === artifactId);
                  if (known && !unlocked.includes(item.factId)) unlocked.push(item.factId);
                }
              }
              return {
                ...session,
                pending: false,
                failure: null,
                unlockedFactIds: unlocked,
                messages: [
                  ...session.messages,
                  {
                    role: 'assistant',
                    text: response.answer,
                    status: response.status,
                    evidence: response.evidence,
                    mocked: response.mocked,
                  },
                ],
              };
            }),
          );
        })
        .catch(() => {
          setSessions((current) =>
            patchSession(current, artifactId, (session) => ({
              ...session,
              pending: false,
              failure: { kind: 'network', question, serverText: '', mocked: false },
            })),
          );
        });
    },
    [chat, catalog],
  );

  const session = (artifact && sessions[artifact.id]) ?? EMPTY_SESSION;

  return (
    <div className="xp">
      <header className="xp-bar">
        <div className="xp-bar__brand">
          <h1 className="xp-bar__title">{APP_TITLE}</h1>
        </div>
        <nav className="xp-bar__crumbs" aria-label="You are here">
          <ol>
            {crumbs.map((crumb, index) => (
              <li key={`${index}-${crumb}`} aria-current={index === crumbs.length - 1 ? 'page' : undefined}>
                {crumb}
              </li>
            ))}
          </ol>
        </nav>
        <div className="xp-bar__actions">
          <PassportButton />
          {catalog.isMock && <span className="xp-tag xp-tag--warn">Demo data</span>}
          {view.level !== 'solar' && (
            <button type="button" className="xp-btn xp-btn--primary" onClick={callbacks.onBack}>
              <span aria-hidden="true">← </span>
              {backLabel(view)}
            </button>
          )}
        </div>
      </header>

      <div className="xp-stage">
        {missionMap && <MarsMissionsFrame body={missionMap} tour={tour} initialMissionId={artifact?.body === 'mars' ? artifact.id : undefined} />}
        {view.level === 'solar' && !tour && <Guidance view={view} catalog={catalog} callbacks={callbacks} />}

        {view.level === 'artifact' && artifact && !missionMap && (
          <Storyteller
            key={artifact.id}
            catalog={catalog}
            artifact={artifact}
            session={session}
            onAsk={(question) => ask(artifact.id, question, historyFor(session.messages), false)}
            onRetry={() => {
              if (session.failure) ask(artifact.id, session.failure.question, historyForRetry(session.messages), true);
            }}
            onStory={(expectedCursor) => setSessions((current) => patchSession(current, artifact.id, (value) =>
              appendNarrative(value, expectedCursor, buildNarrative(artifact, catalog.facts,
                new Set(catalog.sources.map((source) => source.id))), catalog.facts)))}
          />
        )}

        {view.level === 'artifact' && !artifact && (
          <section className="xp-panel" aria-label="Unknown signal">
            <div className="xp-panel__body">
              <h2 className="xp-panel__title">Signal not found</h2>
              <p className="xp-text">This machine is not in our catalog, so there is nothing to show.</p>
              <button type="button" className="xp-btn xp-btn--primary" onClick={callbacks.onBack}>
                {backLabel(view)}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
