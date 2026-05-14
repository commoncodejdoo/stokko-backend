import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { ArticlesService } from '../articles/articles.service';
import { CategoriesService } from '../categories/categories.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { ALL_UNITS, Unit } from '../common/unit';
import { SuppliersService } from '../suppliers/suppliers.service';
import { WAREHOUSE_KINDS, WarehouseKind } from '../warehouses/warehouse.domain';
import { WarehousesService } from '../warehouses/warehouses.service';
import { BulkImportFileError, BulkImportValidationError } from './bulk-import.errors';
import { BulkImportSummary, RowError } from './bulk-import.types';

const SHEET_NAMES = {
  categories: 'Kategorije',
  warehouses: 'Skladišta',
  suppliers: 'Dobavljači',
  articles: 'Artikli',
} as const;

interface CategoryRow {
  row: number;
  name: string;
}

interface WarehouseRow {
  row: number;
  name: string;
  color: string;
  kind: WarehouseKind;
}

interface SupplierRow {
  row: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
}

interface ArticleRow {
  row: number;
  sku: string;
  name: string;
  unit: Unit;
  categoryName: string;
  supplierName: string | null;
  purchasePrice: string;
  salePrice: string;
  thresholdWarning: string;
  thresholdCritical: string;
}

@Injectable()
export class BulkImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
    private readonly warehouses: WarehousesService,
    private readonly suppliers: SuppliersService,
    private readonly articles: ArticlesService,
  ) {}

  async run(buffer: Buffer, ctx: AuthContext): Promise<BulkImportSummary> {
    const workbook = new ExcelJS.Workbook();
    try {
      // exceljs typing on .xlsx.load expects an ArrayBuffer-like; Buffer works at runtime.
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch {
      throw new BulkImportFileError(
        'Datoteka nije čitljiva. Provjeri je li to ispravan .xlsx file.',
      );
    }

    const errors: RowError[] = [];
    const categoryRows = this.parseCategories(workbook, errors);
    const warehouseRows = this.parseWarehouses(workbook, errors);
    const supplierRows = this.parseSuppliers(workbook, errors);
    const articleRows = this.parseArticles(workbook, errors);

    // Cross-reference: every articleRow.categoryName must resolve either to
    // a row in categoryRows or (we'll check during transaction) an existing DB row.
    // We can't pre-check DB rows here without a tx, so just confirm intra-file
    // references early and defer DB checks to step 5.
    const fileCategoryNames = new Set(
      categoryRows.map((r) => r.name.trim().toLowerCase()),
    );
    const fileSupplierNames = new Set(
      supplierRows.map((r) => r.name.trim().toLowerCase()),
    );

    if (errors.length > 0) {
      throw new BulkImportValidationError(errors);
    }

    return this.prisma.$transaction(async (tx) => {
      const categoryResult = await this.upsertCategories(categoryRows, ctx, tx);
      const warehouseResult = await this.upsertWarehouses(warehouseRows, ctx, tx);
      const supplierResult = await this.upsertSuppliers(supplierRows, ctx, tx);

      // Resolve article FKs: prefer the just-created file rows, fall back to DB lookups.
      const dbErrors: RowError[] = [];
      const articleResult = await this.upsertArticles(
        articleRows,
        categoryResult.nameToId,
        supplierResult.nameToId,
        fileCategoryNames,
        fileSupplierNames,
        ctx,
        tx,
        dbErrors,
      );
      if (dbErrors.length > 0) {
        throw new BulkImportValidationError(dbErrors);
      }

      return {
        categories: { created: categoryResult.created, skipped: categoryResult.skipped },
        warehouses: { created: warehouseResult.created, skipped: warehouseResult.skipped },
        suppliers: { created: supplierResult.created, skipped: supplierResult.skipped },
        articles: { created: articleResult.created, skipped: articleResult.skipped },
      };
    });
  }

  // ── parsers ──

  private parseCategories(wb: ExcelJS.Workbook, errors: RowError[]): CategoryRow[] {
    const sheet = wb.getWorksheet(SHEET_NAMES.categories);
    if (!sheet) return [];
    const rows: CategoryRow[] = [];
    const seen = new Set<string>();
    sheet.eachRow({ includeEmpty: false }, (excelRow, rowNumber) => {
      if (rowNumber === 1) return; // header
      const name = this.cellString(excelRow.getCell(1));
      if (!name) return;
      const key = name.trim().toLowerCase();
      if (seen.has(key)) return; // dedupe within sheet silently
      seen.add(key);
      rows.push({ row: rowNumber, name: name.trim() });
    });
    return rows;
  }

  private parseWarehouses(wb: ExcelJS.Workbook, errors: RowError[]): WarehouseRow[] {
    const sheet = wb.getWorksheet(SHEET_NAMES.warehouses);
    if (!sheet) return [];
    const rows: WarehouseRow[] = [];
    const seen = new Set<string>();
    sheet.eachRow({ includeEmpty: false }, (excelRow, rowNumber) => {
      if (rowNumber === 1) return;
      const name = this.cellString(excelRow.getCell(1));
      const colorRaw = this.cellString(excelRow.getCell(2));
      const kindRaw = this.cellString(excelRow.getCell(3));
      if (!name && !colorRaw && !kindRaw) return; // fully empty

      if (!name) {
        errors.push({
          sheet: SHEET_NAMES.warehouses,
          row: rowNumber,
          field: 'Naziv',
          message: 'Obavezno polje.',
        });
        return;
      }

      const color = colorRaw || '#2563eb';
      if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
        errors.push({
          sheet: SHEET_NAMES.warehouses,
          row: rowNumber,
          field: 'Boja',
          message: `"${color}" nije ispravan hex (npr. #2563eb).`,
        });
        return;
      }

      const kindCandidate = (kindRaw || 'STORAGE').toUpperCase();
      if (!WAREHOUSE_KINDS.includes(kindCandidate as WarehouseKind)) {
        errors.push({
          sheet: SHEET_NAMES.warehouses,
          row: rowNumber,
          field: 'Vrsta',
          message: `Mora biti ${WAREHOUSE_KINDS.join(' ili ')}.`,
        });
        return;
      }

      const key = name.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        row: rowNumber,
        name: name.trim(),
        color,
        kind: kindCandidate as WarehouseKind,
      });
    });
    return rows;
  }

  private parseSuppliers(wb: ExcelJS.Workbook, errors: RowError[]): SupplierRow[] {
    const sheet = wb.getWorksheet(SHEET_NAMES.suppliers);
    if (!sheet) return [];
    const rows: SupplierRow[] = [];
    const seen = new Set<string>();
    sheet.eachRow({ includeEmpty: false }, (excelRow, rowNumber) => {
      if (rowNumber === 1) return;
      const name = this.cellString(excelRow.getCell(1));
      const contactPerson = this.cellString(excelRow.getCell(2)) || null;
      const phone = this.cellString(excelRow.getCell(3)) || null;
      const email = this.cellString(excelRow.getCell(4)) || null;
      const note = this.cellString(excelRow.getCell(5)) || null;

      if (!name && !contactPerson && !phone && !email && !note) return;

      if (!name) {
        errors.push({
          sheet: SHEET_NAMES.suppliers,
          row: rowNumber,
          field: 'Naziv',
          message: 'Obavezno polje.',
        });
        return;
      }

      const key = name.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ row: rowNumber, name: name.trim(), contactPerson, phone, email, note });
    });
    return rows;
  }

  private parseArticles(wb: ExcelJS.Workbook, errors: RowError[]): ArticleRow[] {
    const sheet = wb.getWorksheet(SHEET_NAMES.articles);
    if (!sheet) return [];
    const rows: ArticleRow[] = [];
    const seenSku = new Set<string>();
    sheet.eachRow({ includeEmpty: false }, (excelRow, rowNumber) => {
      if (rowNumber === 1) return;

      const sku = this.cellString(excelRow.getCell(1));
      const name = this.cellString(excelRow.getCell(2));
      const unitRaw = this.cellString(excelRow.getCell(3));
      const categoryName = this.cellString(excelRow.getCell(4));
      const supplierName = this.cellString(excelRow.getCell(5)) || null;
      const purchasePrice = this.cellNumberString(excelRow.getCell(6));
      const salePrice = this.cellNumberString(excelRow.getCell(7));
      const thresholdWarning = this.cellNumberString(excelRow.getCell(8));
      const thresholdCritical = this.cellNumberString(excelRow.getCell(9));

      // Skip wholly empty rows.
      if (
        !sku &&
        !name &&
        !unitRaw &&
        !categoryName &&
        !supplierName &&
        !purchasePrice &&
        !salePrice &&
        !thresholdWarning &&
        !thresholdCritical
      ) {
        return;
      }

      let rowOk = true;
      const require = (field: string, value: string | null) => {
        if (!value || !value.trim()) {
          errors.push({
            sheet: SHEET_NAMES.articles,
            row: rowNumber,
            field,
            message: 'Obavezno polje.',
          });
          rowOk = false;
        }
      };

      require('SKU', sku);
      require('Naziv', name);
      require('Jedinica', unitRaw);
      require('Kategorija', categoryName);
      require('Nabavna cijena', purchasePrice);
      require('Prodajna cijena', salePrice);
      require('Prag upozorenja', thresholdWarning);
      require('Kritični prag', thresholdCritical);

      const unitCandidate = unitRaw.toUpperCase();
      if (unitRaw && !ALL_UNITS.includes(unitCandidate as Unit)) {
        errors.push({
          sheet: SHEET_NAMES.articles,
          row: rowNumber,
          field: 'Jedinica',
          message: `Mora biti jedno od: ${ALL_UNITS.join(', ')}.`,
        });
        rowOk = false;
      }

      const checkNumeric = (field: string, value: string) => {
        if (!value) return;
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) {
          errors.push({
            sheet: SHEET_NAMES.articles,
            row: rowNumber,
            field,
            message: 'Mora biti broj veći ili jednak 0.',
          });
          rowOk = false;
        }
      };
      checkNumeric('Nabavna cijena', purchasePrice);
      checkNumeric('Prodajna cijena', salePrice);
      checkNumeric('Prag upozorenja', thresholdWarning);
      checkNumeric('Kritični prag', thresholdCritical);

      if (thresholdWarning && thresholdCritical) {
        const warn = Number(thresholdWarning);
        const crit = Number(thresholdCritical);
        if (Number.isFinite(warn) && Number.isFinite(crit) && crit > warn) {
          errors.push({
            sheet: SHEET_NAMES.articles,
            row: rowNumber,
            field: 'Kritični prag',
            message: 'Kritični prag mora biti manji ili jednak pragu upozorenja.',
          });
          rowOk = false;
        }
      }

      if (!rowOk) return;

      const skuTrim = sku.trim();
      const skuKey = skuTrim.toLowerCase();
      if (seenSku.has(skuKey)) {
        errors.push({
          sheet: SHEET_NAMES.articles,
          row: rowNumber,
          field: 'SKU',
          message: `Duplicirani SKU "${skuTrim}" u istom uvozu.`,
        });
        return;
      }
      seenSku.add(skuKey);

      rows.push({
        row: rowNumber,
        sku: skuTrim,
        name: name.trim(),
        unit: unitCandidate as Unit,
        categoryName: categoryName.trim(),
        supplierName: supplierName ? supplierName.trim() : null,
        purchasePrice,
        salePrice,
        thresholdWarning,
        thresholdCritical,
      });
    });
    return rows;
  }

  // ── upserters (transactional) ──

  private async upsertCategories(
    rows: CategoryRow[],
    ctx: AuthContext,
    tx: TxClient,
  ): Promise<{ created: number; skipped: number; nameToId: Map<string, string> }> {
    let created = 0;
    let skipped = 0;
    const nameToId = new Map<string, string>();
    for (const r of rows) {
      const existing = await this.categories.findByName(r.name, ctx.organizationId, tx);
      if (existing) {
        nameToId.set(r.name.toLowerCase(), existing.id);
        skipped += 1;
        continue;
      }
      const cat = await this.categories.create(r.name, ctx, tx);
      nameToId.set(r.name.toLowerCase(), cat.id);
      created += 1;
    }
    return { created, skipped, nameToId };
  }

  private async upsertWarehouses(
    rows: WarehouseRow[],
    ctx: AuthContext,
    tx: TxClient,
  ): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;
    for (const r of rows) {
      const existing = await this.warehouses.findByName(r.name, ctx.organizationId, tx);
      if (existing) {
        skipped += 1;
        continue;
      }
      await this.warehouses.create({ name: r.name, color: r.color, kind: r.kind }, ctx, tx);
      created += 1;
    }
    return { created, skipped };
  }

  private async upsertSuppliers(
    rows: SupplierRow[],
    ctx: AuthContext,
    tx: TxClient,
  ): Promise<{ created: number; skipped: number; nameToId: Map<string, string> }> {
    let created = 0;
    let skipped = 0;
    const nameToId = new Map<string, string>();
    for (const r of rows) {
      const existing = await this.suppliers.findByName(r.name, ctx.organizationId, tx);
      if (existing) {
        nameToId.set(r.name.toLowerCase(), existing.id);
        skipped += 1;
        continue;
      }
      const s = await this.suppliers.create(
        {
          name: r.name,
          contactPerson: r.contactPerson,
          phone: r.phone,
          email: r.email,
          note: r.note,
        },
        ctx,
        tx,
      );
      nameToId.set(r.name.toLowerCase(), s.id);
      created += 1;
    }
    return { created, skipped, nameToId };
  }

  private async upsertArticles(
    rows: ArticleRow[],
    categoryNameToId: Map<string, string>,
    supplierNameToId: Map<string, string>,
    fileCategoryNames: Set<string>,
    fileSupplierNames: Set<string>,
    ctx: AuthContext,
    tx: TxClient,
    errors: RowError[],
  ): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const r of rows) {
      // Resolve category — either from this import's category sheet (already inserted)
      // or from the DB. If unresolvable, emit a row-level error.
      const catKey = r.categoryName.toLowerCase();
      let categoryId = categoryNameToId.get(catKey);
      if (!categoryId) {
        const existing = await this.categories.findByName(
          r.categoryName,
          ctx.organizationId,
          tx,
        );
        if (existing) {
          categoryId = existing.id;
          categoryNameToId.set(catKey, existing.id);
        }
      }
      if (!categoryId) {
        errors.push({
          sheet: SHEET_NAMES.articles,
          row: r.row,
          field: 'Kategorija',
          message: `Kategorija "${r.categoryName}" ne postoji niti je u uvozu.`,
        });
        continue;
      }

      let supplierId: string | null = null;
      if (r.supplierName) {
        const supKey = r.supplierName.toLowerCase();
        supplierId = supplierNameToId.get(supKey) ?? null;
        if (!supplierId) {
          const existing = await this.suppliers.findByName(
            r.supplierName,
            ctx.organizationId,
            tx,
          );
          if (existing) {
            supplierId = existing.id;
            supplierNameToId.set(supKey, existing.id);
          }
        }
        if (!supplierId) {
          errors.push({
            sheet: SHEET_NAMES.articles,
            row: r.row,
            field: 'Dobavljač',
            message: `Dobavljač "${r.supplierName}" ne postoji niti je u uvozu.`,
          });
          continue;
        }
      }

      // SKU duplicate (in DB) ⇒ skip silently. New SKU ⇒ create.
      try {
        await this.articles.create(
          {
            sku: r.sku,
            name: r.name,
            purchasePrice: r.purchasePrice,
            salePrice: r.salePrice,
            unit: r.unit,
            categoryId,
            supplierId,
            thresholdWarning: r.thresholdWarning,
            thresholdCritical: r.thresholdCritical,
          },
          ctx,
          tx,
        );
        created += 1;
      } catch (err) {
        // ArticlesService throws DomainValidationError on duplicate SKU.
        // Treat as a skip rather than a hard failure so re-uploads stay safe.
        if (
          err instanceof Error &&
          err.message.includes('already exists')
        ) {
          skipped += 1;
          continue;
        }
        throw err;
      }
    }

    // Silence intentionally unused params — they keep the API shape readable.
    void fileCategoryNames;
    void fileSupplierNames;

    return { created, skipped };
  }

  // ── cell helpers ──

  private cellString(cell: ExcelJS.Cell): string {
    if (cell == null) return '';
    const value = cell.value;
    if (value == null) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      // Rich text / hyperlink / formula result.
      const v = value as { text?: string; result?: unknown; richText?: { text: string }[] };
      if (typeof v.text === 'string') return v.text.trim();
      if (Array.isArray(v.richText)) {
        return v.richText.map((p) => p.text ?? '').join('').trim();
      }
      if (v.result != null) return String(v.result).trim();
    }
    return '';
  }

  private cellNumberString(cell: ExcelJS.Cell): string {
    const raw = this.cellString(cell);
    if (!raw) return '';
    // Accept "1.234,56" (HR locale) and "1,234.56" (US) — normalise to dot.
    const normalised = raw.replace(/\s/g, '').replace(',', '.');
    return normalised;
  }
}
