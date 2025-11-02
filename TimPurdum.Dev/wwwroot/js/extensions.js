window.setLayerOnTop = (layerId, viewId, core) => {
    let view = core.arcGisObjectRefs[viewId];
    let layer = core.arcGisObjectRefs[layerId];
    if (view) {
        view.map.reorder(layer, view.map.layers.length - 1);
    }
};