import { Injectable } from '@nestjs/common';
import { Prisma, Document } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  findAll(organizationId: string) {
    return this.prisma.document.findMany({
      where: { uploader: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: { uploader: true },
    });
  }

  findByEntity(entityId: string, entityType: string) {
    return this.prisma.document.findMany({
      where: { entityId, entityType },
      orderBy: { createdAt: 'desc' },
      include: { uploader: true },
    });
  }

  findByCategory(category: string) {
    return this.prisma.document.findMany({
      where: { category: category as any },
      orderBy: { createdAt: 'desc' },
      include: { uploader: true },
    });
  }

  findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: { uploader: true },
    });
  }

  update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
    return this.prisma.document.update({
      where: { id },
      data,
      include: { uploader: true },
    });
  }

  remove(id: string): Promise<Document> {
    return this.prisma.document.delete({ where: { id } });
  }
}
