import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { PREDEFINED_CATEGORIES } from '../common/predefined-categories';
import { ALL_UNITS } from '../common/unit';
import { WAREHOUSE_KINDS } from '../warehouses/warehouse.domain';

@Injectable()
export class BulkImportTemplateGenerator {
  /**
   * Builds the Excel template that users download from the web app and
   * fill in before re-uploading via `POST /bulk-import`.
   *
   * Five sheets, in order: Upute, Kategorije, Skladišta, Dobavljači, Artikli.
   * Data-validation dropdowns are attached for Unit and WarehouseKind.
   */
  async build(currency: string): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Stokko';
    wb.created = new Date();

    this.buildInstructions(wb, currency);
    this.buildCategoriesSheet(wb);
    this.buildWarehousesSheet(wb);
    this.buildSuppliersSheet(wb);
    this.buildArticlesSheet(wb);

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  // ── sheets ──

  private buildInstructions(wb: ExcelJS.Workbook, currency: string): void {
    const sheet = wb.addWorksheet('Upute');
    sheet.columns = [{ width: 90 }];

    const lines: { text: string; bold?: boolean }[] = [
      { text: 'Stokko — predložak za masovni uvoz', bold: true },
      { text: '' },
      { text: 'Kako koristiti predložak:', bold: true },
      { text: '1) Popuni jedan ili više listova ispod (Kategorije, Skladišta, Dobavljači, Artikli).' },
      { text: '2) Obriši primjere prije nego što uploadaš.' },
      { text: '3) Spremi datoteku kao .xlsx i uploadaj u Stokku preko "Uvezi Excel".' },
      { text: '' },
      { text: 'Pravila duplikata:', bold: true },
      { text: '• Postojeći zapisi (po nazivu, neosjetljivo na velika/mala slova) se preskaču.' },
      { text: '• Artikli se preskaču ako SKU već postoji.' },
      { text: '' },
      { text: 'Obavezna polja u listu "Artikli":', bold: true },
      { text: 'SKU, Naziv, Jedinica, Kategorija, Nabavna cijena, Prodajna cijena, Prag upozorenja, Kritični prag.' },
      { text: 'Dobavljač je opcionalan.' },
      { text: '' },
      { text: `Valuta organizacije: ${currency}`, bold: true },
      { text: 'Cijene unosi kao broj (npr. 12.50). Decimalni separator može biti . ili ,.' },
      { text: '' },
      { text: 'Predefinirane kategorije (postoje od kreiranja organizacije, ne treba ih ponovno dodavati):', bold: true },
      { text: PREDEFINED_CATEGORIES.join(', ') },
      { text: '' },
      { text: 'Dozvoljene jedinice mjere:', bold: true },
      { text: ALL_UNITS.join(', ') },
      { text: '' },
      { text: 'Dozvoljene vrste skladišta:', bold: true },
      { text: `${WAREHOUSE_KINDS.join(', ')} (STORAGE = skladište iza, FOH = front-of-house/točionik).` },
    ];

    lines.forEach((line, i) => {
      const row = sheet.getRow(i + 1);
      const cell = row.getCell(1);
      cell.value = line.text;
      if (line.bold) cell.font = { bold: true };
      row.commit();
    });
  }

  private buildCategoriesSheet(wb: ExcelJS.Workbook): void {
    const sheet = wb.addWorksheet('Kategorije');
    sheet.columns = [{ header: 'Naziv', key: 'name', width: 40 }];
    this.styleHeader(sheet, 1);
    sheet.addRow({ name: 'Primjer — obriši prije uvoza' });
  }

  private buildWarehousesSheet(wb: ExcelJS.Workbook): void {
    const sheet = wb.addWorksheet('Skladišta');
    sheet.columns = [
      { header: 'Naziv', key: 'name', width: 30 },
      { header: 'Boja (hex, npr. #2563eb)', key: 'color', width: 28 },
      { header: 'Vrsta', key: 'kind', width: 14 },
    ];
    this.styleHeader(sheet, 3);

    sheet.addRow({ name: 'Primjer — obriši', color: '#2563eb', kind: 'STORAGE' });

    // Dropdown za Vrsta (kolona C, redovi 2..100).
    const formula = `"${WAREHOUSE_KINDS.join(',')}"`;
    for (let r = 2; r <= 200; r++) {
      sheet.getCell(`C${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Neispravna vrsta',
        error: `Vrsta mora biti ${WAREHOUSE_KINDS.join(' ili ')}.`,
      };
    }
  }

  private buildSuppliersSheet(wb: ExcelJS.Workbook): void {
    const sheet = wb.addWorksheet('Dobavljači');
    sheet.columns = [
      { header: 'Naziv', key: 'name', width: 36 },
      { header: 'Kontakt osoba', key: 'contactPerson', width: 28 },
      { header: 'Telefon', key: 'phone', width: 18 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Bilješka', key: 'note', width: 40 },
    ];
    this.styleHeader(sheet, 5);

    sheet.addRow({
      name: 'Primjer d.o.o. — obriši',
      contactPerson: 'Ivo Ivić',
      phone: '+385 91 123 4567',
      email: 'kontakt@primjer.hr',
      note: '',
    });
  }

  private buildArticlesSheet(wb: ExcelJS.Workbook): void {
    const sheet = wb.addWorksheet('Artikli');
    sheet.columns = [
      { header: 'SKU', key: 'sku', width: 16 },
      { header: 'Naziv', key: 'name', width: 36 },
      { header: 'Jedinica', key: 'unit', width: 12 },
      { header: 'Kategorija (naziv)', key: 'categoryName', width: 22 },
      { header: 'Dobavljač (naziv, opcionalno)', key: 'supplierName', width: 30 },
      { header: 'Nabavna cijena', key: 'purchasePrice', width: 16 },
      { header: 'Prodajna cijena', key: 'salePrice', width: 16 },
      { header: 'Prag upozorenja', key: 'thresholdWarning', width: 16 },
      { header: 'Kritični prag', key: 'thresholdCritical', width: 14 },
    ];
    this.styleHeader(sheet, 9);

    sheet.addRow({
      sku: 'PRIMJER-001',
      name: 'Primjer artikla — obriši',
      unit: 'KOM',
      categoryName: 'Hrana',
      supplierName: '',
      purchasePrice: 5,
      salePrice: 9.5,
      thresholdWarning: 10,
      thresholdCritical: 3,
    });

    const unitFormula = `"${ALL_UNITS.join(',')}"`;
    for (let r = 2; r <= 1000; r++) {
      sheet.getCell(`C${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [unitFormula],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Neispravna jedinica',
        error: `Jedinica mora biti jedna od: ${ALL_UNITS.join(', ')}.`,
      };
    }

    for (const col of ['F', 'G', 'H', 'I']) {
      for (let r = 2; r <= 1000; r++) {
        sheet.getCell(`${col}${r}`).numFmt = '#,##0.00';
      }
    }
  }

  private styleHeader(sheet: ExcelJS.Worksheet, columnCount: number): void {
    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: 'middle' };
    header.height = 22;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    for (let c = 1; c <= columnCount; c++) {
      const cell = header.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF1F4' },
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFCBD0D7' } },
      };
    }
  }
}
