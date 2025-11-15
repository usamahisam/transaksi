
import { DataSource } from 'typeorm';
import { JournalBalanceEntity } from './journal_balance.entity';

export const journalBalanceProvider = [
  {
    provide: 'JOURNAL_BALANCE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(JournalBalanceEntity),
    inject: ['DATA_SOURCE'],
  },
];
