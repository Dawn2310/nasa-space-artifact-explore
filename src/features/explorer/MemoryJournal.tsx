import type { Artifact, Fact } from '../../shared/contracts';
import { factsFor } from '../../shared/app-types';
import type { Catalog } from '../../shared/app-types';
import FactCard from './FactCard';
import type { ChatSession } from './session';
import { farewellFor, farewellThreshold } from './storyText';

interface MemoryJournalProps {
  catalog: Catalog;
  artifact: Artifact;
  session: ChatSession;
  onOpenFarewell: () => void;
}

/** Facts the child unlocked by asking questions, plus the written farewell. */
export default function MemoryJournal({ catalog, artifact, session, onOpenFarewell }: MemoryJournalProps) {
  const total = factsFor(catalog, artifact.id).length;
  const unlocked: Fact[] = [];
  for (const factId of session.unlockedFactIds) {
    const fact = catalog.facts.find((f) => f.id === factId);
    if (fact) unlocked.push(fact);
  }
  const threshold = farewellThreshold(total);
  const reached = unlocked.length >= threshold;
  const showFarewell = reached || session.farewellOpened;

  return (
    <div className="xp-journal">
      <p className="xp-text" role="status">
        <strong>
          {unlocked.length} of {total} memories recorded.
        </strong>{' '}
        {reached
          ? 'You recorded enough to hear the final farewell.'
          : `Each answer in the chat that uses a fact card saves that card here. Record ${threshold} to hear the final farewell.`}
      </p>

      {unlocked.length === 0 && <p className="xp-note">Your journal is empty. Ask the character a question to start.</p>}
      <div className="xp-facts">
        {unlocked.map((fact) => (
          <FactCard key={fact.id} catalog={catalog} fact={fact} />
        ))}
      </div>

      {showFarewell ? (
        <section className="xp-block xp-farewell" aria-label="Final farewell">
          <h3 className="xp-h3">Final farewell</h3>
          <div className="xp-tags">
            <span className="xp-tag xp-tag--ai">AI character</span>
            <span className="xp-tag">Written farewell, not a real transmission</span>
          </div>
          <p className="xp-intro__text">{farewellFor(artifact)}</p>
        </section>
      ) : (
        <button type="button" className="xp-btn" onClick={onOpenFarewell}>
          Say goodbye now
        </button>
      )}
    </div>
  );
}
