import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductEntity } from 'src/common/entity/product/product.entity';
import { ProductStockEntity } from 'src/common/entity/product_stock/product_stock.entity';
import { ProductUnitEntity, ProductUnitEnum } from 'src/common/entity/product_unit/product_unit.entity';

@Injectable()
export class ProductService {
  constructor(
    @Inject('PRODUCT_REPOSITORY')
    private readonly productRepo: Repository<ProductEntity>,
    @Inject('PRODUCT_UNIT_REPOSITORY')
private readonly unitRepo: Repository<ProductUnitEntity>,
    @Inject('PRODUCT_STOCK_REPOSITORY')
    private readonly stokRepo: Repository<ProductStockEntity>,
  ) {}

  async create(name: string, userId?: string) {
    const newProduct = this.productRepo.create({
      name,
      createdBy: userId,
    });

    return await this.productRepo.save(newProduct);
  }

  async findAll() {
    return await this.productRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(uuid: string) {
    return await this.productRepo.findOne({ where: { uuid } });
  }

  async update(uuid: string, name: string, userId?: string) {
    const data = await this.findOne(uuid);
    if (!data) return null;

    data.name = name;
    data.updatedBy = userId;

    return await this.productRepo.save(data);
  }

  async softDelete(uuid: string, userId?: string) {
    const data = await this.findOne(uuid);
    if (!data) return null;
    data.deletedBy = userId;
    await this.productRepo.save(data);
    return this.productRepo.softDelete(uuid);
  }

  async restore(uuid: string) {
    return this.productRepo.restore(uuid);
  }

  async addUnit(
    productUuid: string,
    unitName: ProductUnitEnum,
    unitMultiplier: number,
    setAsDefault = false,
    userId?: string,
  ) {
    const product = await this.findOne(productUuid);
    if (!product) throw new BadRequestException('Product not found');
    if (!Object.values(ProductUnitEnum).includes(unitName)) {
      throw new BadRequestException('Invalid unit enum');
    }
    if (unitMultiplier <= 0) {
      throw new BadRequestException('Multiplier must be > 0');
    }
    const newUnit = this.unitRepo.create({
      productUuid,
      unitName,
      unitMultiplier,
      createdBy: userId,
    });
    const savedUnit = await this.unitRepo.save(newUnit);
    if (setAsDefault) {
      product.defaultUnitUuid = savedUnit.uuid;
      await this.productRepo.save(product);
    }
    return savedUnit;
  }

  async addStock(productUuid: string, qty: number, userId?: string) {
    if (qty <= 0) throw new BadRequestException('Qty must be > 0');
    const product = await this.findOne(productUuid);
    if (!product) throw new BadRequestException('Product not found');
    const stok = this.stokRepo.create({
      productUuid,
      qty,
      createdBy: userId,
    });
    return await this.stokRepo.save(stok);
  }

  async reduceStock(productUuid: string, qty: number, userId?: string) {
    if (qty <= 0) throw new BadRequestException('Qty must be > 0');
    const product = await this.findOne(productUuid);
    if (!product) throw new BadRequestException('Product not found');
    const total = product.stock.reduce((sum, s) => sum + s.qty, 0);
    if (total < qty)
      throw new BadRequestException('Stok tidak mencukupi');
    const stok = this.stokRepo.create({
      productUuid,
      qty: -Math.abs(qty),
      createdBy: userId,
    });
    return await this.stokRepo.save(stok);
  }
}
