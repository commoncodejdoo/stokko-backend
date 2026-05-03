import { Article } from '../../domain/articles/article.domain';
import { ArticlesRepository, CreateArticleInput, ListArticlesFilter, UpdateArticleInput } from '../../domain/articles/articles.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaArticlesRepository extends ArticlesRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    private toPrismaDecimal;
    create(input: CreateArticleInput, currency: string, tx?: TxClient): Promise<Article>;
    findById(id: string, currency: string, tx?: TxClient): Promise<Article | null>;
    list(filter: ListArticlesFilter, currency: string, tx?: TxClient): Promise<Article[]>;
    update(id: string, patch: UpdateArticleInput, currency: string, tx?: TxClient): Promise<Article>;
    softDelete(id: string, currency: string, tx?: TxClient): Promise<Article>;
    existsBySku(organizationId: string, sku: string, tx?: TxClient): Promise<boolean>;
}
