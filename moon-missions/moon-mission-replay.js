// Moon replay (from Nasa_Space_Apps_Challenge-moon/shared/mission-replay.js), aligned with the Mars page:
// no numbered pins, the whole journey plays by itself in ~10 s, the camera never moves,
// and the current milestone is shown as a subtitle (#replay-caption + #replay-event).
import { Box3, MathUtils, Vector3 } from 'three';

// Where the rover drives for each milestone (illustrative, distances shortened).
const stops = [[-4.4, .55, 1.2], [0, .7, -4.8], [4.4, .55, 1.4]].map(p => new Vector3(...p));
export const routeOverview = new Vector3(2, 11, 15);
export const routeFocus = new Vector3(0, .4, -.8);
const restHeight = -.075;
const wheelAxis = new Vector3(1, 0, 0);
const JOURNEY_MS = 10000;

export function createReplay(controls, reducedMotion, dust, createOperation) {
  const element = id => document.getElementById(id);
  const play = element('replay-play');
  const previous = element('replay-prev');
  const next = element('replay-next');
  const caption = element('replay-caption');
  const eventText = element('replay-event');
  const restart = element('replay-restart');
  let mission, model, motion;
  let operation;
  let stationary;
  let wheels = [];
  let entries = [];
  let index = -1;
  let playing = false;
  let advanceAt = Infinity;
  let pausedAt = null;
  let groundOffset = () => 0;

  function refresh() {
    play.disabled = restart.disabled = !model;
    play.textContent = playing ? 'Ⅱ' : '▶';
    play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    previous.disabled = !model || index <= 0;
    next.disabled = !model || index >= entries.length - 1;
  }

  function stop() {
    playing = false;
    pausedAt = null;
    advanceAt = Infinity;
    refresh();
  }

  function cancelMotion() {
    motion = null;
    stop();
    dust.hide();
    operation?.clearEffects?.();
    if (model) model.position.y = restHeight + groundOffset(model.position.x, model.position.z);
  }

  function resetPose() {
    for (const wheel of wheels) wheel.part.quaternion.copy(wheel.rest);
    model.rotation.set(0, 0, 0);
    operation?.reset();
  }

  function select(i, now = performance.now()) {
    if (!model || !entries[i]) return;
    index = i;
    const destination = new Vector3(0, restHeight, 0);
    const rover = mission.type === 'Rover';
    if (!stationary) destination.set(stops[i].x, restHeight, stops[i].z);
    if (stationary) {
      resetPose();
      operation?.prepare?.(i);
    }
    const from = model.position.clone();
    from.y = restHeight;
    const distance = from.distanceTo(destination);
    const deploy = stationary && i === 1;
    const landing = stationary && i === 0 && mission.landing !== false;
    const setup = i === 0 && Boolean(operation?.setup);
    const drive = rover && distance > .01;
    const step = JOURNEY_MS / entries.length;
    const natural = drive ? 2900 : deploy ? 4300 : landing || setup ? 2700 : 1300;
    const duration = Math.min(natural, step - 250);
    motion = {
      start: now,
      duration,
      deploy,
      landing,
      setup,
      drive,
      distance,
      wheelStart: wheels.map(wheel => wheel.part.quaternion.clone()),
      heading: drive ? Math.atan2(destination.x - from.x, destination.z - from.z) : 0,
      headingFrom: model.rotation.y,
      modelFrom: from,
      destination,
    };
    advanceAt = playing ? now + step : Infinity;
    caption.textContent = 'Milestone ' + (i + 1) + ' / ' + entries.length + ' · ' + mission.titles[i] + ' · ' + entries[i].date;
    eventText.textContent = entries[i].event;
    refresh();
    if (reducedMotion) animate(now);
  }

  function animate(now) {
    if (pausedAt !== null) return;
    if (motion) {
      const elapsed = reducedMotion ? motion.duration : now - motion.start;
      const t = MathUtils.clamp(elapsed / motion.duration, 0, 1);
      const eased = MathUtils.smoothstep(t, 0, 1);
      // The camera stays where it is (a wide view set by the page); only the machine moves.
      const travel = motion.drive ? MathUtils.smoothstep(t, .18, 1) : eased;
      model.position.lerpVectors(motion.modelFrom, motion.destination, travel);
      const surfaceY = groundOffset(model.position.x, model.position.z);
      model.position.y += surfaceY;
      if (motion.drive) {
        const turn = Math.atan2(Math.sin(motion.heading - motion.headingFrom), Math.cos(motion.heading - motion.headingFrom));
        model.rotation.y = motion.headingFrom + turn * MathUtils.smoothstep(t, 0, .3);
        for (const [i, wheel] of wheels.entries()) {
          wheel.part.quaternion.copy(motion.wheelStart[i]);
          wheel.part.rotateOnAxis(wheelAxis, travel * motion.distance / wheel.radius);
        }
      }
      if (motion.landing) model.position.y += 1.65 * (1 - MathUtils.smoothstep(t, 0, .85));

      if (!reducedMotion && motion.landing) {
        const contact = MathUtils.smoothstep(t, .72, .86) * (1 - MathUtils.smoothstep(t, .89, 1));
        dust.update(model.position, MathUtils.smoothstep(t, .72, 1), contact * .58, surfaceY);
      } else if (!reducedMotion && motion.drive) {
        dust.update(model.position, travel * .45, Math.sin(Math.PI * travel) * .34, surfaceY);
      }

      if (motion.setup) operation.setup(t);
      if (motion.deploy) operation?.update(t);
      if (t === 1) {
        model.position.copy(motion.destination);
        model.position.y += groundOffset(model.position.x, model.position.z);
        motion = null;
        dust.hide();
        refresh();
      }
    }
    if (playing && now >= advanceAt) {
      if (index < entries.length - 1) select(index + 1, now);
      else stop();
    }
  }

  function manual(i) {
    stop();
    select(i);
  }

  play.addEventListener('click', () => {
    if (playing) {
      pausedAt = performance.now();
      playing = false;
      refresh();
    } else if (pausedAt !== null) {
      const delay = performance.now() - pausedAt;
      if (motion) motion.start += delay;
      advanceAt += delay;
      pausedAt = null;
      playing = true;
      refresh();
    } else {
      playing = true;
      select(index < 0 || index === entries.length - 1 ? 0 : index);
    }
  });
  previous.addEventListener('click', () => manual(index - 1));
  next.addEventListener('click', () => manual(index + 1));
  controls.addEventListener('start', () => {
    if (model && motion) cancelMotion();
  });

  return {
    setTerrain(height) { groundOffset = height; },
    open(selectedMission) {
      mission = selectedMission;
      stationary = mission.stationary ?? mission.type === 'Lander';
      index = -1;
      caption.textContent = 'Loading the 3D model…';
      eventText.textContent = '';
      entries = mission.timeline.map(([date, event]) => ({ date, event }));
      refresh();
    },
    attach(loadedModel) {
      model = loadedModel;
      operation = createOperation(model, mission);
      model.updateWorldMatrix(true, true);
      model.traverse(part => {
        if (!/^suspension_(left|right)_(front|middle|rear)_wheel$/.test(part.name)) return;
        const radius = new Box3().setFromObject(part, true).getSize(new Vector3()).y / 2;
        if (!radius) return;
        wheels.push({ part, rest: part.quaternion.clone(), radius });
      });
      refresh();
    },
    close() {
      cancelMotion();
      operation?.dispose();
      operation = null;
      model = null;
      wheels = [];
    },
    reset() {
      cancelMotion();
      model?.position.set(0, restHeight, 0);
      if (model) resetPose();
      index = -1;
      caption.textContent = 'Press ▶ Run to play the mission again.';
      eventText.textContent = '';
      refresh();
    },
    /** Start the actions from milestone 1 without waiting for a click. */
    autoplay() {
      if (!model || !entries.length) return;
      playing = true;
      pausedAt = null;
      select(0);
    },
    animate,
  };
}
