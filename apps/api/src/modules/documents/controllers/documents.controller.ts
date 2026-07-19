import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller({ path: 'documents', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
  })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all documents' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('entity')
  @ApiQuery({ name: 'entityId', required: true })
  @ApiQuery({ name: 'entityType', required: true })
  @ApiOperation({ summary: 'Get documents by entity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Documents found' })
  findByEntity(
    @Query('entityId') entityId: string,
    @Query('entityType') entityType: string,
  ) {
    return this.documentsService.findByEntity(entityId, entityType);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get documents by category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Documents found' })
  findByCategory(@Param('category') category: string) {
    return this.documentsService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
