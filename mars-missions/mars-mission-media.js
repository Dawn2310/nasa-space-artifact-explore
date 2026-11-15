import catalog from '../content/catalog.json';
import assets from '../content/assets.json';

// One presentation for direct exploration and UFO tours. Never substitute another
// rover's geometry for a missing model. The linked Sojourner model is view-only.
export function createMissionMedia(stage) {
  const panel = document.createElement('figure');
  panel.id = 'mission-media'; panel.hidden = true;
  stage.append(panel);
  return {
    open(mission) {
      panel.replaceChildren(); panel.hidden = false;
      document.body.classList.add('has-mission-media');
      const artifact = catalog.artifacts.find(item => item.id === mission.id);
      const photo = assets.assets.find(item => item.id === artifact?.imageAssetId);
      if (mission.viewer) {
        const frame = document.createElement('iframe');
        frame.title = mission.name + ' interactive 3D model by ' + mission.credit;
        frame.allow = 'autoplay; fullscreen; xr-spatial-tracking';
        frame.allowFullscreen = true;
        frame.src = mission.viewer.embedUrl;
        panel.append(frame);
      } else if (photo) {
        const image = document.createElement('img');
        image.src = '/assets/' + photo.localPath;
        image.alt = photo.represents;
        panel.append(image);
      }
      const caption = document.createElement('figcaption');
      if (mission.viewer) {
        const link = document.createElement('a');
        link.href = mission.viewer.sourceUrl; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = 'Interactive 3D · ' + mission.credit + ' · Open on Sketchfab ↗';
        caption.append(link);
      } else caption.textContent = 'NASA photograph · ' + (photo?.creatorCredit ?? 'NASA') + ' · No local 3D model';
      panel.append(caption);
    },
    close() {
      panel.replaceChildren(); panel.hidden = true;
      document.body.classList.remove('has-mission-media');
    },
  };
}
