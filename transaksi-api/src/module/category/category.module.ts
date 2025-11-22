
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { productCategoryProvider } from 'src/common/entities/product_category/product_category.provider';
import { productCategoryPivotProvider } from 'src/common/entities/product_category_pivot/product_category_pivot.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryController],
  providers: [
    ...productCategoryProvider,
    ...productCategoryPivotProvider,
    CategoryService,
  ],
  exports: [CategoryService],
})
export class CategoryModule { }
