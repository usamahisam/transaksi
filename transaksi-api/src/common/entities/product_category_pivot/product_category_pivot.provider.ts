
import { DataSource } from 'typeorm';
import { ProductCategoryPivotEntity } from './product_category_pivot.entity';

export const productCategoryPivotProvider = [
  {
    provide: 'PRODUCT_CATEGORY_PIVOT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductCategoryPivotEntity),
    inject: ['DATA_SOURCE'],
  },
];
