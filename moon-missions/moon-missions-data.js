// Moon machines (translated from Nasa_Space_Apps_Challenge-moon/moon/moon-missions-data.js).
// artifactId links each machine to content/catalog.json for the storyteller chat and its facts.
const apollo11 = 'https://www.nasa.gov/missions/apollo/apollo-11-mission-overview/';
const apollo12 = 'https://www.nasa.gov/missions/apollo/apollo-12-the-pinpoint-mission/';
const apollo15 = 'https://www.nasa.gov/missions/apollo/apollo-15-mission-details/';
const surveyor = 'https://science.nasa.gov/mission/surveyor-3/';
const lrv = 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html';
const alsep = 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_18-31_ALSEP_Arrays_and_Status.htm';
const nasspModels = 'https://github.com/orbiternassp/NASSP/blob/Orbiter2016/Meshes/ProjectApollo/';
const roverModel = 'https://blenderartists.org/t/nasa-lunar-rover-scene-file/1610886';
const surveyorSite = 'https://www.nasa.gov/missions/lunar-reconnaissance-orbiter-looks-at-apollo-12-surveyor-3-landing-sites/';
export const globeSource = 'https://svs.gsfc.nasa.gov/4720/';

export const modelDimensions = {
  'eagle-nassp.glb': { meters: 9.4, height: 7, label: 'Height 7 m · 9.4 m across two opposite landing legs', source: 'https://airandspace.si.edu/amp-stories/lunar-module/index.html' },
  'lrv-oldschool.glb': { meters: 2.3, tireDiameter: .818, tireWidth: .23, label: 'NASA frame length 3.1 m · Wheelbase 2.3 m · Wheels Ø81.8 cm', source: lrv },
  'alsep-nassp.glb': { meters: 6.9, label: 'PSE thermal shroud Ø1.52 m · SNAP-27 generator 45.7 cm tall, Ø40.6 cm', source: 'https://solarsystem.nasa.gov/system/downloadable_items/2921_Apollo_12.pdf' },
  'surveyor-nassp.glb': { meters: 4.2, height: 3, label: 'Height 3 m · 4.2 m wide with landing legs open', source: 'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4012v2.pdf' },
};

// type: 'Lander' | 'Rover' | 'Science station' (the replay branches on 'Rover' and `stationary`).
export const missions = [
  {
    id: 'eagle', artifactId: 'apollo-11-eagle-descent-stage', name: 'Eagle', model: 'eagle-nassp.glb', type: 'Lander', site: 'Apollo 11 · Sea of Tranquility',
    lat: .67416, lon: 23.47314, location: 'Landing site · 0.674° N, 23.473° E', source: apollo11,
    credit: 'Project Apollo – NASSP (community model, not NASA) · Illustrative stage-separation animation',
    summary: 'Eagle carried Neil Armstrong and Buzz Aldrin down to the Moon. When they went back to orbit, the ascent stage lifted off from the descent stage. The descent stage is still at Tranquility Base.',
    titles: ['Landing', 'Ascent stage lifts off', 'Descent stage stays behind'],
    timeline: [
      ['July 20, 1969', 'Eagle landed on the Sea of Tranquility. Armstrong and Aldrin stepped out, collected rock samples and set up the Apollo 11 experiments.', apollo11],
      ['July 21, 1969', 'At 17:54 UTC, the engine lifted the upper stage off its base to meet Michael Collins in orbit. The crew saw pieces of Kapton insulation fly off the lower stage.', 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11tcdb.html'],
      ['After Apollo 11', 'Pictures from the Lunar Reconnaissance Orbiter show the descent stage still at the landing site.', 'https://science.nasa.gov/resource/apollo-landing-sites/'],
    ],
    modelSource: nasspModels + 'LM_DescentStage.msh',
  },
  {
    id: 'hadley-lrv', artifactId: 'apollo-15-lrv', name: 'Apollo 15 Lunar Rover', stageName: 'Apollo 15 Rover', model: 'lrv-oldschool.glb', type: 'Rover', site: 'Apollo 15 · Hadley–Apennine',
    lat: 26.1311, lon: 3.63972, location: 'Parking spot · 26.131° N, 3.640° E', source: apollo15,
    credit: 'Hameed (OldSchool3D), CC0 (community model, not NASA) · LRV with four separately turning wheels',
    modelSource: roverModel,
    summary: 'Apollo 15 was the first mission to use an electric car on the Moon. David Scott and James Irwin drove about 27.9 km to study the rocks. The rover is still parked at Hadley–Apennine.',
    titles: ['Drive to Elbow crater', 'Collecting the Genesis Rock', 'Parked to film liftoff'],
    timeline: [
      ['July 31, 1971', 'Scott and Irwin drove to Elbow crater, near the edge of Hadley Rille, to look around and collect samples.', apollo15],
      ['August 1, 1971', 'At Spur crater, the crew collected the Genesis Rock, a mineral-rich sample that helps scientists study the Moon’s early crust.', apollo15],
      ['August 2, 1971', 'The rover was parked where its TV camera could film the upper stage of the Falcon lander lifting off.', apollo15],
    ],
  },
  {
    id: 'apollo12-alsep', artifactId: 'apollo-12-alsep', name: 'Apollo 12 ALSEP', model: 'alsep-nassp.glb', type: 'Science station', stationary: true, landing: false, cameraScale: .62,
    site: 'Apollo 12 · Ocean of Storms', lat: -3.00942, lon: -23.42458, markerOffset: -17,
    location: 'Deployment site · 3.009° S, 23.425° W', source: alsep,
    credit: 'Project Apollo – NASSP (community model, not NASA) · Central station, seismometer and RTG power source',
    modelSource: nasspModels + 'ALSEP_Station.msh',
    summary: 'The Apollo 12 ALSEP station kept sending data to Earth after the astronauts left. Its seismometer recorded shaking, helping scientists study the inside of the Moon.',
    titles: ['Setting up the station', 'Recording the shaking', 'Data collection ends'],
    timeline: [
      ['November 19, 1969', 'Astronauts set up the central station, the passive seismometer and the RTG power source. The station used power from the RTG to collect data and send it to Earth.', apollo12],
      ['November 20, 1969', 'Apollo 12’s ascent stage was crashed into the Moon on purpose. The seismometer recorded the shaking from the impact.', apollo12],
      ['September 30, 1977', 'NASA stopped running the ALSEP network. The instruments are still where they were set up.', alsep],
    ],
  },
  {
    id: 'surveyor-3', artifactId: 'surveyor-3', name: 'Surveyor 3', model: 'surveyor-nassp.glb', type: 'Lander', site: 'Surveyor 3 · Ocean of Storms',
    lat: -3.0159, lon: -23.4178, markerOffset: 17, location: 'Landing site · 3.016° S, 23.418° W', source: surveyor,
    credit: 'Project Apollo – NASSP (community model, not NASA) · Camera and scoop as separate parts',
    modelSource: nasspModels + 'Surveyor.msh',
    summary: 'Surveyor 3 was a robot lander. It took pictures and used a scoop to test the soil. Two years later, Apollo 12 astronauts visited it and brought some of its parts back to Earth.',
    titles: ['Landing in a shallow crater', 'Testing the soil', 'Apollo 12 visits'],
    timeline: [
      ['April 20, 1967', 'The spacecraft landed inside a shallow crater. Its camera sent pictures of the surface back to Earth.', surveyor],
      ['April–May 1967', 'The scoop dug four trenches to help scientists measure how lunar soil behaves.', surveyor],
      ['November 20, 1969', 'Pete Conrad and Alan Bean removed the TV camera, the scoop and material samples. The body and landing legs stayed behind.', apollo12],
    ],
  },
];

const sky = 0x050507;
const plain = (x, z) => .045 * Math.sin(x * .5) * Math.cos(z * .6) + .065 * Math.sin(z * .31);
export const terrainSites = {
  eagle: {
    title: 'Sea of Tranquility', source: 'https://science.nasa.gov/resource/view-apollo-11-lunar-module-as-it-rested-on-lunar-surface/', sky,
    note: 'A gray, dusty plain with small scattered rocks. Illustrative terrain based on Apollo 11 surface photos.',
    soil: 0x89837f, rock: 0x777476, count: 360, radius: .19, flatness: .53, ripple: 0, height: plain,
  },
  'hadley-lrv': {
    title: 'Hadley–Apennine', source: 'https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/', sky,
    note: 'Gray dust, rocks and far-off hills suggest the Hadley landscape. The drive shows the order of the stops, with the distances shortened.',
    soil: 0x827d78, rock: 0x797577, count: 480, radius: .24, flatness: .49, ripple: 0,
    height: (x, z) => plain(x, z) + 2.7 * Math.exp(-((x + 17) ** 2 + (z + 19) ** 2) / 90)
      + 3.1 * Math.exp(-((x + 28) ** 2 + (z + 14) ** 2) / 100),
    outcrops: [[-4, -3.4, .44], [5.2, -2.8, .32]],
  },
  'apollo12-alsep': {
    title: 'Ocean of Storms', source: surveyorSite, sky,
    note: 'A fine, dusty plain near the Apollo 12 landing site. The seismometer and the RTG sit on either side, about 3 m from the central station.',
    soil: 0x8f8a84, rock: 0x737073, count: 300, radius: .15, flatness: .48, ripple: 0, height: plain,
  },
  'surveyor-3': {
    title: 'Surveyor Crater', source: surveyorSite, sky,
    note: 'The spacecraft sits on the inner slope of a crater. The slope under its legs and the crater rim are illustrative.',
    soil: 0x8a837c, rock: 0x6e6c6b, count: 390, radius: .18, flatness: .54, ripple: 0,
    height: (x, z) => (-.15 * x + .08 * z) * Math.exp(-(x * x + z * z) / 36)
      + .8 * Math.exp(-((Math.hypot(x - 4, z + 2) - 13) ** 2) / 6),
  },
};
