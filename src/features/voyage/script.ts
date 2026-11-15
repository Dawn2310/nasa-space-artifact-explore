// The Legacy Voyage: guided stories about the machines left on the Moon, on Mars and in deep space.
// Three separate flights (one per world) plus one-stop hops to a single machine, so no flight is long.
// The visitor plays an astronaut flying the pretend UFO "Echo". ECHO (the ship's guide) links the
// stops; each machine speaks in the first person. Every factual sentence is backed by the fact ids
// listed with it (content/facts.json). ECHO's lines without fact ids only connect or explain ideas
// already stated in cited lines, they do not add new facts.

import type { ArtifactId } from '../../shared/contracts';

export type VoyageScene =
  | { kind: 'solar'; focus?: string }
  | { kind: 'map'; body: 'moon' | 'mars'; mission?: string };

export interface VoyageLine {
  speaker: 'echo' | ArtifactId;
  text: string;
  factIds: string[];
}

export type ChapterId = 'moon' | 'mars' | 'deep';

export interface VoyageStop {
  id: string;
  chapter: ChapterId;
  /** Short label for the route map. */
  label: string;
  year?: string;
  scene: VoyageScene;
  artifactId?: ArtifactId;
  /** For machines with no 3D model on the map: show the NASA photo from the catalog. */
  photo?: boolean;
  lines: VoyageLine[];
  /** The "Legacy Spark": what this machine handed on to the explorers after it. */
  spark?: string;
  /** Last stop of a world flight: shows the wall of sparks and "Land the UFO". */
  home?: boolean;
}

export const CHAPTERS: { id: ChapterId; title: string; place: string; blurb: string }[] = [
  { id: 'moon', title: 'Learning to land', place: 'The Moon', blurb: 'From a robot scout to the first Moon car' },
  { id: 'mars', title: 'Learning a new world', place: 'Mars', blurb: 'Pictures, wheels, water, quakes and wings' },
  { id: 'deep', title: 'Going farther than anyone', place: 'Deep space', blurb: 'Asteroids, outer planets and far-off stars' },
];

export const VOYAGE: VoyageStop[] = [
  // ---------------- Moon flight ----------------
  {
    id: 'moon-boarding', chapter: 'moon', label: 'Take off', scene: { kind: 'solar', focus: 'moon' },
    lines: [
      { speaker: 'echo', factIds: [], text: 'Welcome aboard, astronaut! I’m Echo, the guide of this little UFO. Out there, machines that people sent into space still rest where their missions ended.' },
      { speaker: 'echo', factIds: [], text: 'They are silent now, but not forgotten. Each one passed something on to the explorers after it. Let’s fly to the Moon and collect those Legacy Sparks!' },
    ],
  },

  // ---------------- Chapter 1 · The Moon ----------------
  {
    id: 'surveyor-3', chapter: 'moon', label: 'Surveyor 3', year: '1967', artifactId: 'surveyor-3',
    scene: { kind: 'map', body: 'moon', mission: 'surveyor-3' },
    spark: 'Proved the Moon’s ground could hold a lander',
    lines: [
      { speaker: 'echo', factIds: ['sv3-002'], text: 'Before people could land on the Moon, someone had to answer a big question: will the ground hold a heavy spaceship? Small robot landers went first to help the coming Apollo landings.' },
      { speaker: 'surveyor-3', factIds: ['sv3-033', 'sv3-034', 'sv3-035'], text: 'I’m Surveyor 3! In 1967, I dug four trenches and pressed my scoop into the ground. The soil felt a lot like wet sand, and it was solid enough to hold an Apollo lunar module. My answer opened the way!' },
    ],
  },
  {
    id: 'eagle', chapter: 'moon', label: 'Eagle', year: '1969', artifactId: 'apollo-11-eagle-descent-stage',
    scene: { kind: 'map', body: 'moon', mission: 'eagle' },
    spark: 'Carried the first people to land on the Moon',
    lines: [
      { speaker: 'echo', factIds: [], text: 'Two years later, people were ready to trust the ground. Look down there: that golden base is a piece of the most famous landing in history.' },
      { speaker: 'apollo-11-eagle-descent-stage', factIds: ['a11-001', 'a11-004', 'a11-005'], text: 'I’m Eagle’s descent stage. On July 20, 1969, I carried Neil Armstrong and Buzz Aldrin down, the first crewed vehicle to land on the Moon. When it was time to leave, I became their launch pad. The top half flew away, and I stayed behind.' },
    ],
  },
  {
    id: 'apollo12-alsep', chapter: 'moon', label: 'ALSEP', year: '1969', artifactId: 'apollo-12-alsep',
    scene: { kind: 'map', body: 'moon', mission: 'apollo12-alsep' },
    spark: 'Kept science listening after the crew went home',
    lines: [
      { speaker: 'echo', factIds: ['sv3-041', 'sv3-043'], text: 'Here’s a surprise. In November 1969, Apollo 12 landed only about 180 meters from old Surveyor 3! The astronauts walked over and brought its camera home. But they also left something new behind.' },
      { speaker: 'apollo-12-alsep', factIds: ['als-002', 'als-007', 'als-008'], text: 'I’m the Apollo 12 science station. After the astronauts flew home, I kept measuring and sending data to Earth. My seismometer felt the first recorded artificial moonquake, made when their empty ascent stage was crashed into the Moon on purpose. I kept working until 1977.' },
    ],
  },
  {
    id: 'hadley-lrv', chapter: 'moon', label: 'Moon rover', year: '1971', artifactId: 'apollo-15-lrv',
    scene: { kind: 'map', body: 'moon', mission: 'hadley-lrv' },
    spark: 'Gave explorers wheels to go farther',
    lines: [
      { speaker: 'echo', factIds: [], text: 'Landing, then listening. What’s the next big step? Going farther than your feet can carry you!' },
      { speaker: 'apollo-15-lrv', factIds: ['lrv-001', 'lrv-002', 'lrv-005'], text: 'Vroom! I’m the Apollo 15 Moon rover, the first rover used on a Moon mission. Dave Scott and Jim Irwin drove me 27.8 kilometers, so they could explore far from their lander.' },
    ],
  },
  {
    id: 'moon-home', chapter: 'moon', label: 'Home', scene: { kind: 'solar', focus: 'moon' }, home: true,
    lines: [
      { speaker: 'echo', factIds: [], text: 'Look at your Moon Sparks, astronaut. A robot tested the ground, so people could land. People left a station that kept listening, and a car that took them farther.' },
      { speaker: 'echo', factIds: [], text: 'Land safely, keep listening, use wheels: explorers carried all three ideas to Mars. That is our next chapter!' },
    ],
  },

  // ---------------- Mars flight ----------------
  {
    id: 'mars-boarding', chapter: 'mars', label: 'Take off', scene: { kind: 'solar', focus: 'mars' },
    lines: [
      { speaker: 'echo', factIds: [], text: 'Welcome aboard, astronaut! I’m Echo, your guide. Today we fly to Mars, where machines from 1976 to 2021 still rest.' },
      { speaker: 'echo', factIds: [], text: 'Each one learned something new and handed it to the next. Let’s collect their Legacy Sparks!' },
    ],
  },

  // ---------------- Chapter 2 · Mars ----------------
  {
    id: 'insight', chapter: 'mars', label: 'InSight', year: '2018', artifactId: 'insight',
    scene: { kind: 'map', body: 'mars', mission: 'insight' },
    spark: 'Listened to marsquakes to study the inside of Mars',
    lines: [
      { speaker: 'insight', factIds: ['ins-001', 'ins-005'], text: 'Hello, astronaut. I’m InSight. I carried a seismometer called SEIS to measure marsquakes. By listening very carefully, I helped scientists study the deep interior of Mars.' },
    ],
  },
  {
    id: 'viking-1', chapter: 'mars', label: 'Viking 1', year: '1976', artifactId: 'viking-1',
    scene: { kind: 'map', body: 'mars', mission: 'viking-1' },
    spark: 'Took the first photo from the surface of Mars',
    lines: [
      { speaker: 'echo', factIds: ['a11-002', 'vk1-017'], text: 'Mars is much farther away, and no one can walk here yet. Look at the date of the first good landing: July 20, 1976. That’s exactly seven years after Eagle landed on the Moon!' },
      { speaker: 'viking-1', factIds: ['vk1-017', 'vk1-019', 'vk1-033'], text: 'Greetings, astronaut. I’m Viking 1. I made the first truly successful landing on Mars and took the first photograph ever from its surface. Then my robot arm scooped soil into my little laboratory to look for signs of life.' },
    ],
  },
  {
    id: 'viking-2', chapter: 'mars', label: 'Viking 2', year: '1976', artifactId: 'viking-2',
    scene: { kind: 'map', body: 'mars', mission: 'viking-2' },
    spark: 'Found the elements life uses, so the search went on',
    lines: [
      { speaker: 'viking-2', factIds: ['vk2-006', 'vk2-007'], text: 'And I’m Viking 2, the twin. Neither of us found traces of life. But we found the elements that life on Earth needs: carbon, nitrogen, hydrogen, oxygen and phosphorus. I worked for 1,281 Mars days.' },
      { speaker: 'echo', factIds: [], text: 'No life, but a big new question: was Mars once a friendlier place? The next explorers came to find out, on wheels, just like the Moon rover.' },
    ],
  },
  {
    id: 'sojourner', chapter: 'mars', label: 'Sojourner', year: '1997', artifactId: 'sojourner',
    scene: { kind: 'map', body: 'mars', mission: 'sojourner' },
    spark: 'Became the first robot rover on Mars',
    lines: [
      { speaker: 'sojourner', factIds: ['soj-001', 'soj-002', 'soj-005'], text: 'Hi! I’m Sojourner, the first robot rover ever delivered to the surface of Mars. I rode on the Mars Pathfinder lander and arrived on July 4, 1997. I was tiny: only 28 centimeters tall, with six wheels.' },
      { speaker: 'echo', factIds: [], text: 'This time there was no driver on board. A small robot showed that wheels could roll across Mars with people steering from Earth. Bigger wheels were coming.' },
    ],
  },
  {
    id: 'spirit', chapter: 'mars', label: 'Spirit', year: '2004', artifactId: 'spirit',
    scene: { kind: 'map', body: 'mars', mission: 'spirit' },
    spark: 'Found signs that ancient Mars was wetter',
    lines: [
      { speaker: 'spirit', factIds: ['spi-005'], text: 'Hi, astronaut! I’m Spirit. One of my wheels stopped working, but it helped me make a discovery: as it dragged through the soil, it uncovered nearly pure silica. That was a clue that ancient Mars had been much wetter!' },
    ],
  },
  {
    id: 'opportunity', chapter: 'mars', label: 'Opportunity', year: '2004', artifactId: 'opportunity',
    scene: { kind: 'map', body: 'mars', mission: 'opportunity' },
    spark: 'Found rocks that formed in water long ago',
    lines: [
      { speaker: 'echo', factIds: ['opp-025', 'spi-005'], text: 'Twin rovers, Spirit and Opportunity, came to search for clues to past water. Spirit made a discovery by accident: its broken wheel dragged up nearly pure silica, strong evidence that ancient Mars was much wetter.' },
      { speaker: 'opportunity', factIds: ['opp-039', 'opp-036', 'opp-044', 'opp-046'], text: 'I’m Opportunity! I found hematite, a mineral that forms in water, right where I landed. I drove more than a marathon on Mars. My last message reached Earth on June 10, 2018, and NASA declared my mission complete on February 13, 2019.' },
    ],
  },
  {
    id: 'phoenix', chapter: 'mars', label: 'Phoenix', year: '2008', artifactId: 'phoenix',
    scene: { kind: 'map', body: 'mars', mission: 'phoenix' },
    spark: 'Touched real water ice under the ground',
    lines: [
      { speaker: 'echo', factIds: [], text: 'Clues about old water are exciting. But could anyone find water itself? We need to fly north, to the Martian arctic.' },
      { speaker: 'phoenix', factIds: ['phx-002', 'phx-006'], text: 'I’m Phoenix. I landed on the arctic plains of Mars on May 25, 2008. I dug into the soil with my robotic arm and confirmed there is water ice just below the surface!' },
    ],
  },
  {
    id: 'ingenuity', chapter: 'mars', label: 'Ingenuity', year: '2021', artifactId: 'ingenuity',
    scene: { kind: 'map', body: 'mars', mission: 'ingenuity' },
    spark: 'Made the first powered flight on another planet',
    lines: [
      { speaker: 'echo', factIds: [], text: 'Landing, driving, digging, listening. Explorers had done them all on Mars. Only one thing was left: flying!' },
      { speaker: 'ingenuity', factIds: ['ing-002', 'ing-004', 'ing-007'], text: 'Whee, I’m Ingenuity! On April 19, 2021, I made the first powered, controlled flight on another planet. I was built for only five test flights, but I made 72! My final resting place is Valinor Hills.' },
    ],
  },
  {
    id: 'mars-home', chapter: 'mars', label: 'Home', scene: { kind: 'solar', focus: 'mars' }, home: true,
    lines: [
      { speaker: 'echo', factIds: [], text: 'Look at your Mars Sparks, astronaut: the first pictures, the first wheels, rocks from old water, real ice, marsquakes and, at last, wings.' },
      { speaker: 'echo', factIds: [], text: 'Every Mars machine stood on the shoulders of the one before. Next, let’s follow the machines that flew even farther, into deep space!' },
    ],
  },

  // ---------------- Deep space flight ----------------
  {
    id: 'deep-boarding', chapter: 'deep', label: 'Take off', scene: { kind: 'solar' },
    lines: [
      { speaker: 'echo', factIds: [], text: 'Welcome aboard, astronaut! I’m Echo, your guide. Today we leave the big planets behind and visit machines far out in space.' },
      { speaker: 'echo', factIds: [], text: 'Some flew past giant planets, some landed on tiny worlds, and one looked at other stars. Let’s collect their Legacy Sparks!' },
    ],
  },

  // ---------------- Chapter 3 · Deep space ----------------
  {
    id: 'pioneer-10', chapter: 'deep', label: 'Pioneer 10', year: '1972', artifactId: 'pioneer-10',
    scene: { kind: 'solar', focus: 'pioneer-10' },
    spark: 'Opened the road to the outer planets',
    lines: [
      { speaker: 'pioneer-10', factIds: ['p10-001', 'p10-002', 'p10-004'], text: 'I’m Pioneer 10, NASA’s first mission to the outer planets. I was the first spacecraft to fly through the asteroid belt and past Jupiter. In 1983, I became the first human-made object to go beyond the farthest planet.' },
      { speaker: 'echo', factIds: ['p10-005', 'p11-004'], text: 'Pioneer 10 carries a plaque with drawings of a man and a woman and a map of where it came from. Its twin, Pioneer 11, was the first to fly past Saturn.' },
    ],
  },
  {
    id: 'near-shoemaker', chapter: 'deep', label: 'NEAR', year: '2001', artifactId: 'near-shoemaker',
    scene: { kind: 'solar', focus: 'eros' },
    spark: 'First to orbit and touch down on an asteroid',
    lines: [
      { speaker: 'near-shoemaker', factIds: ['nea-004', 'nea-006'], text: 'I’m NEAR Shoemaker. In 2000, I became the first human-made object to orbit an asteroid, named Eros. In 2001, I touched down on it gently, the first spacecraft ever to land on an asteroid.' },
    ],
  },
  {
    id: 'dawn', chapter: 'deep', label: 'Dawn', year: '2015', artifactId: 'dawn',
    scene: { kind: 'solar', focus: 'dawn' },
    spark: 'Explored two worlds in the asteroid belt',
    lines: [
      { speaker: 'dawn', factIds: ['dwn-001', 'dwn-009', 'dwn-008'], text: 'I’m Dawn. I explored two worlds in the asteroid belt: the giant asteroid Vesta and the dwarf planet Ceres. My pictures showed bright salts on Ceres, left when briny water reached the surface. I still circle Ceres today.' },
    ],
  },
  {
    id: 'kepler', chapter: 'deep', label: 'Kepler', year: '2018', artifactId: 'kepler',
    scene: { kind: 'solar', focus: 'kepler' },
    spark: 'Showed that planets around other stars are everywhere',
    lines: [
      { speaker: 'echo', factIds: [], text: 'Our last stop doesn’t visit a world at all. It looks far beyond our Sun.' },
      { speaker: 'kepler', factIds: ['kep-001', 'kep-004', 'kep-008'], text: 'I’m Kepler, NASA’s first planet hunter. I watched for tiny dips in a star’s light when a planet passed in front of it. I left a legacy of more than 2,600 planets found outside our solar system.' },
    ],
  },

  {
    id: 'deep-home', chapter: 'deep', label: 'Home', scene: { kind: 'solar' }, home: true,
    lines: [
      { speaker: 'echo', factIds: [], text: 'Look at your Deep Space Sparks, astronaut: a road to the outer planets, a touchdown on an asteroid, two worlds in the asteroid belt and thousands of far-off planets.' },
      { speaker: 'echo', factIds: [], text: 'These machines are quiet now, but every one of them is a stepping stone. The next step could be yours. Thanks for flying with me!' },
    ],
  },
];

/** A flight is either a whole world (boarding, machines, home) or a one-stop hop to one machine. */
/** The story order of the three flights. */
export function nextChapter(chapter: ChapterId): ChapterId | undefined {
  const index = CHAPTERS.findIndex((item) => item.id === chapter);
  return CHAPTERS[index + 1]?.id;
}

export interface VoyagePlan {
  id: string;
  chapter: ChapterId;
  title: string;
  stops: VoyageStop[];
}

export function worldPlan(chapter: ChapterId): VoyagePlan {
  const info = CHAPTERS.find((item) => item.id === chapter)!;
  return { id: chapter, chapter, title: info.place + ' · ' + info.title, stops: VOYAGE.filter((stop) => stop.chapter === chapter) };
}

export function machinePlan(stopId: string): VoyagePlan | undefined {
  const stop = VOYAGE.find((item) => item.id === stopId && item.spark);
  if (!stop) return undefined;
  const info = CHAPTERS.find((item) => item.id === stop.chapter)!;
  return { id: 'hop:' + stop.id, chapter: stop.chapter, title: info.place + ' · ' + stop.label, stops: [stop] };
}

/** Machines you can hop to on their own, grouped by world. */
export function machinesOf(chapter: ChapterId): VoyageStop[] {
  return VOYAGE.filter((stop) => stop.chapter === chapter && stop.spark);
}
