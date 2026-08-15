'use client';

import { useCallback } from 'react';
import useEditorStore from './editorStore';
import { updateObjectTransform } from './editorFabric';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import ShapePicker from './ShapePicker';

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-medium text-foreground-tertiary uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

export default function ShapeProperties({ selectedEl }) {
  const patchElementData = useEditorStore((s) => s.patchElementData);
  const incrementVersion = useEditorStore((s) => s.incrementVersion);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const id = selectedEl?.id;
  const shapeData = selectedEl?.shapeData || {};
  const shapeType = shapeData.shapeType || 'rect';
  const fillColor = shapeData.fillColor || '#cbd5e1';
  const strokeColor = shapeData.strokeColor || '#334155';
  const strokeWidth = shapeData.strokeWidth || 0;
  const borderRadius = shapeData.borderRadius || 0;
  const borderStyle = shapeData.borderStyle || 'solid';

  const applyShapeProp = useCallback(
    (key, value) => {
      if (!id) return;

      let fabricProps = {};
      if (key === 'fillColor') {
        fabricProps = { fill: value };
      } else if (key === 'strokeColor') {
        fabricProps = { stroke: value };
      } else if (key === 'strokeWidth') {
        fabricProps = { strokeWidth: value };
      } else if (key === 'borderRadius' && shapeType === 'rect') {
        fabricProps = { rx: value, ry: value };
      } else if (key === 'borderStyle') {
        const dashArray =
          value === 'dashed' ? [6, 6] : value === 'dotted' ? [2, 2] : null;
        fabricProps = { strokeDashArray: dashArray };
      }

      const fabricUpdated =
        Object.keys(fabricProps).length > 0
          ? updateObjectTransform(id, fabricProps)
          : false;

      patchElementData(id, 'shapeData', {
        [key]: value,
      });

      pushHistory();

      // If the shape type itself changes, we must recreate the Fabric object structurally
      if (key === 'shapeType' || !fabricUpdated) {
        incrementVersion();
      }
    },
    [id, shapeType, patchElementData, incrementVersion, pushHistory]
  );

  return (
    <div className="space-y-5">
      {/* Shape Type */}
      <div>
        <FieldLabel>Shape Type</FieldLabel>
        <ShapePicker value={shapeType} onChange={(v) => applyShapeProp('shapeType', v)} />
      </div>

      {/* Fill Color (if not a line) */}
      {shapeType !== 'line' && (
        <div>
          <FieldLabel>Fill Color</FieldLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => applyShapeProp('fillColor', e.target.value)}
              className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-background p-0.5"
            />
            <span className="text-xs text-foreground-tertiary font-mono">{fillColor}</span>
          </div>
        </div>
      )}

      {/* Stroke Width */}
      <div>
        <FieldLabel>Stroke Width</FieldLabel>
        <div className="flex items-center gap-2 h-9">
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={strokeWidth}
            onChange={(e) => applyShapeProp('strokeWidth', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-muted rounded cursor-pointer accent-primary"
          />
          <span className="text-[11px] font-mono w-6 text-right shrink-0">
            {strokeWidth}px
          </span>
        </div>
      </div>

      {/* Stroke Color (only if strokeWidth > 0) */}
      {strokeWidth > 0 && (
        <div>
          <FieldLabel>Stroke Color</FieldLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => applyShapeProp('strokeColor', e.target.value)}
              className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-background p-0.5"
            />
            <span className="text-xs text-foreground-tertiary font-mono">{strokeColor}</span>
          </div>
        </div>
      )}

      {/* Border Style (only if strokeWidth > 0) */}
      {strokeWidth > 0 && (
        <div>
          <FieldLabel>Stroke Dash Style</FieldLabel>
          <Select value={borderStyle} onValueChange={(v) => applyShapeProp('borderStyle', v)}>
            <SelectTrigger className="h-9 text-xs rounded-lg w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid" className="text-xs">Solid</SelectItem>
              <SelectItem value="dashed" className="text-xs">Dashed</SelectItem>
              <SelectItem value="dotted" className="text-xs">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Border Radius (Rectangle only) */}
      {shapeType === 'rect' && (
        <div>
          <FieldLabel>Corner Radius (Border Radius)</FieldLabel>
          <div className="flex items-center gap-2 h-9">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={borderRadius}
              onChange={(e) => applyShapeProp('borderRadius', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-muted rounded cursor-pointer accent-primary"
            />
            <span className="text-[11px] font-mono w-6 text-right shrink-0">
              {borderRadius}px
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
