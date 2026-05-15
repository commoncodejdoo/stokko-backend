export type AnomalyKind = 'POSSIBLE_LEAK' | 'EXCESSIVE_WRITE_OFFS';

export interface AnomalySignal {
  kind: AnomalyKind;
  details: string;
}

export interface AnomalyInput {
  /** Count of ABSOLUTE COUNT corrections in the last 14 days. */
  absoluteCountCorrectionsLast14Days: number;
  /** Count of WRITE_OFF corrections in the last 30 days. */
  writeOffCorrectionsLast30Days: number;
}

/**
 * Heuristic anomaly detection over recent stock corrections.
 *
 *  - Many consecutive ABSOLUTE COUNT corrections → physical count keeps differing
 *    from system stock → suggests leakage (theft, miscounting, expired stock).
 *  - High WRITE_OFF rate → product spoilage or planning mismatch.
 */
export function detectAnomalies(input: AnomalyInput): AnomalySignal[] {
  const out: AnomalySignal[] = [];
  if (input.absoluteCountCorrectionsLast14Days >= 3) {
    out.push({
      kind: 'POSSIBLE_LEAK',
      details: `${input.absoluteCountCorrectionsLast14Days} korekcija stanja u zadnjih 14 dana`,
    });
  }
  if (input.writeOffCorrectionsLast30Days >= 5) {
    out.push({
      kind: 'EXCESSIVE_WRITE_OFFS',
      details: `${input.writeOffCorrectionsLast30Days} otpisa u zadnjih 30 dana`,
    });
  }
  return out;
}
