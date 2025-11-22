
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { ProductController } from './product.controller';
import { productProvider } from 'src/common/entities/product/product.provider';
import { ProductService } from './product.service';
import { productStockProvider } from 'src/common/entities/product_stock/product_stock.provider';
import { productUnitProvider } from 'src/common/entities/product_unit/product_unit.provider';
import { productPriceProvider } from 'src/common/entities/product_price/product_price.provider';
import { productShelveProvider } from 'src/common/entities/product_shelve/product_shelve.provider';
import { productShelvePivotProvider } from 'src/common/entities/product_shelve_pivot/product_shelve_pivot.provider';
import { productCategoryProvider } from 'src/common/entities/product_category/product_category.provider';
import { productCategoryPivotProvider } from 'src/common/entities/product_category_pivot/product_category_pivot.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [
    ...productProvider,
    ...productUnitProvider,
    ...productStockProvider,
    ...productPriceProvider,
    ...productCategoryProvider,
    ...productCategoryPivotProvider,
    ...productShelveProvider,
    ...productShelvePivotProvider,
    ProductService,
  ],
  exports: [ProductService],
})
export class ProductModule { }
