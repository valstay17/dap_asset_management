import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PrinterPort } from '../../domain/ports/PrinterPort';
import { NewPrinter, Printer } from '../../domain/models/Printer';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface ImpresoraDto {
  idImpresora: number;
  inventario: string | null;
  marca: string | null;
  tipo: string | null;
  numeroSerie: string | null;
  ubicacion: { idUbicacion: number } | null;
  fabricante: string | null;
  active: boolean;
}

interface ImpresoraPayload {
  inventario: string;
  marca: string;
  tipo: string;
  numeroSerie: string;
  ubicacion: { idUbicacion: number } | null;
  fabricante: string;
  active: boolean;
}

function toPrinter(dto: ImpresoraDto): Printer {
  return {
    id: String(dto.idImpresora),
    inventoryNumber: dto.inventario ?? '',
    brand: dto.marca ?? '',
    type: dto.tipo ?? '',
    serialNumber: dto.numeroSerie ?? '',
    locationId: dto.ubicacion ? String(dto.ubicacion.idUbicacion) : '',
    manufacturer: dto.fabricante ?? '',
    active: dto.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpPrinterAdapter implements PrinterPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  create(input: NewPrinter): Observable<Printer> {
    const headers = this.tokenService.loggedHeader();
    const payload: ImpresoraPayload = {
      inventario: input.inventoryNumber,
      marca: input.brand,
      tipo: input.type,
      numeroSerie: input.serialNumber,
      ubicacion: input.locationId ? { idUbicacion: Number(input.locationId) } : null,
      fabricante: input.manufacturer,
      active: input.active,
    };

    return this.http.post<ImpresoraDto>(environment.impresoraSave, payload, { headers }).pipe(map(toPrinter));
  }
}
