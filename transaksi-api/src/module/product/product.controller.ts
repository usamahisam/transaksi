import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Apple iPhone 16' },
        userId: { type: 'string', example: 'user-uuid-123' },
      },
      required: ['name'],
    },
  })
  async create(@Body() body: { name: string; userId?: string }) {
    return this.productService.create(body.name, body.userId);
  }

  @Get('find-all')
  @ApiOperation({ summary: 'Get all products' })
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get product detail' })
  async findOne(@Param('uuid') uuid: string) {
    return this.productService.findOne(uuid);
  }

  @Put('update/:uuid')
  @ApiOperation({ summary: 'Update product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Samsung Galaxy S25' },
        userId: { type: 'string', example: 'user-uuid-123' },
      },
      required: ['name'],
    },
  })
  async update(
    @Param('uuid') uuid: string,
    @Body() body: { name: string; userId?: string },
  ) {
    return this.productService.update(uuid, body.name, body.userId);
  }

  @Delete('delete/:uuid')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-uuid-123' },
      },
    },
  })
  async delete(
    @Param('uuid') uuid: string,
    @Body() body: { userId?: string },
  ) {
    return this.productService.softDelete(uuid, body.userId);
  }

  @Post('restore/:uuid')
  @ApiOperation({ summary: 'Restore soft-deleted product' })
  async restore(@Param('uuid') uuid: string) {
    return this.productService.restore(uuid);
  }

  @Post('add-stok/:uuid')
  @ApiOperation({ summary: 'Add stock to product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        qty: { type: 'number', example: 10 },
        userId: { type: 'string', example: 'user-uuid-123' },
      },
      required: ['qty'],
    },
  })
  
  @ApiResponse({ status: 201, description: 'Stock added successfully' })
  async addStok(
    @Param('uuid') uuid: string,
    @Body() body: { qty: number; userId?: string },
  ) {
    return this.productService.addStock(uuid, body.qty, body.userId);
  }

  @Post('reduce-stok/:uuid')
  @ApiOperation({ summary: 'Reduce product stock' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        qty: { type: 'number', example: 5 },
        userId: { type: 'string', example: 'user-uuid-123' },
      },
      required: ['qty'],
    },
  })
  @ApiResponse({ status: 201, description: 'Stock reduced successfully' })
  async reduceStok(
    @Param('uuid') uuid: string,
    @Body() body: { qty: number; userId?: string },
  ) {
    return this.productService.reduceStock(uuid, body.qty, body.userId);
  }
}
