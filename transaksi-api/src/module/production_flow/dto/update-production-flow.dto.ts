import { PartialType } from '@nestjs/swagger';
import { CreateProductionFlowDto } from './create-production-flow.dto';
import { IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';

export class UpdateProductionFlowDto extends PartialType(CreateProductionFlowDto) {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    workerUserUuids?: string[];
    
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}