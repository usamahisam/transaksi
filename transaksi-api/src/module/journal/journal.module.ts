
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { journalProvider } from 'src/common/entity/journal/journal.provider';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { journalDetailProvider } from 'src/common/entity/journal_detail/journal_detail.provider';
import { journalBalanceProvider } from 'src/common/entity/journal_balance/journal_balance.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [JournalController],
  providers: [
    ...journalProvider,
    ...journalDetailProvider,
    ...journalBalanceProvider,
    JournalService,
  ],
})
export class JournalModule {}
