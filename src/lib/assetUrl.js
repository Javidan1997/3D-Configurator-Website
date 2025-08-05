export const assetUrl = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
// usage: assetUrl('models/hand.glb') -> '/3D-Configurator-Website/models/hand.glb'
