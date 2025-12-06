import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/db/database.module';
import { productionFlowProvider } from 'src/common/entities/production_flow/production_flow.provider';
import { productionFlowUserProvider } from 'src/common/entities/production_flow_user/production_flow_user.provider';
import { ProductionFlowController } from './production_flow.controller';
import { ProductionFlowService } from './production_flow.service';

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [ProductionFlowController],
    providers: [
        ...productionFlowProvider,
        ...productionFlowUserProvider,
        ProductionFlowService,
    ],
    exports: [ProductionFlowService],
})
export class ProductionFlowModule { }