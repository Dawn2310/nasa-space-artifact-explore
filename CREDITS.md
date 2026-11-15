# Credits and data sources

Character presentation: the spacecraft's own NASA model (or NASA photo where no
model is available) remains visible. An original SVG chibi shuttle acts as a
decorative chat mascot and send/replay button; it is not a scientific model of
the selected artifact. Its lift, exhaust, smoke and speech-cloud animation are
illustrative. The NASA model meshes remain unchanged. Each of the 17 objects
has one upbeat first-person introduction, with its fact IDs recorded in
`src/features/explorer/narrative.ts`. The opening is 38–41 words, estimated at
about 15 seconds; actual speech timing and expressiveness depend on the available
browser/OS voice. No further narration is emitted until the visitor asks.
Narration and answers share one conversation, with sources/review labels under
each factual message. Dawn's additional science passage uses Marc Rayman's
[March 31, 2016 Dawn Journal](https://www.jpl.nasa.gov/blog/2016/3/dawn-fueled-for-even-more-discoveries-at-ceres/);
the fact `dwn-009` remains pending human review. Speech
uses the visitor's browser speech synthesis on object selection when permitted,
with mute/replay controls and a text fallback. A brighter pitch/rate and a preference
among available English voices support the character presentation; the app
does not call a third-party TTS endpoint. Story scripts and the keyword chat
mock are not presented as a real transmission or proof of LLM quality.

3D backdrop presentation: the NASA Deep Star Maps image is mapped onto an inward
facing sky sphere. Two spiral particle galaxies have fixed centers and axes
in world space; their stars rotate within those frames. The smaller galaxy is
across from the larger one in the overview. Layered stars and nine meteor-like streaks are illustrative effects
written in Three.js, not NASA observations or measured trajectories. Meteor motion
is explicitly enabled following the request for a brighter, more frequent shower;
it is independent of the planetary motion preference. The map remains unmodified.

Spacecraft motion audit: [Kepler orbits the Sun](https://science.nasa.gov/resource/keplers-orbit/),
[Dawn remains in orbit around Ceres](https://www.nasa.gov/news-release/nasas-dawn-mission-to-asteroid-belt-comes-to-end/),
[NEAR landed on Eros](https://science.nasa.gov/mission/near-shoemaker/), and
[Pioneer 10](https://science.nasa.gov/mission/pioneer-10/) and
[Pioneer 11](https://science.nasa.gov/mission/pioneer-11/) continue outward.
Display trajectories, phases, speeds and distances are schematic. Kepler has
an independent solar orbit with a gradual drift relative to Earth. NEAR has no
independent orbital motion: the overview shows Eros as its host, without guessing
a spacecraft landing position or pose on the irregular mesh. The story card
retains the separate spacecraft model. The artifact viewer does not auto-spin
stationary machines. See `docs/LOCATION-MOTION-AUDIT.md` for all 17 artifacts.
Original NASA VTAD [Ceres](https://science.nasa.gov/resource/ceres-3d-model/)
and [Eros](https://science.nasa.gov/resource/eros-3d-model/) GLBs provide the host
body shapes; file sources and checksums are recorded in `content/assets.json`.

Selected natural satellites: parent relationships follow NASA's
[Moons: Facts](https://science.nasa.gov/solar-system/moons/facts/),
[Uranus moons](https://science.nasa.gov/uranus/moons/), and
[Neptune moons](https://science.nasa.gov/neptune/moons/).
Individual NASA source links are recorded in `src/features/world/solar-system.ts`.
Only selected moons are displayed; orbital spacing, size, phase and speed are
illustrative. Triton travels in the opposite direction to the other displayed moons.

Phobos and Deimos retain their original irregular NASA/JPL-Caltech GLB models:
[Phobos](https://science.nasa.gov/resource/phobos-mars-moon-3d-model/),
[Deimos](https://science.nasa.gov/resource/deimos-mars-moon-3d-model/).
Io, Europa, Ganymede, Callisto, Enceladus, Titan, Miranda, Titania and Triton use
unmodified maps from NASA 3D Resources at the pinned commit below. The Earth's
Moon uses the unmodified 2048×1024 LROC map from
[NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), centered at 0° longitude.
Their file sources, credits and checksums are recorded in `content/assets.json`.

Additional solar-view models: NASA Visualization Technology Applications and
Development (VTAD), [Sun](https://science.nasa.gov/learn/heat/resource/sun-3d-model/),
[Mercury](https://science.nasa.gov/resource/mercury-3d-model/), and
[Saturn](https://science.nasa.gov/resource/saturn-3d-model/).
Original GLB files are bundled as `models/planet-*.glb`, with their source geometry,
embedded textures and materials intact. Only display scale and orientation change.
Atmospheric rims and solar glow are illustrative rendering effects. The Venus map
shows the radar surface rather than its visible cloud cover. The visual direction
was informed by [NASA's Eyes](https://science.nasa.gov/eyes/).

Solar-system sky: the optical photographic mosaic by **Axel Mellinger (Central
Michigan University)**, credit and copyright © 2009 Axel Mellinger, published as
[All-Sky Milky Way Panorama, NASA APOD, 25 November 2009](https://science.nasa.gov/image-article/apod-2009-november-25-all-sky-milky-way-panorama/).
The unmodified `images/milky-way-panorama.jpg` (2000×1000) is a photographic
mosaic, not a NASA-created/public-domain image. Its Hammer-Aitoff projection is
mapped to a sky sphere in code, with reduced exposure and a darker black level.
The photographer remains credited by the visible sky link. Projection is
documented in [Mellinger's original paper](https://arxiv.org/abs/0908.4360).

Fine bright-star detail uses the unmodified 8192×4096 galactic-coordinate
`images/deep-star-map-galactic-8k.jpg` from NASA/Goddard Space Flight Center
Scientific Visualization Studio, [Deep Star Maps](https://svs.gsfc.nasa.gov/3895/),
Ernie Wright and Tom Bridgman. This layer comes from star catalogs. The optical
photo supplies the dust lanes and diffuse stellar clouds; no procedural noise,
random stars, or invented nebulae are added. Earlier local star maps are inactive.
The sky orientation is decorative, not a live spacecraft view. Rotation stays in
world coordinates; its translation follows the camera to remove nearby-object
parallax. The two rotating particle galaxies are unchanged. Sources, sizes and
SHA-256 hashes are in `content/assets.json`.

The NASA-sourced 3D models and planet textures in `public/assets/` retain their original files from
NASA 3D Resources — https://github.com/nasa/NASA-3D-Resources
(commit 11ebb4ee043715aefbba6aeec8a61746fad67fa7, 2025-06-03), also published at
https://science.nasa.gov/3d-resources/. Per-file source URL, size and SHA-256
are recorded in `content/assets.json`.

Credit line: NASA. Individual contributor names appear on each asset's page at
science.nasa.gov/3d-resources and must be added here by a team member before
submission (not yet done).

Use follows the NASA Images and Media Usage Guidelines
(https://www.nasa.gov/nasa-brand-center/images-and-media/). This project is not
affiliated with or endorsed by NASA. No NASA insignia, logotype or mission
patches are used in the interface or demo.

## To be added by the team

- Moon texture: NASA SVS CGI Moon Kit, https://svs.gsfc.nasa.gov/4720
- Photographs: NASA Image and Video Library, https://images.nasa.gov (list NASA ID per image)
- Mission facts: NSSDCA (https://nssdc.gsfc.nasa.gov/) and science.nasa.gov mission pages; see `content/sources.json`
- AI use: built with AI coding assistants (code, drafts of facts and character text). NASA-sourced facts are accepted without a separate human-review gate at the user's request; this does not assert that every draft has been independently human-verified.

## Moon mission map (moon-missions/, public/moon-assets/)

Copied from the team folder Nasa_Space_Apps_Challenge-moon. Not all of these are NASA assets:

- Moon globe image: NASA SVS CGI Moon Kit (LRO), https://svs.gsfc.nasa.gov/4720/
- Eagle (Apollo 11 LM), Apollo 12 ALSEP, Surveyor 3: models converted to GLB from Project Apollo – NASSP (community project, not NASA), https://github.com/orbiternassp/NASSP — see its licence: https://github.com/orbiternassp/NASSP/blob/Orbiter2016/NASSP-LICENSE.txt
- Apollo 15 Lunar Roving Vehicle: Blender model by Hameed (OldSchool3D), geometry and materials CC0 1.0, reduced for the web, https://blenderartists.org/t/nasa-lunar-rover-scene-file/1610886 (third-party texture terms listed in the original download's PDF)
- Draco decoder: three.js distribution (see moon-missions/THREE-LICENSE)
- Coordinates for the Apollo 15 rover, ALSEP and Surveyor 3: tables B-1 and B-2 of "Lunar Constants and Models" (JPL D-32296)

## HDR sky, black-hole backdrop and Echo (2026-11-14)

The primary sky now uses the unmodified 4096×2048 galactic-coordinate OpenEXR
from [Deep Star Maps 2020, NASA SVS 4851](https://svs.gsfc.nasa.gov/4851/),
NASA/Goddard Space Flight Center/Ernie Wright. It plots catalog stars from Gaia
DR2, Hipparcos and Tycho; it is not an optical photograph. The linear HDR map
retains stellar brightness and color; shader exposure maps it to the screen.
It loads asynchronously, with the previous NASA JPEG map as a fallback.
The credited Mellinger photo remains a faint optical dust/color layer. The two
existing rotating particle galaxies are unchanged and are illustrative effects.

The distant black-hole backdrop uses the original 1080×1080 WebM and 1024×1024
poster from [Black Hole Accretion Disk Visualization, NASA SVS 13326](https://svs.gsfc.nasa.gov/13326/),
credit **NASA's Goddard Space Flight Center/Jeremy Schnittman**. This is NASA's
general-relativistic simulation, not a photograph or a black hole in our solar
system. A video texture displays the simulation on a fixed distant plane;
the poster is used for reduced motion or playback failure. This app does not
compute real-time gravitational lensing of its own sky. File URLs, sizes and
SHA-256 checksums are recorded in `content/assets.json` under `backgroundMedia`.

Echo's animated saucer, lights and flight trail are original code-based UI art
for an explicitly fictional guide, not a NASA model or scientific trajectory.

The 360-degree backdrop has four illustrative particle galaxies (the two
originals plus two smaller ones behind the initial view) and two distant
black-hole displays. Both displays reuse the same credited NASA SVS 13326
video/poster and a single video decoder; their decorative placements do not
represent measured astronomical locations.

## Previous Sojourner viewer (2026-11-14, superseded below)

The user-specified [Sojourner Mars Rover](https://sketchfab.com/3d-models/sojourner-mars-rover-7f135874ddd34f8f98904b53a2c178e1)
is by **Jan Walter Sluka**, a community model, **not a NASA-created model**.
Sketchfab's public model metadata reports `isDownloadable: false` and the
Standard license. The application embeds the public Sketchfab viewer with
creator attribution; no model files were copied, extracted or redistributed.
That version required network access and used the same viewer in direct exploration and
the UFO tour. It is now inactive. Historical metadata and provenance remain in `content/assets.json.externalViewers`.
NASA/NSSDCA sources still supply the mission facts and site coordinates.

Phoenix has a destination in both routes with its credited NASA photograph.
It does not use an InSight model or an invented Phoenix mesh. Its local 3D
model remains unavailable. Spirit and Opportunity share the existing MER
geometry but now have separate destinations in both routes.

Echo's revised metallic hull, panel seams, bolts, cockpit and engine pods are
original fictional UI geometry. Brushed-metal roughness is generated in code;
the material reflection uses three.js RoomEnvironment (MIT), confined to Echo's
materials, without changing NASA spacecraft models or their textures.

The first-person Echo windshield, instrument panel, mission-passport badges,
constellation accents and reward animations are original code-based UI art.
The badges are fictional learning rewards, not NASA insignia or endorsements.
No scientific imagery or spacecraft geometry was generated or replaced for them.

## Mars model update from the supplied main-1 folder (2026-11-15)

The active Sojourner scene now uses the local **Mars Sojourner Rover Model** by
**Dan**, [original model](https://sketchfab.com/3d-models/mars-sojourner-rover-model-8b3810e7cd804bd6b0009520c67984c6),
licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
This is a **community model, not NASA**. Its creator, source and license are
shown under Model & sources. The GLB was supplied in the user's sibling
`Nasa_Space_Apps_Challenge-main` folder; its original bytes are preserved in
`public/assets/models/sojourner-dan.glb`, with SHA-256 in `content/assets.json`.
The viewer separates the six tire shells into wheel pivots, rotates the model
to face the route and uniformly scales its longest horizontal span to 0.63 m
using the existing NASA/NSSDCA catalog record. The wheel animation, route,
soil and rock positions are illustrative. No geometry was extracted from
Jan Walter Sluka's non-downloadable model; that old external viewer is inactive.

`Nasa_Space_Apps_Challenge-main-1` supplies the improved InSight assembly,
robot-arm deployment and detailed camera approach. Its missing Sojourner and
InSight tether helpers were present in the sibling `main` folder. Both are
integrated with the existing chat, UFO tours and rewards rather than replacing
the application with the standalone demo. The five existing NASA model files
and the Mars texture in the new folder are byte-identical to those already installed.

InSight combines the existing NASA Deployed and Cruise Lander model parts.
Fixed duplicate payload/arm/tether faces are hidden at runtime; the arm places
SEIS, the wind/thermal shield and HP³ in sequence, with illustrative connecting
cables. The source folder's nonuniform stretching of the shield is omitted:
NASA payload proportions are retained. Stored NASA GLB files are unmodified;
runtime assembly, joint poses, cable geometry, terrain and elapsed times are
illustrations, not a surveyed reconstruction or exact engineering simulation.
