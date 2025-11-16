<template>
  <div class="flex flex-col min-h-screen surface-ground">
    
    <header class="h-14 lg:h-16 sticky top-0 z-50 shadow-sm bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
      <Toolbar class="h-full border-none px-4 lg:px-6">
        
        <template #start>
          <div class="flex items-center gap-3">
            <Button 
              icon="pi pi-bars" 
              severity="secondary" 
              text 
              rounded 
              @click="visible = true" 
              aria-label="Toggle Sidebar" 
              class="lg:hidden"
            />
            <NuxtLink to="/" class="text-xl lg:hidden font-black text-primary-500 tracking-wider">
              RetailPulse
            </NuxtLink>
            
            <h2 class="hidden lg:block text-2xl font-semibold text-900 dark:text-0">
                Aplikasi Dashboard Retail
            </h2>

          </div>
        </template>

        <template #end>
          <div class="flex items-center gap-4">
            <span class="p-input-icon-left hidden md:flex">
              <i class="pi pi-search" />
              <InputText placeholder="Cari data..." size="small" class="w-15rem" />
            </span>
            
            <Button 
              icon="pi pi-bell" 
              severity="secondary" 
              text 
              rounded 
              aria-label="Notifikasi" 
            />
            
            <Avatar 
              label="A" 
              size="large" 
              shape="circle" 
              class="bg-primary-500 text-white cursor-pointer" 
            />
          </div>
        </template>
      </Toolbar>
    </header>

    <div class="flex flex-1 overflow-hidden">
      
      <div class="hidden lg:block w-60 xl:w-64 flex-shrink-0 border-r border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 overflow-y-auto">
        
        <div class="flex flex-col h-full">
          <div class="h-14 lg:h-16 flex items-center p-4 border-b border-surface-100 dark:border-surface-800">
            <span class="text-2xl font-black text-primary-500">RetailPulse</span>
          </div>
          
          <div class="flex-1 p-3 pt-4">
            <Menu :model="items" class="w-full border-none" />
          </div>
          
          <div class="p-4 border-t border-surface-200 dark:border-surface-700">
            <Button 
              label="Logout" 
              icon="pi pi-sign-out" 
              severity="danger" 
              text 
              class="w-full justify-content-start" 
            />
          </div>
        </div>
      </div>

      <main class="flex-1 p-4 md:p-6 overflow-y-auto bg-surface-50 dark:bg-surface-900">
        <NuxtPage /> 
      </main>
    </div>

    <Sidebar v-model:visible="visible" class="w-18rem md:w-20rem lg:hidden" header="RetailPulse Menu">
        <Menu :model="items" class="w-full border-none" @menuitem-click="visible = false" />
        <template #footer>
            <div class="p-4 border-t border-surface-200">
                <Button label="Logout" icon="pi pi-sign-out" severity="danger" class="w-full" />
            </div>
        </template>
    </Sidebar>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext'; 
import { NuxtLink } from '#components'; 

const visible = ref(false);

const items = ref([
    { label: 'Dashboard', icon: 'pi pi-chart-pie', to: '/' },
    { separator: true },
    { label: 'Inventory Management', icon: 'pi pi-box', items: [
        { label: 'Products', icon: 'pi pi-tag', to: '/products' },
        { label: 'Stock Audit', icon: 'pi pi-list', to: '/stock' },
    ]},
    { label: 'Sales & Transactions', icon: 'pi pi-wallet', items: [
        { label: 'Sales Orders', icon: 'pi pi-chart-line', to: '/sales' },
        { label: 'Purchase Orders', icon: 'pi pi-shopping-cart', to: '/purchase' },
    ]},
    { label: 'CRM & Users', icon: 'pi pi-users', items: [
        { label: 'Customers', icon: 'pi pi-user', to: '/customers' },
        { label: 'Employees', icon: 'pi pi-id-card', to: '/employees' },
    ]},
    { separator: true },
    { label: 'System Settings', icon: 'pi pi-cog', to: '/settings' },
]);
</script>

<style scoped>
/* CSS Konsistensi */
.p-toolbar {
  padding: 0; 
  background-color: transparent !important; 
}

/* Memperbaiki Flex-1 di Flex Column */
.flex-1 {
  min-height: 0; 
}

.surface-ground {
  background-color: var(--surface-ground);
}
</style>