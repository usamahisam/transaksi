import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository, DataSource, EntityManager, Like } from 'typeorm';
import { JournalEntity } from 'src/common/entities/journal/journal.entity';
import { JournalDetailEntity } from 'src/common/entities/journal_detail/journal_detail.entity';

// [BARU] Helper untuk menghasilkan pengenal lokal
const generateLocalUuid = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
const generateJournalDetailUuid = (storeUuid: string) => `${storeUuid}-JDT-${generateLocalUuid()}`;

@Injectable()
export class JournalService {
  constructor(
    @Inject('JOURNAL_REPOSITORY')
    private journalRepository: Repository<JournalEntity>,

    @Inject('JOURNAL_DETAIL_REPOSITORY')
    private detailRepository: Repository<JournalDetailEntity>,

    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) { }

  async generateCode(prefix: string, storeUuid: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const codePrefix = `${prefix}-${storeUuid}-${date}-`;
    
    // Logika untuk mencari urutan tertinggi di toko yang sama
    const maxCodeJournal = await this.journalRepository.findOne({
        where: { code: Like(`${codePrefix}%`) },
        order: { code: 'DESC' },
    });

    let sequence = 1;
    if (maxCodeJournal) {
        const lastPart = maxCodeJournal.code.split('-').pop();
        if (lastPart) {
            sequence = parseInt(lastPart) + 1;
        }
    }
    return `${codePrefix}${String(sequence).padStart(4, '0')}`;
  }

  async createJournal(
    type: string,
    details: Record<string, any>,
    userId: string,
    storeUuid: string,
  ) {
    
    if (!storeUuid) {
        throw new BadRequestException('Store ID is required for journal creation.');
    }
    
    const customJournalUuid = `${storeUuid}-JRN-${generateLocalUuid()}`;

    return this.dataSource.transaction(async (manager) => {
      const code = await this.generateCode(type, storeUuid);
      const journal = manager.create(JournalEntity, {
        uuid: customJournalUuid,
        code,
        createdBy: userId,
      });
      await manager.save(journal);

      const detailEntities = Object.entries(details).map(([key, value]) =>
        manager.create(JournalDetailEntity, {
          uuid: generateJournalDetailUuid(storeUuid),
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          journalCode: code,
          createdBy: userId,
        }),
      );

      // 1. Simpan semua detail non-stock yang dikirim dari frontend
      await manager.save(detailEntities);

      // 2. Proses Stock dan Nominal
      if (type === 'SALE' || type === 'BUY') {
        // Panggil fungsi pemroses stock dan nominal
        await this.processStockAndNominal(details, userId, manager, code, type, storeUuid);
      }

      return {
        message: `${type} journal created`,
        journal,
        details: detailEntities,
      };
    });
  }

  /**
   * Mengkonversi item dari payload transaksi BUY/SALE menjadi entry Journal Detail
   * untuk pencatatan stok dan nominal (stok_min_/stok_plus_ dan nominal_sale_/nominal_buy_).
   */
  private async processStockAndNominal(
    details: Record<string, any>,
    userId: string | undefined,
    manager: EntityManager,
    journalCode: string,
    type: 'SALE' | 'BUY',
    storeUuid: string,
  ) {
    const itemsMap = new Map<string, any>();
    const journalDetails: Partial<JournalDetailEntity>[] = [];

    // 1. Rekonstruksi Item Details berdasarkan index
    Object.keys(details).forEach((key) => {
      if (key.includes('#')) {
        const parts = key.split('#');
        const index = parts.pop();

        // [PERBAIKAN] Menggunakan parts.join('#') untuk merekonstruksi nama field
        // yang mungkin berisi underscore ('_') tanpa mengubahnya.
        const fieldName = parts.join('#');

        if (!index || isNaN(Number(index))) return;

        if (!itemsMap.has(index)) {
          itemsMap.set(index, {});
        }
        const itemObj = itemsMap.get(index);

        if (itemObj) {
          // Mapping. FieldName yang dikirim frontend: product_uuid, unit_uuid, qty, price, subtotal
          if (fieldName === 'product_uuid') itemObj.productUuid = details[key];
          if (fieldName === 'unit_uuid') itemObj.unitUuid = details[key];
          if (fieldName === 'qty') itemObj.qty = Number(details[key]);

          // Perhatikan: key price di sale adalah 'price', di buy adalah 'buy_price'
          if (fieldName === 'price' || fieldName === 'buy_price') itemObj.price = Number(details[key]);
          if (fieldName === 'subtotal') itemObj.subtotal = Number(details[key]);
        }
      }
    });

    const stockPrefix = type === 'SALE' ? 'stok_min_' : 'stok_plus_';
    const nominalPrefix = type === 'SALE' ? 'nominal_sale_' : 'nominal_buy_';

    // 2. Buat Journal Detail Entries untuk Stok dan Nominal
    for (const [_, item] of itemsMap) {
      // Pastikan data esensial ada
      if (item.productUuid && item.qty > 0 && item.unitUuid && item.price !== undefined) {

        // 2a. Catat Pergerakan Stok
        // Key format: stok_(min/plus)_UUIDPRODUK_UUIDUNIT
        const stockKey = `${stockPrefix}${item.productUuid}_${item.unitUuid}`;
        journalDetails.push(manager.create(JournalDetailEntity, {
          uuid: generateJournalDetailUuid(storeUuid),
          journalCode: journalCode,
          key: stockKey,
          value: String(item.qty),
          createdBy: userId,
        }));

        // 2b. Catat Nominal
        const nominalKey = `${nominalPrefix}${item.productUuid}_${item.unitUuid}`;
        // Gunakan subtotal jika ada, jika tidak, hitung (qty * price)
        const nominalValue = item.subtotal !== undefined ? item.subtotal : (item.qty * item.price);

        journalDetails.push(manager.create(JournalDetailEntity, {
          uuid: generateJournalDetailUuid(storeUuid),
          journalCode: journalCode,
          key: nominalKey,
          value: String(nominalValue),
          createdBy: userId,
        }));
      }
    }

    if (journalDetails.length > 0) {
      await manager.save(journalDetails);
    }
  }


  // ==========================================================
  // Stock Adjustment via Product Create/Update (Type: ADJ)
  // ==========================================================
  /**
   * Mencatat penyesuaian stok (selisih newQty dan oldQty) sebagai transaksi ADJ.
   */
  async processStockAdjustment(
    adjustments: Array<{ productUuid: string; unitUuid: string; oldQty: number; newQty: number; }>,
    userId: string | undefined,
    manager: EntityManager,
    storeUuid: string,
  ) {
    if (!adjustments || adjustments.length === 0) return;

    const journalDetails: Partial<JournalDetailEntity>[] = [];
    const code = await this.generateCode('ADJ', storeUuid);
    const customJournalUuid = `${storeUuid}-JRN-${generateLocalUuid()}`;

    // 1. Buat Journal entry untuk adjustment
    const journal = manager.create(JournalEntity, {
      uuid: customJournalUuid,
      code,
      createdBy: userId,
    });
    await manager.save(journal);

    // 2. Catat detail penyesuaian untuk setiap unit
    for (const adj of adjustments) {
      const diff = adj.newQty - adj.oldQty;

      if (diff === 0) continue;

      const stockPrefix = diff > 0 ? 'stok_plus_' : 'stok_min_';
      const qty = Math.abs(diff);

      // Key format: stok_(plus/min)_UUIDPRODUK_UUIDUNIT
      const stockKey = `${stockPrefix}${adj.productUuid}_${adj.unitUuid}`;

      journalDetails.push(manager.create(JournalDetailEntity, {
        uuid: generateJournalDetailUuid(storeUuid),
        journalCode: code,
        key: stockKey,
        value: String(qty),
        createdBy: userId,
      }));

      // Catat juga metadata adjustment untuk audit/laporan
      const metaKey = `stok_adj_meta_${adj.productUuid}_${adj.unitUuid}`;
      journalDetails.push(manager.create(JournalDetailEntity, {
        uuid: generateJournalDetailUuid(storeUuid),
        journalCode: code,
        key: metaKey,
        value: JSON.stringify({ diff: diff, old: adj.oldQty, new: adj.newQty }),
        createdBy: userId,
      }));
    }

    if (journalDetails.length > 0) {
      await manager.save(journalDetails);
    }
  }

  async createSale(details: any, userId: string, storeUuid: string) {
    return this.createJournal('SALE', details, userId, storeUuid);
  }

  async createBuy(details: any, userId: string, storeUuid: string) {
    return this.createJournal('BUY', details, userId, storeUuid);
  }

  async findAllByType(typePrefix: string, storeUuid: string) {
    const codePattern = `${typePrefix}-${storeUuid}-%`;
    return await this.journalRepository.find({
      where: {
        code: Like(`${codePattern}%`),
      },
      relations: ['details'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getChartData(startDate: string, endDate: string, storeUuid: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const saleCodePattern = `SALE-${storeUuid}-%`;
    const buyCodePattern = `BUY-${storeUuid}-%`;
    const query = this.journalRepository.createQueryBuilder('j')
      .innerJoin('j.details', 'jd', 'jd.key = :key', { key: 'grand_total' })
      .where('j.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere(`j.code LIKE :saleCodePattern OR j.code LIKE :buyCodePattern`, { saleCodePattern, buyCodePattern })
      .select([
        "DATE_FORMAT(j.created_at, '%Y-%m-%d') as date",`SUM(CASE WHEN j.code LIKE :saleCodePattern THEN CAST(jd.value AS DECIMAL) ELSE 0 END) as total_sale`,
        `SUM(CASE WHEN j.code LIKE :buyCodePattern THEN CAST(jd.value AS DECIMAL) ELSE 0 END) as total_buy`
      ])
      .groupBy("date")
      .orderBy("date", "ASC");
    return await query.getRawMany();
  }
}