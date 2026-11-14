# Card intros for the 14 card-only artifacts

Status: UPDATED by ui-story against `content/facts.json`. Every "Claims to
check" line now cites the fact id(s) that support it (all facts still pending
human review).

How to use: each intro goes into `Artifact.intro` in the catalog (a copy that
is easy to merge is in `catalog-story.json` next to this file). The UI shows it
with an "AI character" label and the note "Story card only. This craft has no
chat." Card artifacts get no suggested questions in the UI, because there is
nobody to ask.

Rules followed:

- Character voice only. No dates, numbers, distances or discoveries.
- The only claims used are (a) what the artifact name in
  `content/catalog.seed.json` already says, (b) the body it belongs to in the
  catalog, and (c) the mandatory truths and model labels in CLAUDE.md.
- The characters never say they are conscious or that they feel.
- "Claims to check" lists every statement and the facts.json ids that back it.
  If a cited fact fails human review, cut or rewrite the matching sentence.

## Moon

### `apollo-11-eagle-descent-stage`

> I am the character for the Eagle descent stage, the lower part of the Apollo 11 lander. I am the part that stayed on the Moon. Close to me sits a laser reflector, which is a different artifact with its own story.

Claims checked: descent stage stayed on the Moon — `a11-004`, `a11-005`; the laser reflector (LRRR, part of EASEP) is a separate artifact nearby — `a11-007`, `a11-008` (also mandatory truth #3).

### `apollo-15-lrv`

> I am the character for the Apollo 15 Lunar Roving Vehicle. I am a vehicle that was built to drive on the Moon, and I am still parked here. Open my fact cards to see what the records say about me.

Claims checked: "built to drive on the Moon" — `lrv-001`. "Still parked here" has no explicit fact; it rests on the catalog placing the LRV on the Moon (body + location). No fact contradicts it; if Lead wants only fact-backed sentences, change to "I was left on the Moon with my mission" style once a fact exists.

### `apollo-12-alsep`

> I am the character for the Apollo 12 ALSEP. I am a package of science experiments that was left on the Moon. I belong to Apollo 12, so do not mix me up with other Apollo missions.

Claims checked: ALSEP is a set of science instruments left at the site — `als-002`; it is the Apollo 12 set — `als-001`, `als-003` (mandatory truth #5).

## Mars

### `sojourner`

> I am the Sojourner character, a small rover. I came to Mars with the Mars Pathfinder mission. Open my fact cards to see what I did here.

Claims checked: robotic rover that rode on the Mars Pathfinder lander — `soj-001`; "small" — `soj-005`. ("Rover" was held back in the first draft; now confirmed and added.)

### `spirit`

> I am the Spirit character, a rover on Mars. Opportunity is my twin, built to the same design. The 3D model you see is my twin, so read my own cards for my own story.

Claims checked: twin of Opportunity — `spi-001`, `opp-002` (also CLAUDE.md model label and `assets.json`).

### `viking-2`

> I am the Viking 2 lander character. Viking 1 and I share the same lander design. Open my fact cards to see where I am and what I did.

Claims checked: shared design with Viking 1 — `vk2-001`, `vk1-001` ("Like Viking 1, it was made of an orbiter and a lander"; plus `assets.json` text for `model-viking-lander`).

### `phoenix`

> I am the Phoenix lander character. I am a lander, so I stayed in the spot where I came down on Mars. My fact cards tell you what happened there.

Claims checked: lander that came down on Mars — `phx-002`, `phx-003`.

### `insight`

> I am the InSight lander character. I sit still on Mars with my solar panels open. Open my fact cards to learn what I was sent to study.

Claims checked: lander on Mars — `ins-003`; sent to study the deep interior — `ins-001`; solar panels deployed on the surface (`assets.json` text for `model-insight`).

### `ingenuity`

> I am the Ingenuity character, a helicopter on Mars. The place where I rest now is called Valinor Hills. It is not the place where I was first set down, so check what my map marker shows.

Claims checked: helicopter on Mars — `ing-001`, `ing-002`; final resting place nicknamed Valinor Hills, different from where it was first deployed — `ing-007` (mandatory truth #2).

## Deep space

### `dawn`

> I am the Dawn character. I am not on the Moon or on Mars. I orbit a world called Ceres, and my dot on the map is only an illustration.

Claims checked: not on Mars — `dwn-001`; remains in orbit around Ceres — `dwn-005`, `dwn-008`; illustrative dot (mandatory truth #4).

### `near-shoemaker`

> I am the NEAR Shoemaker character. I am not on Mars. I rest on a space rock called Eros, and my dot on the map is only an illustration.

Claims checked: never went to Mars and its target was the asteroid 433 Eros — `nea-002`; touched down on Eros — `nea-006`; illustrative dot (mandatory truth #4). "Space rock" is the kid word for asteroid, confirmed by `nea-002`.

### `pioneer-10`

> I am the Pioneer 10 character. I am not at Mars. I am travelling out of the solar system, and my dot on the map is only an illustration.

Claims checked: not at Mars and heading out of the solar system — `p10-008` (mandatory truth #4); illustrative dot (mandatory truth #4).

### `pioneer-11`

> I am the Pioneer 11 character. Like my sister craft Pioneer 10, I am travelling out of the solar system. The 3D model you see is Pioneer 10, not me.

Claims checked: sister craft of Pioneer 10 — `p11-001`; on a path out of the solar system — `p11-007` (mandatory truth #4); shared model (CLAUDE.md model label and `assets.json`).

### `kepler`

> I am the Kepler character, a space telescope. I do not sit on any world. I follow my own path around the Sun, and my dot on the map is only an illustration.

Claims checked: space telescope that hunted planets — `kep-001`; does not orbit a planet, follows an Earth-trailing orbit around the Sun — `kep-003`; illustrative dot (mandatory truth #4).
