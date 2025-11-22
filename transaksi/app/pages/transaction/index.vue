<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
// Import komponen transaksi
import TransactionSale from '~/components/TransactionSale.vue';
import TransactionBuy from '~/components/TransactionBuy.vue';
import ProductCreateModal from '~/components/ProductCreateModal.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// Ref untuk memanggil fungsi refresh dari komponen anak
const saleRef = ref(null);
const buyRef = ref(null);

// State Tab
const activeTab = ref(route.query.tab === 'buy' ? 'buy' : 'sale');

// State Modal Produk
const showModal = ref(false);

// --- UTILS ---
const getTabClass = (tabName) => {
    return activeTab.value === tabName
        ? 'global-tab-active'
        : 'global-tab-inactive';
};

// --- LOGIC ---
// Sinkronisasi Tab dengan URL
watch(activeTab, (newTab) => {
    router.replace({ query: { tab: newTab } });
});

// Panggil refresh saat tab berubah dan komponen sudah dimuat
watch(() => route.query.tab, async (newTab) => {
    activeTab.value = newTab === 'buy' ? 'buy' : 'sale';
    
    await nextTick();
    
    if (activeTab.value === 'sale' && saleRef.value && saleRef.value.refreshData) {
        saleRef.value.refreshData();
    } else if (activeTab.value === 'buy' && buyRef.value && buyRef.value.refreshData) {
        buyRef.value.refreshData();
    }
});

const onProductCreated = () => {
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Produk baru berhasil dibuat!', life: 3000 });
    if (activeTab.value === 'sale' && saleRef.value) {
        saleRef.value.refreshData();
    } else if (activeTab.value === 'buy' && buyRef.value) {
        buyRef.value.refreshData();
    }
    showModal.value = false;
};

const handleOpenCreateModal = () => {
    showModal.value = true;
};

onMounted(() => {
    activeTab.value = route.query.tab === 'buy' ? 'buy' : 'sale';
});

definePageMeta({ layout: 'default' });
</script>

<template>
    <div class="h-[calc(100vh-5rem)]">
        <Toast />
        
        <div class="h-full flex flex-col">
            <div class="flex items-end gap-3 mb-4 border-b border-surface-200 dark:border-surface-700">
                <button 
                    @click="activeTab = 'sale'"
                    :class="getTabClass('sale')"
                >
                    <i class="pi pi-shopping-cart mr-2"></i> Transaksi Penjualan
                </button>
                <button 
                    @click="activeTab = 'buy'"
                    :class="getTabClass('buy')"
                >
                    <i class="pi pi-truck mr-2"></i> Transaksi Pembelian (Stok Masuk)
                </button>
            </div>
            
            <div class="flex-1 overflow-hidden">
                <KeepAlive>
                    <TransactionSale 
                        v-if="activeTab === 'sale'" 
                        ref="saleRef"
                        @open-create-modal="handleOpenCreateModal"
                        class="h-full"
                    />
                    <TransactionBuy 
                        v-else-if="activeTab === 'buy'" 
                        ref="buyRef"
                        @open-create-modal="handleOpenCreateModal"
                        class="h-full"
                    />
                </KeepAlive>
            </div>
        </div>

        <ProductCreateModal 
            v-model:visible="showModal" 
            :productUuid="null" 
            @product-created="onProductCreated" 
        />
    </div>
</template>