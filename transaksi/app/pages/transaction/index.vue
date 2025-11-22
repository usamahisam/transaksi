// pages/transaction/index.vue

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
// [BARU] Import komponen yang sudah dibuat
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
// Gunakan query parameter 'tab' untuk sinkronisasi state
const activeTab = ref(route.query.tab === 'buy' ? 'buy' : 'sale');

// State Modal Produk
const showModal = ref(false);

// Sinkronisasi Tab dengan URL
watch(activeTab, (newTab) => {
    router.replace({ query: { tab: newTab } });
});

// Panggil refresh saat tab berubah
watch(() => route.query.tab, (newTab) => {
    activeTab.value = newTab === 'buy' ? 'buy' : 'sale';
    if (newTab === 'buy' && buyRef.value && buyRef.value.refreshData) {
        // Beri waktu render lalu refresh data
        setTimeout(() => buyRef.value.refreshData(), 50);
    } else if (newTab !== 'buy' && saleRef.value && saleRef.value.refreshData) {
         setTimeout(() => saleRef.value.refreshData(), 50);
    }
});

const onProductCreated = () => {
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Produk baru berhasil dibuat!', life: 3000 });
    // Refresh data di kedua tab, atau minimal di tab yang aktif
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
    // Pastikan tab diset dari URL saat pertama kali dimuat
    activeTab.value = route.query.tab === 'buy' ? 'buy' : 'sale';
});

definePageMeta({ layout: 'default' });
</script>

<template>
    <div class="h-[calc(100vh-5rem)]">
        <Toast />
        
        <div class="h-full flex flex-col">
            <div class="flex items-center gap-4 mb-4 border-b border-surface-200 dark:border-surface-700">
                <button 
                    @click="activeTab = 'sale'"
                    class="px-4 py-2 text-sm font-bold border-b-2 transition-all duration-200"
                    :class="activeTab === 'sale'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                >
                    <i class="pi pi-shopping-cart mr-2"></i> Transaksi Penjualan
                </button>
                <button 
                    @click="activeTab = 'buy'"
                    class="px-4 py-2 text-sm font-bold border-b-2 transition-all duration-200"
                    :class="activeTab === 'buy'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
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