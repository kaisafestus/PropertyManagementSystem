import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentsRepository } from '../repositories/documents.repository';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly documentsRepository: DocumentsRepository) {}

  create(createDocumentDto: CreateDocumentDto) {
    return this.documentsRepository.create({
      name: createDocumentDto.name,
      url: createDocumentDto.url,
      category: createDocumentDto.category,
      fileType: createDocumentDto.fileType,
      size: createDocumentDto.size,
      description: createDocumentDto.description,
      entityId: createDocumentDto.entityId,
      entityType: createDocumentDto.entityType,
      uploader: { connect: { id: createDocumentDto.uploadedBy } },
    });
  }

  findAll(organizationId: string) {
    return this.documentsRepository.findAll(organizationId);
  }

  findByEntity(entityId: string, entityType: string) {
    return this.documentsRepository.findByEntity(entityId, entityType);
  }

  findByCategory(category: string) {
    return this.documentsRepository.findByCategory(category);
  }

  async findById(id: string) {
    const document = await this.documentsRepository.findById(id);
    if (!document)
      throw new NotFoundException(`Document with ID ${id} not found`);
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    await this.findById(id);
    return this.documentsRepository.update(id, {
      name: updateDocumentDto.name,
      url: updateDocumentDto.url,
      category: updateDocumentDto.category,
      fileType: updateDocumentDto.fileType,
      size: updateDocumentDto.size,
      description: updateDocumentDto.description,
      entityId: updateDocumentDto.entityId,
      entityType: updateDocumentDto.entityType,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.documentsRepository.remove(id);
  }
}
