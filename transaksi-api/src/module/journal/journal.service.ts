import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { JournalEntity } from 'src/common/entity/journal/journal.entity';
import { JournalBalanceEntity } from 'src/common/entity/journal_balance/journal_balance.entity';
import { JournalDetailEntity } from 'src/common/entity/journal_detail/journal_detail.entity';

@Injectable()
export class JournalService {
  constructor(
    @Inject('JOURNAL_REPOSITORY')
    private journalRepository: Repository<JournalEntity>,

    @Inject('JOURNAL_BALANCE_REPOSITORY')
    private balanceRepository: Repository<JournalBalanceEntity>,

    @Inject('JOURNAL_DETAIL_REPOSITORY')
    private detailRepository: Repository<JournalDetailEntity>,

    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  async generateCode(prefix: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.journalRepository.count();
    return `${prefix}-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  async createJournal(
    type: string,
    amount: number,
    details: Record<string, any>,
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const code = await this.generateCode(type);

      const journal = manager.create(JournalEntity, {
        code,
        createdBy: userId,
      });
      await manager.save(journal);

      const balance = manager.create(JournalBalanceEntity, {
        code: `${code}-BAL`,
        journalCode: code,
        balance: amount,
        createdBy: userId,
      });
      await manager.save(balance);

      const detailEntities = Object.entries(details).map(([key, value]) =>
        manager.create(JournalDetailEntity, {
          key,
          value: String(value),
          journalCode: code,
          createdBy: userId,
        }),
      );
      await manager.save(detailEntities);

      return {
        message: `${type} journal created`,
        journal,
        balance,
        details: detailEntities,
      };
    });
  }

  async createSale(amount: number, details: any, userId: string) {
    return this.createJournal('SALE', Math.abs(amount), details, userId);
  }

  async createBuy(amount: number, details: any, userId: string) {
    return this.createJournal('BUY', -Math.abs(amount), details, userId);
  }

  async createHutang(amount: number, details: any, userId: string) {
    return this.createJournal('AP', -Math.abs(amount), details, userId);
  }

  async createPiutang(amount: number, details: any, userId: string) {
    return this.createJournal('AR', Math.abs(amount), details, userId);
  }

  async cashIn(amount: number, details: any, userId: string) {
    return this.createJournal('CASH_IN', Math.abs(amount), details, userId);
  }

  async cashOut(amount: number, details: any, userId: string) {
    return this.createJournal('CASH_OUT', -Math.abs(amount), details, userId);
  }
  
  async refund(amount: number, details: any, userId: string) {
  return this.createJournal('REFUND', -Math.abs(amount), details, userId);
}
}
