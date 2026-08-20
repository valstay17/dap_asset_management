import { Injectable, inject } from '@angular/core';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { Asset } from '../../domain/models/Asset';
import { User } from '../../domain/models/User';
import { formatBuildingLabel, formatLocationLabel } from '../../domain/models/SiteLocation';
import { LocationStore } from '../LocationStore';

const TEMPLATE_URL = '/plantilla_pdf.pdf';
const MAX_ROWS = 4;
const FONT_SIZE = 8.5;

interface RowSlots {
  equipo: number;
  marca: number;
  modelo: number;
  serie: number;
  inventario: number;
}

// Coordenadas base extraídas de plantilla_pdf.pdf (origen inferior-izquierdo, alto de página 612pt),
// desplazadas +3pt para que las descendentes (p, g, y) no crucen la línea inferior de la fila.
const ROWS: RowSlots[] = [
  { equipo: 492.4, marca: 481.1, modelo: 468.1, serie: 456.8, inventario: 445.3 },
  { equipo: 419.1, marca: 407.6, modelo: 395.4, serie: 383.1, inventario: 370.9 },
  { equipo: 347.3, marca: 335.1, modelo: 323.1, serie: 311.1, inventario: 298.8 },
  { equipo: 273.2, marca: 261.9, modelo: 249.1, serie: 237.4, inventario: 225.4 },
];

@Injectable({ providedIn: 'root' })
export class GenerateUserReportPdfUseCase {
  private readonly locationStore = inject(LocationStore);

  async execute(user: User, assets: Asset[]): Promise<Uint8Array> {
    const templateBytes = await fetch(TEMPLATE_URL).then((response) => response.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const draw = (text: string, x: number, y: number, maxWidth: number) => {
      this.drawText(page, font, this.fitText(font, text, maxWidth), x, y);
    };

    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });

    draw(assets[0]?.name ?? '', 628, 587.1, 118);
    draw(fecha, 568, 568.8, 60);
    draw(this.buildingLabel(user.location), 590, 533.8, 155);
    draw(`${user.firstName} ${user.lastName}`, 114, 510.4, 190);

    const ROW_VALUE_X = 136;
    const ROW_VALUE_MAX_WIDTH = 115;

    assets.slice(0, MAX_ROWS).forEach((asset, index) => {
      const row = ROWS[index];
      draw(asset.type, ROW_VALUE_X, row.equipo, ROW_VALUE_MAX_WIDTH);
      draw(asset.manufacturer, ROW_VALUE_X, row.marca, ROW_VALUE_MAX_WIDTH);
      draw(asset.model, ROW_VALUE_X, row.modelo, ROW_VALUE_MAX_WIDTH);
      draw(asset.serialNumber, ROW_VALUE_X, row.serie, ROW_VALUE_MAX_WIDTH);
      draw(asset.inventoryNumber, ROW_VALUE_X, row.inventario, ROW_VALUE_MAX_WIDTH);
    });

    return pdfDoc.save();
  }

  private buildingLabel(userLocation: string): string {
    const match = this.locationStore.locations().find((location) => formatLocationLabel(location) === userLocation);
    return match ? formatBuildingLabel(match) : userLocation;
  }

  private drawText(page: PDFPage, font: PDFFont, text: string, x: number, y: number): void {
    page.drawText(text, { x, y, size: FONT_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
  }

  private fitText(font: PDFFont, text: string, maxWidth: number): string {
    if (font.widthOfTextAtSize(text, FONT_SIZE) <= maxWidth) {
      return text;
    }
    let truncated = text;
    while (truncated.length > 1 && font.widthOfTextAtSize(`${truncated}…`, FONT_SIZE) > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return `${truncated}…`;
  }
}
