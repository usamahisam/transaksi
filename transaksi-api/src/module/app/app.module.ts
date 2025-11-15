import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { JournalModule } from '../journal/journal.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    JournalModule,
    ProductModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
