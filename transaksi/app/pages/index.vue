<template>
  <div class="p-fluid">
    <h1 class="text-3xl font-bold mb-6 text-900 dark:text-0">
      👋 Selamat Datang di Dashboard RetailPulse
    </h1>

    <div class="grid mb-6">
      <div class="col-12 lg:col-6 xl:col-3">
        <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <template #content>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Total Penjualan</span>
                <div class="text-900 font-bold text-xl">Rp 120.500.000</div>
              </div>
              <div class="flex align-items-center justify-content-center bg-blue-100 dark:bg-blue-900 rounded-full" 
                   style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-chart-line text-blue-500 text-xl"></i>
              </div>
            </div>
            <span class="text-green-500 font-medium">↑ 15%</span>
            <span class="text-500"> Sejak Bulan Lalu</span>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-6 xl:col-3">
        <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <template #content>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Total Transaksi</span>
                <div class="text-900 font-bold text-xl">5.340</div>
              </div>
              <div class="flex align-items-center justify-content-center bg-orange-100 dark:bg-orange-900 rounded-full" 
                   style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-shopping-cart text-orange-500 text-xl"></i>
              </div>
            </div>
            <span class="text-red-500 font-medium">↓ 5%</span>
            <span class="text-500"> Dibanding Kemarin</span>
          </template>
        </Card>
      </div>
      
      <div class="col-12 lg:col-6 xl:col-3">
        <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <template #content>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Item Terjual</span>
                <div class="text-900 font-bold text-xl">18.125 Unit</div>
              </div>
              <div class="flex align-items-center justify-content-center bg-cyan-100 dark:bg-cyan-900 rounded-full" 
                   style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-box text-cyan-500 text-xl"></i>
              </div>
            </div>
            <span class="text-green-500 font-medium">↑ 3%</span>
            <span class="text-500"> Hari Ini</span>
          </template>
        </Card>
      </div>
      
      <div class="col-12 lg:col-6 xl:col-3">
        <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <template #content>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Stok Kritis</span>
                <div class="text-900 font-bold text-xl text-red-600">45 Item</div>
              </div>
              <div class="flex align-items-center justify-content-center bg-red-100 dark:bg-red-900 rounded-full" 
                   style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
              </div>
            </div>
            <span class="text-red-500 font-medium">Segera</span>
            <span class="text-500"> Lakukan *Restock*</span>
          </template>
        </Card>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>
            Tren Penjualan 6 Bulan Terakhir
          </template>
          <template #content>
            <Chart type="line" :data="chartData" :options="chartOptions" class="h-30rem" />
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-4">
        <Card>
          <template #title>
            Top 5 Produk Stok Rendah
          </template>
          <template #content>
            <ul class="list-none p-0 m-0">
              <li v-for="(product, index) in lowStockProducts" :key="index"
                  class="flex align-items-center py-3 px-2 border-bottom-1 surface-border hover:surface-hover transition-colors duration-150">
                <i :class="product.icon" class="text-lg mr-3" :style="{ color: product.color }"></i>
                <div class="flex-1">
                  <div class="text-900">{{ product.name }}</div>
                  <div class="text-500 text-sm">SKU: {{ product.sku }}</div>
                </div>
                <Badge :value="product.stock" severity="danger"></Badge>
              </li>
            </ul>
            <Button label="Lihat Semua Stok Kritis" icon="pi pi-list" text class="mt-4 w-full" />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Pastikan komponen ini sudah di-register di nuxt.config.ts Anda
import Chart from 'primevue/chart';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
// Import InputText jika belum
import InputText from 'primevue/inputtext';

// 1. Data untuk Grafik (Line Chart)
const chartData = ref({
    labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    datasets: [
        {
            label: 'Penjualan Bersih (Rp Juta)',
            data: [100, 115, 95, 125, 120, 150],
            fill: true,
            borderColor: 'var(--blue-500)',
            tension: 0.4,
            backgroundColor: 'rgba(59, 130, 246, 0.1)' // Tailwind blue-500 with opacity
        }
    ]
});

// Opsi untuk Grafik
const chartOptions = ref({
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'var(--text-color-secondary)'
            },
            grid: {
                color: 'var(--surface-border)'
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: 'var(--text-color-secondary)',
                callback: function(value) {
                    return 'Rp ' + value + ' Jt';
                }
            },
            grid: {
                color: 'var(--surface-border)'
            }
        }
    }
});

// 2. Data Produk Stok Rendah
const lowStockProducts = ref([
    { name: 'Kemeja Basic Pria L', sku: 'KMBAS-L', stock: 12, icon: 'pi pi-shirt', color: '#EF4444' },
    { name: 'Sepatu Running V2 40', sku: 'SRV2-40', stock: 18, icon: 'pi pi-shoe', color: '#F97316' },
    { name: 'Celana Jeans Slim Fit', sku: 'CJSLIM', stock: 25, icon: 'pi pi-wallet', color: '#14B8A6' },
    { name: 'Hoodie Fleece XL', sku: 'HOOF-XL', stock: 30, icon: 'pi pi-star', color: '#6366F1' },
    { name: 'Topi Baseball Hitam', sku: 'TBBS-H', stock: 35, icon: 'pi pi-palette', color: '#FBBF24' }
]);

// Konfigurasi Layout Nuxt
definePageMeta({
  layout: 'dashboard' // Memanggil layout yang sudah kita buat sebelumnya
})

</script>

<style scoped>
/* PrimeFlex Grid digunakan secara default dengan class col-12, lg:col-6, dll. */
/* Tidak perlu menambahkan CSS Grid kustom lagi di sini */
.h-30rem {
    height: 30rem;
}
</style>