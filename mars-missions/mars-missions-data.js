export const modelDimensions = {
  'sojourner-dan.glb': {
    meters: .63,
    framing: .29,
    label: 'Length about 63 cm',
    source: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=MESURPR',
  },
  'ingenuity.glb': {
    meters: 1.2,
    label: 'Rotor diameter 1.2 m · Height about 0.49 m',
    source: 'https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/quick_facts/',
  },
  'mer-articulated.glb': {
    meters: 2.3,
    label: 'Length 1.6 m · Width 2.3 m · Height 1.5 m',
    source: 'https://mars.nasa.gov/internal_resources/823/',
  },
  'insight-deployed.glb': {
    meters: 6,
    label: 'Solar array span 6 m · Deck height 0.83–1.08 m',
    source: 'https://science.nasa.gov/mission/insight/spacecraft/',
  },
  'viking.glb': {
    meters: 3,
    label: 'Width about 3 m · Height about 2 m',
    source: 'https://science.nasa.gov/wp-content/uploads/2023/09/viking-encounter-press-kit.pdf',
  },
};

// type: 'Helicopter' | 'Rover' | 'Lander' (mars-mission-replay.js branches on these values).
export const missions = [
  {
    id: 'insight', name: 'InSight', type: 'Lander', site: 'Elysium Planitia',
    lat: 4.5, lon: 135.9, location: 'Landing site',
    model: 'insight-deployed.glb', credit: 'NASA VTAD · Science instruments: NASA / Brian E. Kumanchik',
    source: 'https://science.nasa.gov/mission/insight/',
    summary: 'InSight used a seismometer to record marsquakes, helping scientists learn what the inside of Mars is like.',
    timeline: [
      ['November 26, 2018', 'InSight landed on Elysium Planitia with its two solar panels still folded.'],
      ['November 26, 2018', 'After the dust settled, the two panels opened to make power. The robotic arm stayed folded away.', 'https://www.jpl.nasa.gov/news/press_kits/insight/launch/mission/'],
      ['December 2018–February 2019', 'The robotic arm placed SEIS on the ground, covered it with the wind and thermal shield, then placed the HP³ heat probe beside it. These three deployments are shown together at an illustrative speed.', 'https://www.jpl.nasa.gov/news/press_kits/insight/landing/mission/spacecraft/'],
      ['2022', 'Dust on the panels cut its power. NASA ended the mission in December.'],
    ],
  },
  {
    id: 'ingenuity', name: 'Ingenuity', type: 'Helicopter', site: 'Valinor Hills · Jezero Crater',
    lat: 18.45, lon: 77.4, location: 'Area near its final resting place (not its deployment site)',
    model: 'ingenuity.glb', credit: 'NASA / Brian E. Kumanchik',
    source: 'https://science.nasa.gov/blog/farewell-to-our-flying-friend-and-closing-in-on-the-crater-rim/',
    summary: 'Ingenuity showed that an aircraft can take off under control in the thin air of Mars. After that, it helped Perseverance scout the terrain from above.',
    timeline: [['2021', 'Arrived at Jezero Crater with the Perseverance rover.'], ['April 19, 2021', 'Made the first powered flight on another planet.'], ['January 18, 2024', 'Its rotor blades were damaged when it landed after flight 72 at Valinor Hills.']],
  },
  {
    id: 'opportunity', name: 'Opportunity', type: 'Rover', site: 'Perseverance Valley · Meridiani Planum',
    lat: -2.0, lon: -5.4, location: 'Area near its final resting place',
    model: 'mer-articulated.glb', credit: 'NASA/JPL-Caltech',
    source: 'https://science.nasa.gov/mission/mer-opportunity/',
    summary: 'Opportunity studied rocks and soil and found evidence of liquid water in the past. The rover drove more than 45 km in almost 15 years of work.',
    timeline: [['2004', 'Landed in Eagle Crater on Meridiani Planum.'], ['2011', 'Reached Endeavour Crater and kept studying its rock layers.'], ['2018–2019', 'Last contact came from Perseverance Valley on June 10, 2018, during a global dust storm. NASA declared the mission over on February 13, 2019.']],
  },
  {
    id: 'spirit', name: 'Spirit', type: 'Rover', site: 'Troy · Gusev Crater',
    lat: -14.6, lon: 175.5, location: 'Area near its final resting place',
    model: 'mer-articulated.glb', credit: 'NASA/JPL-Caltech',
    source: 'https://science.nasa.gov/mission/mer-spirit/',
    summary: 'Spirit studied rocks and soil in Gusev Crater and found clues that Mars was once wetter.',
    timeline: [['2004', 'Landed in Gusev Crater and began exploring.'], ['2009', 'Got stuck in soft ground at Troy.'], ['2010–2011', 'Sent its last signal in 2010. NASA ended its attempts to make contact in 2011.']],
  },
  {
    id: 'viking-1', name: 'Viking 1', type: 'Lander', site: 'Chryse Planitia',
    lat: 22.5, lon: -48.0, location: 'Landing site',
    model: 'viking.glb', credit: 'NASA / Michael Carbajal',
    source: 'https://science.nasa.gov/mission/viking-1/',
    summary: 'Viking 1 sent pictures from the surface, tracked the weather and tested soil for signs of life. Its experiments gave no clear evidence of life.',
    timeline: [['July 20, 1976', 'Landed on Chryse Planitia.'], ['July 28, 1976', 'The sampler arm pushed its scoop into the ground, then lifted it. The soil went to the laboratory inside the lander.', 'https://science.nasa.gov/mission/viking-1/'], ['1982', 'Contact ended after more than six years on the surface.']],
  },
  {
    id: 'viking-2', name: 'Viking 2', type: 'Lander', site: 'Utopia Planitia',
    lat: 47.64, lon: 134.29, location: 'Landing site',
    model: 'viking.glb', credit: 'NASA / Michael Carbajal',
    source: 'https://science.nasa.gov/mission/viking-2/',
    summary: 'Viking 2 had the same design as Viking 1. It took pictures, studied the weather and tested soil at a different place on Mars.',
    timeline: [['September 3, 1976', 'Landed on Utopia Planitia.'], ['1976', 'The sampler arm dug a small trench between rocks to collect soil for tests.', 'https://www.jpl.nasa.gov/images/pia00145-surface-sampler-arm-acquiring-sample/'], ['1980', 'The lander’s operations ended.']],
  },
  {
    id: 'sojourner', name: 'Sojourner', type: 'Rover', site: 'Ares Vallis · Sagan Memorial Station',
    lat: 19.33, lon: -33.55, location: 'Pathfinder landing-site area; the rover stayed near the lander',
    model: 'sojourner-dan.glb', credit: 'Dan · CC BY 4.0 · Community model, not NASA; wheels articulated for this illustration',
    modelReference: 'https://sketchfab.com/3d-models/mars-sojourner-rover-model-8b3810e7cd804bd6b0009520c67984c6',
    modelLicense: 'https://creativecommons.org/licenses/by/4.0/',
    source: 'https://science.nasa.gov/mission/mars-pathfinder/',
    summary: 'Sojourner was the first rover to explore Mars. It traveled with Mars Pathfinder and studied rocks and soil near the lander.',
    timeline: [['July 1997', 'Rolled off Pathfinder and began exploring Ares Vallis.'], ['Sol 3', 'Investigated Barnacle Bill with its APXS instrument.', 'https://science.nasa.gov/resource/sojourner-barnacle-bill-yogi/'], ['Sol 8–10', 'Investigated Yogi. The rock arrangement and rover path here are illustrative.', 'https://science.nasa.gov/resource/sojourner-yogi/']],
  },
  {
    id: 'phoenix', name: 'Phoenix', type: 'Lander', site: 'Vastitas Borealis · Arctic plain',
    lat: 68.22, lon: -125.75, location: 'Landing site and final resting place',
    model: null, credit: 'NASA photograph; no local 3D model',
    source: 'https://science.nasa.gov/mission/mars-phoenix/',
    summary: 'Phoenix dug into the arctic soil and confirmed water ice just below the surface of Mars.',
    timeline: [['May 25, 2008', 'Landed on the arctic plains of Mars.'], ['2008', 'Used its robotic arm to investigate soil and water ice.'], ['November 2008', 'The mission ended as sunlight faded.']],
  },
];

export const replayTitles = {
  sojourner: ['Leaving Pathfinder', 'Investigating Barnacle Bill', 'Investigating Yogi'],
  ingenuity: ['Arrival at Jezero', 'First flight', 'Flight 72'],
  opportunity: ['Landing in Eagle Crater', 'Exploring Endeavour Crater', 'Last signal'],
  spirit: ['Landing in Gusev Crater', 'Stuck at Troy', 'End of contact'],
  insight: ['Landing on Elysium Planitia', 'Solar panels open', 'Seismometer placed', 'Power fades'],
  'viking-1': ['Landing on Chryse Planitia', 'Sampler arm at work', 'End of contact'],
  'viking-2': ['Landing on Utopia Planitia', 'Sampler arm at work', 'End of mission'],
};
