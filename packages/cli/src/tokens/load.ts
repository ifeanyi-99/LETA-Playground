import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AllSnapshots,
  EffectStylesSnapshot,
  TextStylesSnapshot,
  Variable,
  VariableCollection,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.resolve(__dirname, '../../snapshots');

async function readJson<T>(file: string): Promise<T> {
  const buf = await readFile(path.join(SNAPSHOT_DIR, file), 'utf8');
  return JSON.parse(buf) as T;
}

export async function loadAllSnapshots(): Promise<AllSnapshots> {
  const [brand, alias, mappedColors, mappedType, mappedSizes, textStyles, effectStyles] =
    await Promise.all([
      readJson<VariableCollection>('brand.json'),
      readJson<VariableCollection>('alias.json'),
      readJson<VariableCollection>('mapped-colors.json'),
      readJson<VariableCollection>('mapped-type.json'),
      readJson<VariableCollection>('mapped-sizes.json'),
      readJson<TextStylesSnapshot>('text-styles.json'),
      readJson<EffectStylesSnapshot>('effect-styles.json'),
    ]);

  const collections: VariableCollection[] = [brand, alias, mappedColors, mappedType, mappedSizes];
  const variableIndex = new Map<string, Variable>();
  const collectionByVarId = new Map<string, VariableCollection>();

  for (const c of collections) {
    for (const v of c.variables) {
      variableIndex.set(v.id, v);
      collectionByVarId.set(v.id, c);
    }
  }

  return {
    brand,
    alias,
    mappedColors,
    mappedType,
    mappedSizes,
    textStyles,
    effectStyles,
    variableIndex,
    collectionByVarId,
  };
}

export { SNAPSHOT_DIR };
