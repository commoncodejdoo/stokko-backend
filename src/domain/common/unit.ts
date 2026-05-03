/**
 * Unit of measure for an Article. Mirrors the Prisma `Unit` enum.
 *
 *  - KOM    — komad (piece)        — integer quantities only
 *  - KG     — kilogram             — fractional allowed
 *  - L      — litre                — fractional allowed
 *  - BOCA   — bottle               — integer
 *  - GAJBA  — crate                — integer
 *  - PAKET  — pack                 — integer
 *  - KUTIJA — box                  — integer
 */
export enum Unit {
  KOM = 'KOM',
  KG = 'KG',
  L = 'L',
  BOCA = 'BOCA',
  GAJBA = 'GAJBA',
  PAKET = 'PAKET',
  KUTIJA = 'KUTIJA',
}

const FRACTIONAL_UNITS = new Set<Unit>([Unit.KG, Unit.L]);

export const isFractionalUnit = (unit: Unit): boolean => FRACTIONAL_UNITS.has(unit);

export const ALL_UNITS: Unit[] = Object.values(Unit);
