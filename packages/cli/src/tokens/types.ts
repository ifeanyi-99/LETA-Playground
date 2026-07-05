// Types mirroring the Figma snapshot JSON shape.

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export type VariableValue = FigmaColor | number | string | boolean | VariableAlias;

export interface VariableMode {
  modeId: string;
  name: string;
}

export interface Variable {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  scopes: string[];
  valuesByMode: Record<string, VariableValue>;
}

export interface VariableCollection {
  id: string;
  name: string;
  defaultModeId: string;
  modes: VariableMode[];
  variables: Variable[];
}

export interface TextStyle {
  id: string;
  name: string;
  description?: string;
  fontName: { family: string; style: string };
  fontSize: number;
  lineHeight: { unit: 'PIXELS' | 'PERCENT' | 'AUTO'; value?: number };
  letterSpacing: { unit: 'PIXELS' | 'PERCENT'; value: number };
  paragraphSpacing: number;
  textCase: string;
  textDecoration: string;
  boundVariables?: Record<string, VariableAlias>;
}

export interface TextStylesSnapshot {
  count: number;
  styles: TextStyle[];
}

/**
 * One layer of a Figma effect style. We currently only support DROP_SHADOW
 * (the only type used by LETA elevations); INNER_SHADOW / BLUR aren't emitted.
 */
export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
  visible?: boolean;
  blendMode?: string;
}

export interface EffectStyle {
  id: string;
  name: string;
  description?: string;
  effects: Effect[];
}

export interface EffectStylesSnapshot {
  count: number;
  styles: EffectStyle[];
}

export interface AllSnapshots {
  brand: VariableCollection;
  alias: VariableCollection;
  mappedColors: VariableCollection;
  mappedType: VariableCollection;
  mappedSizes: VariableCollection;
  textStyles: TextStylesSnapshot;
  effectStyles: EffectStylesSnapshot;
  /** Map of variable id → Variable for fast lookup across all collections. */
  variableIndex: Map<string, Variable>;
  /** Map of variable id → which collection it belongs to. */
  collectionByVarId: Map<string, VariableCollection>;
}
