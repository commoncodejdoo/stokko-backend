import { Module } from '@nestjs/common';
import { AnthropicLlmClient } from '../../data/narratives/anthropic-llm-client.service';
import { PrismaNarrativesRepository } from '../../data/narratives/narratives.repository';
import { LlmClient } from '../../domain/narratives/llm-client';
import { NarrativesRepository } from '../../domain/narratives/narratives.repository';
import { NarrativesService } from '../../domain/narratives/narratives.service';
import { ArticlesModule } from '../articles/articles.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { NarrativesAdminController } from './narratives-admin.controller';
import { NarrativesController } from './narratives.controller';

@Module({
  imports: [
    OrganizationsModule,
    ArticlesModule,
    WarehousesModule,
    PredictionsModule,
  ],
  controllers: [NarrativesController, NarrativesAdminController],
  providers: [
    { provide: NarrativesRepository, useClass: PrismaNarrativesRepository },
    { provide: LlmClient, useClass: AnthropicLlmClient },
    NarrativesService,
  ],
  exports: [NarrativesService],
})
export class NarrativesModule {}
