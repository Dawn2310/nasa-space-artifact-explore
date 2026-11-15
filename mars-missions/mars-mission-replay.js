import { Box3, MathUtils, Quaternion, Vector3 } from 'three';
import { replayTitles } from './mars-missions-data.js';
import { createLanderOperation } from './mars-lander-operations.js';

const pins = [[-2.15, .55, .65], [0, .7, -2.3], [2.15, .55, .85]].map(p => new Vector3(...p));
const restHeight = -.075;
const shaftAxis = new Vector3(1, 0, 0);
const wheelAxis = new Vector3(0, 0, 1);
// The whole journey plays automatically in about this long (all milestones together).
const JOURNEY_MS = 10000;
const views = [[4.2, 2.8, 5], [3.3, 2.3, 4.2], [2.9, 2.6, 5.15]];
const yogiView = [-3.1, 3.6, 5.7];
const insightDeploymentView = [2.8, 2.9, 4.05];
const flightOverview = new Vector3(4.7, 3.7, 6.4);
const flightFocus = new Vector3(0, .65, 0);

export function createReplay(camera, controls, reducedMotion, dust, onComplete = () => {}) {
  const element = id => document.getElementById(id);
  const layer = element('replay-markers');
  const play = element('replay-play');
  const previous = element('replay-prev');
  const next = element('replay-next');
  const caption = element('replay-caption');
  const restart = element('replay-restart');
  const eventText = element('replay-event');
  let mission, model, motion;
  let operation;
  let stationary;
  let joints = [];
  let wheels = [];
  let entries = [];
  let index = -1;
  let playing = false;
  let advanceAt = Infinity;
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
    advanceAt = Infinity;
    refresh();
  }

  function cancelMotion() {
    stop();
    motion = null;
    dust.hide();
    if (model) model.position.y = restHeight + groundOffset(model.position.x, model.position.z);
  }

  function resetPose() {
    for (const { part, rest } of joints) part.quaternion.copy(rest);
    for (const wheel of wheels) wheel.part.quaternion.copy(wheel.rest);
    model.rotation.set(0, 0, 0);
    operation?.reset();
  }

  function selectionHint() {
    return 'Press ▶ Run to play the mission again.';
  }

  function select(i, now = performance.now()) {
    if (!model || !entries[i]) return;
    index = i;
    const destination = new Vector3(0, restHeight, 0);
    const rover = mission.type === 'Rover';
    const helicopter = mission.id === 'ingenuity';
    if (!stationary) destination.set(pins[i].x, restHeight, pins[i].z);
    if (stationary) {
      resetPose();
      operation?.prepare?.(i);
    }
    const from = model.position.clone();
    from.y = restHeight;
    const distance = from.distanceTo(destination);
    const takeoff = helicopter && distance > .01;
    const solar = mission.id === 'insight' && i === 1;
    const deploy = stationary && i === (mission.id === 'insight' ? 2 : 1);
    const landing = stationary && i === 0;
    const drive = rover && distance > .01;
    const step = JOURNEY_MS / entries.length;
    const natural = takeoff ? 4600 : deploy || solar ? 4300 : landing || drive ? 2700 : 1300;
    const duration = deploy && mission.id === 'insight' ? 18000 : Math.min(natural, step - 250);
    const view = deploy && mission.id === 'insight' ? insightDeploymentView
      : mission.id === 'sojourner' && i === 2 ? yogiView : views[i] ?? views[2];
    const cameraTo = new Vector3(...view).multiplyScalar(model.userData.framing)
      .add(new Vector3(destination.x, model.userData.focusHeight - .9, destination.z));
    cameraTo.y = Math.max(cameraTo.y, groundOffset(destination.x, destination.z) + .4);
    motion = {
      start: now,
      duration,
      takeoff,
      solar,
      deploy,
      landing,
      drive,
      distance,
      wheelStart: wheels.map(wheel => wheel.part.quaternion.clone()),
      failedWheel: mission.id === 'spirit' && i > 0,
      heading: drive || takeoff ? Math.atan2(destination.x - from.x, destination.z - from.z) : 0,
      headingFrom: model.rotation.y,
      cameraFrom: camera.position.clone(), targetFrom: controls.target.clone(), cameraTo,
      targetTo: new Vector3(destination.x, model.userData.focusHeight, destination.z),
      modelFrom: from,
      destination,
    };
    advanceAt = playing ? now + Math.max(step, duration + 250) : Infinity;
    caption.textContent = 'Milestone ' + (i + 1) + ' / ' + entries.length + ' · ' + replayTitles[mission.id][i] + ' · ' + entries[i].date;
    eventText.textContent = entries[i].event;
    refresh();
    if (reducedMotion) animate(now);
  }

  function animate(now) {
    if (motion) {
      const t = reducedMotion ? 1 : MathUtils.clamp((now - motion.start) / motion.duration, 0, 1);
      const eased = MathUtils.smoothstep(t, 0, 1);
      const travelOverview = motion.takeoff || motion.drive;
      if (travelOverview && t < .84) {
        const widen = MathUtils.smoothstep(t, 0, .22);
        camera.position.lerpVectors(motion.cameraFrom, flightOverview, widen);
        controls.target.lerpVectors(motion.targetFrom, flightFocus, widen);
      } else {
        const frame = travelOverview ? MathUtils.smoothstep(t, .84, 1) : eased;
        camera.position.lerpVectors(travelOverview ? flightOverview : motion.cameraFrom, motion.cameraTo, frame);
        controls.target.lerpVectors(travelOverview ? flightFocus : motion.targetFrom, motion.targetTo, frame);
      }
      const travel = motion.takeoff ? MathUtils.smoothstep(t, .31, .72)
        : motion.drive ? MathUtils.smoothstep(t, .25, 1) : eased;
      model.position.lerpVectors(motion.modelFrom, motion.destination, travel);
      const surfaceY = groundOffset(model.position.x, model.position.z);
      model.position.y += surfaceY;
      controls.target.y += surfaceY;
      if (motion.drive) {
        const turn = Math.atan2(Math.sin(motion.heading - motion.headingFrom), Math.cos(motion.heading - motion.headingFrom));
        model.rotation.y = motion.headingFrom + turn * MathUtils.smoothstep(t, 0, .35);
        const roll = Math.sin(travel * motion.distance * 9) * Math.sin(Math.PI * travel);
        model.rotation.z = roll * .035;
        model.position.y += Math.abs(roll) * .025;
        for (const [i, wheel] of wheels.entries()) {
          wheel.part.quaternion.copy(motion.wheelStart[i]);
          if (!motion.failedWheel || !wheel.frontRight) {
            wheel.part.rotateOnAxis(wheelAxis, wheel.sign * travel * motion.distance / wheel.radius);
          }
        }
      }
      if (motion.takeoff) {
        const altitude = MathUtils.smoothstep(t, .15, .32) * (1 - MathUtils.smoothstep(t, .72, .88));
        model.position.y += altitude * 1.35;
        const turn = Math.atan2(Math.sin(motion.heading - motion.headingFrom), Math.cos(motion.heading - motion.headingFrom));
        model.rotation.y = motion.headingFrom + turn * MathUtils.smoothstep(t, .14, .38);
        model.rotation.x = .14 * Math.sin(Math.PI * travel);
      }
      if (motion.landing) model.position.y += 1.65 * (1 - MathUtils.smoothstep(t, 0, .85));

      if (!reducedMotion && motion.takeoff) {
        const nearGround = 1 - MathUtils.smoothstep(model.position.y - restHeight - surfaceY, .05, .72);
        const rotorPower = MathUtils.smoothstep(t, .06, .22) * (1 - MathUtils.smoothstep(t, .86, 1));
        dust.update(model.position, .25 + t * .55, nearGround * rotorPower, surfaceY);
      } else if (!reducedMotion && motion.landing) {
        const contact = MathUtils.smoothstep(t, .72, .86) * (1 - MathUtils.smoothstep(t, .89, 1));
        dust.update(model.position, MathUtils.smoothstep(t, .72, 1), contact * .58, surfaceY);
      } else if (!reducedMotion && motion.drive) {
        dust.update(model.position, travel * .45, Math.sin(Math.PI * travel) * .34, surfaceY);
      }

      for (const [i, { part, rest }] of joints.entries()) {
        part.quaternion.copy(rest);
        if (motion.takeoff) {
          // The GLB stores both rotors along their parent's local X axis.
          const angle = 88 * (t - Math.sin(2 * Math.PI * t) / (2 * Math.PI));
          part.rotateOnWorldAxis(shaftAxis, (i === 0 ? 1 : -1) * angle);
        }
      }
      if (motion.solar) operation?.openPanels(t);
      if (motion.deploy) operation?.update(t);
      if (t === 1) {
        model.position.copy(motion.destination);
        model.position.y += groundOffset(model.position.x, model.position.z);
        motion = null;
        dust.hide();
      }
    }
    if (playing && now >= advanceAt) {
      if (index < entries.length - 1) select(index + 1, now);
      else { stop(); onComplete(); }
    }
  }

  function manual(i) {
    stop();
    select(i);
  }

  play.addEventListener('click', () => {
    if (playing) {
      cancelMotion();
    } else {
      playing = true;
      select(index < 0 || index === entries.length - 1 ? 0 : index);
    }
  });
  previous.addEventListener('click', () => manual(index - 1));
  next.addEventListener('click', () => manual(index + 1));
  controls.addEventListener('start', () => {
    if (model) cancelMotion();
  });

  return {
    setTerrain(height) { groundOffset = height; },
    open(selectedMission) {
      mission = selectedMission;
      stationary = mission.type === 'Lander';
      index = -1;
      caption.textContent = 'Loading the NASA model…';
      eventText.textContent = '';
      // No numbered pins in the scene: the journey plays by itself (▶ Run, ← → still work).
      entries = mission.timeline.map(([date, event]) => ({ date, event }));
      layer.replaceChildren();
      layer.hidden = true;
      refresh();
    },
    attach(loadedModel) {
      model = loadedModel;
      operation = createLanderOperation(model, mission, groundOffset);
      model.updateWorldMatrix(true, true);
      model.traverse(part => {
        if (!/^suspension_(left|right)_(front|middle|rear)_wheel$/.test(part.name)) return;
        const radius = new Box3().setFromObject(part, true).getSize(new Vector3()).y / 2;
        if (!radius) return;
        const axis = wheelAxis.clone().transformDirection(part.matrixWorld);
        wheels.push({ part, rest: part.quaternion.clone(), radius, sign: Math.sign(axis.x),
          frontRight: part.name === 'suspension_right_front_wheel' });
      });
      const names = mission.id === 'ingenuity' ? ['rotors_01', 'rotors_02'] : [];
      joints = names.map(name => model.getObjectByName(name)).filter(Boolean)
        .map(part => ({ part, rest: new Quaternion().copy(part.quaternion) }));
      refresh();
    },
    close() {
      cancelMotion();
      operation?.dispose();
      operation = null;
      model = null;
      joints = [];
      wheels = [];
      layer.hidden = true;
    },
    reset() {
      cancelMotion();
      model?.position.set(0, restHeight, 0);
      if (model) resetPose();
      index = -1;
      caption.textContent = selectionHint();
      eventText.textContent = '';
      refresh();
    },
    /** Start the actions from milestone 1 without waiting for a click. */
    autoplay() {
      if (!model || !entries.length) return;
      playing = true;
      select(0);
    },
    animate,
    project() {}, // no milestone pins to place any more
  };
}
