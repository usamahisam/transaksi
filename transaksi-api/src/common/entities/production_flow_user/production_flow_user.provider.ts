

import { DataSource } from 'typeorm';
import { ProductionFlowUserEntity } from './production_flow_user.entity';

export const productionFlowUserProvider = [
    {
        provide: 'PRODUCTION_FLOW_USER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductionFlowUserEntity),
        inject: ['DATA_SOURCE'],
    },
];
