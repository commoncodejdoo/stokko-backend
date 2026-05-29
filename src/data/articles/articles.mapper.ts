import { Article as PrismaArticle } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Article } from '../../domain/articles/article.domain';
import { Money } from '../../domain/common/money';
import { Unit } from '../../domain/common/unit';

export class ArticlesMapper {
  toDomain(p: PrismaArticle, currency: string): Article {
    return new Article(
      p.id,
      p.organizationId,
      p.sku,
      p.name,
      p.barcode,
      new Money(new Decimal(p.purchasePrice.toString()), currency),
      new Money(new Decimal(p.salePrice.toString()), currency),
      p.unit as Unit,
      p.categoryId,
      p.supplierId,
      new Decimal(p.thresholdWarning.toString()),
      new Decimal(p.thresholdCritical.toString()),
      p.createdById,
      p.deletedAt,
      p.createdAt,
      p.updatedAt,
    );
  }
}
