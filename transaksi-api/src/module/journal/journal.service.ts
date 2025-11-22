import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource, EntityManager, Like } from 'typeorm';
import { JournalEntity } from 'src/common/entities/journal/journal.entity';
import { JournalDetailEntity } from 'src/common/entities/journal_detail/journal_detail.entity';
// import { ProductService } from '../product/product.service'; // DIHAPUS: ProductService tidak lagi mengelola ProductStock

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

  async generateCode(prefix: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    // NOTE: Ini masih menggunakan COUNT global, idealnya harus diubah ke SEQUENCE atau MAX(code)
    const count = await this.journalRepository.count();
    return `${prefix}-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  async createJournal(
    type: string,
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

      const detailEntities = Object.entries(details).map(([key, value]) =>
        manager.create(JournalDetailEntity, {
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
        await this.processStockAndNominal(details, userId, manager, code, type);
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
    type: 'SALE' | 'BUY'
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
  ) {
    if (!adjustments || adjustments.length === 0) return;

    const journalDetails: Partial<JournalDetailEntity>[] = [];
    const code = await this.generateCode('ADJ');

    // 1. Buat Journal entry untuk adjustment
    const journal = manager.create(JournalEntity, {
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
        journalCode: code,
        key: stockKey,
        value: String(qty),
        createdBy: userId,
      }));

      // Catat juga metadata adjustment untuk audit/laporan
      const metaKey = `stok_adj_meta_${adj.productUuid}_${adj.unitUuid}`;
      journalDetails.push(manager.create(JournalDetailEntity, {
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

  async createSale(details: any, userId: string) {
    return this.createJournal('SALE', details, userId);
  }

  async createBuy(details: any, userId: string) {
    return this.createJournal('BUY', details, userId);
  }

  async findAllByType(typePrefix: string) {
    return await this.journalRepository.find({
      where: {
        code: Like(`${typePrefix}%`),
      },
      relations: ['details'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getChartData(startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const query = this.journalRepository.createQueryBuilder('j')
      .innerJoin('j.details', 'jd', 'jd.key = :key', { key: 'grand_total' })
      .where('j.createdAt BETWEEN :start AND :end', { start, end })
      .select([
        "DATE_FORMAT(j.created_at, '%Y-%m-%d') as date",
        "SUM(CASE WHEN j.code LIKE 'SALE%' THEN CAST(jd.value AS DECIMAL) ELSE 0 END) as total_sale",
        "SUM(CASE WHEN j.code LIKE 'BUY%' THEN CAST(jd.value AS DECIMAL) ELSE 0 END) as total_buy"
      ])
      .groupBy("date")
      .orderBy("date", "ASC");
    return await query.getRawMany();
  }
}