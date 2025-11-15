
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { ProductController } from './product.controller';
import { productProvider } from 'src/common/entity/product/product.provider';
import { ProductService } from './product.service';
import { productStockProvider } from 'src/common/entity/product_stock/product_stock.provider';
import { productUnitProvider } from 'src/common/entity/product_unit/product_unit.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [
    ...productProvider,
    ...productUnitProvider,
    ...productStockProvider,
    ProductService,
  ],
})
export class ProductModule {}
