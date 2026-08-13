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
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveCategoryIcon } from '@/components/dashboard/admin/categories/categoryIconRegistry';
import { SHAPE_REGISTRY } from './shapeRegistry';

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

export async function initStaticCanvas(canvasEl, width, height) {
  const f = await getFabric();

  if (canvasInstance) {
    canvasInstance.dispose();
    canvasInstance = null;
  }

  const canvas = new f.StaticCanvas(canvasEl, {
    width,
    height,
    backgroundColor: CANVAS_DEFAULTS.backgroundColor,
  });

  canvasInstance = canvas;
  return canvas;
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
  if (props.underline !== undefined) obj.set('underline', props.underline);
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

  console.log("[DEBUG CANVAS] renderElements called with", elements.length, "elements");

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
      console.log("[DEBUG CANVAS] Rendering element:", el.id, "type:", el.type);
      const obj = await elementToFabricObject(el);
      console.log("[DEBUG CANVAS] elementToFabricObject resolved to:", obj ? obj.type || "unknown" : "null/undefined");
      if (obj) {
        canvasInstance.add(obj);
        console.log("[DEBUG CANVAS] Object added to canvas. Canvas object count now:", canvasInstance.getObjects().length);
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
  console.log("[DEBUG CANVAS] renderElements finished. Final objects on canvas:", canvasInstance.getObjects().map(o => ({ id: o.data?.elementId, type: o.type })));
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

export async function setBackgroundImageFromUrl(url) {
  if (!canvasInstance) return;
  const f = getFabricSync();
  const ImageClass = f?.FabricImage || f?.Image;
  if (!ImageClass) return;

  try {
    const img = await ImageClass.fromURL(url, { crossOrigin: 'anonymous' });
    if (!canvasInstance) return;
    img.set({
      scaleX: canvasInstance.width / img.width,
      scaleY: canvasInstance.height / img.height,
    });
    canvasInstance.backgroundImage = img;
    canvasInstance.requestRenderAll();
  } catch (err) {
    console.warn('[Editor] Failed to set background image:', url, err);
  }
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

export function getLucideIconSvgString(iconName, color, size = 48) {
  const IconComp = resolveCategoryIcon(iconName);
  if (!IconComp) return '';
  try {
    const markup = renderToStaticMarkup(
      React.createElement(IconComp, { size, color })
    );
    return markup;
  } catch (err) {
    console.warn('Failed to render Lucide icon to static markup:', iconName, err);
    return '';
  }
}

function calculateObjectFitScales(imgWidth, imgHeight, containerWidth, containerHeight, fit) {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imgWidth / imgHeight;
  
  let scaleX = 1;
  let scaleY = 1;
  
  if (fit === 'cover') {
    if (imageRatio > containerRatio) {
      scaleY = containerHeight / imgHeight;
      scaleX = scaleY;
    } else {
      scaleX = containerWidth / imgWidth;
      scaleY = scaleX;
    }
  } else if (fit === 'contain') {
    if (imageRatio > containerRatio) {
      scaleX = containerWidth / imgWidth;
      scaleY = scaleX;
    } else {
      scaleY = containerHeight / imgHeight;
      scaleX = scaleY;
    }
  } else if (fit === 'fill') {
    scaleX = containerWidth / imgWidth;
    scaleY = containerHeight / imgHeight;
  }
  
  return { scaleX, scaleY };
}

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
    data: { elementId: el.id, locked: !!el.locked },
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
        underline: el.textData.underline || false,
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
      console.log("[DEBUG IMAGE] Processing element:", el.id, "URL:", el.imageData?.source?.url);
      if (!el.imageData?.source?.url) {
        console.warn("[DEBUG IMAGE] No image URL found for element:", el.id);
        return null;
      }
      return new Promise(async (resolve) => {
        try {
          const ImageClass = f.FabricImage || f.Image;
          if (!ImageClass) {
            console.error('[Editor] FabricImage or Image class not found on fabric module.');
            resolve(null);
            return;
          }

          console.log("[DEBUG IMAGE] Loading image from URL...");
          const img = await ImageClass.fromURL(el.imageData.source.url, {
            crossOrigin: 'anonymous',
          });

          if (!img) {
            console.warn("[DEBUG IMAGE] Failed to create image object from URL.");
            resolve(null);
            return;
          }

          console.log("[DEBUG IMAGE] Image loaded. Natural size:", img.width, "x", img.height);
          const fit = el.imageData.fit || 'cover';
          const { scaleX, scaleY } = calculateObjectFitScales(
            img.width,
            img.height,
            el.width || img.width,
            el.height || img.height,
            fit
          );

          console.log("[DEBUG IMAGE] Fit mode:", fit, "Calculated scales:", scaleX, scaleY);
          img.set({
            ...common,
            width: img.width,
            height: img.height,
            scaleX: (el.scaleX || 1) * scaleX,
            scaleY: (el.scaleY || 1) * scaleY,
            objectFit: fit,
          });

          img.set('data', {
            elementId: el.id,
            locked: !!el.locked,
            publicId: el.imageData.source.publicId || '',
            ...img.data,
          });

          console.log("[DEBUG IMAGE] Fabric Image object created:", {
            type: img.type,
            left: img.left,
            top: img.top,
            width: img.width,
            height: img.height,
            scaleX: img.scaleX,
            scaleY: img.scaleY,
            visible: img.visible,
            opacity: img.opacity
          });

          resolve(img);
        } catch (err) {
          console.error('[DEBUG IMAGE] Error in image loader:', err);
          resolve(null);
        }
      });
    }

    case 'shape': {
      if (!el.shapeData) return null;
      const type = el.shapeData.shapeType || 'rect';
      const shapeDef = SHAPE_REGISTRY.find((s) => s.id === type);

      const fillColor = el.shapeData.fillColor || '#cbd5e1';
      const strokeColor = el.shapeData.strokeColor || '#334155';
      const strokeWidth = typeof el.shapeData.strokeWidth === 'number' ? el.shapeData.strokeWidth : 0;
      const borderStyle = el.shapeData.borderStyle || 'solid';
      const dashArray = borderStyle === 'dashed' ? [6, 6] : borderStyle === 'dotted' ? [2, 2] : null;

      // Common properties mapped to Fabric options
      const shapeOptions = {
        ...common,
        fill: fillColor,
        stroke: strokeWidth > 0 ? strokeColor : null,
        strokeWidth: strokeWidth,
        strokeDashArray: dashArray,
        data: {
          ...common.data,
          shapeType: type,
        },
      };

      // Native basic shapes
      if (type === 'rect' || type === 'square' || type === 'rounded-rect') {
        const rx = type === 'rounded-rect' ? (el.shapeData.borderRadius ?? 12) : (el.shapeData.borderRadius || 0);
        return new f.Rect({
          ...shapeOptions,
          rx,
          ry: rx,
        });
      }

      if (type === 'circle' || type === 'ellipse') {
        return new f.Ellipse({
          ...shapeOptions,
          rx: el.width / 2,
          ry: el.height / 2,
        });
      }

      if (type === 'triangle') {
        return new f.Triangle(shapeOptions);
      }

      if (type === 'line') {
        return new f.Line(
          [0, 0, el.width, el.height],
          {
            ...shapeOptions,
            stroke: strokeColor || '#000000',
            strokeWidth: strokeWidth || 2,
          }
        );
      }

      // If it's a custom path from registry, draw it as a Path!
      if (shapeDef && shapeDef.type === 'path' && shapeDef.path) {
        // Base coordinate box is 100x100.
        // We set path width and height options to 100 so that scaleX/scaleY represents scaling factor.
        return new f.Path(shapeDef.path, {
          ...shapeOptions,
          width: 100,
          height: 100,
          scaleX: (el.scaleX || 1) * (el.width / 100),
          scaleY: (el.scaleY || 1) * (el.height / 100),
        });
      }

      // Fallback to basic rect
      return new f.Rect(shapeOptions);
    }

    case 'icon': {
      if (!el.iconData) return null;
      const iconType = el.iconData.iconType || 'library';
      const iconColor = el.iconData.color || DEFAULT_ICON_COLOR;
      const iconSize = el.iconData.size || DEFAULT_ICON_SIZE;

      if (iconType === 'custom' && el.iconData.iconUrl) {
        const url = el.iconData.iconUrl;
        return new Promise((resolve) => {
          fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error('Failed to fetch SVG');
              return res.text();
            })
            .then(async (svgString) => {
              try {
                const { objects, options } = await f.loadSVGFromString(svgString);
                if (!objects || objects.length === 0) {
                  resolve(null);
                  return;
                }
                const cleanObjects = objects.filter(Boolean);
                const group = new f.Group(cleanObjects, {
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
                    locked: !!el.locked,
                    iconType: 'custom',
                    iconUrl: url,
                    iconSize,
                    iconColor,
                  },
                });
                resolve(group);
              } catch (err) {
                console.warn('[Editor] Failed to parse custom SVG:', url, err);
                resolve(null);
              }
            })
            .catch((err) => {
              console.warn('[Editor] Failed to load custom SVG:', url, err);
              resolve(null);
            });
        });
      } else {
        const iconName = el.iconData.iconName || 'Sparkles';
        const svgString = getLucideIconSvgString(iconName, iconColor, iconSize);
        return new Promise(async (resolve) => {
          try {
            const { objects, options } = await f.loadSVGFromString(svgString);
            if (!objects || objects.length === 0) {
              resolve(null);
              return;
            }
            const cleanObjects = objects.filter(Boolean);
            const group = new f.Group(cleanObjects, {
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
                locked: !!el.locked,
                iconType: 'library',
                iconName,
                iconColor,
                iconSize,
              },
            });
            resolve(group);
          } catch (err) {
            console.warn('[Editor] Failed to load library icon SVG:', iconName, err);
            resolve(null);
          }
        });
      }
    }

    case 'audio': {
      const audioTitle = el.audioData?.title || 'Audio Track';
      const bg = new f.Rect({
        left: 0,
        top: 0,
        width: 300,
        height: 70,
        rx: 10,
        ry: 10,
        fill: '#f1f5f9',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
      });

      const title = new f.Text(audioTitle, {
        left: -50,
        top: -10,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#334155',
        originX: 'left',
        originY: 'center',
      });

      const subtitle = new f.Text('Audio Element', {
        left: -50,
        top: 12,
        fontFamily: 'Inter',
        fontSize: 10,
        fill: '#64748b',
        originX: 'left',
        originY: 'center',
      });

      const svgMusic = getLucideIconSvgString('Music', '#6366f1', 24);
      return new Promise(async (resolve) => {
        try {
          const { objects, options } = await f.loadSVGFromString(svgMusic);
          const cleanObjects = (objects || []).filter(Boolean);
          const iconGroup = new f.Group(cleanObjects, {
            ...options,
            left: -110,
            top: 0,
            originX: 'center',
            originY: 'center',
          });

          const group = new f.Group([bg, iconGroup, title, subtitle], {
            left: el.x,
            top: el.y,
            width: 300,
            height: 70,
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
              locked: !!el.locked,
              audioData: el.audioData || {},
            },
          });
          resolve(group);
        } catch (err) {
          console.warn('[Editor] Failed to load audio icon SVG:', err);
          resolve(null);
        }
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
    locked: !!obj.data?.locked,
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
        underline: obj.underline || false,
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

  if (
    obj.isType?.('rect') ||
    obj.isType?.('ellipse') ||
    obj.isType?.('line') ||
    obj.isType?.('triangle') ||
    obj.isType?.('path') ||
    obj.isType?.('polygon')
  ) {
    const isRect = obj.isType?.('rect');
    const isCircle = obj.isType?.('ellipse');
    const isTriangle = obj.isType?.('triangle');
    const isLine = obj.isType?.('line');

    // Deduce borderStyle from strokeDashArray
    let borderStyle = 'solid';
    if (obj.strokeDashArray) {
      if (obj.strokeDashArray[0] === 6) borderStyle = 'dashed';
      else if (obj.strokeDashArray[0] === 2) borderStyle = 'dotted';
    }

    const type = obj.data?.shapeType || (isCircle ? 'circle' : isRect ? 'rect' : isTriangle ? 'triangle' : isLine ? 'line' : 'rect');
    const isCustomPath = type !== 'rect' && type !== 'circle' && type !== 'ellipse' && type !== 'triangle' && type !== 'line' && type !== 'square' && type !== 'rounded-rect';

    return {
      ...base,
      type: 'shape',
      width: isCustomPath ? 100 : (obj.width || 0),
      height: isCustomPath ? 100 : (obj.height || 0),
      shapeData: {
        shapeType: type,
        fillColor: obj.fill || undefined,
        strokeColor: obj.stroke || undefined,
        strokeWidth: typeof obj.strokeWidth === 'number' ? obj.strokeWidth : 0,
        borderRadius: isRect ? (obj.rx || 0) : undefined,
        borderStyle,
      },
    };
  }

  // Icon groups carry iconName or iconUrl in data
  if (obj.isType?.('group') && (obj.data?.iconName || obj.data?.iconUrl)) {
    return {
      ...base,
      type: 'icon',
      iconData: {
        iconType: obj.data.iconType || 'library',
        iconName: obj.data.iconName || '',
        iconUrl: obj.data.iconUrl || '',
        size: obj.data.iconSize || DEFAULT_ICON_SIZE,
        color: obj.data.iconColor || DEFAULT_ICON_COLOR,
      },
    };
  }

  // Audio groups carry audioData
  if (obj.isType?.('group') && obj.data?.audioData) {
    return {
      ...base,
      type: 'audio',
      audioData: {
        source: obj.data.audioData.source || '',
        title: obj.data.audioData.title || '',
        autoplay: obj.data.audioData.autoplay ?? false,
        loop: obj.data.audioData.loop ?? false,
        volume: obj.data.audioData.volume ?? 1,
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
