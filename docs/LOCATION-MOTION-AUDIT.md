# Artifact placement and motion audit

Checked against NASA sources on 2026-11-14. This audits relationships and the
meaning of map markers, not present-day spacecraft coordinates. No chat fact's
`reviewStatus` was changed.

## How motion should work

A machine resting on a surface stays with that body's surface as the body rotates
and travels around the Sun. A moon or spacecraft in a bound orbit moves around
its host while the whole system also travels around the Sun. Being outside a
planet does **not** by itself mean an object belongs to that planet.

NASA's [moon overview](https://science.nasa.gov/solar-system/moons/facts/)
describes the natural-satellite relationships. The scene nests the selected moons
inside their planet's moving group. In the separate surface view, markers remain
children of the rotating globe. The close-up artifact viewer is an inspection
view of a model, not a claim that the real machine floats alone in space.

## All 17 catalog artifacts

| Artifact | Physical relationship established by NASA | What the app displays |
|---|---|---|
| Surveyor 3 | On the Moon, Oceanus Procellarum. [NASA mission](https://science.nasa.gov/mission/surveyor-3/) | Surface landing-site marker; no independent orbital animation. |
| Apollo 11 Eagle descent stage | Lower stage left on the lunar surface; the laser reflector is separate nearby hardware. [NASA lunar-artifact inventory, Appendix E](https://www.nasa.gov/wp-content/uploads/2023/12/nasa-usg-lunar-historic-sites-reva.pdf) | Eagle landing-site marker; reflector has a separate deployment entry. The whole-LM model is explicitly identified as such. |
| Apollo 15 LRV | Rover left on the Moon. [NASA lunar-artifact inventory, Appendix E](https://www.nasa.gov/wp-content/uploads/2023/12/nasa-usg-lunar-historic-sites-reva.pdf) | Catalog marker is the LM landing site, explicitly **not** the rover's exact parking spot. No guessed parking coordinates. |
| Apollo 12 ALSEP | Experiment equipment deployed on the lunar surface. [NASA lunar-artifact inventory, Appendix E](https://www.nasa.gov/wp-content/uploads/2023/12/nasa-usg-lunar-historic-sites-reva.pdf) | Surface deployment marker, not a satellite. |
| Sojourner | Rover on Mars at the Pathfinder site. [NASA Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/) | Ares Vallis landing-site marker, not a reconstructed final rover pose. |
| Spirit | Rover stopped on Mars near Home Plate. [NASA Spirit](https://science.nasa.gov/mission/mer-spirit/) | Gusev landing-site marker is explicitly distinguished from the final resting place. |
| Opportunity | Rover's final resting area is Perseverance Valley on Mars. [NASA Opportunity](https://science.nasa.gov/mission/mer-opportunity/) | Eagle crater **landing-site** marker, explicitly not its final resting place. |
| Viking 1 lander | Landed at Chryse Planitia on Mars. [NASA Viking 1](https://science.nasa.gov/mission/viking-1/) | Surface lander, not the separate Viking orbiter. |
| Viking 2 lander | Landed at Utopia Planitia on Mars. [NASA Viking](https://science.nasa.gov/mission/viking/) | Surface lander, not the separate Viking orbiter. |
| Phoenix | Stationary lander on Mars' arctic plain. [NASA Phoenix](https://science.nasa.gov/mission/mars-phoenix/) | Surface landing-site marker. |
| InSight | Stationary lander on Mars; mission ended. [NASA InSight](https://science.nasa.gov/mission/insight/) | Approximate surface landing-site marker. |
| Ingenuity | Grounded at Valinor Hills after its final flight. [NASA/JPL image and caption](https://www.jpl.nasa.gov/images/pia26237-ingenuity-at-valinor-hills/) | Final-resting marker selected; deployment location is separately recorded. No continued flying animation. |
| Dawn | Remains in orbit around Ceres after the mission ended. [NASA mission-end release](https://www.nasa.gov/news-release/nasas-dawn-mission-to-asteroid-belt-comes-to-end/) | Spacecraft orbits Ceres, whose group travels around the Sun. Not attached to Mars or Vesta. |
| NEAR Shoemaker | Landed on Eros; it is no longer an orbiter. [NASA NEAR](https://science.nasa.gov/mission/near-shoemaker/) | Overview labels the NASA asteroid mesh Eros. Clicking the rock inspects Eros, with a separate Meet NEAR Shoemaker button opening the spacecraft model and story. No fabricated landing offset or spacecraft pose on that mesh. Eros rotates and orbits the Sun. |
| Pioneer 10 | Outbound trajectory with sufficient speed to escape the solar system. [NASA Pioneer summary](https://science.nasa.gov/missions/pioneer/pioneer-11/10-things-about-pioneer-spacecraft/) | Moves outward; does not circle Jupiter or remain attached to Earth. |
| Pioneer 11 | Outbound trajectory with sufficient speed to escape the solar system. [NASA Pioneer summary](https://science.nasa.gov/missions/pioneer/pioneer-11/10-things-about-pioneer-spacecraft/) | Moves outward; does not circle Saturn. Shared Pioneer 10 model is labeled. |
| Kepler | Independent orbit around the Sun, slowly drifting away from Earth. [NASA orbit explanation](https://science.nasa.gov/resource/keplers-orbit/) | Independent solar orbit with a slightly slower angular speed than Earth; not an Earth satellite or a fixed companion. |

## Limits of this visualization

The animation is a diagram: distances, sizes, orbital phases, planes and speeds
are illustrative. Dawn's local circle and the straight outward Pioneer paths are
display simplifications, not measured trajectories. No present epoch, SPICE
kernels, Horizons ephemerides, registered landing poses, or predicted exact
post-mission attitudes are loaded. Original NASA model geometry is preserved.

The two rotating spiral galaxies and meteor-like streaks are decorative 3D
effects. Galaxy centers and axes remain in world space when the camera turns;
their particles rotate internally. They do not depict the actual current
positions or rotation rates of named galaxies. The unmodified NASA star-map
sky is a separate layer: an optical photographic mosaic by Axel Mellinger,
published by NASA APOD (2009-11-25), combined with sharp bright-star detail from
the original 8192×4096 galactic-coordinate map from NASA SVS Deep Star Maps (3895).
The photo's Hammer-Aitoff projection is remapped onto a sphere in code. Both
image files are unmodified; their display exposure is reduced. The sky's world
orientation remains fixed while translation follows the camera, so it has no
nearby-object parallax. The synthetic foreground Stars layer stays removed.
The galaxy particle
geometry, centers, axes, counts and rotation speeds are unchanged. Display
spacecraft radii are smaller than every major planet; close inspection still
zooms into a selected object. Neither scale nor the sky orientation is literal.

Validation: `npm run build`, `node src/features/world/scene-motion.check.mjs`,
and `node src/features/world/geo.check.mjs`. The motion check exercises the
spacecraft/host relationships and projects both galaxy centers through the
overview camera to check that they appear in opposite diagonal corners.

## Display spacing and flights (2026-11-14)

The shared `solar-layout.ts` now places the eight circular display lanes at
radii 3, 4.8, 8, 12.7, 20.5, 29.5, 38 and 44.5. Each adjacent pair has clearance
beyond both complete moon/ring envelopes, including conjunctions. Ceres/Dawn
and Eros occupy separate clear lanes. Kepler's illustrative plane is raised to
avoid the Earth/Moon meshes. These are display units, not AU; orbital phases,
planes and speeds are still illustrative. Perspective can hide one body behind
another on screen even when the meshes do not intersect in space.

`solar-layout.check.mjs` checks whole-system clearance, asteroid hosts, the
perspective overview at desktop/mobile aspect ratios and a UFO path ending at
the current moving dock. The camera fits outward Pioneer destinations when a
flight starts. Echo is a fictional guide and arcs above the display plane; it
does not depict a real spacecraft, transfer orbit or travel time.

The primary sky is now the unmodified NASA SVS 4851 HDR galactic catalog map,
with the previous 8K JPEG as a loading/error fallback and the Mellinger optical
photo as faint color. Fixed world orientation and both rotating galaxies remain.
The distant black-hole video is NASA SVS 13326's simulation on a fixed plane;
it is not a physical neighbor, a real-time lensing model or an observed image.
Sources, sizes and checksums are in `content/assets.json` and `CREDITS.md`.
