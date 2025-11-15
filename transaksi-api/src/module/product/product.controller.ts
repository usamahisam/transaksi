import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProductUnitEnum } from 'src/common/entity/product_unit/product_unit.entity';

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

  @Post('add-unit/:uuid')
  @ApiOperation({ summary: 'Add unit to product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        unitName: {
          type: 'string',
          enum: Object.values(ProductUnitEnum),
          example: 'PCS',
        },
        unitMultiplier: {
          type: 'number',
          example: 12,
        },
        setAsDefault: {
          type: 'boolean',
          example: true,
        },
        userId: {
          type: 'string',
          example: 'user-uuid-123',
        },
      },
      required: ['unitName', 'unitMultiplier'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Unit added successfully',
  })
  async addUnit(
    @Param('uuid') uuid: string,
    @Body()
    body: {
      unitName: ProductUnitEnum;
      unitMultiplier: number;
      setAsDefault?: boolean;
      userId?: string;
    },
  ) {
    return this.productService.addUnit(
      uuid,
      body.unitName,
      body.unitMultiplier,
      body.setAsDefault,
      body.userId,
    );
  }

  @Post('add-price/:uuid')
  @ApiOperation({ summary: 'Add price to product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 15000 },
        unitUuid: { type: 'string', example: 'unit-uuid-123', nullable: true },
        setAsDefault: { type: 'boolean', example: false },
        userId: { type: 'string', example: 'user-uuid-123' },
      },
      required: ['price'],
    },
  })
  @ApiResponse({ status: 201, description: 'Price added successfully' })
  async addPrice(
    @Param('uuid') uuid: string,
    @Body()
    body: {
      price: number;
      unitUuid: string;
      setAsDefault?: boolean;
      userId?: string;
    },
  ) {
    return this.productService.addPrice(
      uuid,
      body.price,
      body.unitUuid,
      body.setAsDefault ?? false,
      body.userId,
    );
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
