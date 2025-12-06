import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductionFlowEntity } from 'src/common/entities/production_flow/production_flow.entity';
import { ProductionFlowUserEntity } from 'src/common/entities/production_flow_user/production_flow_user.entity';
import { CreateProductionFlowDto } from './dto/create-production-flow.dto';
import { UpdateProductionFlowDto } from './dto/update-production-flow.dto';

const generateLocalUuid = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

@Injectable()
export class ProductionFlowService {
    constructor(
        @Inject('PRODUCTION_FLOW_REPOSITORY')
        private flowRepository: Repository<ProductionFlowEntity>,
        
        @Inject('PRODUCTION_FLOW_USER_REPOSITORY')
        private flowUserRepository: Repository<ProductionFlowUserEntity>,
    ) { }

    async create(createDto: CreateProductionFlowDto, userId: string, storeUuid: string): Promise<ProductionFlowEntity> {
        const { workerUserUuids, ...flowData } = createDto;
        
        // 1. Simpan Flow
        const flowUuid = `${storeUuid}-FLOW-${generateLocalUuid()}`;
        const newFlow = this.flowRepository.create({
            ...flowData,
            uuid: flowUuid,
            createdBy: userId,
        });
        
        const savedFlow = await this.flowRepository.save(newFlow);

        // 2. Simpan Workers (Pivot) jika ada
        if (workerUserUuids && workerUserUuids.length > 0) {
            const pivotEntities = workerUserUuids.map(userUuid => {
                return this.flowUserRepository.create({
                    uuid: `${storeUuid}-WKR-${generateLocalUuid()}-${Math.random().toString(36).substring(7)}`,
                    productionFlowUuid: savedFlow.uuid,
                    userUuid: userUuid,
                    assignedBy: userId
                });
            });
            await this.flowUserRepository.save(pivotEntities);
        }

        return this.findOne(savedFlow.uuid);
    }

    async findAllByProduction(productionUuid: string): Promise<ProductionFlowEntity[]> {
        return this.flowRepository.find({
            where: { productionUuid },
            relations: ['workers', 'workers.user'], // Load relasi worker dan user-nya
            order: { stepOrder: 'ASC' },
        });
    }

    async findOne(uuid: string): Promise<ProductionFlowEntity> {
        const flow = await this.flowRepository.findOne({
            where: { uuid },
            relations: ['workers', 'workers.user'],
        });
        if (!flow) throw new NotFoundException('Flow tidak ditemukan');
        return flow;
    }

    async update(uuid: string, updateDto: UpdateProductionFlowDto, userId: string, storeUuid: string): Promise<ProductionFlowEntity> {
        const flow = await this.findOne(uuid);
        const { workerUserUuids, ...updateData } = updateDto;

        // Update data dasar flow
        await this.flowRepository.update(uuid, {
            ...updateData,
            updatedBy: userId,
            completedAt: updateData.isCompleted ? new Date() : "",
        });

        // Update Workers (Full Replace Strategy)
        // Hapus worker lama, insert worker baru (atau logic diffing jika ingin lebih kompleks)
        if (workerUserUuids) {
            // Hapus yang lama
            await this.flowUserRepository.delete({ productionFlowUuid: uuid });
            
            // Insert yang baru
            if (workerUserUuids.length > 0) {
                 const pivotEntities = workerUserUuids.map(userUuid => {
                    return this.flowUserRepository.create({
                        uuid: `${storeUuid}-WKR-${generateLocalUuid()}-${Math.random().toString(36).substring(7)}`,
                        productionFlowUuid: uuid,
                        userUuid: userUuid,
                        assignedBy: userId
                    });
                });
                await this.flowUserRepository.save(pivotEntities);
            }
        }

        return this.findOne(uuid);
    }

    async remove(uuid: string) {
        return this.flowRepository.delete(uuid); 
    }
}