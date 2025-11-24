<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
// Import komponen khusus Piutang/Hutang
import ArapDebtPayment from '~/components/ArapDebtPayment.vue';
import ArapGlobalDebt from '~/components/ArapGlobalDebt.vue'; 

const route = useRoute();
const router = useRouter();
const toast = useToast();

// Ref untuk memanggil fungsi refresh dari komponen anak
const debtPaymentRef = ref(null);
const globalDebtRef = ref(null); 

// State Tab
const defaultTab = 'global-debt';
// Tentukan tab awal, jika di URL ada 'debt-payment', gunakan itu, jika tidak, gunakan default
const activeTab = ref(route.query.tab === 'debt-payment' ? 'debt-payment' : defaultTab); 

// --- UTILS ---
const getTabClass = (tabName) => {
    // Memberikan kelas tab yang aktif atau tidak aktif
    return activeTab.value === tabName
        ? 'global-tab-active'
        : 'global-tab-inactive';
};

// Panggil refresh saat tab berubah dan komponen sudah dimuat
watch(() => route.query.tab, async (newTab) => {
    // Logika penentuan tab hanya untuk AR/AP
    activeTab.value = newTab === 'debt-payment' ? 'debt-payment' : 'global-debt'; 
    
    await nextTick();
    
    // Logic refresh hanya untuk tab Hutang/Piutang
    if (activeTab.value === 'debt-payment' && debtPaymentRef.value && debtPaymentRef.value.refreshData) {
        debtPaymentRef.value.refreshData();
    } else if (activeTab.value === 'global-debt' && globalDebtRef.value && globalDebtRef.value.refreshData) {
        globalDebtRef.value.refreshData();
    }
});

// onMounted untuk set tab awal dan sinkronisasi URL
onMounted(() => {
    activeTab.value = route.query.tab === 'debt-payment' ? 'debt-payment' : defaultTab;
    if (route.query.tab !== activeTab.value) {
         router.replace({ query: { tab: activeTab.value } });
    }
});

definePageMeta({ layout: 'default' });
</script>

<template>
    <div class="h-[calc(100vh-5rem)]">
        <Toast />
        
        <div class="h-full flex flex-col">
            <div class="flex items-end gap-3 mb-4 border-b border-surface-200 dark:border-surface-700">
                
                <!-- Tab: Piutang/Hutang Baru -->
                <button 
                    @click="activeTab = 'global-debt'"
                    :class="getTabClass('global-debt')"
                >
                    <i class="pi pi-plus-circle mr-2"></i> Piutang/Hutang Baru
                </button>

                <!-- Tab: Bayar Piutang/Hutang -->
                <button 
                    @click="activeTab = 'debt-payment'"
                    :class="getTabClass('debt-payment')"
                >
                    <i class="pi pi-money-bill mr-2"></i> Bayar Piutang/Hutang
                </button>
            </div>
            
            <div class="flex-1 overflow-hidden">
                <KeepAlive>
                    <ArapGlobalDebt
                        v-if="activeTab === 'global-debt'" 
                        ref="globalDebtRef"
                        class="h-full"
                    />
                    <ArapDebtPayment
                        v-else-if="activeTab === 'debt-payment'" 
                        ref="debtPaymentRef"
                        class="h-full"
                    />
                </KeepAlive>
            </div>
        </div>
    </div>
</template>