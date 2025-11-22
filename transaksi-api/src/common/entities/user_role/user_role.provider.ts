
import { DataSource } from 'typeorm';
import { UserRoleEntity } from './user_role.entity';

export const userRoleProvider = [
  {
    provide: 'USER_ROLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserRoleEntity),
    inject: ['DATA_SOURCE'],
  },
];
