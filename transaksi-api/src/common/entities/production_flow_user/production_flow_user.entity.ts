import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ProductionFlowEntity } from '../production_flow/production_flow.entity';

@Entity('production_flow_user')
export class ProductionFlowUserEntity {
    @PrimaryColumn('varchar', { length: 60 })
    uuid: string;

    @Column({ name: 'production_flow_uuid', type: 'varchar', length: 60 })
    productionFlowUuid: string;

    @Column({ name: 'user_uuid', type: 'uuid' })
    userUuid: string;

    // Relasi ke Flow
    @ManyToOne(() => ProductionFlowEntity, (flow) => flow.workers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'production_flow_uuid' })
    productionFlow: ProductionFlowEntity;

    // Relasi ke User (Pegawai)
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_uuid' })
    user: UserEntity;

    @CreateDateColumn({ name: 'assigned_at', type: 'timestamp' })
    assignedAt: Date;
    
    // Opsional: Jika ingin mencatat siapa yang menugaskan
    @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
    assignedBy?: string;
}