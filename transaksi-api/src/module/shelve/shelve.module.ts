
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { ShelveController } from './shelve.controller';
import { ShelveService } from './shelve.service';
import { productShelveProvider } from 'src/common/entities/product_shelve/product_shelve.provider';
import { productCategoryPivotProvider } from 'src/common/entities/product_category_pivot/product_category_pivot.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ShelveController],
  providers: [
    ...productShelveProvider,
    ...productCategoryPivotProvider,
    ShelveService,
  ],
  exports: [ShelveService],
})
export class ShelveModule { }
