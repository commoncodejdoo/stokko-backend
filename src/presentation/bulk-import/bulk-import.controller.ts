import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BulkImportTemplateGenerator } from '../../domain/bulk-import/bulk-import-template.generator';
import { BulkImportService } from '../../domain/bulk-import/bulk-import.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ACCEPTED_MIMETYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
]);

@Controller('bulk-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class BulkImportController {
  constructor(
    private readonly service: BulkImportService,
    private readonly templateGenerator: BulkImportTemplateGenerator,
    private readonly orgs: OrganizationsService,
  ) {}

  @Get('template')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="stokko-predlozak.xlsx"')
  @Header('Cache-Control', 'no-store')
  async template(
    @CurrentUser() ctx: AuthContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    const org = await this.orgs.requireById(ctx.organizationId);
    const buffer = await this.templateGenerator.build(org.currency);
    res.setHeader('Content-Length', buffer.length);
    return buffer;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() ctx: AuthContext,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'BULK_IMPORT_FILE_MISSING',
        message: 'Nedostaje datoteka u "file" polju.',
      });
    }
    if (
      file.mimetype &&
      !ACCEPTED_MIMETYPES.has(file.mimetype) &&
      !file.originalname.toLowerCase().endsWith('.xlsx')
    ) {
      throw new BadRequestException({
        code: 'BULK_IMPORT_FILE_TYPE',
        message: 'Datoteka mora biti .xlsx.',
      });
    }
    const summary = await this.service.run(file.buffer, ctx);
    return summary;
  }
}
