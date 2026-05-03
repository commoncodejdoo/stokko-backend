import { Article as PrismaArticle } from '@prisma/client';
import { Article } from '../../domain/articles/article.domain';
export declare class ArticlesMapper {
    toDomain(p: PrismaArticle, currency: string): Article;
}
