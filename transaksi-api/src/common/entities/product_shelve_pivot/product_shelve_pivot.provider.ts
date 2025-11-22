
import { DataSource } from 'typeorm';
import { ProductShelvePivotEntity } from './product_shelve_pivot.entity';

export const productShelvePivotProvider = [
  {
    provide: 'PRODUCT_SHELVE_PIVOT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductShelvePivotEntity),
    inject: ['DATA_SOURCE'],
  },
];
