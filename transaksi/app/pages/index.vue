<script setup>
import { ref } from 'vue';

// Data Shortcut Menu
const menus = ref([
    {
        title: 'TRANSAKSI CEPAT',
        items: [
            { 
                label: 'Penjualan Baru', 
                icon: 'pi pi-shopping-cart', 
                route: '/transaction?tab=sale', 
                desc: 'Membuka antarmuka Kasir / POS',
                // Warna Emerald (Hijau)
                color: 'text-emerald-600 dark:text-emerald-300', 
                bg: 'bg-emerald-100 dark:bg-emerald-900/40' 
            },
            { 
                label: 'Pembelian Stok', 
                icon: 'pi pi-truck', 
                route: '/transaction?tab=buy', 
                desc: 'Mencatat stok masuk dari Supplier',
                // Warna Orange
                color: 'text-orange-600 dark:text-orange-300', 
                bg: 'bg-orange-100 dark:bg-orange-900/40' 
            },
             { 
                label: 'Piutang Baru (AR)', 
                icon: 'pi pi-arrow-up-right', 
                route: '/arap?tab=global-debt', 
                desc: 'Mencatat Piutang Global (AR) baru',
                // Warna Cyan
                color: 'text-cyan-600 dark:text-cyan-300', 
                bg: 'bg-cyan-100 dark:bg-cyan-900/40' 
            },
            { 
                label: 'Bayar Hutang (AP)', 
                icon: 'pi pi-money-bill', 
                route: '/arap?tab=debt-payment', 
                desc: 'Mencatat pelunasan Hutang/Piutang',
                // Warna Indigo
                color: 'text-indigo-600 dark:text-indigo-300', 
                bg: 'bg-indigo-100 dark:bg-indigo-900/40' 
            }
        ]
    },
    {
        title: 'MANAJEMEN INVENTORI',
        items: [
            { 
                label: 'Master Produk', 
                icon: 'pi pi-box', 
                route: '/product', 
                desc: 'Kelola Item, Stok, dan Harga',
                // Warna Blue
                color: 'text-blue-600 dark:text-blue-300', 
                bg: 'bg-blue-100 dark:bg-blue-900/40' 
            },
            { 
                label: 'Kategori Produk', 
                icon: 'pi pi-tags', 
                route: '/product?tab=categories', 
                desc: 'Kelola Kategori Item',
                // Warna Purple
                color: 'text-purple-600 dark:text-purple-300', 
                bg: 'bg-purple-100 dark:bg-purple-900/40' 
            },
            { 
                label: 'Pengaturan Toko', 
                icon: 'pi pi-cog', 
                route: '/setting', 
                desc: 'Ubah detail toko dan pajak',
                // Warna Gray
                color: 'text-surface-600 dark:text-surface-300', 
                bg: 'bg-surface-200 dark:bg-surface-700/50' 
            }
        ]
    },
    {
        title: 'LAPORAN DAN ANALISIS',
        items: [
            { 
                label: 'Laporan Penjualan', 
                icon: 'pi pi-chart-line', 
                route: '/report?tab=sale', 
                desc: 'Lihat ringkasan omset dan transaksi',
                // Warna Teal
                color: 'text-teal-600 dark:text-teal-300', 
                bg: 'bg-teal-100 dark:bg-teal-900/40' 
            },
            { 
                label: 'Laporan Pembelian', 
                icon: 'pi pi-shopping-bag', 
                route: '/report?tab=buy', 
                desc: 'Lihat detail pengeluaran dan stok masuk',
                // Warna Pink
                color: 'text-pink-600 dark:text-pink-300', 
                bg: 'bg-pink-100 dark:bg-pink-900/40' 
            },
             { 
                label: 'Analisis Grafik', 
                icon: 'pi pi-chart-bar', 
                route: '/report?tab=graph', 
                desc: 'Tren laba rugi bulanan',
                // Warna Yellow
                color: 'text-yellow-600 dark:text-yellow-300', 
                bg: 'bg-yellow-100 dark:bg-yellow-900/40' 
            }
        ]
    }
]);

definePageMeta({
    layout: 'default'
});
</script>

<template>
    <div class="p-4 md:p-8 animate-fade-in">
        
        <!-- HEADER SAMBUTAN DINAMIS -->
        <div class="mb-10 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-950 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div class="relative z-10">
                <h1 class="text-3xl md:text-4xl font-bold mb-2">Selamat Datang! 👋</h1>
                <p class="text-primary-100 text-lg">Kelola tokomu dengan mudah melalui *shortcut* di bawah.</p>
            </div>
            <i class="pi pi-chart-bar absolute -right-5 -bottom-10 text-[10rem] text-white opacity-10 dark:opacity-5 rotate-12"></i>
        </div>

        <!-- MENU SHORTCUTS -->
        <div v-for="(group, index) in menus" :key="index" class="mb-10">
            
            <h2 class="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-4 ml-1 border-b border-surface-200 dark:border-surface-700 pb-2 inline-block">
                {{ group.title }}
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <NuxtLink 
                    v-for="item in group.items" 
                    :key="item.label" 
                    :to="item.route"
                    class="group relative 
                        bg-white dark:bg-surface-900 p-6 rounded-2xl 
                        border border-surface-200 dark:border-surface-800 
                        shadow-md dark:shadow-none 
                        hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50 hover:border-primary-400 dark:hover:border-primary-600
                        hover:-translate-y-1 
                        transition-all duration-300 cursor-pointer"
                >
                    <div class="flex items-start justify-between mb-4">
                        <!-- ICON BOX DINAMIS -->
                        <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner', item.bg, item.color]">
                            <i :class="item.icon"></i>
                        </div>
                        
                        <!-- ARROW -->
                        <div class="w-8 h-8 rounded-full 
                            bg-surface-50 dark:bg-surface-800 
                            flex items-center justify-center 
                            text-surface-400 
                            group-hover:bg-primary-500 group-hover:text-white 
                            transition-colors border border-surface-100 dark:border-surface-700">
                            <i class="pi pi-arrow-right text-sm"></i>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-bold 
                                text-surface-800 dark:text-surface-100 
                                mb-1 
                                
                                group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {{ item.label }}
                        </h3>
                        <p class="text-sm 
                                text-surface-500 dark:text-surface-400">
                            {{ item.desc }}
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Animasi halus saat masuk */
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>