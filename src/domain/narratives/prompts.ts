/**
 * Prompt templates for narrative generation.
 *
 * Strict vocabulary rules (književni hrvatski):
 *   - "skladište", NIKAD "magacin"
 *   - "nabava", NIKAD "primka" ili "nabavka"
 *   - Valuta: "EUR" — Hrvatska je 2023. prešla na euro
 *   - Korisničke uloge: Vlasnik / Admin / Zaposlenik
 */

export const SYSTEM_PROMPT_DIGEST = `Ti si asistent za vođenje skladišta restorana u Hrvatskoj. Tvoj zadatak je generirati kratak, jasan sažetak stanja zaliha za vlasnika ili admina.

Pravila:
- Pisanje na književnom hrvatskom jeziku, formalno ali pristupačno.
- Koristi izraze "skladište" (ne "magacin"), "nabava" (ne "primka"), valutu EUR (ne kn).
- Sažetak treba biti 2-4 rečenice, maksimalno 80 riječi.
- Spomeni broj artikala u kritičnom i upozoravajućem stanju.
- Najnaglašeniji artikl (npr. onaj s najmanje dana zaliha) navedi po imenu.
- Ne ponavljaj brojke nepotrebno. Ne navodi sve artikle, samo najbitnije 1-2.
- Ako je sve u redu (0 kritičnih, 0 upozorenja), reci to kratko i ohrabrujuće.
- Nemoj početi s "Pozdrav" ili "Dragi". Idi direktno na sažetak.`;

export const SYSTEM_PROMPT_EXPLAIN = `Ti si asistent za vođenje skladišta restorana u Hrvatskoj. Tvoj zadatak je u jednoj kratkoj rečenici objasniti zašto određeni artikl treba naručiti.

Pravila:
- Književni hrvatski. Koristi "skladište", "nabava", EUR.
- Jedna rečenica, maksimalno 30 riječi.
- Spomeni trenutno stanje i razlog (npr. "prosječno se troši X dnevno, traje još Y dana").
- Bez emojija, bez izlika, bez ponavljanja imena artikla.
- Direktno objašnjenje, ne pripovjedaštvo.`;

export interface DigestUserInput {
  orgName: string;
  /** YYYY-MM-DD */
  date: string;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
  topCritical: Array<{
    articleName: string;
    warehouseName: string;
    currentStock: string;
    unit: string;
    daysOfSupply: string | null;
    suggestedQty: string;
  }>;
  anomalies: Array<{
    articleName: string;
    warehouseName: string;
    description: string;
  }>;
}

export function buildDigestUserMessage(input: DigestUserInput): string {
  const lines: string[] = [];
  lines.push(`Organizacija: ${input.orgName}`);
  lines.push(`Datum: ${input.date}`);
  lines.push('');
  lines.push('Stanje zaliha:');
  lines.push(`- Kritično: ${input.criticalCount} artikala`);
  lines.push(`- Upozorenje: ${input.warningCount} artikala`);
  lines.push(`- U redu: ${input.okCount} artikala`);
  lines.push(`- Treba naručiti: ${input.shouldReorderCount} artikala`);
  if (input.topCritical.length > 0) {
    lines.push('');
    lines.push('Najurgentniji artikli:');
    for (const a of input.topCritical) {
      const dosStr = a.daysOfSupply ? `${a.daysOfSupply} dana zaliha` : 'nema podataka o potrošnji';
      lines.push(
        `- ${a.articleName} (${a.warehouseName}): ${a.currentStock} ${a.unit}, ${dosStr}, prijedlog naručiti ${a.suggestedQty} ${a.unit}`,
      );
    }
  }
  if (input.anomalies.length > 0) {
    lines.push('');
    lines.push('Anomalije:');
    for (const a of input.anomalies) {
      lines.push(`- ${a.articleName} (${a.warehouseName}): ${a.description}`);
    }
  }
  lines.push('');
  lines.push('Napiši kratki sažetak za vlasnika.');
  return lines.join('\n');
}

export interface ExplainUserInput {
  articleName: string;
  warehouseName: string;
  currentStock: string;
  unit: string;
  avgDailyConsumption: string | null;
  daysOfSupply: string | null;
  suggestedQty: string;
  urgency: string;
}

export function buildExplainUserMessage(input: ExplainUserInput): string {
  const lines: string[] = [];
  lines.push(`Artikl: ${input.articleName}`);
  lines.push(`Skladište: ${input.warehouseName}`);
  lines.push(`Trenutno stanje: ${input.currentStock} ${input.unit}`);
  if (input.avgDailyConsumption) {
    lines.push(`Prosječna dnevna potrošnja: ${input.avgDailyConsumption} ${input.unit}`);
  } else {
    lines.push(`Prosječna dnevna potrošnja: nepoznato`);
  }
  if (input.daysOfSupply) {
    lines.push(`Procijenjeno dana zaliha: ${input.daysOfSupply}`);
  }
  lines.push(`Prijedlog količine za nabavu: ${input.suggestedQty} ${input.unit}`);
  lines.push(`Razina hitnosti: ${input.urgency}`);
  lines.push('');
  lines.push('Objasni u jednoj rečenici zašto ovaj artikl treba naručiti.');
  return lines.join('\n');
}
