// composables/useJournalService.ts

export const useJournalService = () => {
    const config = useRuntimeConfig();
    
    const API_BASE = `${config.public.apiBase}/journal`;
    const DEFAULT_USER_ID = 'user-uuid-123-mock';

    // --- TRANSAKSI UTAMA ---
    
    const createSaleTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/sale`, {
            method: 'POST',
            body: {
                ...payload,
                userId: DEFAULT_USER_ID
            }
        });
    };
    
    const createBuyTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/buy`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };
    
    // --- TRANSAKSI RETUR ---

    const createSaleReturnTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/return/sale`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };

    const createBuyReturnTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/return/buy`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };
    
    // --- PIUTANG/HUTANG GLOBAL (BARU) ---

    const createArTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/debt/ar`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };
    
    const createApTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/debt/ap`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };

    // --- PEMBAYARAN PIUTANG/HUTANG ---

    const createArPaymentTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/payment/ar`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };
    
    const createApPaymentTransaction = async (payload: any) => {
        return await useApi(`${API_BASE}/payment/ap`, {
            method: 'POST',
            body: { ...payload, userId: DEFAULT_USER_ID }
        });
    };

    // --- LAPORAN/REPORTING ---
    
    const getSalesReport = async () => {
        return await useApi(`${API_BASE}/report/SALE`, {
            method: 'GET'
        });
    };

    const getPurchaseReport = async () => {
        return await useApi(`${API_BASE}/report/BUY`, {
            method: 'GET'
        });
    };
    
    const findAllByType = async (type: string) => {
        return await useApi(`${API_BASE}/report/${type}`, {
            method: 'GET'
        });
    };
    
    const getChartData = async (startDate: string, endDate: string) => {
        return await useApi(`${API_BASE}/chart`, {
            method: 'GET',
            params: { startDate, endDate }
        });
    };

    return {
        createSaleTransaction,
        createBuyTransaction,
        createSaleReturnTransaction,
        createBuyReturnTransaction,
        createArTransaction, // Piutang Global
        createApTransaction, // Hutang Global
        createArPaymentTransaction, // Pembayaran Piutang
        createApPaymentTransaction, // Pembayaran Hutang
        getSalesReport,
        getPurchaseReport,
        getChartData,
        findAllByType
    };
};