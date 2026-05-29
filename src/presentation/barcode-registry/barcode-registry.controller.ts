import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BarcodeRegistryService } from '../../domain/barcode-registry/barcode-registry.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';

/**
 * Public catalogue lookup — any authenticated user (including EMPLOYEE) may
 * query a barcode. The response intentionally omits `usingOrgIds` and
 * `firstSeenOrgId` to prevent cross-tenant info leak; see
 * `BarcodeRegistry.toPublicSnapshot()`.
 */
@Controller('barcode-registry')
@UseGuards(JwtAuthGuard)
export class BarcodeRegistryController {
  constructor(private readonly service: BarcodeRegistryService) {}

  @Get(':barcode')
  async lookup(@Param('barcode') barcode: string) {
    const entry = await this.service.lookup(barcode);
    if (!entry) return { found: false as const };
    return { found: true as const, registry: entry.toPublicSnapshot() };
  }
}
