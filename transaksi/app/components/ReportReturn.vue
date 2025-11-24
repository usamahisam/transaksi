// app/components/ReportReturn.vue

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

const productService = useProductService();
const journalService = useJournalService();
const toast = useToast();

const transactions = ref([]);
const productsMap = ref({});
const loading = ref(true);
const expandedRows = ref({});
const filters = ref({
    global: { value: null, matchMode: 'contains' }
});

// --- COMPUTED STATS ---
const stats = computed(() => {
    // Total Refund selalu positif di tampilan stat
    const totalRefund = transactions.value.reduce((sum, t) => sum + Math.abs(t.total), 0);
    const totalTrx = transactions.value.length;
    
    const totalSaleReturns = transactions.value.filter(t => t.type === 'RT_SALE').length;
    const totalBuyReturns = transactions.value.filter(t => t.type === 'RT_BUY').length;

    return { totalRefund, totalTrx, totalSaleReturns, totalBuyReturns };
});

// --- LOAD DATA ---
const loadData = async () => {
    loading.value = true;
    try {
        const productsData = await productService.getAllProducts();
        productsMap.value = (productsData || []).reduce((acc, curr) => {
            acc[curr.uuid] = curr;
            return acc;
        }, {});

        // [BARU] Fetch RT_SALE dan RT_BUY
        // Asumsi findAllByType sudah disetup untuk generic fetch
        const [returnSaleData, returnBuyData] = await Promise.all([
             journalService.findAllByType('RT_SALE'), 
             journalService.findAllByType('RT_BUY'),
        ]);
        
        const rawData = [
            ...(returnSaleData || []), 
            ...(returnBuyData || [])
        ];
        
        transactions.value = rawData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(journal => {
            const detailsMap = Array.isArray(journal.details) 
                ? journal.details.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {}) 
                : (journal.details || {});

            const count = Number(detailsMap['total_items_count'] || 0);
            const isSaleReturn = journal.code.startsWith('RT_SALE');
            
            const items = [];
            for (let i = 0; i < count; i++) {
                const pUuid = detailsMap[`product_uuid#${i}`];
                const uUuid = detailsMap[`unit_uuid#${i}`];
                
                const productMaster = productsMap.value[pUuid];
                const unitMaster = productMaster?.units?.find(u => u.uuid === uUuid);

                const itemQty = Number(detailsMap[`qty#${i}`] || 0);
                // Note: price/buy_price di detail transaksi retur dikirim dalam NEGATIF, tapi kita tampilkan positif
                const priceKey = isSaleReturn ? 'price' : 'buy_price';
                const itemPrice = Math.abs(Number(detailsMap[`${priceKey}#${i}`] || 0)); 
                const itemSubtotal = Math.abs(Number(detailsMap[`subtotal#${i}`] || 0));

                items.push({
                    productName: productMaster?.name || 'Unknown Product',
                    unitName: unitMaster?.unitName || 'Unit',
                    qty: itemQty,
                    price: itemPrice,
                    subtotal: itemSubtotal,
                });
            }

            const total = Number(detailsMap['grand_total'] || 0); // Ini pasti negatif dari API

            return {
                uuid: journal.uuid,
                code: journal.code,
                type: isSaleReturn ? 'RT_SALE' : 'RT_BUY',
                date: journal.createdAt,
                total: total,
                customer: detailsMap['customer_name'] || '-',
                supplier: detailsMap['supplier'] || '-',
                refNo: detailsMap['reference_no'] || '-',
                notes: detailsMap['notes'] || '',
                items: items 
            };
        });

    } catch (e) {
        console.error("Gagal memuat data", e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data retur', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// --- FORMATTERS & UTILS ---
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
    if(!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

onMounted(() => {
    loadData();
});

const refreshData = async () => {
    await loadData();
}

defineExpose({ refreshData });
</script>

<template>
    <div class="h-full flex flex-col bg-surface-50 dark:bg-surface-950">
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div class="p-4 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <i class="pi pi-refresh text-6xl text-red-500"></i>
                </div>
                <p class="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pengembalian Dana</p>
                <h3 class="text-2xl font-black text-surface-800 dark:text-surface-100">{{ formatCurrency(stats.totalRefund) }}</h3>
                <p class="text-xs text-red-600 mt-2 font-medium flex items-center"><i class="pi pi-minus-circle mr-1 text-[10px]"></i> Total Nilai Transaksi Retur</p>
            </div>

            <div class="p-4 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <i class="pi pi-receipt text-6xl text-blue-500"></i>
                </div>
                <p class="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Jumlah Transaksi Retur</p>
                <h3 class="text-2xl font-black text-surface-800 dark:text-surface-100">{{ stats.totalTrx }} <span class="text-base font-normal text-surface-400">Nota</span></h3>
                <p class="text-xs text-blue-500 mt-2 font-medium">Total semua retur</p>
            </div>

            <div class="p-4 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <i class="pi pi-shopping-cart text-6xl text-emerald-500"></i>
                </div>
                <p class="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Retur Penjualan</p>
                <h3 class="text-2xl font-black text-surface-800 dark:text-surface-100">{{ stats.totalSaleReturns }} <span class="text-base font-normal text-surface-400">Nota</span></h3>
                <p class="text-xs text-emerald-500 mt-2 font-medium">Stok masuk kembali</p>
            </div>

             <div class="p-4 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <i class="pi pi-truck text-6xl text-orange-500"></i>
                </div>
                <p class="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Retur Pembelian</p>
                <h3 class="text-2xl font-black text-surface-800 dark:text-surface-100">{{ stats.totalBuyReturns }} <span class="text-base font-normal text-surface-400">Nota</span></h3>
                <p class="text-xs text-orange-500 mt-2 font-medium">Stok keluar/dikembalikan ke supplier</p>
            </div>
        </div>

        <div class="rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden flex-1">
            
            <div class="p-4 border-b border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row justify-between gap-4 items-center bg-surface-50/50 dark:bg-surface-900">
                <div class="w-full sm:w-auto">
                    <IconField iconPosition="left">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText v-model="filters['global'].value" placeholder="Cari No. Dokumen, Supplier, Pelanggan..." class="w-full sm:w-80 !rounded-lg pl-10" />
                    </IconField>
                </div>
                <div class="flex gap-2">
                     <Button label="Filter Tanggal" icon="pi pi-calendar" severity="secondary" text size="small" />
                     <Button label="Export" icon="pi pi-file-excel" severity="success" text size="small" />
                </div>
            </div>

            <DataTable 
                v-model:expandedRows="expandedRows" 
                :value="transactions" 
                dataKey="uuid"
                :loading="loading"
                paginator :rows="10" :rowsPerPageOptions="[10,20,50]"
                :filters="filters"
                stripedRows
                tableStyle="min-width: 60rem"
                rowHover
                class="text-sm"
            >
                <template #empty>
                    <div class="flex flex-col items-center justify-center py-12 text-surface-400">
                        <i class="pi pi-file-excel text-4xl mb-2 opacity-50"></i>
                        <p>Belum ada data transaksi retur.</p>
                    </div>
                </template>

                <Column expander style="width: 3rem" />

                <Column field="code" header="Info Dokumen" sortable>
                    <template #body="slotProps">
                        <div class="flex flex-col py-1">
                            <span class="font-bold text-red-700 font-mono text-xs">{{ slotProps.data.code }}</span>
                            <div class="flex items-center gap-1 text-surface-500 text-[11px] mt-0.5">
                                <i class="pi pi-clock text-[9px]"></i>
                                <span>{{ formatDate(slotProps.data.date) }}</span>
                            </div>
                             <Tag :value="slotProps.data.type === 'RT_SALE' ? 'Penjualan' : 'Pembelian'" 
                                :severity="slotProps.data.type === 'RT_SALE' ? 'info' : 'warning'" 
                                rounded class="!text-[9px] mt-1 !font-extrabold !px-1.5 w-fit" />
                        </div>
                    </template>
                </Column>

                <Column field="type" header="Tipe Retur" sortable>
                     <template #body="slotProps">
                        <div v-if="slotProps.data.type === 'RT_SALE'" class="flex items-center gap-1">
                            <i class="pi pi-arrow-left text-emerald-500 text-sm"></i>
                            <span class="font-medium">Dari: {{ slotProps.data.customer || 'Umum' }}</span>
                        </div>
                        <div v-else class="flex items-center gap-1">
                            <i class="pi pi-arrow-right text-orange-500 text-sm"></i>
                            <span class="font-medium">Ke: {{ slotProps.data.supplier || 'Umum' }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="refNo" header="Ref. Nota / Catatan">
                    <template #body="slotProps">
                        <div class="flex flex-col">
                            <span v-if="slotProps.data.refNo !== '-'" class="text-xs font-medium text-surface-700 dark:text-surface-200">
                                Ref: {{ slotProps.data.refNo }}
                            </span>
                            <span v-if="slotProps.data.notes" class="text-xs text-surface-600 italic max-w-[200px] truncate block" :title="slotProps.data.notes">
                                "{{ slotProps.data.notes }}"
                            </span>
                            <span v-else-if="slotProps.data.refNo === '-'" class="text-surface-400 text-xs">-</span>
                        </div>
                    </template>
                </Column>

                <Column field="items.length" header="Item" sortable class="text-center">
                    <template #body="slotProps">
                         <Badge :value="slotProps.data.items.length" severity="danger" class="!min-w-[1.5rem] !h-[1.5rem]" />
                    </template>
                </Column>

                <Column field="total" header="Total Refund" sortable class="text-right">
                    <template #body="slotProps">
                        <span class="font-black text-red-600 text-sm">
                            - {{ formatCurrency(Math.abs(slotProps.data.total)) }}
                        </span>
                    </template>
                </Column>

                <Column style="width: 4rem; text-align: center">
                    <template #body>
                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small" />
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div class="p-4 bg-red-50/50 dark:bg-surface-950/50 border-t border-b border-surface-200 dark:border-surface-800 shadow-inner">
                        <div class="flex items-center gap-2 mb-3 ml-1">
                            <i class="pi pi-box text-red-500 bg-red-100 dark:bg-red-900/30 p-1.5 rounded-md"></i>
                            <h5 class="font-bold text-surface-700 dark:text-surface-200 text-xs uppercase tracking-wide">Rincian Barang Dikembalikan</h5>
                        </div>
                        
                        <div class="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
                            <DataTable :value="slotProps.data.items" size="small" class="text-xs">
                                <Column field="productName" header="Produk">
                                    <template #body="i">
                                        <span class="font-medium text-surface-700">{{ i.data.productName }}</span>
                                    </template>
                                </Column>
                                <Column field="unitName" header="Satuan" style="width: 100px">
                                    <template #body="i">
                                        <span class="bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-[10px] font-bold text-surface-600">{{ i.data.unitName }}</span>
                                    </template>
                                </Column>
                                <Column field="qty" header="Qty" class="text-center" style="width: 100px">
                                    <template #body="i">
                                        <span class="font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">+{{ i.data.qty }}</span>
                                    </template>
                                </Column>
                                <Column field="price" header="Harga Awal" class="text-right">
                                    <template #body="i">
                                        {{ formatCurrency(i.data.price) }}
                                    </template>
                                </Column>
                                <Column field="subtotal" header="Subtotal Refund" class="text-right" style="width: 150px">
                                    <template #body="i">
                                        <span class="font-bold">- {{ formatCurrency(i.data.subtotal) }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                        
                        <div class="flex justify-end mt-3 gap-2">
                             <Button label="Cetak Bukti" icon="pi pi-print" size="small" severity="secondary" outlined class="!text-xs !py-1" />
                        </div>
                    </div>
                </template>

            </DataTable>
        </div>
    </div>
</template>

<style scoped>
/* Mengatasi latar belakang tabel utama */
:deep(.p-datatable) {
    /* Menjadikan latar belakang transparent dan menghapus latar belakang PrimeVue */
    background: transparent !important;
    border-color: transparent !important;
}

/* Mengatasi latar belakang header */
:deep(.p-datatable-thead > tr > th) {
    background-color: var(--p-surface-50) !important; /* Light Mode default */
    color: var(--p-text-color) !important;
    border-color: var(--p-surface-200) !important;
}

/* Memaksa warna header di Dark Mode */
.dark :deep(.p-datatable-thead > tr > th) {
    background-color: var(--p-surface-900) !important;
    color: var(--p-surface-100) !important;
    border-color: var(--p-surface-800) !important;
}

/* Mengatasi latar belakang baris */
:deep(.p-datatable-tbody > tr) {
    background-color: var(--p-surface-0) !important; /* Light Mode default (putih) */
    color: var(--p-text-color) !important;
    border-color: var(--p-surface-200) !important;
}

/* Mengatasi warna baris ganjil/genap (striped rows) */
:deep(.p-datatable-tbody .p-row-even) {
    background-color: var(--p-surface-50) !important; /* Light Mode striped */
}

/* Memaksa warna baris di Dark Mode */
.dark :deep(.p-datatable-tbody > tr) {
    background-color: var(--p-surface-900) !important; /* Default Dark Row */
}
.dark :deep(.p-datatable-tbody .p-row-even) {
    background-color: var(--p-surface-950) !important; /* Striped Dark Row (Genap) */
}
/* Memastikan warna baris ganjil di Dark Mode juga benar */
.dark :deep(.p-datatable-tbody .p-row-odd) {
     background-color: var(--p-surface-900) !important; /* Striped Dark Row (Ganjil) */
}

/* HOVER ROW FIX */
.dark :deep(.p-datatable-tbody > tr:hover) {
    background-color: var(--p-surface-800) !important; 
}
:deep(.p-datatable-tbody > tr:hover) {
    background-color: var(--p-surface-100) !important; 
}

/* Penyesuaian agar isi tabel rata atas */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    vertical-align: top;
    border-color: var(--p-surface-200); /* Border Light */
}
.dark :deep(.p-datatable .p-datatable-tbody > tr > td) {
    border-color: var(--p-surface-800); /* Border Dark */
}


.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>