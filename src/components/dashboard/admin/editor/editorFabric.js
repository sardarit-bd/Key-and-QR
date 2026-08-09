/**
 * Editor Fabric.js utility layer
 *
 * All Fabric.js operations are encapsulated here.
 * Components interact with Fabric only through these helpers.
 * The Zustand store holds the canonical data; Fabric canvas is the view.
 *
 * Performance design:
 * - renderElements() is only called on STRUCTURAL changes (add/remove/reorder).
 * - Property updates from Fabric events are pushed to the store via useEditorSync,
 *   but do NOT trigger re-render because the sync hook does not call setState
 *   for every pixel change — only on object:modified (mouse-up after drag ends).
 * - Pan uses middle-mouse button to avoid conflicts with element manipulation.
 */
import { CANVAS_DEFAULTS, DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './editorConstants';
import { getIconSvgColored } from './iconUtils';

let fabric = null;
let canvasInstance = null;

// ============================================================
// Initialize Fabric.js (lazy import)
// ============================================================

const getFabric = async () => {
  if (!fabric) {
    const mod = await import('fabric');
    fabric = mod.fabric || mod.default || mod;
  }
  return fabric;
};

// ============================================================
// Canvas lifecycle
// ============================================================

export async function initCanvas(canvasEl, width, height) {
  const f = await getFabric();

  if (canvasInstance) {
    canvasInstance.dispose();
    canvasInstance = null;
  }

  const canvas = new f.Canvas(canvasEl, {
    width,
    height,
    backgroundColor: CANVAS_DEFAULTS.backgroundColor,
    preserveObjectStacking: true,
    stopContextMenu: true,
    fireRightClick: false,
    selection: true,
    defaultCursor: 'default',
  });

  // ── Pan via middle-mouse button ──
  canvas.on('mouse:down', (opt) => {
    const evt = opt.e;
    if (evt.button === 1) {
      canvas.isDragging = true;
      canvas.selection = false;
      canvas.lastPosX = evt.clientX;
      canvas.lastPosY = evt.clientY;
    }
  });

  canvas.on('mouse:move', (opt) => {
    if (canvas.isDragging) {
      const evt = opt.e;
      const vpt = canvas.viewportTransform;
      vpt[4] += evt.clientX - canvas.lastPosX;
      vpt[5] += evt.clientY - canvas.lastPosY;
      canvas.lastPosX = evt.clientX;
      canvas.lastPosY = evt.clientY;
      canvas.renderAll();
    }
  });

  canvas.on('mouse:up', () => {
    if (canvas.isDragging) {
      canvas.isDragging = false;
      canvas.selection = true;
    }
  });

  // ── Object selection events forwarded to the sync hook ──
  // (Event registration happens in useEditorSync)

  canvasInstance = canvas;
  return canvas;
}

export function getCanvas() {
  return canvasInstance;
}

export function disposeCanvas() {
  if (canvasInstance) {
    canvasInstance.dispose();
    canvasInstance = null;
  }
}

export function isInitialized() {
  return !!canvasInstance;
}

// ============================================================
// Canvas dimensions & background
// ============================================================

export function setCanvasSize(width, height) {
  if (!canvasInstance) return;
  canvasInstance.setWidth(width);
  canvasInstance.setHeight(height);
  canvasInstance.renderAll();
}

export function setCanvasBackground(color) {
  if (!canvasInstance) return;
  canvasInstance.backgroundColor = color;
  canvasInstance.renderAll();
}

// ============================================================
// Zoom & viewport
// ============================================================

export function setCanvasZoom(zoom, point) {
  if (!canvasInstance) return;
  const zoomPoint = point || { x: canvasInstance.width / 2, y: canvasInstance.height / 2 };
  canvasInstance.zoomToPoint(zoomPoint, zoom);
  canvasInstance.renderAll();
}

export function fitCanvasToContainer(containerWidth, containerHeight) {
  if (!canvasInstance) return 1;
  const cw = canvasInstance.width;
  const ch = canvasInstance.height;
  const scaleX = (containerWidth - 80) / cw;
  const scaleY = (containerHeight - 80) / ch;
  const zoom = Math.min(scaleX, scaleY, 1);
  const center = { x: containerWidth / 2, y: containerHeight / 2 };
  canvasInstance.zoomToPoint(center, zoom);
  canvasInstance.viewportTransform[4] = (containerWidth - cw * zoom) / 2;
  canvasInstance.viewportTransform[5] = (containerHeight - ch * zoom) / 2;
  canvasInstance.renderAll();
  return zoom;
}

// ============================================================
// Incremental object management
// ============================================================

export function getObjectById(id) {
  if (!canvasInstance) return null;
  return canvasInstance.getObjects().find((o) => o.data?.elementId === id);
}

export function addObjectToCanvas(obj) {
  if (!canvasInstance) return;
  canvasInstance.add(obj);
  canvasInstance.renderAll();
}

export function removeObjectById(id) {
  if (!canvasInstance) return;
  const obj = getObjectById(id);
  if (obj) {
    canvasInstance.remove(obj);
    canvasInstance.renderAll();
  }
}

export function clearAllObjects() {
  if (!canvasInstance) return;
  canvasInstance.getObjects().forEach((obj) => canvasInstance.remove(obj));
  canvasInstance.discardActiveObject();
  canvasInstance.renderAll();
}

// ============================================================
// Object property updates (in-place, no full re-render)
// ============================================================

export function updateObjectTransform(id, props) {
  const obj = getObjectById(id);
  if (!obj) return false;
  obj.set(props);
  obj.setCoords();
  canvasInstance.renderAll();
  return true;
}

/**
 * Update text properties on an existing Fabric text object in-place.
 * Does NOT recreate the object — only changes the specified properties.
 */
export function updateTextProperties(id, props) {
  const obj = getObjectById(id);
  if (!obj) return false;
  if (!obj.isType?.('textbox') && !obj.isType?.('i-text')) return false;

  if (props.fontFamily !== undefined) obj.set('fontFamily', props.fontFamily);
  if (props.fontSize !== undefined) obj.set('fontSize', props.fontSize);
  if (props.fontWeight !== undefined) obj.set('fontWeight', props.fontWeight);
  if (props.fontStyle !== undefined) obj.set('fontStyle', props.fontStyle);
  if (props.lineHeight !== undefined) obj.set('lineHeight', props.lineHeight);
  if (props.charSpacing !== undefined) obj.set('charSpacing', props.charSpacing);
  if (props.textAlign !== undefined) obj.set('textAlign', props.textAlign);
  if (props.fill !== undefined) obj.set('fill', props.fill);
  if (props.opacity !== undefined) obj.set('opacity', props.opacity);
  if (props.angle !== undefined) obj.set('angle', props.angle);

  obj.setCoords();
  canvasInstance.renderAll();
  return true;
}

/**
 * Update icon properties on an existing Fabric group in-place.
 * - color: updates stroke/fill on all child path elements
 * - size:  scales the group proportionally
 * - name: returns false (requires full re-render to reload SVG)
 */
export function updateIconProperties(id, props) {
  const obj = getObjectById(id);
  if (!obj) return false;
  if (!obj.isType?.('group')) return false;

  if (props.iconName !== undefined) {
    // Changing the icon name requires reloading the SVG — signal caller
    // to trigger a structural re-render via incrementVersion.
    return false;
  }

  const currentSize = obj.data?.iconSize || DEFAULT_ICON_SIZE;
  const currentColor = obj.data?.iconColor || DEFAULT_ICON_COLOR;

  let needsRender = false;

  if (props.color !== undefined) {
    const paths = obj._objects || obj.objects || [];
    paths.forEach((child) => {
      if (child.set) {
        if (child.stroke !== undefined && child.stroke !== null) {
          child.set({ stroke: props.color });
        }
        if (child.fill !== undefined && child.fill !== null && child.fill !== 'none') {
          child.set({ fill: props.color });
        }
      }
    });
    obj.set('data', { ...obj.data, iconColor: props.color });
    needsRender = true;
  }

  if (props.size !== undefined && props.size > 0 && props.size !== currentSize) {
    // Size change — trigger re-render for clean SVG regeneration
    return false;
  }

  if (props.opacity !== undefined) {
    obj.set('opacity', props.opacity);
    needsRender = true;
  }

  if (props.angle !== undefined) {
    obj.set('angle', props.angle);
    needsRender = true;
  }

  if (needsRender) {
    obj.setCoords();
    canvasInstance.renderAll();
    return true;
  }
  return false;
}

// ============================================================
// Full re-render from store data (structural changes only)
// Preserves zoom/viewport between re-renders.
// ============================================================

export async function renderElements(elements, background) {
  const f = await getFabric();
  if (!canvasInstance) return;

  // Save current viewport transform
  const savedVpt = canvasInstance.viewportTransform
    ? [...canvasInstance.viewportTransform]
    : null;

  canvasInstance.clear();

  // Apply background
  applyBackgroundToCanvas(background);

  // Sort by zIndex and render
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    try {
      const obj = await elementToFabricObject(el);
      if (obj) {
        canvasInstance.add(obj);
      }
    } catch (err) {
      console.warn('[Editor] Failed to render element:', el.id, err);
    }
  }

  // Restore viewport
  if (savedVpt) {
    canvasInstance.setViewportTransform(savedVpt);
  }

  canvasInstance.renderAll();
  return true;
}

// ============================================================
// Background application (sync, no await)
// ============================================================

function applyBackgroundToCanvas(bg) {
  if (!canvasInstance) return;

  if (!bg) {
    canvasInstance.backgroundColor = CANVAS_DEFAULTS.backgroundColor;
    canvasInstance.backgroundImage = null;
    return;
  }

  switch (bg.type) {
    case 'solid':
      canvasInstance.backgroundColor = bg.color;
      canvasInstance.backgroundImage = null;
      break;
    case 'gradient': {
      const gType = bg.gradient === 'radial' ? 'radial' : 'linear';
      const coords = gType === 'radial'
        ? { r1: 0, r2: Math.max(canvasInstance.width, canvasInstance.height) / 2 }
        : { x1: 0, y1: 0, x2: canvasInstance.width, y2: canvasInstance.height };
      canvasInstance.backgroundColor = new (getFabricSync().Gradient)({
        type: gType,
        gradientUnits: 'pixels',
        coords,
        colorStops: (bg.colors || ['#000', '#fff']).map((color, i) => ({
          offset: i / (bg.colors.length - 1 || 1),
          color,
        })),
      });
      canvasInstance.backgroundImage = null;
      break;
    }
    case 'image':
      canvasInstance.backgroundColor = '#ffffff';
      // Image background is loaded asynchronously later via setBackgroundImage
      break;
  }
}

export function setBackgroundImageFromUrl(url) {
  if (!canvasInstance) return;
  const f = getFabricSync();
  f.Image.fromURL(
    url,
    (img) => {
      if (!canvasInstance) return;
      canvasInstance.setBackgroundImage(
        img,
        canvasInstance.renderAll.bind(canvasInstance),
        {
          scaleX: canvasInstance.width / img.width,
          scaleY: canvasInstance.height / img.height,
        }
      );
    },
    { crossOrigin: 'anonymous' }
  );
}

// ── Synchronous access (after import) ──
let _fabricSync = null;
function getFabricSync() {
  if (!_fabricSync) {
    // Only call after initCanvas has loaded fabric
    _fabricSync = canvasInstance?.constructor?.prototype?.constructor;
  }
  return _fabricSync;
}

// ============================================================
// Element conversion: store element → Fabric object
// ============================================================

export async function elementToFabricObject(el) {
  const f = await getFabric();
  if (!f) return null;

  const common = {
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    angle: el.rotation || 0,
    scaleX: el.scaleX || 1,
    scaleY: el.scaleY || 1,
    opacity: el.opacity ?? 1,
    visible: el.visible !== false,
    selectable: !el.locked,
    evented: !el.locked,
    data: { elementId: el.id },
  };

  switch (el.type) {
    case 'text': {
      if (!el.textData) return null;
      const text = new f.Textbox(el.textData.content, {
        ...common,
        originX: 'center',
        originY: 'center',
        fontFamily: el.textData.fontFamily || 'Inter',
        fontSize: el.textData.fontSize || 48,
        fontWeight: el.textData.fontWeight || 'normal',
        fontStyle: el.textData.fontStyle || 'normal',
        lineHeight: el.textData.lineHeight || 1.3,
        charSpacing: (el.textData.letterSpacing || 0) * 10,
        textAlign: el.textData.textAlign || 'center',
        fill: el.textData.color || '#000000',
        stroke: el.textData.stroke?.color || null,
        strokeWidth: el.textData.stroke?.width || 0,
      });

      if (el.textData.shadow) {
        text.shadow = new f.Shadow({
          color: el.textData.shadow.color || 'rgba(0,0,0,0.4)',
          blur: el.textData.shadow.blur || 4,
          offsetX: el.textData.shadow.offsetX || 0,
          offsetY: el.textData.shadow.offsetY || 2,
        });
      }

      if (el.width) text.set('width', el.width);
      return text;
    }

    case 'image': {
      if (!el.imageData?.source?.url) return null;
      return new Promise((resolve) => {
        f.Image.fromURL(
          el.imageData.source.url,
          (img) => {
            if (!img) { resolve(null); return; }
            img.set({
              ...common,
              scaleX: el.scaleX || 1,
              scaleY: el.scaleY || 1,
              objectFit: el.imageData.fit || 'cover',
            });
            img.set('data', {
              elementId: el.id,
              publicId: el.imageData.source.publicId || '',
              ...img.data,
            });
            resolve(img);
          },
          { crossOrigin: 'anonymous' }
        );
      });
    }

    case 'shape': {
      if (!el.shapeData) return null;
      switch (el.shapeData.shapeType) {
        case 'rect':
          return new f.Rect({
            ...common,
            rx: el.shapeData.borderRadius || 0,
            ry: el.shapeData.borderRadius || 0,
            fill: el.shapeData.fillColor || '#cccccc',
            stroke: el.shapeData.strokeColor || null,
            strokeWidth: el.shapeData.strokeWidth || 0,
          });
        case 'circle':
          return new f.Ellipse({
            ...common,
            rx: el.width / 2,
            ry: el.height / 2,
            fill: el.shapeData.fillColor || '#cccccc',
            stroke: el.shapeData.strokeColor || null,
            strokeWidth: el.shapeData.strokeWidth || 0,
          });
        case 'line':
          return new f.Line(
            [el.x, el.y, el.x + el.width, el.y + el.height],
            {
              stroke: el.shapeData.strokeColor || '#000000',
              strokeWidth: el.shapeData.strokeWidth || 2,
              data: { elementId: el.id },
            }
          );
      }
      return null;
    }

    case 'icon': {
      if (!el.iconData) return null;
      const iconName = el.iconData.iconName || 'sparkles';
      const iconColor = el.iconData.color || DEFAULT_ICON_COLOR;
      const iconSize = el.iconData.size || DEFAULT_ICON_SIZE;
      const svgString = getIconSvgColored(iconName, iconColor, iconSize);
      return new Promise((resolve) => {
        f.loadSVGFromString(svgString, (objects, options) => {
          if (!objects || objects.length === 0) {
            resolve(null);
            return;
          }
          const group = new f.Group(objects, {
            ...options,
            left: el.x,
            top: el.y,
            originX: 'center',
            originY: 'center',
            angle: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            opacity: el.opacity ?? 1,
            visible: el.visible !== false,
            selectable: !el.locked,
            evented: !el.locked,
            data: {
              elementId: el.id,
              iconName,
              iconColor,
              iconSize,
            },
          });
          resolve(group);
        });
      });
    }

    default:
      return null;
  }
}

// ============================================================
// Extract store-compatible data from Fabric objects
// ============================================================

export function fabricObjectToElement(obj) {
  const id = obj.data?.elementId || `el_${Date.now()}`;

  const base = {
    id,
    x: obj.left || 0,
    y: obj.top || 0,
    width: obj.width || 0,
    height: obj.height || 0,
    rotation: obj.angle || 0,
    scaleX: obj.scaleX || 1,
    scaleY: obj.scaleY || 1,
    opacity: obj.opacity ?? 1,
    visible: obj.visible !== false,
    locked: !obj.selectable,
    zIndex: 0,
  };

  if (obj.isType?.('textbox') || obj.isType?.('i-text')) {
    return {
      ...base,
      type: 'text',
      textData: {
        content: obj.text || '',
        fontFamily: obj.fontFamily || 'Inter',
        fontSize: obj.fontSize || 48,
        fontWeight: obj.fontWeight || 'normal',
        fontStyle: obj.fontStyle || 'normal',
        lineHeight: obj.lineHeight || 1.3,
        letterSpacing: (obj.charSpacing || 0) / 10,
        textAlign: obj.textAlign || 'center',
        color: obj.fill || '#000000',
        stroke: obj.stroke
          ? { color: obj.stroke, width: obj.strokeWidth || 0 }
          : undefined,
        shadow: obj.shadow
          ? {
              color: obj.shadow.color,
              blur: obj.shadow.blur,
              offsetX: obj.shadow.offsetX,
              offsetY: obj.shadow.offsetY,
            }
          : undefined,
        wrap: true,
      },
    };
  }

  if (obj.isType?.('image')) {
    return {
      ...base,
      type: 'image',
      imageData: {
        source: {
          type: 'cloudinary',
          publicId: obj.data?.publicId || '',
          url: obj.getSrc?.() || '',
        },
        fit: obj.objectFit || 'cover',
      },
    };
  }

   if (obj.isType?.('rect') || obj.isType?.('ellipse') || obj.isType?.('line')) {
    const isRect = obj.isType?.('rect');
    const isCircle = obj.isType?.('ellipse');
    return {
      ...base,
      type: 'shape',
      shapeData: {
        shapeType: isCircle ? 'circle' : isRect ? 'rect' : 'line',
        fillColor: obj.fill || undefined,
        strokeColor: obj.stroke || undefined,
        strokeWidth: obj.strokeWidth || undefined,
        borderRadius: isRect ? (obj.rx || 0) : undefined,
        radius: isCircle ? Math.min(obj.width, obj.height) / 2 : undefined,
      },
    };
  }

  // Icon groups carry iconName in data
  if (obj.isType?.('group') && obj.data?.iconName) {
    return {
      ...base,
      type: 'icon',
      iconData: {
        iconName: obj.data.iconName,
        size: obj.data.iconSize || DEFAULT_ICON_SIZE,
        color: obj.data.iconColor || DEFAULT_ICON_COLOR,
      },
    };
  }

  return {
    ...base,
    type: 'text',
    textData: { content: '', color: '#000000', wrap: true },
  };
}

// ============================================================
// Selection
// ============================================================

export function getSelectedObjectIds() {
  if (!canvasInstance) return [];
  const active = canvasInstance.getActiveObjects();
  if (!active || active.length === 0) return [];
  return active
    .map((obj) => obj.data?.elementId)
    .filter(Boolean);
}

export function selectObjectById(id) {
  if (!canvasInstance) return;
  canvasInstance.discardActiveObject();
  const obj = canvasInstance
    .getObjects()
    .find((o) => o.data?.elementId === id);
  if (obj) {
    canvasInstance.setActiveObject(obj);
    canvasInstance.renderAll();
  }
}

export function discardSelection() {
  if (!canvasInstance) return;
  canvasInstance.discardActiveObject();
  canvasInstance.renderAll();
}

// ============================================================
// Export — render canvas to blob
// ============================================================

export function exportCanvasToBlob(mimeType = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (!canvasInstance) {
      reject(new Error('Canvas not initialized'));
      return;
    }
    canvasInstance.renderAll();
    canvasInstance.getElement().toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export canvas'));
      },
      mimeType,
      quality
    );
  });
}
