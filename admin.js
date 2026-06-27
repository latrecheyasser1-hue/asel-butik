// Premium Custom Alert Override
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-alert-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(15, 23, 42, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        .custom-alert-backdrop.active {
            opacity: 1;
            visibility: visible;
        }
        .custom-alert-card {
            background: #ffffff;
            border-radius: 16px;
            width: 90%;
            max-width: 420px;
            padding: 32px 24px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            transform: scale(0.9);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            border-top: 6px solid #c5a880;
            direction: rtl;
        }
        .custom-alert-backdrop.active .custom-alert-card {
            transform: scale(1);
        }
        .custom-alert-icon-container {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
            font-size: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .custom-alert-title {
            font-family: 'Cairo', sans-serif;
            font-size: 20px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .custom-alert-text {
            font-family: 'Cairo', sans-serif;
            font-size: 15px;
            font-weight: 500;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 24px;
            white-space: pre-line;
        }
        .custom-alert-button {
            font-family: 'Cairo', sans-serif;
            background-color: #2c3e50;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            width: 100%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .custom-alert-button:hover {
            background-color: #c5a880;
            box-shadow: 0 10px 15px -3px rgba(197, 168, 128, 0.3);
        }
        .custom-alert-button:active {
            transform: scale(0.97);
        }
    `;
    document.head.appendChild(style);

    const backdrop = document.createElement('div');
    backdrop.className = 'custom-alert-backdrop';
    
    const card = document.createElement('div');
    card.className = 'custom-alert-card';
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'custom-alert-icon-container';
    const icon = document.createElement('i');
    iconContainer.appendChild(icon);
    
    const title = document.createElement('div');
    title.className = 'custom-alert-title';
    
    const text = document.createElement('div');
    text.className = 'custom-alert-text';
    
    const btn = document.createElement('button');
    btn.className = 'custom-alert-button';
    btn.textContent = 'موافق';
    
    card.appendChild(iconContainer);
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(btn);
    backdrop.appendChild(card);
    
    if (document.body) {
        document.body.appendChild(backdrop);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(backdrop);
        });
    }

    let currentCallback = null;

    function getIconAndColorForMessage(msg) {
        msg = msg.toLowerCase();
        if (msg.includes('نجاح') || msg.includes('تمت') || msg.includes('تم ') || msg.includes('موافق') || msg.includes('بنجاح')) {
            return { iconClass: 'fa-solid fa-circle-check', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', title: 'عملية ناجحة' };
        }
        if (msg.includes('خطأ') || msg.includes('فشل') || msg.includes('غير صالحة') || msg.includes('لا يمكنك') || msg.includes('الرجاء') || msg.includes('يرجى') || msg.includes('عذراً')) {
            return { iconClass: 'fa-solid fa-circle-exclamation', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', title: 'تنبيه هام' };
        }
        return { iconClass: 'fa-solid fa-circle-info', color: '#c5a880', bg: 'rgba(197, 168, 128, 0.12)', title: 'تنبيه' };
    }

    window.alert = function(msg) {
        text.textContent = msg;
        const config = getIconAndColorForMessage(msg);
        
        icon.className = config.iconClass;
        iconContainer.style.color = config.color;
        iconContainer.style.backgroundColor = config.bg;
        card.style.borderTopColor = config.color;
        title.textContent = config.title;

        backdrop.classList.add('active');
        btn.focus();
        
        return new Promise((resolve) => {
            currentCallback = resolve;
        });
    };

    function closeAlert() {
        backdrop.classList.remove('active');
        if (currentCallback) {
            currentCallback();
            currentCallback = null;
        }
    }

    btn.addEventListener('click', closeAlert);
    
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
            closeAlert();
        }
    });

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && backdrop.classList.contains('active')) {
            closeAlert();
        }
    });
})();

// Desktop App (Electron) Print Helper
async function triggerPrint(printerType = 'receipt') {
    if (window.electronAPI && window.electronAPI.printSilent) {
        let deviceName = '';
        if (printerType === 'receipt') {
            deviceName = localStorage.getItem('receiptPrinterName') || '';
        } else if (printerType === 'barcode') {
            deviceName = localStorage.getItem('barcodePrinterName') || '';
        }
        
        try {
            const result = await window.electronAPI.printSilent({ deviceName: deviceName });
            if (!result.success) {
                console.error('Silent print failed:', result.error);
                // Fallback if silent print fails completely for some reason
                window.print();
            }
        } catch (e) {
            console.error('IPC Error during print:', e);
            window.print();
        }
    } else {
        // Normal web browser mode
        window.print();
    }
}

// Initialize Supabase Client
let supabaseClient;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
    alert("Supabase Client Init Error: " + err.message + "\n" + err.stack);
}

function formatImageUrl(url) {
    if (!url) return '../images/kaftan_gold_1.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    let formatted = url;
    if (formatted.startsWith('./')) {
        formatted = formatted.substring(2);
    }
    if (formatted.startsWith('images/')) {
        return '../' + formatted;
    }
    return formatted;
}

// State Variables
let currentTab = 'general';
let productsList = [];
let stockList = [];
let ordersList = [];
let invoicesList = [];
let addedStockVariants = []; // temp list for the Add Product modal
let suppliersList = []; // state list of suppliers
let cashiersList = []; // state list of cashiers
let expensesList = []; // state list of expenses
let debtsList = []; // state list of debts
let isCashierUser = false; // flag indicating if current logged-in user is a cashier
let originalStockQuantities = {}; // cache of stock quantities when editing a product to prevent cashier from decreasing stock
let originalProductBarcode = null; // cache original barcode when editing
let websiteSettings = null; // store website text/contact configurations

// DOM Elements
const sidebarMenuItems = document.querySelectorAll('.menu-item');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabTitle = document.getElementById('tabTitle');
const adminLoader = document.getElementById('adminLoader');
const tabPanelsContainer = document.getElementById('tabPanels');

const ordersTableBody = document.getElementById('ordersTableBody');
const emptyOrdersState = document.getElementById('emptyOrdersState');

const historyTableBody = document.getElementById('historyTableBody');
const emptyHistoryState = document.getElementById('emptyHistoryState');
const historySearchInput = document.getElementById('historySearchInput');

const adminProductsGrid = document.getElementById('adminProductsGrid');

const suppliersTableBody = document.getElementById('suppliersTableBody');
const emptySuppliersState = document.getElementById('emptySuppliersState');
const addSupplierModal = document.getElementById('addSupplierModal');
const openAddSupplierModalBtn = document.getElementById('openAddSupplierModalBtn');
const closeSupplierFormModalBtn = document.getElementById('closeSupplierFormModalBtn');
const supplierForm = document.getElementById('supplierForm');

const debtsTableBody = document.getElementById('debtsTableBody');
const emptyDebtsState = document.getElementById('emptyDebtsState');
const debtsSearchInput = document.getElementById('debtsSearchInput');
const debtsStatusFilter = document.getElementById('debtsStatusFilter');
const debtsTotalRemaining = document.getElementById('debtsTotalRemaining');
const debtorsCount = document.getElementById('debtorsCount');

const debtDetailsModal = document.getElementById('debtDetailsModal');
const closeDebtDetailsModalBtn = document.getElementById('closeDebtDetailsModalBtn');
const recordPaymentForm = document.getElementById('recordPaymentForm');
const paymentAmountInput = document.getElementById('paymentAmountInput');
const recordPaymentDebtId = document.getElementById('recordPaymentDebtId');
const detailDebtClientName = document.getElementById('detailDebtClientName');
const detailDebtClientPhone = document.getElementById('detailDebtClientPhone');
const detailDebtInvoiceNum = document.getElementById('detailDebtInvoiceNum');
const detailDebtDate = document.getElementById('detailDebtDate');
const detailDebtTotal = document.getElementById('detailDebtTotal');
const detailDebtPaid = document.getElementById('detailDebtPaid');
const detailDebtRemaining = document.getElementById('detailDebtRemaining');
const detailDebtItemsBody = document.getElementById('detailDebtItemsBody');
const detailDebtPaymentsBody = document.getElementById('detailDebtPaymentsBody');
const printDebtStatementBtn = document.getElementById('printDebtStatementBtn');
const deleteDebtBtn = document.getElementById('deleteDebtBtn');

const statTotalEarnings = document.getElementById('statTotalEarnings');
const statCompletedOrders = document.getElementById('statCompletedOrders');
const statTotalStock = document.getElementById('statTotalStock');
const topSellingList = document.getElementById('topSellingList');

const addProductModal = document.getElementById('addProductModal');
const openAddProductModalBtn = document.getElementById('openAddProductModalBtn');
const closeProductFormModalBtn = document.getElementById('closeProductFormModalBtn');
const productForm = document.getElementById('productForm');
const addedStockTableBody = document.getElementById('addedStockTableBody');
const addStockRowBtn = document.getElementById('addStockRowBtn');

const resetDemoDataBtn = document.getElementById('resetDemoDataBtn');

// Charts references
let salesChart = null;
let wilayaChart = null;

// Initial Setup
let isDashboardInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        setupAuth();
        await checkAuth();
    } catch (err) {
        alert("DOMContentLoaded Error: " + err.message + "\n" + err.stack);
    }
});

// Setup tab navigation switching
function setupTabSwitching() {
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            if (currentTab === tabId) return;

            sidebarMenuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabPanels.forEach(panel => {
                if (panel.id === `tab-${tabId}`) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            currentTab = tabId;
            updateTabTitle(tabId);
            
            // Re-render views if switching to stock or analytics
            if (tabId === 'stock') {
                renderStockGrid();
            } else if (tabId === 'suppliers') {
                renderSuppliersTab();
            } else if (tabId === 'analytics') {
                renderAnalytics();
            } else if (tabId === 'cashiers') {
                renderCashiersTab();
            } else if (tabId === 'settings') {
                populateSettingsForm();
            } else if (tabId === 'debts') {
                renderDebtsTab();
            }
        });
    });
}

function updateTabTitle(tabId) {
    const titles = {
        'general': 'الطلبات الجديدة',
        'history': 'الأرشيف والوصولات المطبوعة',
        'stock': 'إدارة مخزون البوتيك',
        'suppliers': 'إدارة الموردين والجهات الموردة',
        'analytics': 'الإحصائيات والتقارير المالية',
        'cashiers': 'إدارة حسابات الموظفين (الكاشير)',
        'settings': 'إعدادات المتجر العامّة',
        'debts': 'دفتر الديون (Versements)'
    };
    tabTitle.textContent = titles[tabId] || 'لوحة التحكم';
}

function setupAnalyticsFilter() {
    const filterSelect = document.getElementById('analyticsDateFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            if (currentTab === 'analytics') {
                renderAnalytics();
            }
        });
    }
}

function getCurrentUserName() {
    try {
        const cachedSession = JSON.parse(sessionStorage.getItem('asel_user_session') || 'null');
        if (cachedSession) {
            if (cachedSession.isCashierUser) {
                return cachedSession.email;
            } else {
                return "المدير";
            }
        }
    } catch (e) {
        console.error('Failed to parse cached session:', e);
    }
    return "غير معروف";
}

function setupExpensesFeature() {
    const expensesStatCard = document.getElementById('expensesStatCard');
    const expensesModal = document.getElementById('expensesModal');
    const closeExpensesModalBtn = document.getElementById('closeExpensesModalBtn');
    const addExpenseForm = document.getElementById('addExpenseForm');

    if (expensesStatCard && expensesModal) {
        expensesStatCard.addEventListener('click', () => {
            expensesModal.classList.add('active');
            renderExpensesModalContent();
        });
    }

    if (closeExpensesModalBtn && expensesModal) {
        closeExpensesModalBtn.addEventListener('click', () => {
            expensesModal.classList.remove('active');
        });
    }

    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amountInput = document.getElementById('expenseAmount');
            const reasonInput = document.getElementById('expenseReason');

            if (!amountInput || !reasonInput) return;

            const amount = Number(amountInput.value);
            const reason = reasonInput.value.trim();

            if (isNaN(amount) || amount <= 0 || !reason) {
                alert('الرجاء إدخال مبلغ صحيح وسبب مقبول.');
                return;
            }

            const cashierName = getCurrentUserName();

            // Clear inputs
            amountInput.value = '';
            reasonInput.value = '';

            try {
                // If offline, queue and update local cache
                if (!navigator.onLine) {
                    const tempId = typeof self.crypto !== 'undefined' && self.crypto.randomUUID ? self.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                    const tempExpense = {
                        id: tempId,
                        amount: amount,
                        reason: reason,
                        cashier_name: cashierName,
                        created_at: new Date().toISOString()
                    };
                    expensesList.unshift(tempExpense);
                    saveStateToLocalCache();
                    queueOfflineAction('CREATE_EXPENSE', {
                        id: tempId,
                        amount,
                        reason,
                        cashier_name: cashierName,
                        created_at: tempExpense.created_at
                    });
                    renderAnalytics();
                    renderExpensesModalContent();
                    alert('تم حفظ المصروف محلياً وسيتم مزامنته مع السحابة عند توفر الإنترنت.');
                    return;
                }

                // If online, insert to Supabase
                const { data, error } = await supabaseClient
                    .from('expenses')
                    .insert({
                        amount,
                        reason,
                        cashier_name: cashierName
                    })
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    expensesList.unshift(data);
                    saveStateToLocalCache();
                    renderAnalytics();
                    renderExpensesModalContent();
                }
            } catch (err) {
                console.error('Failed to log expense:', err);
                alert('فشل تسجيل المصروف. الرجاء المحاولة لاحقاً.');
            }
        });
    }
}

function renderExpensesModalContent() {
    const expensesTableBody = document.getElementById('expensesTableBody');
    const emptyExpensesState = document.getElementById('emptyExpensesState');
    const expensesPeriodLabel = document.getElementById('expensesPeriodLabel');

    if (!expensesTableBody) return;

    expensesTableBody.innerHTML = '';

    const dateFilterVal = document.getElementById('analyticsDateFilter')?.value || 'week';
    const periodNames = {
        'today': 'اليوم (24 ساعة)',
        'yesterday': 'أمس',
        'week': 'آخر 7 أيام',
        'month': 'آخر 30 يوم',
        'all': 'كل الأوقات'
    };
    if (expensesPeriodLabel) {
        expensesPeriodLabel.textContent = periodNames[dateFilterVal] || 'الفترة المحددة';
    }

    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (dateFilterVal === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterVal === 'yesterday') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterVal === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (dateFilterVal === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    }

    const filteredExpenses = expensesList.filter(exp => {
        if (dateFilterVal === 'all') return true;
        const expDate = new Date(exp.created_at);
        if (startDate && expDate < startDate) return false;
        if (endDate && expDate >= endDate) return false;
        return true;
    });

    if (filteredExpenses.length === 0) {
        if (emptyExpensesState) emptyExpensesState.style.display = 'flex';
        return;
    }
    if (emptyExpensesState) emptyExpensesState.style.display = 'none';

    filteredExpenses.forEach(exp => {
        const tr = document.createElement('tr');
        const formattedDate = new Date(exp.created_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        });

        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif); font-weight: bold; color: var(--danger-color);">${Number(exp.amount).toLocaleString('ar-DZ')} د.ج</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color);"><strong>${exp.reason}</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-muted);">${exp.cashier_name || 'غير معروف'}</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">${formattedDate}</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                ${isCashierUser ? '' : `<button class="btn btn-sm btn-danger delete-exp-btn" data-id="${exp.id}" style="padding: 4px 8px; font-size: 11px; background-color: #e74c3c; border-color: #e74c3c; color: white;"><i class="fa-solid fa-trash"></i></button>`}
            </td>
        `;

        if (!isCashierUser) {
            const deleteBtn = tr.querySelector('.delete-exp-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteExpense(exp.id));
            }
        }

        expensesTableBody.appendChild(tr);
    });
}

async function deleteExpense(expenseId) {
    if (isCashierUser) {
        alert('عذراً، صلاحياتك ككاشير لا تسمح بحذف المصاريف الجانبية.');
        return;
    }

    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المصروف؟')) return;

    try {
        // If offline, queue and update local cache
        if (!navigator.onLine) {
            expensesList = expensesList.filter(e => e.id !== expenseId);
            saveStateToLocalCache();
            queueOfflineAction('DELETE_EXPENSE', { id: expenseId });
            renderAnalytics();
            renderExpensesModalContent();
            return;
        }

        // If online, delete from Supabase
        const { error } = await supabaseClient
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) throw error;

        expensesList = expensesList.filter(e => e.id !== expenseId);
        saveStateToLocalCache();
        renderAnalytics();
        renderExpensesModalContent();
    } catch (err) {
        console.error('Failed to delete expense:', err);
        alert('فشل حذف المصروف. الرجاء المحاولة لاحقاً.');
    }
}

// Helper to save current state to localStorage caches
function saveStateToLocalCache() {
    try {
        localStorage.setItem('asel_products_cache', JSON.stringify(productsList));
        localStorage.setItem('asel_stock_cache', JSON.stringify(stockList));
        localStorage.setItem('asel_orders_cache', JSON.stringify(ordersList));
        localStorage.setItem('asel_invoices_cache', JSON.stringify(invoicesList));
        localStorage.setItem('asel_suppliers_cache', JSON.stringify(suppliersList));
        localStorage.setItem('asel_settings_cache', JSON.stringify(websiteSettings));
        localStorage.setItem('asel_cashiers_cache', JSON.stringify(cashiersList));
        localStorage.setItem('asel_expenses_cache', JSON.stringify(expensesList));
        localStorage.setItem('asel_debts_cache', JSON.stringify(debtsList));
    } catch (e) {
        console.error('Failed to save state to localStorage cache:', e);
    }
}

// Helper to load state from localStorage caches
function loadStateFromLocalCache() {
    try {
        const prod = localStorage.getItem('asel_products_cache');
        const st = localStorage.getItem('asel_stock_cache');
        const ord = localStorage.getItem('asel_orders_cache');
        const inv = localStorage.getItem('asel_invoices_cache');
        const sup = localStorage.getItem('asel_suppliers_cache');
        const set = localStorage.getItem('asel_settings_cache');
        const cash = localStorage.getItem('asel_cashiers_cache');
        const exp = localStorage.getItem('asel_expenses_cache');
        const dbt = localStorage.getItem('asel_debts_cache');

        if (prod) productsList = JSON.parse(prod);
        if (st) stockList = JSON.parse(st);
        if (ord) ordersList = JSON.parse(ord);
        if (inv) invoicesList = JSON.parse(inv);
        if (sup) suppliersList = JSON.parse(sup);
        if (set) websiteSettings = JSON.parse(set);
        if (cash) cashiersList = JSON.parse(cash);
        if (exp) expensesList = JSON.parse(exp);
        if (dbt) debtsList = JSON.parse(dbt);
        
        return !!prod; // Return true if we loaded at least products
    } catch (e) {
        console.error('Failed to load state from localStorage cache:', e);
        return false;
    }
}

// Fetch all data from Supabase
async function loadDashboardData(isQuiet = false) {
    try {
        if (!isQuiet) {
            adminLoader.style.display = 'flex';
            tabPanelsContainer.style.display = 'none';
        } else {
            const syncBadge = document.getElementById('syncStatusBadge');
            if (syncBadge) {
                const textSpan = syncBadge.querySelector('span');
                if (textSpan) textSpan.textContent = 'جاري تحديث البيانات...';
                syncBadge.style.display = 'flex';
            }
        }

        // Check if browser is offline. If offline, immediately fallback to cache.
        if (!navigator.onLine) {
            throw new Error('OfflineModeActive');
        }

        // Fetch all 9 tables in parallel to dramatically improve performance
        const [productsRes, stockRes, ordersRes, invoicesRes, suppliersRes, settingsRes, authCodesRes, expensesRes, debtsRes] = await Promise.all([
            supabaseClient.from('products').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('stock').select('*'),
            supabaseClient.from('orders').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('invoices').select('*').order('printed_at', { ascending: false }),
            supabaseClient.from('suppliers').select('*').order('name', { ascending: true }),
            supabaseClient.from('settings').select('*').eq('id', 1).single(),
            supabaseClient.from('auth_codes').select('*'),
            supabaseClient.from('expenses').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('debts').select('*').order('created_at', { ascending: false })
        ]);

        if (productsRes.error) throw productsRes.error;
        if (stockRes.error) throw stockRes.error;
        if (ordersRes.error) throw ordersRes.error;
        if (invoicesRes.error) throw invoicesRes.error;
        if (suppliersRes.error) throw suppliersRes.error;
        if (settingsRes.error) throw settingsRes.error;
        if (debtsRes.error) throw debtsRes.error;

        productsList = productsRes.data;
        stockList = stockRes.data;
        ordersList = ordersRes.data;
        invoicesList = invoicesRes.data;
        suppliersList = suppliersRes.data;
        websiteSettings = settingsRes.data;
        debtsList = debtsRes.data || [];
        
        if (!authCodesRes.error) { authCodesList = authCodesRes.data || []; }

        if (!expensesRes.error) {
            expensesList = expensesRes.data || [];
        }

        // Cache state locally on success
        saveStateToLocalCache();

        renderGeneralOrders();
        renderHistoryTable();
        
        if (currentTab === 'stock') renderStockGrid();
        if (currentTab === 'suppliers') renderSuppliersTab();
        if (currentTab === 'analytics') renderAnalytics();
        if (currentTab === 'cashiers') renderCashiersTab();
        if (currentTab === 'settings') populateSettingsForm();
        if (currentTab === 'debts') renderDebtsTab();

        tabPanelsContainer.style.display = 'block';
    } catch (err) {
        console.warn('Network load failed, falling back to local cache:', err);
        const cacheLoaded = loadStateFromLocalCache();
        if (cacheLoaded) {
            renderGeneralOrders();
            renderHistoryTable();
            
            if (currentTab === 'stock') renderStockGrid();
            if (currentTab === 'suppliers') renderSuppliersTab();
            if (currentTab === 'analytics') renderAnalytics();
            if (currentTab === 'cashiers') renderCashiersTab();
            if (currentTab === 'settings') populateSettingsForm();
            if (currentTab === 'debts') renderDebtsTab();

            tabPanelsContainer.style.display = 'block';
            console.log('Successfully loaded dashboard data from offline cache.');
        } else {
            console.error('No local cache available:', err);
            alert('حدث خطأ أثناء تحميل لوحة التحكم. تأكد من اتصالك بالإنترنت وسوبابيس.');
        }
    } finally {
        if (!isQuiet) {
            adminLoader.style.display = 'none';
        } else {
            const syncBadge = document.getElementById('syncStatusBadge');
            if (syncBadge) {
                const textSpan = syncBadge.querySelector('span');
                if (textSpan) textSpan.textContent = 'جاري المزامنة...';
                syncBadge.style.display = 'none';
            }
        }
    }
}

// TAB 1: GENERAL (ORDERS)
function renderGeneralOrders() {
    ordersTableBody.innerHTML = '';
    const pendingOrders = ordersList.filter(o => o.status === 'جديد');

    if (pendingOrders.length === 0) {
        emptyOrdersState.style.display = 'flex';
        return;
    }
    emptyOrdersState.style.display = 'none';

    pendingOrders.forEach(order => {
        const tr = document.createElement('tr');
        const formattedDate = new Date(order.created_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        });
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td>
                <strong>${order.client_name}</strong><br>
                <small style="color: var(--text-muted);">${order.phone}</small>
            </td>
            <td>${order.product_name}</td>
            <td>${order.color}</td>
            <td><span style="font-family: var(--font-serif); font-weight: bold;">${order.size}</span></td>
            <td>${order.wilaya} - ${order.baladiya}</td>
            <td>${order.delivery_type}</td>
            <td style="font-family: var(--font-serif); font-weight: bold; color: var(--accent-gold);">${Number(order.total_price).toLocaleString('ar-DZ')} د.ج</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-success confirm-order-btn" data-id="${order.id}"><i class="fa-solid fa-print"></i> تأكيد وطبع</button>
                    <button class="btn btn-sm btn-danger cancel-order-btn" data-id="${order.id}"><i class="fa-solid fa-ban"></i> إلغاء</button>
                </div>
            </td>
        `;

        // Buttons listeners
        tr.querySelector('.confirm-order-btn').addEventListener('click', () => confirmAndPrintOrder(order));
        tr.querySelector('.cancel-order-btn').addEventListener('click', () => cancelOrder(order));

        ordersTableBody.appendChild(tr);
    });
}

// Action: Confirm & Print Order Invoice
async function confirmAndPrintOrder(order) {
    try {
        adminLoader.style.display = 'flex';

        // 1. Create Invoice in Supabase
        const { data: newInvoice, error: invError } = await supabaseClient
            .from('invoices')
            .insert({
                order_id: order.id,
                client_name: order.client_name,
                phone: order.phone,
                wilaya: order.wilaya,
                baladiya: order.baladiya,
                delivery_type: order.delivery_type,
                product_name: order.product_name,
                size: order.size,
                color: order.color,
                total_price: order.total_price
            })
            .select()
            .single();

        if (invError) throw invError;

        // 2. Update Order status in Supabase to 'مؤكد'
        const { error: ordError } = await supabaseClient
            .from('orders')
            .update({ status: 'مؤكد' })
            .eq('id', order.id);

        if (ordError) throw ordError;

        // 3. Setup HTML print container and call browser print
        const printContainer = document.getElementById('printInvoiceContainer');
        if (order.client_name === 'زبون حضوري' && (!order.phone || order.phone === '-' || order.phone === '')) {
            printContainer.classList.add('hide-client-info');
        } else {
            printContainer.classList.remove('hide-client-info');
        }

        document.getElementById('printInvoiceNumber').textContent = newInvoice.invoice_number;
        document.getElementById('printInvoiceDate').textContent = new Date(newInvoice.printed_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
        });
        document.getElementById('printClientName').textContent = newInvoice.client_name;
        document.getElementById('printClientPhone').textContent = newInvoice.phone;
        document.getElementById('printClientWilaya').textContent = newInvoice.wilaya;
        document.getElementById('printClientBaladiya').textContent = newInvoice.baladiya;
        document.getElementById('printDeliveryType').textContent = newInvoice.delivery_type;
        const tbody = document.getElementById('printInvoiceItems');
        tbody.innerHTML = `
            <tr>
                <td>${newInvoice.product_name}</td>
                <td>${newInvoice.color}</td>
                <td>${newInvoice.size}</td>
                <td>${Number(newInvoice.total_price).toLocaleString('ar-DZ')} د.ج</td>
            </tr>
        `;
        document.getElementById('printTotalAmount').textContent = Number(newInvoice.total_price).toLocaleString('ar-DZ') + ' د.ج';

        // Reload data from DB
        await loadDashboardData();
        
        // Open Print dialogue
        await triggerPrint('receipt');

    } catch (err) {
        console.error('Error confirming order:', err);
        alert('حدث خطأ أثناء تأكيد الطلب.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Action: Cancel Order (Restores Stock quantity)
async function cancelOrder(order) {
    const confirmed = confirm(`هل أنت متأكد من إلغاء طلب الزبون: ${order.client_name}؟ (ستتم استعادة كمية المخزون)`);
    if (!confirmed) {
        return;
    }

    try {
        adminLoader.style.display = 'flex';

        // 1. Get current stock quantity
        if (order.product_id) {
            const { data: stockItem, error: fetchErr } = await supabaseClient
                .from('stock')
                .select('id, quantity')
                .eq('product_id', order.product_id)
                .eq('size', order.size)
                .eq('color', order.color)
                .single();

            if (!fetchErr && stockItem) {
                // Restore stock
                await supabaseClient
                    .from('stock')
                    .update({ quantity: stockItem.quantity + 1 })
                    .eq('id', stockItem.id);
            }
        }

        // 2. Cancel order
        const { error: cancelErr } = await supabaseClient
            .from('orders')
            .update({ status: 'ملغي' })
            .eq('id', order.id);

        if (cancelErr) throw cancelErr;

        await loadDashboardData();
    } catch (err) {
        console.error('Error cancelling order:', err);
        alert('حدث خطأ أثناء إلغاء الطلب.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// TAB 2: HISTORY (INVOICES)
function renderHistoryTable(filteredInvoices = null) {
    historyTableBody.innerHTML = '';
    const invoices = filteredInvoices || invoicesList;

    if (invoices.length === 0) {
        emptyHistoryState.style.display = 'flex';
        return;
    }
    emptyHistoryState.style.display = 'none';

    // Group invoices by invoice_number
    const groupedMap = new Map();
    invoices.forEach(inv => {
        const num = inv.invoice_number;
        if (!groupedMap.has(num)) {
            groupedMap.set(num, []);
        }
        groupedMap.get(num).push(inv);
    });

    groupedMap.forEach((items, num) => {
        const first = items[0];
        const tr = document.createElement('tr');
        const formattedDate = new Date(first.printed_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        });

        // Combine product names and sizes/colors
        const productNamesHtml = items.map(item => `<strong>${item.product_name}</strong>`).join('<br>');
        const sizeColorsHtml = items.map(item => `${item.color} / <span style="font-family: var(--font-serif);">${item.size}</span>`).join('<br>');
        const totalInvoicePrice = items.reduce((sum, item) => sum + Number(item.total_price), 0);

        tr.innerHTML = `
            <td style="font-family: var(--font-serif); font-weight: bold;">#${num}</td>
            <td>${formattedDate}</td>
            <td>
                <strong>${first.client_name}</strong><br>
                <small style="color: var(--text-muted);">${first.phone}</small>
            </td>
            <td>${productNamesHtml}</td>
            <td>${sizeColorsHtml}</td>
            <td>${first.wilaya.split('. ')[1] || first.wilaya}</td>
            <td>${first.delivery_type}</td>
            <td style="font-family: var(--font-serif); font-weight: bold; color: var(--success-color);">${Number(totalInvoicePrice).toLocaleString('ar-DZ')} د.ج</td>
            <td>
                <button class="btn btn-sm btn-print reprint-btn" data-id="${first.id}"><i class="fa-solid fa-print"></i> إعادة طبع</button>
            </td>
        `;

        tr.querySelector('.reprint-btn').addEventListener('click', () => reprintInvoice(first));
        historyTableBody.appendChild(tr);
    });
}

async function reprintInvoice(inv) {
    const invoiceItems = invoicesList.filter(item => item.invoice_number === inv.invoice_number);
    if (invoiceItems.length === 0) return;

    const firstItem = invoiceItems[0];
    
    // Check if there is an associated debt record with this invoice number to show paid/remaining in reprint
    const associatedDebt = debtsList.find(d => d.invoice_number === firstItem.invoice_number);
    
    const items = invoiceItems.map(item => ({
        product_name: item.product_name,
        color: item.color,
        size: item.size,
        total_price: item.total_price
    }));

    if (associatedDebt) {
        setupInvoicePrintView(
            firstItem.invoice_number,
            firstItem.printed_at,
            firstItem.client_name,
            firstItem.phone,
            firstItem.wilaya,
            firstItem.baladiya,
            firstItem.delivery_type,
            items,
            associatedDebt.paid_amount,
            associatedDebt.total_amount - associatedDebt.paid_amount
        );
    } else {
        setupInvoicePrintView(
            firstItem.invoice_number,
            firstItem.printed_at,
            firstItem.client_name,
            firstItem.phone,
            firstItem.wilaya,
            firstItem.baladiya,
            firstItem.delivery_type,
            items
        );
    }
    await triggerPrint('receipt');
}

function setupInvoicePrintView(invoiceNum, printedAt, clientName, phone, wilaya, baladiya, deliveryType, items, paidAmount = null, remainingAmount = null) {
    const printContainer = document.getElementById('printInvoiceContainer');
    printContainer.innerHTML = ''; // clear

    const createInvoiceBoxHTML = (copyTitle) => {
        let totalHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px;">
                <span>المجموع الإجمالي:</span>
                <span>${Number(items.reduce((sum, item) => sum + Number(item.total_price), 0)).toLocaleString('ar-DZ')} د.ج</span>
            </div>
        `;

        if (paidAmount !== null && remainingAmount !== null) {
            totalHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 8px;">
                    <span>المجموع الإجمالي:</span>
                    <span>${Number(items.reduce((sum, item) => sum + Number(item.total_price), 0)).toLocaleString('ar-DZ')} د.ج</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; color: var(--success-color); margin-top: 4px;">
                    <span>المبلغ المدفوع (عربون):</span>
                    <span>${Number(paidAmount).toLocaleString('ar-DZ')} د.ج</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: var(--danger-color); margin-top: 4px; border-top: 1px solid #ddd; padding-top: 4px;">
                    <span>الدين المتبقي:</span>
                    <span>${Number(remainingAmount).toLocaleString('ar-DZ')} د.ج</span>
                </div>
            `;
        }

        const itemsRows = items.map(item => `
            <tr>
                <td style="padding: 4px 0;">${item.product_name}</td>
                <td style="padding: 4px 0;">${item.color}</td>
                <td style="padding: 4px 0;">${item.size}</td>
                <td style="padding: 4px 0;">${Number(item.total_price).toLocaleString('ar-DZ')} د.ج</td>
            </tr>
        `).join('');

        return `
            <div class="invoice-box" style="margin-bottom: 5px; text-align: right; direction: rtl; font-family: 'Cairo', sans-serif;">
                <div class="invoice-header" style="text-align: center;">
                    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 2px;">Asel Butik</h2>
                    <p style="font-size: 11px; color: #666; margin-bottom: 5px;">للأزياء النسائية الفاخرة</p>
                    ${copyTitle ? `<div style="text-align: center; margin-bottom: 8px; font-weight: bold; font-size: 11px; background: #f1f2f6; padding: 4px 10px; border-radius: 4px; display: inline-block;">${copyTitle}</div>` : ''}
                    <div class="invoice-meta" style="font-size: 12px; margin-top: 5px; display: flex; flex-direction: column; gap: 3px;">
                        <div><strong>رقم الوصل:</strong> <span>${invoiceNum}</span></div>
                        <div><strong>التاريخ:</strong> <span>${new Date(printedAt).toLocaleDateString('ar-DZ', {
                            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
                        })}</span></div>
                    </div>
                </div>
                
                <div class="invoice-divider" style="border-top: 1px solid #ddd; margin: 8px 0;"></div>
                
                <div class="invoice-client-info" style="font-size: 12px; line-height: 1.6; text-align: right;">
                    <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 5px;">معلومات الزبون</h3>
                    <div><strong>الاسم واللقب:</strong> <span>${clientName || '-'}</span></div>
                    <div><strong>رقم الهاتف:</strong> <span>${phone || '-'}</span></div>
                    ${(wilaya && wilaya !== 'المحل' && wilaya !== '-') ? `<div><strong>الولاية:</strong> <span>${wilaya}</span></div>` : ''}
                    ${(baladiya && baladiya !== 'المحل' && baladiya !== '-') ? `<div><strong>البلدية:</strong> <span>${baladiya}</span></div>` : ''}
                    ${(deliveryType && deliveryType !== 'استلام من المحل' && deliveryType !== '-') ? `<div><strong>نوع التوصيل:</strong> <span>${deliveryType}</span></div>` : ''}
                </div>

                <div class="invoice-divider" style="border-top: 1px solid #ddd; margin: 8px 0;"></div>

                <table class="invoice-table" style="width: 100%; font-size: 11px; text-align: right; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid #ddd; font-weight: bold;">
                            <th style="padding: 4px 0; text-align: right;">المنتج</th>
                            <th style="padding: 4px 0; text-align: right;">اللون</th>
                            <th style="padding: 4px 0; text-align: right;">المقاس</th>
                            <th style="padding: 4px 0; text-align: right;">المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="invoice-divider" style="border-top: 1px solid #ddd; margin: 8px 0;"></div>

                ${totalHTML}

                <div class="invoice-divider" style="border-top: 1px solid #ddd; margin: 8px 0;"></div>

                <div class="invoice-footer" style="text-align: center; font-size: 11px; line-height: 1.4; color: #555;">
                    <div style="margin: 10px auto; padding: 6px 8px; border: 1px dashed #777; border-radius: 4px; background-color: #fcfcfc; color: #111; font-size: 10.5px; line-height: 1.5; text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 2px;">تنبيه:</div>
                        <div>السلع المباعة تُستبدل ولا تُرد خلال مدة أقصاها 48 ساعة من تاريخ الشراء، مع إحضار فاتورة الشراء.</div>
                    </div>
                    <p style="margin: 4px 0;">شكراً لثقتكم بـ Asel Butik!</p>
                    <p style="margin: 4px 0;">لأي استفسار يرجى الاتصال بنا على: ${websiteSettings && websiteSettings.phone_number ? websiteSettings.phone_number : '0555123456'}</p>
                </div>
            </div>
        `;
    };

    const hideInfo = (clientName === 'زبون حضوري' && (!phone || phone === '-' || phone === ''));
    if (paidAmount !== null && remainingAmount !== null) {
        const customerCopy = createInvoiceBoxHTML('نسخة الزبون (Customer Copy)');
        const shopCopy = createInvoiceBoxHTML('نسخة المحل (Shop Copy)');
        const divider = `
            <div class="print-cut-line" style="border-top: 1px dashed #666; margin: 8px 0; text-align: center; font-size: 10px; color: #666; width: 100%;">
                ✂------------------ نسخة المحل / نسخة الزبون ------------------✂
            </div>
        `;
        printContainer.innerHTML = customerCopy + divider + shopCopy;
        if (hideInfo) {
            printContainer.classList.add('hide-client-info');
        } else {
            printContainer.classList.remove('hide-client-info');
        }
    } else {
        printContainer.innerHTML = createInvoiceBoxHTML('');
        if (hideInfo) {
            printContainer.classList.add('hide-client-info');
        } else {
            printContainer.classList.remove('hide-client-info');
        }
    }
}

function filterHistory() {
    const searchVal = historySearchInput.value.toLowerCase().trim();
    if (!searchVal) {
        renderHistoryTable();
        return;
    }

    const filtered = invoicesList.filter(inv => 
        inv.client_name.toLowerCase().includes(searchVal) ||
        inv.phone.includes(searchVal) ||
        inv.invoice_number.toString().includes(searchVal)
    );

    renderHistoryTable(filtered);
}

// TAB 3: STOCK (PRODUCTS GRID)
function renderStockGrid() {
    adminProductsGrid.innerHTML = '';
    
    if (productsList.length === 0) {
        adminProductsGrid.innerHTML = `<p class="no-products">لا توجد منتجات متوفرة. الرجاء إضافة منتج جديد.</p>`;
        return;
    }

    const query = document.getElementById('stockSearchInput')?.value.toLowerCase().trim() || '';
    const filteredProducts = productsList.filter(product => {
        if (!query) return true;
        const nameMatch = product.name?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const supplierMatch = product.supplier_name?.toLowerCase().includes(query);
        const barcodeMatch = product.barcode?.toLowerCase().includes(query);
        return nameMatch || descMatch || supplierMatch || barcodeMatch;
    });

    if (filteredProducts.length === 0) {
        adminProductsGrid.innerHTML = `<p class="no-products">لا توجد منتجات مطابقة للبحث "${query}".</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'stock-product-card';

        const img = formatImageUrl(product.images[0]);
        const price = Number(product.price).toLocaleString('ar-DZ') + ' د.ج';
        
        // Find stock levels
        const pStock = stockList.filter(s => s.product_id === product.id);

        let stockRowsHtml = '';
        if (pStock.length === 0) {
            stockRowsHtml = '<p style="color: var(--danger-color); font-size:12px; padding: 10px;">لا يوجد مخزون مسجل!</p>';
        } else {
            pStock.forEach(stockItem => {
                let qtyClass = 'qty-good';
                if (stockItem.quantity === 0) qtyClass = 'qty-out';
                else if (stockItem.quantity <= 3) qtyClass = 'qty-low';

                stockRowsHtml += `
                    <div class="stock-level-row">
                        <span>اللون: ${stockItem.color} | المقاس: ${stockItem.size}</span>
                        <span class="stock-qty ${qtyClass}">${stockItem.quantity} قطع</span>
                    </div>
                `;
            });
        }

        const isActive = product.is_active !== false;
        const purchasePriceStr = product.purchase_price ? Number(product.purchase_price).toLocaleString('ar-DZ') + ' د.ج' : 'غير محدد';
        const supplierInfo = product.supplier_name 
            ? `<p class="stock-product-supplier" style="font-size: 13px; color: var(--text-muted); margin-top: 5px; font-weight: normal;">
                <i class="fa-solid fa-truck"></i> المورد: <strong>${product.supplier_name}</strong> ${product.supplier_phone ? `(${product.supplier_phone})` : ''}
               </p>`
            : '';

        card.innerHTML = `
            <div class="stock-product-info">
                <div class="stock-product-header">
                    <img class="stock-product-image" src="${img}" alt="${product.name}">
                    <div class="stock-product-meta">
                        <h3>${product.name}</h3>
                        <p style="margin-bottom: 2px;">سعر البيع: <span style="color: var(--accent-gold); font-weight: 700;">${price}</span></p>
                        <p style="font-size: 13px; color: var(--text-muted); font-weight: normal; margin-bottom: 5px;">سعر الشراء: <strong>${purchasePriceStr}</strong></p>
                        ${product.barcode ? `
                            <p style="font-size: 13px; color: var(--accent-gold); font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                                <span><i class="fa-solid fa-barcode"></i> الباركود: <span>${product.barcode}</span></span>
                                <button class="btn btn-sm btn-outline print-barcode-btn" data-id="${product.id}" title="طباعة ملصق الباركود" style="padding: 2px 6px; font-size: 11px; font-weight: 600; border-color: var(--accent-gold); color: var(--accent-gold); border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; background: transparent; cursor: pointer;">
                                    <i class="fa-solid fa-print"></i> طباعة الملصق
                                </button>
                            </p>
                        ` : ''}
                        ${supplierInfo}
                    </div>
                    <button class="btn btn-sm ${isActive ? 'btn-success' : 'btn-secondary'} toggle-active-btn" data-id="${product.id}" 
                        style="${!isActive ? 'background-color: #7f8c8d; color: white;' : ''} ${isCashierUser ? 'cursor: not-allowed; opacity: 0.8;' : ''}"
                        ${isCashierUser ? 'disabled' : ''}>
                        <i class="fa-solid ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i> 
                        ${isActive ? 'نشط' : 'معطل'}
                    </button>
                </div>
            </div>
            <div class="stock-levels-list">
                <div class="stock-levels-title">تفاصيل المخزون:</div>
                ${stockRowsHtml}
            </div>
            <div class="stock-card-footer">
                <button class="btn btn-sm btn-outline edit-prod-btn" data-id="${product.id}"><i class="fa-solid fa-pen-to-square"></i> تعديل</button>
                ${isCashierUser ? '' : `<button class="btn btn-sm btn-danger delete-prod-btn" data-id="${product.id}"><i class="fa-solid fa-trash"></i> حذف</button>`}
            </div>
        `;

        if (!isCashierUser) {
            card.querySelector('.toggle-active-btn').addEventListener('click', () => toggleProductActive(product.id, isActive));
            const deleteBtn = card.querySelector('.delete-prod-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteProduct(product));
            }
        }
        card.querySelector('.edit-prod-btn').addEventListener('click', () => openEditProductModal(product));

        const printBtn = card.querySelector('.print-barcode-btn');
        if (printBtn) {
            printBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                printProductBarcodeLabel(product);
            });
        }
        
        adminProductsGrid.appendChild(card);
    });
}

// Populate Supplier Dropdown inside Product Modal
function populateSupplierDropdown() {
    const select = document.getElementById('prodSupplierName');
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">-- اختر مورد من القائمة --</option>';
    suppliersList.forEach(sup => {
        const opt = document.createElement('option');
        opt.value = sup.name;
        opt.textContent = sup.name;
        select.appendChild(opt);
    });
    
    select.value = currentVal;
}

// Compress image before storing in offline queue
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const max_size = 800; // max size limit
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to 70% quality JPEG
            };
            img.onerror = (err) => reject(err);
            img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

// Convert a base64 DataURL back to a File object for Supabase upload
function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Helper to queue an offline action in localStorage
function queueOfflineAction(type, payload) {
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('asel_offline_actions_queue') || '[]');
    } catch (e) {}
    queue.push({
        id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: type,
        payload: payload,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('asel_offline_actions_queue', JSON.stringify(queue));
}

// Generate a unique 12-digit barcode starting with 2026
function generateUniqueBarcode() {
    let code;
    let attempts = 0;
    do {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
        code = '2026' + randomDigits;
        attempts++;
    } while (productsList.some(p => p.barcode === code) && attempts < 100);
    return code;
}

// Print product barcode label
async function printProductBarcodeLabel(product) {
    const priceFormatted = Number(product.price).toLocaleString('ar-DZ') + ' د.ج';
    
    const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>ملصق الباركود - ${product.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
                body {
                    margin: 0;
                    padding: 10px;
                    font-family: 'Cairo', sans-serif;
                    text-align: center;
                    background: white;
                    color: black;
                }
                .label-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-width: 320px;
                    margin: 0 auto;
                }
                .brand-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #d4af37; /* gold */
                    margin-bottom: 2px;
                }
                .product-name {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 2px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
                .price {
                    font-size: 14px;
                    font-weight: 700;
                    margin: 2px 0 6px 0;
                }
                #barcode {
                    width: 100%;
                    max-height: 70px;
                }
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        padding: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                <div class="brand-title">Asel Butik</div>
                <div class="product-name">${product.name}</div>
                <div class="price">السعر: ${priceFormatted}</div>
                <svg id="barcode"></svg>
            </div>
            <script>
                try {
                    JsBarcode("#barcode", "${product.barcode}", {
                        format: "CODE128",
                        lineColor: "#000",
                        width: 2,
                        height: 50,
                        displayValue: true,
                        font: "Cairo",
                        fontSize: 14,
                        textMargin: 4
                    });
                } catch(e) {
                    console.error("JsBarcode generation failed:", e);
                }
                
                // If not in electron, trigger browser print
                if (!window.electronAPI) {
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 500);
                    };
                }
            </script>
        </body>
        </html>
    `;

    if (window.electronAPI && window.electronAPI.printSilent) {
        // Desktop App Mode
        const deviceName = localStorage.getItem('barcodePrinterName') || '';
        try {
            const result = await window.electronAPI.printSilent({ deviceName, html: htmlContent });
            if (!result.success) {
                console.error("Silent barcode print failed:", result.error);
                alert("فشلت الطباعة الصامتة: " + result.error);
            }
        } catch (err) {
            console.error("IPC Error:", err);
            alert("خطأ في الاتصال بنظام الطباعة.");
        }
    } else {
        // Web Browser Mode
        const printWindow = window.open('', '_blank', 'width=500,height=400');
        if (!printWindow) {
            alert('يرجى السماح بالنوافذ المنبثقة (Popups) لطباعة ملصق الباركود.');
            return;
        }
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }
}

// Setup Product add/edit modal form
function setupProductFormModal() {
    openAddProductModalBtn.addEventListener('click', () => {
        // Clear form for addition
        document.getElementById('formProductId').value = '';
        productForm.reset();
        populateSupplierDropdown();
        document.getElementById('prodSupplierName').value = '';
        document.getElementById('prodSupplierPhone').value = '';
        document.getElementById('prodImagesFile').value = '';
        document.getElementById('existingImagesContainer').innerHTML = '';
        document.getElementById('prodExistingImages').value = '';
        document.getElementById('prodBarcode').value = '';
        document.getElementById('adminBarcodeSection').style.display = 'none';
        document.getElementById('adminBarcodeDisplay').textContent = '---';
        document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
        addedStockVariants = [];
        // Reset checklist
        document.getElementById('creatorColor').value = '';
        document.querySelectorAll('.size-selector-checkbox').forEach(cb => {
            cb.checked = false;
            const card = cb.closest('.size-option-card');
            const qtyInput = card.querySelector('.size-qty-input');
            qtyInput.style.display = 'none';
            qtyInput.value = '';
            card.style.borderColor = 'var(--border-color)';
            card.style.backgroundColor = 'white';
        });
        renderAddedStockTable();
        addProductModal.classList.add('active');
    });

    closeProductFormModalBtn.addEventListener('click', () => {
        addProductModal.classList.remove('active');
    });

    // Auto populate phone when supplier is selected
    document.getElementById('prodSupplierName').addEventListener('change', (e) => {
        const selectedName = e.target.value;
        const phoneInput = document.getElementById('prodSupplierPhone');
        if (!selectedName) {
            phoneInput.value = '';
            return;
        }
        const supplier = suppliersList.find(s => s.name === selectedName);
        phoneInput.value = supplier ? supplier.phone : '';
    });

    // Set up size selector checkbox behavior
    document.querySelectorAll('.size-selector-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const card = e.target.closest('.size-option-card');
            const qtyInput = card.querySelector('.size-qty-input');
            if (e.target.checked) {
                qtyInput.style.display = 'block';
                qtyInput.focus();
                card.style.borderColor = 'var(--accent-gold)';
                card.style.backgroundColor = 'rgba(212, 175, 55, 0.03)';
            } else {
                qtyInput.style.display = 'none';
                qtyInput.value = '';
                card.style.borderColor = 'var(--border-color)';
                card.style.backgroundColor = 'white';
            }
        });
    });

    // Handle adding stock variant rows in the modal form
    addStockRowBtn.addEventListener('click', () => {
        const colorInput = document.getElementById('creatorColor');
        const color = colorInput.value.trim();

        if (!color) {
            alert('يرجى كتابة لون أولاً (مثال: ذهبي، أسود).');
            return;
        }

        const checkedBoxes = document.querySelectorAll('.size-selector-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert('يرجى اختيار مقاس واحد على الأقل وتحديد كميته.');
            return;
        }

        let hasError = false;
        const tempVariants = [];

        checkedBoxes.forEach(cb => {
            const card = cb.closest('.size-option-card');
            const qtyInput = card.querySelector('.size-qty-input');
            const qty = parseInt(qtyInput.value);

            if (isNaN(qty) || qty < 0) {
                alert(`يرجى إدخال كمية صحيحة للمقاس ${cb.value}.`);
                hasError = true;
                return;
            }

            tempVariants.push({ size: cb.value, quantity: qty });
        });

        if (hasError) return;

        // Apply variants
        tempVariants.forEach(item => {
            const existingIdx = addedStockVariants.findIndex(v => v.color === color && v.size === item.size);
            if (existingIdx > -1) {
                addedStockVariants[existingIdx].quantity = item.quantity;
            } else {
                addedStockVariants.push({ color, size: item.size, quantity: item.quantity });
            }
        });

        // Reset checklist
        colorInput.value = '';
        document.querySelectorAll('.size-selector-checkbox').forEach(cb => {
            cb.checked = false;
            const card = cb.closest('.size-option-card');
            const qtyInput = card.querySelector('.size-qty-input');
            qtyInput.style.display = 'none';
            qtyInput.value = '';
            card.style.borderColor = 'var(--border-color)';
            card.style.backgroundColor = 'white';
        });

        renderAddedStockTable();
    });

    // Form Submit
    productForm.addEventListener('submit', handleProductFormSubmit);

    // Admin barcode regeneration handler
    document.getElementById('regenerateBarcodeBtn').addEventListener('click', () => {
        if (isCashierUser) return;
        const newBarcode = generateUniqueBarcode();
        document.getElementById('prodBarcode').value = newBarcode;
        document.getElementById('adminBarcodeDisplay').textContent = newBarcode;
    });
}

// Render stock variants table inside product modal
function renderAddedStockTable() {
    addedStockTableBody.innerHTML = '';
    
    if (addedStockVariants.length === 0) {
        addedStockTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">لا توجد خيارات مخزون مضافة بعد.</td></tr>';
        return;
    }

    addedStockVariants.forEach((variant, idx) => {
        const tr = document.createElement('tr');
        const key = `${variant.color.trim()}_${variant.size.trim()}`;
        const originalQty = originalStockQuantities[key] !== undefined ? originalStockQuantities[key] : 0;
        
        const minQty = isCashierUser ? originalQty : 0;
        const removeBtnHtml = isCashierUser 
            ? `<button type="button" class="btn-sm btn-secondary" disabled style="opacity: 0.5; cursor: not-allowed;"><i class="fa-solid fa-times"></i></button>`
            : `<button type="button" class="btn-sm btn-danger remove-var-btn" data-idx="${idx}"><i class="fa-solid fa-times"></i></button>`;

        tr.innerHTML = `
            <td>${variant.color}</td>
            <td>${variant.size}</td>
            <td><input type="number" class="qty-edit-input" value="${variant.quantity}" min="${minQty}" style="width: 70px; padding: 4px; border: 1px solid #ddd; border-radius: 4px; text-align: center; font-weight: bold;"></td>
            <td>${removeBtnHtml}</td>
        `;
        
        tr.querySelector('.qty-edit-input').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            let newQty = (isNaN(val) || val < 0) ? 0 : val;
            if (isCashierUser && newQty < originalQty) {
                alert(`لا يمكنك تقليل كمية المخزون الحالي. الحد الأدنى المسموح به لهذا الخيار هو ${originalQty}. يمكنك فقط زيادة الكمية.`);
                newQty = originalQty;
                e.target.value = originalQty;
            }
            addedStockVariants[idx].quantity = newQty;
        });

        if (!isCashierUser) {
            tr.querySelector('.remove-var-btn').addEventListener('click', () => {
                addedStockVariants.splice(idx, 1);
                renderAddedStockTable();
            });
        }
        addedStockTableBody.appendChild(tr);
    });
}

// Open modal in EDIT mode
function openEditProductModal(product) {
    document.getElementById('formProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodPurchasePrice').value = product.purchase_price || '';
    
    populateSupplierDropdown();
    document.getElementById('prodSupplierName').value = product.supplier_name || '';
    document.getElementById('prodSupplierPhone').value = product.supplier_phone || '';
    document.getElementById('prodImagesFile').value = '';
    document.getElementById('prodBarcode').value = product.barcode || '';
    
    originalProductBarcode = product.barcode || null;
    const barcodeSec = document.getElementById('adminBarcodeSection');
    const barcodeDisp = document.getElementById('adminBarcodeDisplay');
    if (isCashierUser) {
        barcodeSec.style.display = 'none';
    } else {
        barcodeSec.style.display = 'block';
        barcodeDisp.textContent = product.barcode || 'غير متوفر';
    }
    
    // Toggle input field read-only/disabled states for cashiers
    const inputsToToggle = ['prodName', 'prodDesc', 'prodPrice', 'prodPurchasePrice', 'prodSupplierName', 'prodSupplierPhone', 'prodImagesFile', 'prodBarcode'];
    inputsToToggle.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isCashierUser) {
                if (el.tagName === 'SELECT') {
                    el.disabled = true;
                } else {
                    el.readOnly = true;
                    el.disabled = true;
                }
                el.style.backgroundColor = '#f1f2f6';
                el.style.cursor = 'not-allowed';
            } else {
                if (el.tagName === 'SELECT') {
                    el.disabled = false;
                } else {
                    el.readOnly = false;
                    el.disabled = false;
                }
                el.style.backgroundColor = '';
                el.style.cursor = '';
            }
        }
    });

    // Setup existing images
    const existingImages = product.images || [];
    document.getElementById('prodExistingImages').value = JSON.stringify(existingImages);
    
    const container = document.getElementById('existingImagesContainer');
    container.innerHTML = '';
    existingImages.forEach((imgUrl, idx) => {
        const div = document.createElement('div');
        div.style = "position: relative; width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;";
        
        const deleteImageBtn = isCashierUser 
            ? '' 
            : `<button type="button" class="btn-danger" style="position: absolute; top: 2px; right: 2px; padding: 2px 5px; font-size: 10px; cursor: pointer; border-radius: 2px;" onclick="removeExistingImage(${idx})">X</button>`;

        div.innerHTML = `
            <img src="${formatImageUrl(imgUrl)}" style="width: 100%; height: 100%; object-fit: cover;">
            ${deleteImageBtn}
        `;
        container.appendChild(div);
    });
    
    document.getElementById('productModalTitle').textContent = isCashierUser ? 'تحديث المخزن (زيادة الكميات)' : 'تعديل المنتج ومخزونه';
    
    // Load variants & cache original quantities
    const pStock = stockList.filter(s => s.product_id === product.id);
    originalStockQuantities = {};
    pStock.forEach(s => {
        const key = `${s.color.trim()}_${s.size.trim()}`;
        originalStockQuantities[key] = s.quantity;
    });

    addedStockVariants = pStock.map(s => ({ color: s.color, size: s.size, quantity: s.quantity }));
    // Reset checklist
    document.getElementById('creatorColor').value = '';
    document.querySelectorAll('.size-selector-checkbox').forEach(cb => {
        cb.checked = false;
        const card = cb.closest('.size-option-card');
        const qtyInput = card.querySelector('.size-qty-input');
        qtyInput.style.display = 'none';
        qtyInput.value = '';
        card.style.borderColor = 'var(--border-color)';
        card.style.backgroundColor = 'white';
    });
    renderAddedStockTable();

    addProductModal.classList.add('active');
}

// Global function to remove an existing image
window.removeExistingImage = function(index) {
    if (isCashierUser) return;
    const existingStr = document.getElementById('prodExistingImages').value;
    if (existingStr) {
        let existingImages = JSON.parse(existingStr);
        existingImages.splice(index, 1);
        document.getElementById('prodExistingImages').value = JSON.stringify(existingImages);
        
        // Re-render
        const container = document.getElementById('existingImagesContainer');
        container.innerHTML = '';
        existingImages.forEach((imgUrl, idx) => {
            const div = document.createElement('div');
            div.style = "position: relative; width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;";
            div.innerHTML = `
                <img src="${formatImageUrl(imgUrl)}" style="width: 100%; height: 100%; object-fit: cover;">
                <button type="button" class="btn-danger" style="position: absolute; top: 2px; right: 2px; padding: 2px 5px; font-size: 10px; cursor: pointer; border-radius: 2px;" onclick="removeExistingImage(${idx})">X</button>
            `;
            container.appendChild(div);
        });
    }
}

// Handle Add/Edit Product Submission to Supabase
async function handleProductFormSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('formProductId').value;
    const name = document.getElementById('prodName').value.trim();
    const description = document.getElementById('prodDesc').value.trim();
    const priceRaw = document.getElementById('prodPrice').value;
    const price = parseFloat(priceRaw);
    const purchasePriceRaw = document.getElementById('prodPurchasePrice').value;
    const purchasePrice = parseFloat(purchasePriceRaw);
    const supplierName = document.getElementById('prodSupplierName').value.trim();
    const supplierPhone = document.getElementById('prodSupplierPhone').value.trim();
    let barcode = document.getElementById('prodBarcode').value.trim() || null;
    if (!productId) {
        barcode = generateUniqueBarcode();
    }
    
    if (!name) {
        alert('الرجاء إدخال اسم المنتج.');
        return;
    }
    if (!priceRaw || isNaN(price)) {
        alert('الرجاء إدخال سعر البيع للزبون بشكل صحيح.');
        return;
    }
    if (!purchasePriceRaw || isNaN(purchasePrice)) {
        alert('الرجاء إدخال سعر الشراء / الجملة بشكل صحيح.');
        return;
    }

    if (addedStockVariants.length === 0) {
        alert('الرجاء إضافة خيار واحد على الأقل للمخزون (لون ومقاس).');
        return;
    }

    if (!navigator.onLine) {
        try {
            adminLoader.style.display = 'flex';
            addProductModal.classList.remove('active');

            // Handle images offline
            let finalImages = [];
            const existingStr = document.getElementById('prodExistingImages').value;
            if (existingStr) {
                finalImages = JSON.parse(existingStr);
            }

            const fileInput = document.getElementById('prodImagesFile');
            if (fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    const base64 = await compressImage(fileInput.files[i]);
                    finalImages.push(base64);
                }
            }

            if (finalImages.length === 0) {
                alert('الرجاء إضافة صورة واحدة على الأقل للمنتج.');
                adminLoader.style.display = 'none';
                addProductModal.classList.add('active');
                return;
            }

            const images = finalImages;
            let targetProductId = productId;
            const stockVariants = addedStockVariants.map(variant => ({
                size: variant.size,
                color: variant.color,
                quantity: variant.quantity
            }));

            if (productId) {
                // Edit Product Offline
                const prodIndex = productsList.findIndex(p => p.id === productId);
                if (prodIndex !== -1) {
                    productsList[prodIndex] = {
                        ...productsList[prodIndex],
                        name, description, price, purchase_price: purchasePrice, images,
                        supplier_name: supplierName, supplier_phone: supplierPhone, barcode
                    };
                }

                // Update stock list locally
                stockList = stockList.filter(s => s.product_id !== productId);
                const localStockInserts = stockVariants.map(v => ({
                    id: `temp_s_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    product_id: productId,
                    size: v.size,
                    color: v.color,
                    quantity: v.quantity
                }));
                stockList = [...stockList, ...localStockInserts];

                // Queue action
                if (productId.toString().startsWith('temp_')) {
                    let queue = [];
                    try {
                        queue = JSON.parse(localStorage.getItem('asel_offline_actions_queue') || '[]');
                    } catch (e) {}
                    const actIdx = queue.findIndex(act => act.type === 'CREATE_PRODUCT' && act.payload.temp_id === productId);
                    if (actIdx !== -1) {
                        queue[actIdx].payload = {
                            temp_id: productId, name, description, price, purchase_price: purchasePrice, images,
                            supplier_name: supplierName, supplier_phone: supplierPhone, barcode, stockVariants
                        };
                        localStorage.setItem('asel_offline_actions_queue', JSON.stringify(queue));
                    }
                } else {
                    queueOfflineAction('EDIT_PRODUCT', {
                        product_id: productId, name, description, price, purchase_price: purchasePrice, images,
                        supplier_name: supplierName, supplier_phone: supplierPhone, barcode, stockVariants
                    });
                }
            } else {
                // Add Product Offline
                targetProductId = 'temp_p_' + Date.now();
                
                productsList.unshift({
                    id: targetProductId,
                    name, description, price, purchase_price: purchasePrice, images,
                    supplier_name: supplierName, supplier_phone: supplierPhone, barcode,
                    is_active: true,
                    created_at: new Date().toISOString()
                });

                const localStockInserts = stockVariants.map(v => ({
                    id: `temp_s_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    product_id: targetProductId,
                    size: v.size,
                    color: v.color,
                    quantity: v.quantity
                }));
                stockList = [...stockList, ...localStockInserts];

                queueOfflineAction('CREATE_PRODUCT', {
                    temp_id: targetProductId, name, description, price, purchase_price: purchasePrice, images,
                    supplier_name: supplierName, supplier_phone: supplierPhone, barcode, stockVariants
                });
            }

            saveStateToLocalCache();
            if (currentTab === 'stock') renderStockGrid();

            alert('تم حفظ المنتج والمخزون محلياً (دون اتصال). سيتم حفظهم في السحابة فور عودة الإنترنت.');

            const barcodeChanged = (productId && barcode !== originalProductBarcode);
            if ((!productId || barcodeChanged) && barcode) {
                printProductBarcodeLabel({
                    name: name,
                    price: price,
                    barcode: barcode
                });
            }
        } catch (err) {
            console.error('Offline save product error:', err);
            alert('حدث خطأ أثناء حفظ المنتج محلياً.');
        } finally {
            adminLoader.style.display = 'none';
        }
        return;
    }

    try {
        adminLoader.style.display = 'flex';
        addProductModal.classList.remove('active');
        
        // Handle images
        let finalImages = [];
        const existingStr = document.getElementById('prodExistingImages').value;
        if (existingStr) {
            finalImages = JSON.parse(existingStr);
        }
        
        const fileInput = document.getElementById('prodImagesFile');
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabaseClient.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert('فشل رفع أحد الصور. يرجى التأكد من إنشاء Storage Bucket باسم "product-images" وإعطائه صلاحيات عامة (Public).');
                    throw uploadError;
                }

                const { data: publicUrlData } = supabaseClient.storage
                    .from('product-images')
                    .getPublicUrl(filePath);
                
                finalImages.push(publicUrlData.publicUrl);
            }
        }
        
        if (finalImages.length === 0) {
            alert('الرجاء إضافة صورة واحدة على الأقل للمنتج.');
            adminLoader.style.display = 'none';
            addProductModal.classList.add('active');
            return;
        }

        const images = finalImages;

        let targetProductId = productId;

        if (productId) {
            // EDIT Product
            const { error: pErr } = await supabaseClient
                .from('products')
                .update({ name, description, price, purchase_price: purchasePrice, images, supplier_name: supplierName, supplier_phone: supplierPhone, barcode })
                .eq('id', productId);
            if (pErr) throw pErr;

            // Clear old stock for this product to replace with new configurations
            await supabaseClient.from('stock').delete().eq('product_id', productId);
        } else {
            // ADD Product
            const { data: newProd, error: pErr } = await supabaseClient
                .from('products')
                .insert({ name, description, price, purchase_price: purchasePrice, images, supplier_name: supplierName, supplier_phone: supplierPhone, barcode })
                .select()
                .single();
            if (pErr) throw pErr;
            targetProductId = newProd.id;
        }

        // Insert new stock variants
        const stockInserts = addedStockVariants.map(variant => ({
            product_id: targetProductId,
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity
        }));

        const { error: sErr } = await supabaseClient
            .from('stock')
            .insert(stockInserts);
        if (sErr) throw sErr;

        await loadDashboardData();

        // Auto print/save barcode label if it was a new product OR the barcode was regenerated on edit
        const barcodeChanged = (productId && barcode !== originalProductBarcode);
        if ((!productId || barcodeChanged) && barcode) {
            printProductBarcodeLabel({
                name: name,
                price: price,
                barcode: barcode
            });
        }
    } catch (err) {
        console.error('Error saving product:', err);
        alert('حدث خطأ أثناء حفظ المنتج والمخزون.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Delete Product
async function deleteProduct(product) {
    const confirmed = await showConfirmModal(
        'حذف المنتج',
        `هل أنت متأكد من رغبتك في حذف المنتج: "${product.name}" بشكل نهائي؟ سيتم حذف المخزون المرتبط به كذلك.`,
        true
    );
    if (!confirmed) {
        return;
    }

    if (!navigator.onLine) {
        if (product.id.toString().startsWith('temp_')) {
            let queue = [];
            try {
                queue = JSON.parse(localStorage.getItem('asel_offline_actions_queue') || '[]');
            } catch (e) {}
            queue = queue.filter(act => !(act.type === 'CREATE_PRODUCT' && act.payload.temp_id === product.id));
            localStorage.setItem('asel_offline_actions_queue', JSON.stringify(queue));
        } else {
            queueOfflineAction('DELETE_PRODUCT', { product_id: product.id });
        }

        productsList = productsList.filter(p => p.id !== product.id);
        stockList = stockList.filter(s => s.product_id !== product.id);
        saveStateToLocalCache();
        if (currentTab === 'stock') renderStockGrid();
        alert('تم حذف المنتج محلياً (دون اتصال). سيتم حذفه من السحابة فور عودة الإنترنت.');
        return;
    }

    try {
        adminLoader.style.display = 'flex';

        const { error: err } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', product.id);

        if (err) throw err;

        await loadDashboardData();
    } catch (err) {
        console.error('Error deleting product:', err);
        alert('حدث خطأ أثناء حذف المنتج.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Toggle Product Active Status
async function toggleProductActive(productId, currentStatus) {
    try {
        const newStatus = !currentStatus;

        if (!navigator.onLine) {
            const product = productsList.find(p => p.id === productId);
            if (product) {
                product.is_active = newStatus;
            }
            saveStateToLocalCache();
            if (currentTab === 'stock') renderStockGrid();
            queueOfflineAction('TOGGLE_PRODUCT_STATUS', { product_id: productId, is_active: newStatus });
            return;
        }

        adminLoader.style.display = 'flex';

        const { error } = await supabaseClient
            .from('products')
            .update({ is_active: newStatus })
            .eq('id', productId);

        if (error) throw error;

        await loadDashboardData();
    } catch (err) {
        console.error('Error toggling product status:', err);
        alert('حدث خطأ أثناء تغيير حالة المنتج.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// TAB 4: ANALYTICS (CALCULATIONS & CHART.JS)
function renderAnalytics() {
    const dateFilterVal = document.getElementById('analyticsDateFilter')?.value || 'week';

    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (dateFilterVal === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterVal === 'yesterday') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterVal === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (dateFilterVal === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    }

    // Filter invoices list
    const filteredInvoices = invoicesList.filter(inv => {
        if (dateFilterVal === 'all') return true;
        const invDate = new Date(inv.printed_at);
        if (startDate && invDate < startDate) return false;
        if (endDate && invDate >= endDate) return false;
        return true;
    });

    // Filter expenses list
    const filteredExpenses = expensesList.filter(exp => {
        if (dateFilterVal === 'all') return true;
        const expDate = new Date(exp.created_at);
        if (startDate && expDate < startDate) return false;
        if (endDate && expDate >= endDate) return false;
        return true;
    });

    // 1. Calculations
    const totalEarnings = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total_price), 0);
    const completedCount = filteredInvoices.length;
    const totalStock = stockList.reduce((sum, item) => sum + item.quantity, 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Calculate cost of goods sold (COGS)
    const totalCostOfGoods = filteredInvoices.reduce((sum, inv) => {
        const product = productsList.find(p => p.name === inv.product_name);
        const cost = product && product.purchase_price ? Number(product.purchase_price) : Number(inv.total_price) * 0.6;
        return sum + cost;
    }, 0);

    // Calculate current stock cost value (invested capital)
    const currentStockCost = stockList.reduce((sum, item) => {
        const product = productsList.find(p => p.id === item.product_id);
        const cost = product && product.purchase_price ? Number(product.purchase_price) : 0;
        return sum + (cost * item.quantity);
    }, 0);

    // Calculate approximate net profit (subtracting COGS and expenses)
    const netProfit = totalEarnings - totalCostOfGoods - totalExpenses;

    // Calculate total spent on all goods purchased (sold + in stock)
    const totalPurchases = totalCostOfGoods + currentStockCost;

    // Calculate actual cash balance (Earnings - Total Purchases - Total Expenses)
    const cashBalance = totalEarnings - totalPurchases - totalExpenses;

    if (statTotalEarnings) {
        statTotalEarnings.textContent = totalEarnings.toLocaleString('ar-DZ') + ' د.ج';
    }

    const totalCostOfGoodsEl = document.getElementById('statTotalCostOfGoods');
    if (totalCostOfGoodsEl) {
        totalCostOfGoodsEl.textContent = totalCostOfGoods.toLocaleString('ar-DZ') + ' د.ج';
    }

    const netProfitEl = document.getElementById('statNetProfit');
    if (netProfitEl) {
        netProfitEl.textContent = netProfit.toLocaleString('ar-DZ') + ' د.ج';
    }

    const statExpensesEl = document.getElementById('statExpenses');
    if (statExpensesEl) {
        statExpensesEl.textContent = totalExpenses.toLocaleString('ar-DZ') + ' د.ج';
    }

    const currentStockCostEl = document.getElementById('statCurrentStockCost');
    if (currentStockCostEl) {
        currentStockCostEl.textContent = currentStockCost.toLocaleString('ar-DZ') + ' د.ج';
    }
    
    const totalPurchasesEl = document.getElementById('statTotalPurchases');
    if (totalPurchasesEl) {
        totalPurchasesEl.textContent = totalPurchases.toLocaleString('ar-DZ') + ' د.ج';
    }

    const cashBalanceEl = document.getElementById('statCashBalance');
    if (cashBalanceEl) {
        cashBalanceEl.textContent = cashBalance.toLocaleString('ar-DZ') + ' د.ج';
        if (cashBalance < 0) {
            cashBalanceEl.style.color = '#e74c3c';
        } else {
            cashBalanceEl.style.color = '#1abc9c';
        }
    }

    if (statCompletedOrders) {
        statCompletedOrders.textContent = completedCount;
    }
    if (statTotalStock) {
        statTotalStock.textContent = totalStock + ' قطعة';
    }

    // 2. Best selling products list
    const salesByProduct = {};
    filteredInvoices.forEach(inv => {
        salesByProduct[inv.product_name] = (salesByProduct[inv.product_name] || 0) + 1;
    });

    const sortedProducts = Object.entries(salesByProduct)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales);

    topSellingList.innerHTML = '';
    if (sortedProducts.length === 0) {
        topSellingList.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size:13px; padding: 15px;">لا توجد مبيعات مسجلة في هذه الفترة لعرض المنتجات الأكثر مبيعاً.</p>';
    } else {
        sortedProducts.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'top-selling-item';
            div.innerHTML = `
                <span class="top-selling-info">${idx + 1}. ${item.name}</span>
                <span class="top-selling-sales">${item.sales} قطع مباعة</span>
            `;
            topSellingList.appendChild(div);
        });
    }

    // 3. Render Sales Chart (Chart.js)
    let chartLabels = [];
    let chartDataValues = [];
    let chartLabel = 'المبيعات اليومية (د.ج)';

    if (dateFilterVal === 'today' || dateFilterVal === 'yesterday') {
        chartLabel = dateFilterVal === 'today' ? 'مبيعات اليوم حسب الساعات (د.ج)' : 'مبيعات أمس حسب الساعات (د.ج)';
        const salesByHour = {};
        for (let h = 8; h <= 22; h += 2) {
            const label = `${h.toString().padStart(2, '0')}:00`;
            salesByHour[label] = 0;
        }
        filteredInvoices.forEach(inv => {
            const date = new Date(inv.printed_at);
            const hour = date.getHours();
            let bucketHour = 8;
            if (hour >= 22) bucketHour = 22;
            else if (hour >= 20) bucketHour = 20;
            else if (hour >= 18) bucketHour = 18;
            else if (hour >= 16) bucketHour = 16;
            else if (hour >= 14) bucketHour = 14;
            else if (hour >= 12) bucketHour = 12;
            else if (hour >= 10) bucketHour = 10;

            const label = `${bucketHour.toString().padStart(2, '0')}:00`;
            salesByHour[label] += Number(inv.total_price);
        });
        chartLabels = Object.keys(salesByHour);
        chartDataValues = Object.values(salesByHour);
    } else if (dateFilterVal === 'week') {
        chartLabel = 'المبيعات اليومية لآخر 7 أيام (د.ج)';
        const salesByDate = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
            salesByDate[dateStr] = 0;
        }
        filteredInvoices.forEach(inv => {
            const dateStr = new Date(inv.printed_at).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
            if (salesByDate[dateStr] !== undefined) {
                salesByDate[dateStr] += Number(inv.total_price);
            }
        });
        chartLabels = Object.keys(salesByDate);
        chartDataValues = Object.values(salesByDate);
    } else if (dateFilterVal === 'month') {
        chartLabel = 'المبيعات اليومية لآخر 30 يوم (د.ج)';
        const salesByDate = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
            salesByDate[dateStr] = 0;
        }
        filteredInvoices.forEach(inv => {
            const dateStr = new Date(inv.printed_at).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
            if (salesByDate[dateStr] !== undefined) {
                salesByDate[dateStr] += Number(inv.total_price);
            }
        });
        chartLabels = Object.keys(salesByDate);
        chartDataValues = Object.values(salesByDate);
    } else if (dateFilterVal === 'all') {
        chartLabel = 'المبيعات الشهرية الإجمالية (د.ج)';
        const salesByMonth = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' });
            salesByMonth[monthStr] = 0;
        }
        filteredInvoices.forEach(inv => {
            const monthStr = new Date(inv.printed_at).toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' });
            salesByMonth[monthStr] = (salesByMonth[monthStr] || 0) + Number(inv.total_price);
        });
        chartLabels = Object.keys(salesByMonth);
        chartDataValues = Object.values(salesByMonth);
    }

    const salesChartTitleEl = document.getElementById('salesChartTitle');
    if (salesChartTitleEl) {
        salesChartTitleEl.textContent = chartLabel;
    }

    if (salesChart) salesChart.destroy();
    const ctx1 = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: chartLabel,
                data: chartDataValues,
                borderColor: '#c5a880',
                backgroundColor: 'rgba(197, 168, 128, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return value.toLocaleString('ar-DZ') + ' د.ج'; }
                    }
                }
            }
        }
    });

    // 4. Render Wilaya Distribution Chart (Chart.js)
    const salesByWilaya = {};
    filteredInvoices.forEach(inv => {
        const cleanName = inv.wilaya.split('. ')[1] || inv.wilaya;
        salesByWilaya[cleanName] = (salesByWilaya[cleanName] || 0) + 1;
    });

    const wilayaLabels = Object.keys(salesByWilaya);
    const wilayaValues = Object.values(salesByWilaya);

    if (wilayaChart) wilayaChart.destroy();
    const ctx2 = document.getElementById('wilayaChart').getContext('2d');
    
    const colors = ['#c5a880', '#2c3e50', '#a04000', '#27ae60', '#884ea0', '#e59866', '#a569bd', '#5dade2', '#f5b041', '#45b39d'];

    wilayaChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: wilayaLabels,
            datasets: [{
                data: wilayaValues,
                backgroundColor: colors.slice(0, wilayaLabels.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12 }
                }
            }
        }
    });
}

// Reset Demo Data inside Supabase
function setupDemoReset() {
    if (!resetDemoDataBtn) return;
    resetDemoDataBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal(
            'إعادة تهيئة البيانات',
            'تحذير: سيتم مسح جميع المنتجات والطلبات والموردين واستعادة البيانات التجريبية الافتراضية. هل تريد الاستمرار؟',
            true
        );
        if (!confirmed) {
            return;
        }

        try {
            adminLoader.style.display = 'flex';
            tabPanelsContainer.style.display = 'none';

            // Delete existing rows
            console.log('Clearing old records...');
            await supabaseClient.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabaseClient.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabaseClient.from('stock').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabaseClient.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabaseClient.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabaseClient.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Add new demo data
            console.log('Re-inserting default demo data...');
            
            // Insert Suppliers
            const demoSuppliers = [
                { name: 'ورشة القفطان الملكي تلمسان', phone: '0550112233' },
                { name: 'مورد الحرير الفاخر الجزائر', phone: '0661445566' },
                { name: 'مصنع العباءات التركية وهران', phone: '0770998877' },
                { name: 'مستورد الأطقم الفاخرة قسنطينة', phone: '0555334455' }
            ];
            
            for (const ds of demoSuppliers) {
                const { error: supErr } = await supabaseClient
                    .from('suppliers')
                    .insert(ds);
                if (supErr) throw supErr;
            }

            // Insert Products
            const demoProducts = [
                {
                    name: 'فستان القفطان الملكي الذهبي',
                    description: 'قفطان فاخر مصمم بأرقى خيوط الحرير والذهب، مطرز يدوياً بحرفية عالية ليمنحك إطلالة ملكية في المناسبات السعيدة.',
                    price: 18900,
                    purchase_price: 11000,
                    images: ['./images/kaftan_gold_1.png', './images/kaftan_gold_2.png'],
                    supplier_name: 'ورشة القفطان الملكي تلمسان',
                    supplier_phone: '0550112233'
                },
                {
                    name: 'فستان السهرة الحريري الأبيض',
                    description: 'فستان سهرة ناعم وأنيق مصنوع من قماش الحرير الطبيعي ذو اللمعة الساحرة، مثالي للأعراس والمناسبات الخاصة.',
                    price: 15500,
                    purchase_price: 9000,
                    images: ['./images/dress_white_1.png', './images/dress_white_2.png'],
                    supplier_name: 'مورد الحرير الفاخر الجزائر',
                    supplier_phone: '0661445566'
                },
                {
                    name: 'عباءة النخبة المخملية السوداء',
                    description: 'عباءة كلاسيكية فاخرة من المخمل الفاخر المزين بتطريزات ذهبية مميزة على الأكمام والحاشية، تجمع بين الاحتشام والأناقة.',
                    price: 11200,
                    purchase_price: 6500,
                    images: ['./images/abaya_black_1.png', './images/abaya_black_2.png'],
                    supplier_name: 'مصنع العباءات التركية وهران',
                    supplier_phone: '0770998877'
                },
                {
                    name: 'طقم فستان وسترة البيج الفاخر',
                    description: 'طقم مكون من قطعتين فستان ناعم مع سترة مطرزة بتفاصيل دقيقة وراقية باللون البيج والذهبي الخفيف.',
                    price: 13800,
                    purchase_price: 8000,
                    images: ['./images/dress_beige_1.png', './images/dress_beige_2.png'],
                    supplier_name: 'مستورد الأطقم الفاخرة قسنطينة',
                    supplier_phone: '0555334455'
                }
            ];

            const productMap = {};
            for (const dp of demoProducts) {
                const { data: newProd, error: pErr } = await supabaseClient
                    .from('products')
                    .insert(dp)
                    .select()
                    .single();
                
                if (pErr) throw pErr;
                productMap[newProd.name] = newProd.id;
            }

            // Insert stock
            const demoStock = [
                { name: 'فستان القفطان الملكي الذهبي', size: 'S', color: 'ذهبي', qty: 5 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'ذهبي', qty: 8 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'L', color: 'ذهبي', qty: 6 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'XL', color: 'ذهبي', qty: 3 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'XXL', color: 'ذهبي', qty: 2 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'بيج', qty: 4 },
                { name: 'فستان القفطان الملكي الذهبي', size: 'L', color: 'بيج', qty: 3 },

                { name: 'فستان السهرة الحريري الأبيض', size: 'S', color: 'أبيض', qty: 4 },
                { name: 'فستان السهرة الحريري الأبيض', size: 'M', color: 'أبيض', qty: 7 },
                { name: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'أبيض', qty: 5 },
                { name: 'فستان السهرة الحريري الأبيض', size: 'XL', color: 'أبيض', qty: 3 },
                { name: 'فستان السهرة الحريري الأبيض', size: 'M', color: 'ذهبي', qty: 3 },
                { name: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'ذهبي', qty: 2 },

                { name: 'عباءة النخبة المخملية السوداء', size: 'M', color: 'أسود', qty: 10 },
                { name: 'عباءة النخبة المخملية السوداء', size: 'L', color: 'أسود', qty: 12 },
                { name: 'عباءة النخبة المخملية السوداء', size: 'XL', color: 'أسود', qty: 8 },
                { name: 'عباءة النخبة المخملية السوداء', size: 'XXL', color: 'أسود', qty: 5 },

                { name: 'طقم فستان وسترة البيج الفاخر', size: 'S', color: 'بيج', qty: 3 },
                { name: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'بيج', qty: 6 },
                { name: 'طقم فستان وسترة البيج الفاخر', size: 'L', color: 'بيج', qty: 5 },
                { name: 'طقم فستان وسترة البيج الفاخر', size: 'XL', color: 'بيج', qty: 4 },
                { name: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'أبيض', qty: 3 }
            ];

            const stockInserts = demoStock.map(s => ({
                product_id: productMap[s.name],
                size: s.size,
                color: s.color,
                quantity: s.qty
            }));

            await supabaseClient.from('stock').insert(stockInserts);

            // Insert orders
            const demoOrders = [
                { name: 'فاطمة الزهراء', phone: '0661234567', wilaya: '16. الجزائر', baladiya: 'باب الوادي', delivery: 'توصيل للمنزل', prod: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'ذهبي', price: 18900, status: 'جديد' },
                { name: 'مريم بن يوسف', phone: '0555987654', wilaya: '31. وهران', baladiya: 'بير الجير', delivery: 'مكتب شركة التوصيل', prod: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'أبيض', price: 15500, status: 'جديد' },
                { name: 'أمينة رحماني', phone: '0772345678', wilaya: '25. قسنطينة', baladiya: 'الخروب', delivery: 'توصيل للمنزل', prod: 'عباءة النخبة المخملية السوداء', size: 'XL', color: 'أسود', price: 11200, status: 'مؤكد' },
                { name: 'سارة بوثلجة', phone: '0663456789', wilaya: '13. تلمسان', baladiya: 'المنصورة', delivery: 'توصيل للمنزل', prod: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'بيج', price: 13800, status: 'مؤكد' },
                { name: 'أسماء بلحاج', phone: '0550123456', wilaya: '09. البليدة', baladiya: 'أولاد يعيش', delivery: 'مكتب شركة التوصيل', prod: 'عباءة النخبة المخملية السوداء', size: 'M', color: 'أسود', price: 11200, status: 'ملغي' }
            ];

            for (const ord of demoOrders) {
                const { data: newOrder, error: oErr } = await supabaseClient
                    .from('orders')
                    .insert({
                        client_name: ord.name,
                        phone: ord.phone,
                        wilaya: ord.wilaya,
                        baladiya: ord.baladiya,
                        delivery_type: ord.delivery,
                        product_id: productMap[ord.prod],
                        product_name: ord.prod,
                        size: ord.size,
                        color: ord.color,
                        total_price: ord.price,
                        status: ord.status,
                        created_at: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
                    })
                    .select()
                    .single();

                if (oErr) throw oErr;

                // Create invoices for confirmed ones
                if (ord.status === 'مؤكد') {
                    await supabaseClient.from('invoices').insert({
                        order_id: newOrder.id,
                        client_name: ord.name,
                        phone: ord.phone,
                        wilaya: ord.wilaya,
                        baladiya: ord.baladiya,
                        delivery_type: ord.delivery,
                        product_name: ord.prod,
                        size: ord.size,
                        color: ord.color,
                        total_price: ord.price,
                        printed_at: newOrder.created_at
                    });
                }
            }

            alert('تم استعادة البيانات التجريبية بنجاح!');
            await loadDashboardData();

        } catch (err) {
            console.error('Error resetting demo:', err);
            alert('حدث خطأ أثناء استعادة البيانات.');
        } finally {
            adminLoader.style.display = 'none';
        }
    });
}

// Reusable Custom Confirmation Modal
function showConfirmModal(title, message, isDanger = true) {
    return new Promise((resolve) => {
        const confirmModal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmModalTitle');
        const messageEl = document.getElementById('confirmModalMessage');
        const yesBtn = document.getElementById('confirmModalYesBtn');
        const noBtn = document.getElementById('confirmModalNoBtn');
        const iconEl = confirmModal.querySelector('.confirm-icon i');

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (isDanger) {
            yesBtn.className = 'btn btn-danger';
            iconEl.className = 'fa-solid fa-triangle-exclamation';
            iconEl.parentElement.style.color = 'var(--danger-color)';
        } else {
            yesBtn.className = 'btn btn-primary';
            iconEl.className = 'fa-solid fa-circle-info';
            iconEl.parentElement.style.color = 'var(--accent-gold)';
        }

        // Show Modal
        confirmModal.classList.add('active');

        // Handlers
        const handleYes = () => {
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmModal.classList.remove('active');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            const backdrop = confirmModal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.removeEventListener('click', handleNo);
            }
        };

        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
        const backdrop = confirmModal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', handleNo);
        }
    });
}

// Quietly load dashboard data in the background (no loading spinner)
async function loadDashboardDataQuietly() {
    await loadDashboardData(true);
}

// Subscribe to realtime database changes for all public tables
function setupRealtime() {
    supabaseClient
        .channel('admin-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
            loadDashboardDataQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cashiers' }, () => {
            loadDashboardDataQuietly().then(() => {
                if (currentTab === 'cashiers') renderCashiersTab();
            });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
            loadDashboardDataQuietly().then(() => {
                if (document.getElementById('expensesModal')?.classList.contains('active')) {
                    renderExpensesModalContent();
                }
            });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, () => {
            loadDashboardDataQuietly().then(() => {
                if (currentTab === 'debts') renderDebtsTab();
                if (document.getElementById('debtDetailsModal')?.classList.contains('active')) {
                    const activeDebtId = document.getElementById('recordPaymentDebtId').value;
                    const updatedDebt = debtsList.find(d => d.id === activeDebtId);
                    if (updatedDebt) renderDebtDetailsModalContent(updatedDebt);
                }
            });
        })
        .subscribe();
}

// ==========================================
// TAB: SUPPLIERS (CRUD OPERATIONS & RENDERING)
// ==========================================

// Setup Supplier Form modal event listeners
function setupSupplierModal() {
    openAddSupplierModalBtn.addEventListener('click', () => {
        document.getElementById('formSupplierId').value = '';
        supplierForm.reset();
        document.getElementById('supplierModalTitle').textContent = 'إضافة مورد جديد';
        addSupplierModal.classList.add('active');
    });

    closeSupplierFormModalBtn.addEventListener('click', () => {
        addSupplierModal.classList.remove('active');
    });

    // Close on backdrop click
    addSupplierModal.querySelector('.modal-backdrop').addEventListener('click', () => {
        addSupplierModal.classList.remove('active');
    });

    supplierForm.addEventListener('submit', handleSupplierFormSubmit);
}

// Handle Add/Edit Supplier Submission to Supabase
async function handleSupplierFormSubmit(e) {
    e.preventDefault();

    const supplierId = document.getElementById('formSupplierId').value;
    const name = document.getElementById('supplierNameInput').value.trim();
    const phone = document.getElementById('supplierPhoneInput').value.trim();

    if (!name || !phone) {
        alert('الرجاء تعبئة جميع الحقول المطلوبة.');
        return;
    }

    try {
        adminLoader.style.display = 'flex';
        addSupplierModal.classList.remove('active');

        if (supplierId) {
            // EDIT Supplier
            const { error } = await supabaseClient
                .from('suppliers')
                .update({ name, phone })
                .eq('id', supplierId);
            if (error) throw error;
        } else {
            // ADD Supplier
            const { error } = await supabaseClient
                .from('suppliers')
                .insert({ name, phone });
            if (error) throw error;
        }

        await loadDashboardData();
    } catch (err) {
        console.error('Error saving supplier:', err);
        alert('حدث خطأ أثناء حفظ بيانات المورد. قد يكون الاسم مسجلاً بالفعل.');
        addSupplierModal.classList.add('active');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Render Suppliers list in Suppliers Tab
function renderSuppliersTab() {
    suppliersTableBody.innerHTML = '';

    if (suppliersList.length === 0) {
        emptySuppliersState.style.display = 'flex';
        return;
    }

    emptySuppliersState.style.display = 'none';

    suppliersList.forEach(supplier => {
        // Count how many products are supplied by this supplier
        const suppliedProductsCount = productsList.filter(p => p.supplier_name === supplier.name).length;
        const regDate = supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('ar-DZ') : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${supplier.name}</strong></td>
            <td><span style="font-family: 'Playfair Display', sans-serif;">${supplier.phone}</span></td>
            <td><span class="badge badge-outline" style="border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 4px 10px; border-radius: 20px; font-weight: bold;">${suppliedProductsCount} منتجات</span></td>
            <td>${regDate}</td>
            <td>
                <button class="btn btn-sm btn-outline edit-sup-btn" style="margin-left: 5px;"><i class="fa-solid fa-pen-to-square"></i> تعديل</button>
                <button class="btn btn-sm btn-danger delete-sup-btn"><i class="fa-solid fa-trash"></i> حذف</button>
            </td>
        `;

        tr.querySelector('.edit-sup-btn').addEventListener('click', () => openEditSupplierModal(supplier));
        tr.querySelector('.delete-sup-btn').addEventListener('click', () => deleteSupplier(supplier));

        suppliersTableBody.appendChild(tr);
    });
}

// Open Supplier Form Modal in Edit Mode
function openEditSupplierModal(supplier) {
    document.getElementById('formSupplierId').value = supplier.id;
    document.getElementById('supplierNameInput').value = supplier.name;
    document.getElementById('supplierPhoneInput').value = supplier.phone;
    document.getElementById('supplierModalTitle').textContent = 'تعديل بيانات المورد';

    addSupplierModal.classList.add('active');
}

// Delete Supplier
async function deleteSupplier(supplier) {
    const confirmed = await showConfirmModal(
        'حذف المورد',
        `هل أنت متأكد من رغبتك في حذف المورد "${supplier.name}" بشكل نهائي؟`,
        true
    );
    if (!confirmed) return;

    try {
        adminLoader.style.display = 'flex';

        const { error } = await supabaseClient
            .from('suppliers')
            .delete()
            .eq('id', supplier.id);

        if (error) throw error;

        await loadDashboardData();
    } catch (err) {
        console.error('Error deleting supplier:', err);
        alert('حدث خطأ أثناء حذف المورد.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

let activeDebtId = null;

function renderDebtsTab() {
    const searchVal = debtsSearchInput ? debtsSearchInput.value.toLowerCase().trim() : '';
    const statusFilter = debtsStatusFilter ? debtsStatusFilter.value : 'unpaid';

    // 1. Filter debts list
    const filteredDebts = debtsList.filter(debt => {
        const matchesSearch = (debt.client_name || '').toLowerCase().includes(searchVal) ||
                              (debt.phone || '').toLowerCase().includes(searchVal);
        
        let matchesStatus = true;
        const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
        
        if (statusFilter === 'unpaid') {
            matchesStatus = remaining > 0;
        } else if (statusFilter === 'paid') {
            matchesStatus = remaining <= 0;
        }

        return matchesSearch && matchesStatus;
    });

    // 2. Update Metrics
    let totalRemaining = 0;
    let debtorCountSet = new Set();

    debtsList.forEach(debt => {
        const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
        if (remaining > 0) {
            totalRemaining += remaining;
            debtorCountSet.add(debt.phone || debt.client_name);
        }
    });

    if (debtsTotalRemaining) {
        debtsTotalRemaining.textContent = Number(totalRemaining).toLocaleString('ar-DZ') + ' د.ج';
    }
    if (debtorsCount) {
        debtorsCount.textContent = `${debtorCountSet.size} زبائن`;
    }

    // 3. Render Table
    if (!debtsTableBody) return;
    debtsTableBody.innerHTML = '';

    if (filteredDebts.length === 0) {
        if (emptyDebtsState) emptyDebtsState.style.display = 'flex';
        return;
    } else {
        if (emptyDebtsState) emptyDebtsState.style.display = 'none';
    }

    filteredDebts.forEach(debt => {
        const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
        const isPaid = remaining <= 0;
        const statusBadge = isPaid
            ? `<span class="badge" style="background-color: #2ecc71; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">مسدد كاملة</span>`
            : `<span class="badge" style="background-color: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">غير مسدد</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${new Date(debt.created_at).toLocaleDateString('ar-DZ')}</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color);"><strong>${debt.client_name}</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${debt.phone}</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${Number(debt.total_amount).toLocaleString('ar-DZ')} د.ج</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif); color: var(--success-color);">${Number(debt.paid_amount).toLocaleString('ar-DZ')} د.ج</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif); color: var(--danger-color); font-weight: bold;">${Number(remaining).toLocaleString('ar-DZ')} د.ج</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">${statusBadge}</td>
            <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-primary view-debt-details-btn" data-id="${debt.id}" style="padding: 6px 12px; font-size: 12px; font-weight: bold;">
                        <i class="fa-solid fa-eye"></i> تفاصيل
                    </button>
                    ${!isPaid ? `
                        <button class="btn btn-sm btn-success quick-pay-btn" data-id="${debt.id}" style="padding: 6px 12px; font-size: 12px; font-weight: bold; background-color: var(--accent-gold); border-color: var(--accent-gold); color: white;">
                            <i class="fa-solid fa-coins"></i> تسديد دفعة
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        tr.querySelector('.view-debt-details-btn').addEventListener('click', () => {
            openDebtDetailsModal(debt);
        });

        const quickPayBtn = tr.querySelector('.quick-pay-btn');
        if (quickPayBtn) {
            quickPayBtn.addEventListener('click', () => {
                openDebtDetailsModal(debt);
                if (paymentAmountInput) {
                    paymentAmountInput.focus();
                }
            });
        }

        debtsTableBody.appendChild(tr);
    });
}

function openDebtDetailsModal(debt) {
    activeDebtId = debt.id;
    
    if (detailDebtClientName) detailDebtClientName.textContent = debt.client_name;
    if (detailDebtClientPhone) detailDebtClientPhone.textContent = debt.phone;
    if (detailDebtInvoiceNum) detailDebtInvoiceNum.textContent = debt.invoice_number;
    if (detailDebtDate) {
        detailDebtDate.textContent = new Date(debt.created_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
        });
    }
    
    const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
    
    if (detailDebtTotal) detailDebtTotal.textContent = Number(debt.total_amount).toLocaleString('ar-DZ') + ' د.ج';
    if (detailDebtPaid) detailDebtPaid.textContent = Number(debt.paid_amount).toLocaleString('ar-DZ') + ' د.ج';
    if (detailDebtRemaining) detailDebtRemaining.textContent = Number(remaining).toLocaleString('ar-DZ') + ' د.ج';
    
    // Items
    if (detailDebtItemsBody) {
        detailDebtItemsBody.innerHTML = '';
        (debt.products || []).forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color);"><strong>${item.name || item.product_name || 'منتج غير معروف'}</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${item.color || '-'} / <span style="font-family: var(--font-serif);">${item.size || '-'}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${item.qty}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${Number(item.price).toLocaleString('ar-DZ')} د.ج</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif); font-weight: bold; color: var(--primary-blue);">${Number(item.price * item.qty).toLocaleString('ar-DZ')} د.ج</td>
            `;
            detailDebtItemsBody.appendChild(tr);
        });
    }
    
    // Payments
    if (detailDebtPaymentsBody) {
        detailDebtPaymentsBody.innerHTML = '';
        const historyList = debt.history || [];
        if (historyList.length === 0) {
            detailDebtPaymentsBody.innerHTML = `
                <tr>
                    <td colspan="3" style="padding: 15px; text-align: center; color: var(--text-muted);">لم يتم تسجيل أي دفعات بعد.</td>
                </tr>
            `;
        } else {
            historyList.forEach(payment => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif);">${new Date(payment.date).toLocaleDateString('ar-DZ', {
                        hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
                    })}</td>
                    <td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: var(--font-serif); font-weight: bold; color: var(--success-color);">${Number(payment.amount).toLocaleString('ar-DZ')} د.ج</td>
                    <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${payment.cashier || 'غير معروف'}</td>
                `;
                detailDebtPaymentsBody.appendChild(tr);
            });
        }
    }
    
    if (paymentAmountInput) {
        paymentAmountInput.value = '';
        paymentAmountInput.max = remaining;
        if (remaining <= 0) {
            paymentAmountInput.disabled = true;
            paymentAmountInput.placeholder = 'الدين مسدد بالكامل';
        } else {
            paymentAmountInput.disabled = false;
            paymentAmountInput.placeholder = 'أدخل مبلغ الدفعة...';
        }
    }
    
    if (deleteDebtBtn) {
        deleteDebtBtn.style.display = isCashierUser ? 'none' : 'flex';
    }
    
    if (debtDetailsModal) {
        debtDetailsModal.classList.add('active');
    }
}

async function handleRecordDebtPayment(amount) {
    if (!activeDebtId) return;
    const debt = debtsList.find(d => d.id === activeDebtId);
    if (!debt) return;

    const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
    if (amount <= 0) {
        alert('يرجى إدخال مبلغ صحيح أكبر من الصفر.');
        return;
    }
    if (amount > remaining) {
        alert(`المبلغ المدخل (${amount.toLocaleString('ar-DZ')} د.ج) أكبر من الدين المتبقي (${remaining.toLocaleString('ar-DZ')} د.ج).`);
        return;
    }

    const newPaidAmount = Number(debt.paid_amount) + amount;
    const newStatus = (debt.total_amount - newPaidAmount) <= 0 ? 'paid' : 'unpaid';
    const printedAt = new Date().toISOString();
    const cashierName = getCurrentUserName();

    const paymentLog = {
        date: printedAt,
        amount: amount,
        cashier: cashierName,
        invoice_number: debt.invoice_number
    };

    const updatedHistory = [...(debt.history || []), paymentLog];

    debt.paid_amount = newPaidAmount;
    debt.status = newStatus;
    debt.history = updatedHistory;

    localStorage.setItem('asel_debts_cache', JSON.stringify(debtsList));
    renderDebtsTab();
    openDebtDetailsModal(debt);

    if (!navigator.onLine) {
        queueOfflineAction('RECORD_DEBT_PAYMENT', {
            debt_id: debt.id,
            amount: amount,
            cashier: cashierName,
            date: printedAt,
            invoice_number: debt.invoice_number
        });
        alert('تم تسجيل الدفعة محلياً بنجاح (دون اتصال). ستتم مزامنتها تلقائياً عند الاتصال بالإنترنت.');
    } else {
        try {
            adminLoader.style.display = 'flex';
            const { error } = await supabaseClient
                .from('debts')
                .update({
                    paid_amount: newPaidAmount,
                    status: newStatus,
                    history: updatedHistory
                })
                .eq('id', debt.id);

            if (error) throw error;
            alert('تم تسجيل الدفعة وتحديث حساب الدين بنجاح!');
        } catch (err) {
            console.error('Error recording debt payment:', err);
            alert('حدث خطأ أثناء مزامنة الدفعة مع السحابة. تم حفظها محلياً وسيتم إعادة المحاولة عند استقرار الشبكة.');
            queueOfflineAction('RECORD_DEBT_PAYMENT', {
                debt_id: debt.id,
                amount: amount,
                cashier: cashierName,
                date: printedAt,
                invoice_number: debt.invoice_number
            });
        } finally {
            adminLoader.style.display = 'none';
        }
    }
}

async function handleDeleteDebt() {
    if (!activeDebtId) return;
    const debt = debtsList.find(d => d.id === activeDebtId);
    if (!debt) return;

    if (isCashierUser) {
        alert('عذراً، صلاحيات الكاشير لا تسمح بحذف الديون.');
        return;
    }

    if (!confirm('هل أنت متأكد من رغبتك في حذف سجل هذا الدين بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }

    debtsList = debtsList.filter(d => d.id !== activeDebtId);
    localStorage.setItem('asel_debts_cache', JSON.stringify(debtsList));
    renderDebtsTab();
    if (debtDetailsModal) debtDetailsModal.classList.remove('active');

    if (!navigator.onLine) {
        queueOfflineAction('DELETE_DEBT', { id: activeDebtId });
        alert('تم حذف سجل الدين محلياً بنجاح. سيتم حذفه من السحابة عند الاتصال.');
    } else {
        try {
            adminLoader.style.display = 'flex';
            if (activeDebtId.indexOf('temp_debt_') !== 0) {
                const { error } = await supabaseClient
                    .from('debts')
                    .delete()
                    .eq('id', activeDebtId);
                if (error) throw error;
            }
            alert('تم حذف سجل الدين بالكامل بنجاح!');
        } catch (err) {
            console.error('Error deleting debt:', err);
            alert('حدث خطأ أثناء حذف الدين من السحابة. تم الحذف محلياً وسيتم تحديث السحابة لاحقاً.');
            queueOfflineAction('DELETE_DEBT', { id: activeDebtId });
        } finally {
            adminLoader.style.display = 'none';
        }
    }
}

function setupDebtsFeature() {
    if (debtsSearchInput) {
        debtsSearchInput.addEventListener('input', renderDebtsTab);
    }
    if (debtsStatusFilter) {
        debtsStatusFilter.addEventListener('change', renderDebtsTab);
    }
    if (closeDebtDetailsModalBtn) {
        closeDebtDetailsModalBtn.addEventListener('click', () => {
            if (debtDetailsModal) debtDetailsModal.classList.remove('active');
        });
    }
    const debtBackdrop = document.getElementById('debtDetailsModalBackdrop');
    if (debtBackdrop) {
        debtBackdrop.addEventListener('click', () => {
            if (debtDetailsModal) debtDetailsModal.classList.remove('active');
        });
    }
    if (recordPaymentForm) {
        recordPaymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = Number(paymentAmountInput.value) || 0;
            await handleRecordDebtPayment(amount);
        });
    }
    if (printDebtStatementBtn) {
        printDebtStatementBtn.addEventListener('click', () => {
            if (!activeDebtId) return;
            const debt = debtsList.find(d => d.id === activeDebtId);
            if (!debt) return;

            const items = (debt.products || []).map(p => ({
                product_name: p.name || p.product_name,
                color: p.color,
                size: p.size,
                total_price: Number(p.price) * Number(p.qty)
            }));

            setupInvoicePrintView(
                debt.invoice_number,
                debt.created_at,
                debt.client_name,
                debt.phone,
                'المحل',
                'المحل',
                'استلام من المحل',
                items,
                debt.paid_amount,
                Number(debt.total_amount) - Number(debt.paid_amount)
            );
            window.print();
        });
    }
    if (deleteDebtBtn) {
        deleteDebtBtn.addEventListener('click', handleDeleteDebt);
    }
}

// Setup In-Shop Order form & modal listeners
function setupInShopOrderModal() {
    const modal = document.getElementById('inShopOrderModal');
    const openBtn = document.getElementById('openInShopOrderModalBtn');
    const closeBtn = document.getElementById('closeInShopOrderModalBtn');
    const backdrop = document.getElementById('inShopOrderModalBackdrop');
    const form = document.getElementById('inShopOrderForm');
    const productSelect = document.getElementById('inShopProductSelect');
    const colorSelect = document.getElementById('inShopColorSelect');
    const sizeSelect = document.getElementById('inShopSizeSelect');
    const qtyInput = document.getElementById('inShopQuantityInput');
    const priceInput = document.getElementById('inShopPriceInput');
    const warning = document.getElementById('inShopStockWarning');
    const saveBtn = document.getElementById('saveInShopOrderBtn');
    
    // New elements
    const addBtn = document.getElementById('addInShopItemBtn');
    const addedItemsContainer = document.getElementById('inShopAddedItemsContainer');
    const addedItemsList = document.getElementById('inShopAddedItemsList');
    const orderTotalSpan = document.getElementById('inShopOrderTotal');

    // Pill containers
    const colorOptionsContainer = document.getElementById('inShopColorOptions');
    const sizeOptionsContainer = document.getElementById('inShopSizeOptions');

    // Debt & Payment mode elements
    const paymentModeSection = document.getElementById('inShopPaymentModeSection');
    const paymentTypeSelect = document.getElementById('inShopPaymentType');
    const remiseInput = document.getElementById('inShopRemiseInput');
    const debtFields = document.getElementById('inShopDebtFields');
    const clientNameInput = document.getElementById('inShopClientName');
    const clientPhoneInput = document.getElementById('inShopClientPhone');
    const amountPaidInput = document.getElementById('inShopAmountPaid');
    const amountRemainingSpan = document.getElementById('inShopAmountRemaining');

    if (!modal || !openBtn) return;

    let inShopItems = [];

    const resetItemInputs = () => {
        productSelect.value = '';
        colorSelect.value = '';
        sizeSelect.value = '';
        qtyInput.value = 1;
        priceInput.value = '';
        warning.style.display = 'none';
        
        if (colorOptionsContainer) {
            colorOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">يرجى اختيار المنتج أولاً...</span>';
        }
        if (sizeOptionsContainer) {
            sizeOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">يرجى اختيار اللون أولاً...</span>';
        }
    };

    const updateRemainingAmount = () => {
        let grandTotal = inShopItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let remise = remiseInput ? (Number(remiseInput.value) || 0) : 0;
        
        if (remise < 0) {
            remise = 0;
            if (remiseInput) remiseInput.value = 0;
        }
        if (remise > grandTotal) {
            remise = grandTotal;
            if (remiseInput) remiseInput.value = grandTotal;
        }

        let maxPaid = grandTotal - remise;
        let paid = Number(amountPaidInput.value) || 0;
        
        if (paid < 0) {
            paid = 0;
            if (amountPaidInput) amountPaidInput.value = 0;
        }
        if (paid > maxPaid) {
            paid = maxPaid;
            if (amountPaidInput) amountPaidInput.value = maxPaid;
        }

        let remaining = maxPaid - paid;
        if (amountRemainingSpan) {
            amountRemainingSpan.textContent = `المتبقي: ${Number(remaining).toLocaleString('ar-DZ')} د.ج`;
        }
    };

    openBtn.addEventListener('click', () => {
        form.reset();
        inShopItems = [];
        renderInShopItemsTable();
        resetItemInputs();
        
        // Reset our new fields
        if (paymentTypeSelect) paymentTypeSelect.value = 'full';
        if (remiseInput) remiseInput.value = 0;
        if (debtFields) debtFields.style.display = 'none';
        if (paymentModeSection) paymentModeSection.style.display = 'none';
        if (clientNameInput) clientNameInput.value = '';
        if (clientPhoneInput) clientPhoneInput.value = '';
        if (amountPaidInput) amountPaidInput.value = '0';
        if (amountRemainingSpan) amountRemainingSpan.textContent = 'المتبقي: 0 د.ج';

        // Populate products dropdown
        productSelect.innerHTML = '<option value="">-- اختر المنتج --</option>';
        productsList.forEach(prod => {
            // Calculate total stock for this product
            const totalStock = stockList
                .filter(s => s.product_id === prod.id)
                .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

            // Show product if totalStock > 0 (even if is_active is false)
            if (totalStock > 0) {
                const opt = document.createElement('option');
                opt.value = prod.id;
                if (prod.is_active === false) {
                    opt.textContent = `${prod.name} (معطل على الموقع)`;
                } else {
                    opt.textContent = prod.name;
                }
                productSelect.appendChild(opt);
            }
        });

        modal.classList.add('active');
    });

    const closeModal = () => {
        modal.classList.remove('active');
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Load available colors for selected product (only colors with stock quantity > 0)
    productSelect.addEventListener('change', () => {
        const prodId = productSelect.value;
        colorSelect.value = '';
        sizeSelect.value = '';
        warning.style.display = 'none';

        if (sizeOptionsContainer) {
            sizeOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">يرجى اختيار اللون أولاً...</span>';
        }

        if (!prodId) {
            priceInput.value = '';
            if (colorOptionsContainer) {
                colorOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">يرجى اختيار المنتج أولاً...</span>';
            }
            return;
        }

        const product = productsList.find(p => p.id === prodId);
        if (product) {
            priceInput.value = product.price;
        }

        // Get stock items for this product with quantity > 0
        const pStock = stockList.filter(s => s.product_id === prodId && s.quantity > 0);
        
        // Populate colors
        const uniqueColors = [...new Set(pStock.map(s => s.color))];
        if (uniqueColors.length === 0) {
            if (colorOptionsContainer) {
                colorOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--danger-color); font-weight: 600;">نفذت جميع ألوان ومقاسات هذا المنتج!</span>';
            }
            return;
        }

        if (colorOptionsContainer) {
            colorOptionsContainer.innerHTML = '';
            uniqueColors.forEach(color => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'selection-pill';
                btn.textContent = color;
                btn.addEventListener('click', () => {
                    // Remove active from all color pills
                    colorOptionsContainer.querySelectorAll('.selection-pill').forEach(p => p.classList.remove('active'));
                    // Add active to this pill
                    btn.classList.add('active');
                    // Update hidden input and dispatch change
                    colorSelect.value = color;
                    colorSelect.dispatchEvent(new Event('change'));
                });
                colorOptionsContainer.appendChild(btn);
            });
        }
    });

    // Load available sizes when color is selected (only sizes with stock quantity > 0)
    colorSelect.addEventListener('change', () => {
        const prodId = productSelect.value;
        const selectedColor = colorSelect.value;
        sizeSelect.value = '';
        warning.style.display = 'none';

        if (!prodId || !selectedColor) {
            if (sizeOptionsContainer) {
                sizeOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">يرجى اختيار اللون أولاً...</span>';
            }
            return;
        }

        // Filter stock items for this product and selected color with quantity > 0
        const matchingStock = stockList.filter(s => s.product_id === prodId && s.color === selectedColor && s.quantity > 0);
        
        if (sizeOptionsContainer) {
            sizeOptionsContainer.innerHTML = '';
            
            let hasAvailableSizes = false;
            matchingStock.forEach(stockItem => {
                // Calculate remaining available stock considering what's already added to the ticket
                const alreadyAdded = inShopItems
                    .filter(item => item.product_id === prodId && item.color === selectedColor && item.size === stockItem.size)
                    .reduce((sum, item) => sum + item.qty, 0);
                
                const realAvailable = stockItem.quantity - alreadyAdded;

                if (realAvailable > 0) {
                    hasAvailableSizes = true;
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'selection-pill';
                    if (realAvailable <= 5) {
                        btn.innerHTML = `${stockItem.size} <span style="font-size: 11px; opacity: 0.8; margin-right: 4px;">(باقي ${realAvailable})</span>`;
                    } else {
                        btn.textContent = stockItem.size;
                    }
                    btn.addEventListener('click', () => {
                        // Remove active from all size pills
                        sizeOptionsContainer.querySelectorAll('.selection-pill').forEach(p => p.classList.remove('active'));
                        // Add active to this pill
                        btn.classList.add('active');
                        // Update hidden input and dispatch change
                        sizeSelect.value = stockItem.size;
                        sizeSelect.dispatchEvent(new Event('change'));
                    });
                    sizeOptionsContainer.appendChild(btn);
                }
            });

            if (!hasAvailableSizes) {
                sizeOptionsContainer.innerHTML = '<span style="font-size: 13px; color: var(--danger-color); font-weight: 600;">نفذت جميع مقاسات هذا اللون!</span>';
            }
        }

        validateStock();
    });

    // Validate stock quantity on input/change
    const validateStock = () => {
        const prodId = productSelect.value;
        const color = colorSelect.value;
        const size = sizeSelect.value;
        const requestedQty = parseInt(qtyInput.value) || 1;

        if (!prodId || !color || !size) {
            warning.style.display = 'none';
            return;
        }

        const stockItem = stockList.find(s => s.product_id === prodId && s.color === color && s.size === size);
        const alreadyAdded = inShopItems
            .filter(item => item.product_id === prodId && item.color === color && item.size === size)
            .reduce((sum, item) => sum + item.qty, 0);

        const availableQty = stockItem ? (stockItem.quantity - alreadyAdded) : 0;

        if (requestedQty > availableQty) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    };

    colorSelect.addEventListener('change', validateStock);
    sizeSelect.addEventListener('change', validateStock);
    qtyInput.addEventListener('input', validateStock);

    // Handle Add Product to Ticket Button Click
    addBtn.addEventListener('click', () => {
        const prodId = productSelect.value;
        const color = colorSelect.value;
        const size = sizeSelect.value;
        const qty = parseInt(qtyInput.value) || 1;
        const price = Number(priceInput.value);

        if (!prodId || !color || !size || qty < 1 || isNaN(price)) {
            alert('الرجاء اختيار المنتج واللون والمقاس وتحديد الكمية والسعر.');
            return;
        }

        // Validate stock
        const stockItem = stockList.find(s => s.product_id === prodId && s.color === color && s.size === size);
        const alreadyAdded = inShopItems
            .filter(item => item.product_id === prodId && item.color === color && item.size === size)
            .reduce((sum, item) => sum + item.qty, 0);
        
        const availableQty = stockItem ? (stockItem.quantity - alreadyAdded) : 0;

        if (qty > availableQty) {
            alert('الكمية المحددة أكبر من الكمية المتوفرة حالياً في المخزن للوصل!');
            return;
        }

        const product = productsList.find(p => p.id === prodId);
        if (!product) return;

        // Check if item already exists in local ticket array
        const existingItem = inShopItems.find(item => item.product_id === prodId && item.color === color && item.size === size);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            inShopItems.push({
                product_id: prodId,
                product_name: product.name,
                color: color,
                size: size,
                qty: qty,
                price: price
            });
        }

        resetItemInputs();
        renderInShopItemsTable();
    });

    const renderInShopItemsTable = () => {
        addedItemsList.innerHTML = '';
        if (inShopItems.length === 0) {
            addedItemsContainer.style.display = 'none';
            if (paymentModeSection) paymentModeSection.style.display = 'none';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
            return;
        }

        addedItemsContainer.style.display = 'block';
        if (paymentModeSection) paymentModeSection.style.display = 'block';
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';

        let grandTotal = 0;

        inShopItems.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.product_name}</strong></td>
                <td>${item.color} / <span style="font-family: var(--font-serif);">${item.size}</span></td>
                <td style="font-family: var(--font-serif);">${item.qty}</td>
                <td style="font-family: var(--font-serif);">${Number(item.price).toLocaleString('ar-DZ')} د.ج</td>
                <td style="font-family: var(--font-serif); font-weight: bold; color: var(--primary-blue);">${Number(itemTotal).toLocaleString('ar-DZ')} د.ج</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger delete-item-btn" data-index="${index}" style="padding: 4px 8px; font-size: 11px;">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </td>
            `;

            tr.querySelector('.delete-item-btn').addEventListener('click', () => {
                inShopItems.splice(index, 1);
                renderInShopItemsTable();
            });

            addedItemsList.appendChild(tr);
        });

        orderTotalSpan.textContent = Number(grandTotal).toLocaleString('ar-DZ');
        updateRemainingAmount();
    };

    if (paymentTypeSelect) {
        paymentTypeSelect.addEventListener('change', () => {
            if (paymentTypeSelect.value === 'partial') {
                if (debtFields) debtFields.style.display = 'block';
                if (clientNameInput) clientNameInput.required = true;
                if (clientPhoneInput) clientPhoneInput.required = true;
            } else {
                if (debtFields) debtFields.style.display = 'none';
                if (clientNameInput) clientNameInput.required = false;
                if (clientPhoneInput) clientPhoneInput.required = false;
            }
            updateRemainingAmount();
        });
    }

    if (amountPaidInput) {
        amountPaidInput.addEventListener('input', () => {
            let grandTotal = inShopItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            let remise = remiseInput ? (Number(remiseInput.value) || 0) : 0;
            let maxPaid = grandTotal - remise;
            let val = Number(amountPaidInput.value) || 0;
            if (val < 0) amountPaidInput.value = 0;
            if (val > maxPaid) amountPaidInput.value = maxPaid;
            updateRemainingAmount();
        });
    }

    if (remiseInput) {
        remiseInput.addEventListener('input', () => {
            updateRemainingAmount();
        });
    }

    // Save In-Shop Order Action
    saveBtn.addEventListener('click', async () => {
        if (inShopItems.length === 0) return;

        const paymentType = paymentTypeSelect ? paymentTypeSelect.value : 'full';
        const remise = remiseInput ? (Number(remiseInput.value) || 0) : 0;
        let clientName = 'زبون حضوري';
        let clientPhone = 'المحل';
        let paidAmount = 0;
        let remainingAmount = 0;
        let isDebt = paymentType === 'partial';

        let grandTotal = inShopItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

        if (isDebt) {
            clientName = clientNameInput.value.trim();
            clientPhone = clientPhoneInput.value.trim();
            paidAmount = Number(amountPaidInput.value) || 0;

            if (!clientName || !clientPhone) {
                alert('الرجاء إدخال اسم ورقم هاتف الزبون لتسجيل الدين.');
                return;
            }
            if (paidAmount < 0) {
                alert('المبلغ المدفوع لا يمكن أن يكون سالباً.');
                return;
            }
            const maxPaid = grandTotal - remise;
            if (paidAmount >= maxPaid) {
                alert('المبلغ المدفوع يجب أن يكون أقل من إجمالي الطلب بعد التخفيض لتسجيله كدين. إذا تم الدفع بالكامل، يرجى اختيار "دفع كامل".');
                return;
            }
            remainingAmount = maxPaid - paidAmount;
        } else {
            paidAmount = grandTotal - remise;
            remainingAmount = 0;
        }

        if (!navigator.onLine) {
            // Offline Flow
            try {
                adminLoader.style.display = 'flex';
                closeModal();

                // 1. Deduct stock locally
                inShopItems.forEach(item => {
                    const stockItem = stockList.find(s => s.product_id === item.product_id && s.color === item.color && s.size === item.size);
                    if (!stockItem || stockItem.quantity < item.qty) {
                        throw new Error(`الكمية المطلوبة من المنتج ${item.product_name} غير متوفرة في المخزن!`);
                    }
                    stockItem.quantity -= item.qty;
                });
                localStorage.setItem('asel_stock_cache', JSON.stringify(stockList));

                // 2. Generate temp offline ticket
                const offlineInvoiceNum = 'OFF-' + (Date.now() % 100000);
                const printedAt = new Date().toISOString();

                const tempOrders = inShopItems.map((item, idx) => ({
                    id: `temp_${Date.now()}_${idx}`,
                    client_name: clientName,
                    phone: clientPhone,
                    wilaya: 'المحل',
                    baladiya: 'المحل',
                    delivery_type: 'استلام من المحل',
                    product_id: item.product_id,
                    product_name: item.product_name,
                    size: item.size,
                    color: item.color,
                    total_price: item.price * item.qty,
                    status: 'مؤكد',
                    created_at: printedAt
                }));

                const tempInvoices = tempOrders.map((ord, idx) => {
                    const item = inShopItems[idx];
                    return {
                        order_id: ord.id,
                        invoice_number: offlineInvoiceNum,
                        printed_at: printedAt,
                        client_name: clientName,
                        phone: clientPhone,
                        wilaya: 'المحل',
                        baladiya: 'المحل',
                        delivery_type: 'استلام من المحل',
                        product_name: item.product_name,
                        size: item.size,
                        color: item.color,
                        total_price: item.price * item.qty
                    };
                });

                // Save to offline queue
                let queue = [];
                try {
                    queue = JSON.parse(localStorage.getItem('asel_offline_orders_queue') || '[]');
                } catch(e) {}
                queue.push({
                    items: inShopItems,
                    invoice_number: offlineInvoiceNum,
                    printed_at: printedAt,
                    isDebt: isDebt,
                    client_name: clientName,
                    phone: clientPhone,
                    paidAmount: paidAmount,
                    remise: remise
                });
                localStorage.setItem('asel_offline_orders_queue', JSON.stringify(queue));

                if (isDebt) {
                    const tempDebt = {
                        id: `temp_debt_${Date.now()}`,
                        created_at: printedAt,
                        client_name: clientName,
                        phone: clientPhone,
                        total_amount: grandTotal - remise,
                        paid_amount: paidAmount,
                        products: inShopItems.map(item => ({
                            name: item.product_name,
                            color: item.color,
                            size: item.size,
                            qty: item.qty,
                            price: item.price
                        })),
                        status: 'unpaid',
                        history: paidAmount > 0 ? [{
                            date: printedAt,
                            amount: paidAmount,
                            cashier: getCurrentUserName(),
                            invoice_number: offlineInvoiceNum
                        }] : [],
                        invoice_number: offlineInvoiceNum
                    };

                    debtsList = [tempDebt, ...debtsList];
                    localStorage.setItem('asel_debts_cache', JSON.stringify(debtsList));
                }

                if (remise > 0) {
                    const tempExpId = 'exp_remise_' + Date.now();
                    const tempExpense = {
                        id: tempExpId,
                        amount: remise,
                        reason: `تخفيض (Remise) للطلب رقم #${offlineInvoiceNum} بقيمة ${remise} د.ج`,
                        cashier_name: getCurrentUserName(),
                        created_at: printedAt
                    };
                    expensesList.unshift(tempExpense);
                    saveStateToLocalCache();
                    queueOfflineAction('CREATE_EXPENSE', {
                        id: tempExpId,
                        amount: remise,
                        reason: tempExpense.reason,
                        cashier_name: tempExpense.cashier_name,
                        created_at: tempExpense.created_at
                    });
                }

                // Update in-memory lists
                ordersList = [...tempOrders, ...ordersList];
                invoicesList = [...tempInvoices, ...invoicesList];
                saveStateToLocalCache(); // save current state to cache

                // 3. Setup Print View
                const printItems = inShopItems.map(item => ({
                    product_name: item.product_name,
                    color: item.color,
                    size: item.size,
                    total_price: item.price * item.qty
                }));

                setupInvoicePrintView(
                    offlineInvoiceNum,
                    printedAt,
                    clientName,
                    clientPhone,
                    'المحل',
                    'المحل',
                    'استلام من المحل',
                    printItems,
                    isDebt ? paidAmount : null,
                    isDebt ? remainingAmount : null
                );

                // Re-render UI immediately
                renderGeneralOrders();
                renderHistoryTable();
                if (currentTab === 'stock') renderStockGrid();
                if (currentTab === 'debts') renderDebtsTab();

                alert('تم تسجيل المبيعات وطباعة الوصل محلياً (دون اتصال). سيتم إرسالها للإنترنت تلقائياً عند عودة الشبكة.');
                
                // Open print dialog
                window.print();
            } catch (err) {
                console.error('Offline save error:', err);
                alert(err.message || 'حدث خطأ أثناء حفظ الطلب محلياً.');
            } finally {
                adminLoader.style.display = 'none';
            }
            return;
        }

        try {
            adminLoader.style.display = 'flex';
            closeModal();

            // 1. Deduct stock for all items in parallel
            const stockPromises = inShopItems.map(item => {
                const stockItem = stockList.find(s => s.product_id === item.product_id && s.color === item.color && s.size === item.size);
                if (!stockItem || stockItem.quantity < item.qty) {
                    throw new Error(`الكمية المطلوبة من المنتج ${item.product_name} غير متوفرة في المخزن!`);
                }
                return supabaseClient
                    .from('stock')
                    .update({ quantity: stockItem.quantity - item.qty })
                    .eq('id', stockItem.id);
            });
            await Promise.all(stockPromises);

            // 2. Insert Orders batch in Supabase
            const ordersPayload = inShopItems.map(item => ({
                client_name: clientName,
                phone: clientPhone,
                wilaya: 'المحل',
                baladiya: 'المحل',
                delivery_type: 'استلام من المحل',
                product_id: item.product_id,
                product_name: item.product_name,
                size: item.size,
                color: item.color,
                total_price: item.price * item.qty,
                status: 'مؤكد'
            }));

            const { data: insertedOrders, error: orderErr } = await supabaseClient
                .from('orders')
                .insert(ordersPayload)
                .select();
            if (orderErr) throw orderErr;

            // 3. Insert Invoices in Supabase.
            // Insert the first invoice without invoice_number so the DB generates one.
            const { data: firstInvoice, error: invErr1 } = await supabaseClient
                .from('invoices')
                .insert({
                    order_id: insertedOrders[0].id,
                    client_name: clientName,
                    phone: clientPhone,
                    wilaya: 'المحل',
                    baladiya: 'المحل',
                    delivery_type: 'استلام من المحل',
                    product_name: inShopItems[0].product_name,
                    size: inShopItems[0].size,
                    color: inShopItems[0].color,
                    total_price: inShopItems[0].price * inShopItems[0].qty
                })
                .select()
                .single();
            if (invErr1) throw invErr1;

            // Insert remise expense online if there is one
            if (remise > 0) {
                try {
                    const { error: remiseErr } = await supabaseClient
                        .from('expenses')
                        .insert({
                            amount: remise,
                            reason: `تخفيض (Remise) للطلب رقم #${firstInvoice.invoice_number} بقيمة ${remise} د.ج`,
                            cashier_name: getCurrentUserName()
                        });
                    if (remiseErr) console.error('Failed to auto-insert remise expense:', remiseErr);
                } catch (err) {
                    console.error('Error inserting remise expense:', err);
                }
            }

            // If there are more items, insert the rest using the same invoice_number and printed_at
            if (insertedOrders.length > 1) {
                const remainingInvoicesPayload = insertedOrders.slice(1).map((ord, idx) => {
                    const item = inShopItems[idx + 1];
                    return {
                        order_id: ord.id,
                        invoice_number: firstInvoice.invoice_number,
                        printed_at: firstInvoice.printed_at,
                        client_name: clientName,
                        phone: clientPhone,
                        wilaya: 'المحل',
                        baladiya: 'المحل',
                        delivery_type: 'استلام من المحل',
                        product_name: item.product_name,
                        size: item.size,
                        color: item.color,
                        total_price: item.price * item.qty
                    };
                });

                const { error: invErr2 } = await supabaseClient
                    .from('invoices')
                    .insert(remainingInvoicesPayload);
                if (invErr2) throw invErr2;
            }

            if (isDebt) {
                const { error: debtErr } = await supabaseClient
                    .from('debts')
                    .insert({
                        client_name: clientName,
                        phone: clientPhone,
                        total_amount: grandTotal - remise,
                        paid_amount: paidAmount,
                        products: inShopItems.map(item => ({
                            name: item.product_name,
                            color: item.color,
                            size: item.size,
                            qty: item.qty,
                            price: item.price
                        })),
                        status: 'unpaid',
                        history: paidAmount > 0 ? [{
                            date: firstInvoice.printed_at,
                            amount: paidAmount,
                            cashier: getCurrentUserName(),
                            invoice_number: firstInvoice.invoice_number
                        }] : [],
                        invoice_number: firstInvoice.invoice_number
                    });
                if (debtErr) throw debtErr;
            }

            // 5. Setup Print View & trigger print
            const printItems = inShopItems.map(item => ({
                product_name: item.product_name,
                color: item.color,
                size: item.size,
                total_price: item.price * item.qty
            }));

            setupInvoicePrintView(
                firstInvoice.invoice_number,
                firstInvoice.printed_at,
                clientName,
                clientPhone,
                'المحل',
                'المحل',
                'استلام من المحل',
                printItems,
                isDebt ? paidAmount : null,
                isDebt ? remainingAmount : null
            );

            // Refresh data
            await loadDashboardData();

            // Open print dialog
            window.print();

        } catch (err) {
            console.error('Error creating in-shop order:', err);
            alert(err.message || 'حدث خطأ أثناء تسجيل الطلب الحضوري.');
        } finally {
            adminLoader.style.display = 'none';
        }
    });

    // Global barcode listener
    let barcodeBuffer = '';
    let lastKeyTime = 0;

    document.addEventListener('keydown', (e) => {
        // Ignore if focus is in an input field (except if it is the barcode input field itself)
        const target = e.target;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        
        if (isInputElement && target.id !== 'prodBarcode') {
            barcodeBuffer = '';
            return;
        }

        const currentTime = Date.now();
        const diff = currentTime - lastKeyTime;
        
        // Barcode scanners type characters extremely rapidly (< 50ms apart)
        // We'll allow the first character (when barcodeBuffer is empty),
        // but subsequent characters must be typed within 80ms of each other.
        if (barcodeBuffer.length > 0 && diff > 80) {
            barcodeBuffer = '';
        }
        
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (barcodeBuffer.length >= 3) {
                e.preventDefault();
                const scannedBarcode = barcodeBuffer;
                barcodeBuffer = '';
                
                // Clear active search inputs if any
                if (isInputElement && target.value.includes(scannedBarcode)) {
                    target.value = target.value.replace(scannedBarcode, '');
                }
                
                handleScannedBarcode(scannedBarcode);
            } else {
                barcodeBuffer = '';
            }
            return;
        }

        if (e.key.length === 1) {
            barcodeBuffer += e.key;
        }
    });

    function handleScannedBarcode(scannedBarcode) {
        console.log("Scanned barcode detected:", scannedBarcode);
        
        const product = productsList.find(p => p.barcode === scannedBarcode);
        if (!product) {
            alert(`المنتج ذو الباركود (${scannedBarcode}) غير مسجل في النظام.`);
            return;
        }

        if (product.is_active === false) {
            alert(`المنتج "${product.name}" معطل حالياً.`);
            return;
        }

        // Open In-Shop Order Modal if not already active
        if (!modal.classList.contains('active')) {
            form.reset();
            inShopItems = [];
            renderInShopItemsTable();
            resetItemInputs();
            
            // Populate products dropdown
            productSelect.innerHTML = '<option value="">-- اختر المنتج --</option>';
            productsList.forEach(prod => {
                if (prod.is_active !== false) {
                    const opt = document.createElement('option');
                    opt.value = prod.id;
                    opt.textContent = prod.name;
                    productSelect.appendChild(opt);
                }
            });

            modal.classList.add('active');
        }

        // Select the product
        productSelect.value = product.id;
        productSelect.dispatchEvent(new Event('change'));
        
        // Focus on color selection dropdown so cashier can choose color immediately
        setTimeout(() => {
            colorSelect.focus();
        }, 100);
    }
}

// TAB 6: SETTINGS MANAGEMENT
function populateSettingsForm() {
    if (!websiteSettings) return;

    const setHeroTitle = document.getElementById('setHeroTitle');
    const setHeroSubtitle = document.getElementById('setHeroSubtitle');
    const setAboutText = document.getElementById('setAboutText');
    const setPhoneNumber = document.getElementById('setPhoneNumber');
    const setEmail = document.getElementById('setEmail');
    const setLocationUrl = document.getElementById('setLocationUrl');
    const setFacebookUrl = document.getElementById('setFacebookUrl');
    const setInstagramUrl = document.getElementById('setInstagramUrl');
    const setTiktokUrl = document.getElementById('setTiktokUrl');

    if (setHeroTitle) setHeroTitle.value = websiteSettings.hero_title || '';
    if (setHeroSubtitle) setHeroSubtitle.value = websiteSettings.hero_subtitle || '';
    if (setAboutText) setAboutText.value = websiteSettings.about_text || '';
    if (setPhoneNumber) setPhoneNumber.value = websiteSettings.phone_number || '';
    if (setEmail) setEmail.value = websiteSettings.email || '';
    if (setLocationUrl) setLocationUrl.value = websiteSettings.location_url || '';
    if (setFacebookUrl) setFacebookUrl.value = websiteSettings.facebook_url || '';
    if (setInstagramUrl) setInstagramUrl.value = websiteSettings.instagram_url || '';
    if (setTiktokUrl) setTiktokUrl.value = websiteSettings.tiktok_url || '';
}

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const setHeroTitle = document.getElementById('setHeroTitle').value.trim();
        const setHeroSubtitle = document.getElementById('setHeroSubtitle').value.trim();
        const setAboutText = document.getElementById('setAboutText').value.trim();
        const setPhoneNumber = document.getElementById('setPhoneNumber').value.trim();
        const setEmail = document.getElementById('setEmail').value.trim();
        const setLocationUrl = document.getElementById('setLocationUrl').value.trim();
        const setFacebookUrl = document.getElementById('setFacebookUrl').value.trim();
        const setInstagramUrl = document.getElementById('setInstagramUrl').value.trim();
        const setTiktokUrl = document.getElementById('setTiktokUrl').value.trim();

        if (!setHeroTitle || !setHeroSubtitle || !setAboutText || !setPhoneNumber || !setEmail || !setLocationUrl) {
            alert('الرجاء إدخال كافة الحقول الإلزامية.');
            return;
        }

        if (!navigator.onLine) {
            websiteSettings = {
                id: 1,
                hero_title: setHeroTitle,
                hero_subtitle: setHeroSubtitle,
                about_text: setAboutText,
                phone_number: setPhoneNumber,
                email: setEmail,
                location_url: setLocationUrl,
                facebook_url: setFacebookUrl || null,
                instagram_url: setInstagramUrl || null,
                tiktok_url: setTiktokUrl || null,
                updated_at: new Date().toISOString()
            };
            saveStateToLocalCache();
            queueOfflineAction('UPDATE_SETTINGS', websiteSettings);

            // Save printer settings if in Electron
            if (window.electronAPI) {
                const receiptPrinter = document.getElementById('setReceiptPrinter').value;
                const barcodePrinter = document.getElementById('setBarcodePrinter').value;
                localStorage.setItem('receiptPrinterName', receiptPrinter);
                localStorage.setItem('barcodePrinterName', barcodePrinter);
            }

            alert('تم حفظ إعدادات المتجر محلياً (دون اتصال). سيتم تحديثها في الموقع الإلكتروني فور عودة الإنترنت.');
            populateSettingsForm();
            return;
        }

        try {
            adminLoader.style.display = 'flex';

            const { data, error } = await supabaseClient
                .from('settings')
                .update({
                    hero_title: setHeroTitle,
                    hero_subtitle: setHeroSubtitle,
                    about_text: setAboutText,
                    phone_number: setPhoneNumber,
                    email: setEmail,
                    location_url: setLocationUrl,
                    facebook_url: setFacebookUrl || null,
                    instagram_url: setInstagramUrl || null,
                    tiktok_url: setTiktokUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 1)
                .select()
                .single();

            if (error) throw error;
            websiteSettings = data;

            // Save printer settings if in Electron
            if (window.electronAPI) {
                const receiptPrinter = document.getElementById('setReceiptPrinter').value;
                const barcodePrinter = document.getElementById('setBarcodePrinter').value;
                localStorage.setItem('receiptPrinterName', receiptPrinter);
                localStorage.setItem('barcodePrinterName', barcodePrinter);
            }

            alert('تم حفظ إعدادات المتجر بنجاح وتحديثها في الموقع الإلكتروني!');
            populateSettingsForm();
        } catch (err) {
            console.error('Error saving settings:', err);
            alert(err.message || 'حدث خطأ أثناء حفظ الإعدادات.');
        } finally {
            adminLoader.style.display = 'none';
        }
    });
}

// Initialize Desktop Printer settings
async function initPrinterSettings() {
    if (!window.electronAPI) return; // Only run in desktop app
    
    document.getElementById('printerSettingsTitle').style.display = 'block';
    document.getElementById('printerSettingsDesc').style.display = 'block';
    document.getElementById('printerSettingsDivider').style.display = 'block';
    document.getElementById('printerSettingsRow').style.display = 'flex';
    
    try {
        const printers = await window.electronAPI.getPrinters();
        const receiptSelect = document.getElementById('setReceiptPrinter');
        const barcodeSelect = document.getElementById('setBarcodePrinter');
        
        // Save current selections
        const savedReceipt = localStorage.getItem('receiptPrinterName') || '';
        const savedBarcode = localStorage.getItem('barcodePrinterName') || '';
        
        printers.forEach(p => {
            const opt1 = document.createElement('option');
            opt1.value = p.name;
            opt1.textContent = p.displayName || p.name;
            if (p.name === savedReceipt) opt1.selected = true;
            receiptSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = p.name;
            opt2.textContent = p.displayName || p.name;
            if (p.name === savedBarcode) opt2.selected = true;
            barcodeSelect.appendChild(opt2);
        });
    } catch (err) {
        console.error("Failed to load printers:", err);
    }
}

// Helper to update UI elements based on user role (manager vs cashier)
function updateRoleUI() {
    const profileSpan = document.querySelector('.user-profile span');
    if (profileSpan) {
        profileSpan.textContent = isCashierUser ? 'كاشير المتجر' : 'مدير المتجر';
    }
    
    const cashiersTabBtn = document.querySelector('.menu-item[data-tab="cashiers"]');
    if (cashiersTabBtn) {
        cashiersTabBtn.style.display = isCashierUser ? 'none' : 'flex';
    }
    
    const addProductBtn = document.getElementById('openAddProductModalBtn');
    if (addProductBtn) {
        addProductBtn.style.display = isCashierUser ? 'none' : 'inline-block';
    }
    
    const inShopPriceInput = document.getElementById('inShopPriceInput');
    if (inShopPriceInput) {
        inShopPriceInput.readOnly = true;
        inShopPriceInput.style.backgroundColor = '#f1f2f6';
        inShopPriceInput.style.cursor = 'not-allowed';
    }
    
    if (isCashierUser && currentTab === 'cashiers') {
        currentTab = 'general';
        sidebarMenuItems.forEach(item => {
            if (item.getAttribute('data-tab') === 'general') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        tabPanels.forEach(panel => {
            if (panel.id === 'tab-general') {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        updateTabTitle('general');
    }
}

// Background validation of user's cashier status
async function validateCashierSessionQuietly(userId) {
    try {
        const { data: cashier, error: cErr } = await supabaseClient
            .from('cashiers')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (cErr) {
            if (cErr.code === 'PGRST116') { // PGRST116 means user is not a cashier (so they are an admin)
                if (isCashierUser) {
                    isCashierUser = false;
                    sessionStorage.setItem('asel_user_session', JSON.stringify({
                        id: userId,
                        email: '',
                        isCashierUser: false
                    }));
                    updateRoleUI();
                }
            } else {
                console.error('Background cashier check error:', cErr);
            }
            return;
        }
        
        if (cashier) {
            if (cashier.status === 'pending') {
                await supabaseClient.auth.signOut();
                showLogin('طلب انضمامك ككاشير قيد الانتظار لموافقة مدير المتجر.');
            } else if (cashier.status === 'rejected') {
                await supabaseClient.auth.signOut();
                showLogin('تم رفض طلب انضمامك ككاشير من طرف مدير المتجر.');
            } else {
                const wasCashier = isCashierUser;
                isCashierUser = true;
                sessionStorage.setItem('asel_user_session', JSON.stringify({
                    id: userId,
                    email: cashier.email || '',
                    isCashierUser: true
                }));
                if (!wasCashier) {
                    updateRoleUI();
                }
            }
        }
    } catch (err) {
        console.error('Quiet validation error:', err);
    }
}

// ==========================================
// AUTHENTICATION & SECURITY GUARD FLOW
// ==========================================
async function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'grid';
    
    // Update role-specific UI
    updateRoleUI();
    
    if (!isDashboardInitialized) {
        try {
            // SWR: Load cache instantly if it exists
            const cacheLoaded = loadStateFromLocalCache();
            if (cacheLoaded) {
                console.log('Dashboard SWR: Loading local cache instantly.');
                
                // Render cached data immediately
                renderGeneralOrders();
                renderHistoryTable();
                
                if (currentTab === 'stock') renderStockGrid();
                if (currentTab === 'suppliers') renderSuppliersTab();
                if (currentTab === 'analytics') renderAnalytics();
                if (currentTab === 'cashiers') renderCashiersTab();
                if (currentTab === 'settings') populateSettingsForm();
                
                tabPanelsContainer.style.display = 'block';
                adminLoader.style.display = 'none'; // Hide loader immediately
                
                // Run setups
                setupTabSwitching();
                setupProductFormModal();
                setupSupplierModal();
                setupDemoReset();
                setupAnalyticsFilter();
                setupInShopOrderModal();
                setupRealtime();
                setupSettingsForm();
                initPrinterSettings();
                setupExpensesFeature();
                setupDebtsFeature();
                
                const stockSearch = document.getElementById('stockSearchInput');
                if (stockSearch) {
                    stockSearch.addEventListener('input', renderStockGrid);
                }
                if (historySearchInput) {
                    historySearchInput.addEventListener('input', filterHistory);
                }
                isDashboardInitialized = true;
                
                // Quietly run background refresh from Supabase
                loadDashboardData(true);
            } else {
                // No cache available, blocking load
                adminLoader.style.display = 'flex';
                await loadDashboardData(false);
                
                setupTabSwitching();
                setupProductFormModal();
                setupSupplierModal();
                setupDemoReset();
                setupAnalyticsFilter();
                setupInShopOrderModal();
                setupRealtime();
                setupSettingsForm();
                initPrinterSettings();
                setupExpensesFeature();
                setupDebtsFeature();
                
                const stockSearch = document.getElementById('stockSearchInput');
                if (stockSearch) {
                    stockSearch.addEventListener('input', renderStockGrid);
                }
                if (historySearchInput) {
                    historySearchInput.addEventListener('input', filterHistory);
                }
                isDashboardInitialized = true;
            }
        } catch (err) {
            console.error('Initialization error:', err);
            alert('حدث خطأ أثناء تحميل لوحة التحكم. تأكد من اتصالك بسوبابيس.');
        } finally {
            adminLoader.style.display = 'none';
        }
    } else {
        adminLoader.style.display = 'none';
    }
}


let authCodesList = []; // Array to hold auth codes

function showLogin(customErrorMsg) {
    document.getElementById('adminLayout').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    adminLoader.style.display = 'none';
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoading = document.getElementById('loginBtnLoading');
    if (loginBtnText) loginBtnText.style.display = 'inline-block';
    if (loginBtnLoading) loginBtnLoading.style.display = 'none';

    const loginError = document.getElementById('loginError');
    if (loginError) {
        if (customErrorMsg) {
            loginError.textContent = customErrorMsg;
            loginError.style.display = 'block';
        } else {
            loginError.style.display = 'none';
        }
    }
}

function setupAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pin = document.getElementById('loginPin').value.trim();
            const loginBtnText = document.getElementById('loginBtnText');
            const loginBtnLoading = document.getElementById('loginBtnLoading');
            const loginError = document.getElementById('loginError');

            try {
                if (loginBtnText) loginBtnText.style.display = 'none';
                if (loginBtnLoading) loginBtnLoading.style.display = 'inline-block';
                if (loginError) loginError.style.display = 'none';

                if (!navigator.onLine) {
                    throw new Error('OfflineLoginNotSupported');
                }

                const { data, error } = await supabaseClient.from('auth_codes').select('role').eq('pin', pin).single();

                if (error || !data) {
                    throw new Error('Invalid code');
                }

                const role = data.role;
                sessionStorage.setItem('asel_session_role', role);
                isCashierUser = (role === 'cashier');
                
                await showDashboard();
            } catch (err) {
                console.error('Login error:', err);
                if (loginError) {
                    if (err.message === 'OfflineLoginNotSupported' || err.message.includes('fetch') || err.message.includes('NetworkError')) {
                        loginError.textContent = 'لا يمكن تسجيل الدخول دون اتصال بالإنترنت. يرجى تفعيل الإنترنت والمحاولة مجدداً.';
                    } else {
                        loginError.textContent = 'رمز الدخول غير صحيح.';
                    }
                    loginError.style.display = 'block';
                }
                if (loginBtnText) loginBtnText.style.display = 'inline-block';
                if (loginBtnLoading) loginBtnLoading.style.display = 'none';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                adminLoader.style.display = 'flex';
                sessionStorage.removeItem('asel_session_role');
                sessionStorage.removeItem('asel_user_session');
                // Optional: clear other cached data if needed
                showLogin();
            } catch (err) {
                console.error('Logout error:', err);
                alert('حدث خطأ أثناء تسجيل الخروج.');
            } finally {
                adminLoader.style.display = 'none';
            }
        });
    }
}

async function checkAuth() {
    try {
        adminLoader.style.display = 'flex';
        const role = sessionStorage.getItem('asel_session_role');
        
        if (role) {
            isCashierUser = (role === 'cashier');
            await showDashboard();
        } else {
            showLogin();
        }
    } catch (err) {
        console.error('Auth check error:', err);
        showLogin();
    }
}

// Function to update UI based on role
function updateRoleUI() {
    const settingsBtn = document.querySelector('.menu-item[data-tab="settings"]');
    const cashiersBtn = document.querySelector('.menu-item[data-tab="cashiers"]');
    const debtsBtn = document.querySelector('.menu-item[data-tab="debts"]');
    const analyticsBtn = document.querySelector('.menu-item[data-tab="analytics"]');
    const historyBtn = document.querySelector('.menu-item[data-tab="history"]');
    
    // Disable editing elements if cashier
    const editElements = document.querySelectorAll('.delete-btn, .edit-btn, #openAddProductModalBtn, #openAddSupplierModalBtn, #openInShopOrderModalBtn');

    if (isCashierUser) {
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (cashiersBtn) cashiersBtn.style.display = 'none';
        if (debtsBtn) debtsBtn.style.display = 'none';
        if (analyticsBtn) analyticsBtn.style.display = 'none';
        // Keep history for cashier, but hide delete buttons inside it
        
        editElements.forEach(el => {
            if (el.id !== 'openInShopOrderModalBtn') {
                el.style.display = 'none';
            }
        });
        
        // Hide Admin Barcode feature
        const adminBarcodeSection = document.getElementById('adminBarcodeSection');
        if (adminBarcodeSection) adminBarcodeSection.style.display = 'none';
        
    } else {
        if (settingsBtn) settingsBtn.style.display = 'flex';
        if (cashiersBtn) cashiersBtn.style.display = 'flex';
        if (debtsBtn) debtsBtn.style.display = 'flex';
        if (analyticsBtn) analyticsBtn.style.display = 'flex';
        
        editElements.forEach(el => el.style.display = '');
        
        const adminBarcodeSection = document.getElementById('adminBarcodeSection');
        if (adminBarcodeSection) adminBarcodeSection.style.display = 'block';
    }
}

function renderCashiersTab() {
    const cashierCodeDisplay = document.getElementById('cashierCodeDisplay');
    const regenerateBtn = document.getElementById('regenerateCashierCodeBtn');
    const changeAdminCodeForm = document.getElementById('changeAdminCodeForm');

    // Find current cashier code from loaded list
    const cashierData = authCodesList.find(c => c.role === 'cashier');
    if (cashierData && cashierCodeDisplay) {
        cashierCodeDisplay.value = cashierData.pin;
    }

    if (regenerateBtn && !regenerateBtn.dataset.bound) {
        regenerateBtn.dataset.bound = "true";
        regenerateBtn.addEventListener('click', async () => {
            if (confirm('هل أنت متأكد من توليد كود جديد للكاشير؟ الكود القديم سيتوقف عن العمل فوراً.')) {
                try {
                    regenerateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التوليد...';
                    regenerateBtn.disabled = true;
                    
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    
                    const { error } = await supabaseClient.from('auth_codes').update({ pin: newCode }).eq('role', 'cashier');
                    if (error) throw error;
                    
                    cashierCodeDisplay.value = newCode;
                    
                    // Update local list
                    const cData = authCodesList.find(c => c.role === 'cashier');
                    if (cData) cData.pin = newCode;

                    alert('تم تغيير كود الكاشير بنجاح.');
                } catch (err) {
                    console.error('Error generating new cashier code:', err);
                    alert('حدث خطأ أثناء تغيير كود الكاشير.');
                } finally {
                    regenerateBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate" style="margin-left: 5px;"></i>توليد كود جديد';
                    regenerateBtn.disabled = false;
                }
            }
        });
    }

    if (changeAdminCodeForm && !changeAdminCodeForm.dataset.bound) {
        changeAdminCodeForm.dataset.bound = "true";
        changeAdminCodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentCodeInput = document.getElementById('currentAdminCode').value;
            const newCodeInput = document.getElementById('newAdminCode').value;
            const submitBtn = changeAdminCodeForm.querySelector('button[type="submit"]');

            try {
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
                submitBtn.disabled = true;

                // Verify current code
                const adminData = authCodesList.find(c => c.role === 'admin');
                if (!adminData || adminData.pin !== currentCodeInput) {
                    alert('الكود الحالي للمدير غير صحيح. يرجى المحاولة مرة أخرى.');
                    return;
                }

                // Update code
                const { error } = await supabaseClient.from('auth_codes').update({ pin: newCodeInput }).eq('role', 'admin');
                if (error) throw error;

                // Update local list
                if (adminData) adminData.pin = newCodeInput;

                alert('تم تغيير كود المدير بنجاح! احتفظ به جيداً.');
                changeAdminCodeForm.reset();
            } catch (err) {
                console.error('Error changing admin code:', err);
                alert('حدث خطأ أثناء تغيير الكود.');
            } finally {
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-left: 5px;"></i>تغيير كود المدير';
                submitBtn.disabled = false;
            }
        });
    }
}

// ==========================================
// TAB: SETTINGS
function populateSettingsForm() {
    if (!websiteSettings) return;

    const setHeroTitle = document.getElementById('setHeroTitle');
    const setHeroSubtitle = document.getElementById('setHeroSubtitle');
    const setAboutText = document.getElementById('setAboutText');
    const setPhoneNumber = document.getElementById('setPhoneNumber');
    const setEmail = document.getElementById('setEmail');
    const setLocationUrl = document.getElementById('setLocationUrl');
    const setFacebookUrl = document.getElementById('setFacebookUrl');
    const setInstagramUrl = document.getElementById('setInstagramUrl');
    const setTiktokUrl = document.getElementById('setTiktokUrl');

    if (setHeroTitle) setHeroTitle.value = websiteSettings.hero_title || '';
    if (setHeroSubtitle) setHeroSubtitle.value = websiteSettings.hero_subtitle || '';
    if (setAboutText) setAboutText.value = websiteSettings.about_text || '';
    if (setPhoneNumber) setPhoneNumber.value = websiteSettings.phone_number || '';
    if (setEmail) setEmail.value = websiteSettings.email || '';
    if (setLocationUrl) setLocationUrl.value = websiteSettings.location_url || '';
    if (setFacebookUrl) setFacebookUrl.value = websiteSettings.facebook_url || '';
    if (setInstagramUrl) setInstagramUrl.value = websiteSettings.instagram_url || '';
    if (setTiktokUrl) setTiktokUrl.value = websiteSettings.tiktok_url || '';
}

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const setHeroTitle = document.getElementById('setHeroTitle').value.trim();
        const setHeroSubtitle = document.getElementById('setHeroSubtitle').value.trim();
        const setAboutText = document.getElementById('setAboutText').value.trim();
        const setPhoneNumber = document.getElementById('setPhoneNumber').value.trim();
        const setEmail = document.getElementById('setEmail').value.trim();
        const setLocationUrl = document.getElementById('setLocationUrl').value.trim();
        const setFacebookUrl = document.getElementById('setFacebookUrl').value.trim();
        const setInstagramUrl = document.getElementById('setInstagramUrl').value.trim();
        const setTiktokUrl = document.getElementById('setTiktokUrl').value.trim();

        if (!setHeroTitle || !setHeroSubtitle || !setAboutText || !setPhoneNumber || !setEmail || !setLocationUrl) {
            alert('الرجاء إدخال كافة الحقول الإلزامية.');
            return;
        }

        if (!navigator.onLine) {
            websiteSettings = {
                id: 1,
                hero_title: setHeroTitle,
                hero_subtitle: setHeroSubtitle,
                about_text: setAboutText,
                phone_number: setPhoneNumber,
                email: setEmail,
                location_url: setLocationUrl,
                facebook_url: setFacebookUrl || null,
                instagram_url: setInstagramUrl || null,
                tiktok_url: setTiktokUrl || null,
                updated_at: new Date().toISOString()
            };
            saveStateToLocalCache();
            queueOfflineAction('UPDATE_SETTINGS', websiteSettings);

            // Save printer settings if in Electron
            if (window.electronAPI) {
                const receiptPrinter = document.getElementById('setReceiptPrinter').value;
                const barcodePrinter = document.getElementById('setBarcodePrinter').value;
                localStorage.setItem('receiptPrinterName', receiptPrinter);
                localStorage.setItem('barcodePrinterName', barcodePrinter);
            }

            alert('تم حفظ إعدادات المتجر محلياً (دون اتصال). سيتم تحديثها في الموقع الإلكتروني فور عودة الإنترنت.');
            populateSettingsForm();
            return;
        }

        try {
            adminLoader.style.display = 'flex';

            const { data, error } = await supabaseClient
                .from('settings')
                .update({
                    hero_title: setHeroTitle,
                    hero_subtitle: setHeroSubtitle,
                    about_text: setAboutText,
                    phone_number: setPhoneNumber,
                    email: setEmail,
                    location_url: setLocationUrl,
                    facebook_url: setFacebookUrl || null,
                    instagram_url: setInstagramUrl || null,
                    tiktok_url: setTiktokUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 1)
                .select()
                .single();

            if (error) throw error;
            websiteSettings = data;

            // Save printer settings if in Electron
            if (window.electronAPI) {
                const receiptPrinter = document.getElementById('setReceiptPrinter').value;
                const barcodePrinter = document.getElementById('setBarcodePrinter').value;
                localStorage.setItem('receiptPrinterName', receiptPrinter);
                localStorage.setItem('barcodePrinterName', barcodePrinter);
            }

            alert('تم حفظ إعدادات المتجر بنجاح وتحديثها في الموقع الإلكتروني!');
            populateSettingsForm();
        } catch (err) {
            console.error('Error saving settings:', err);
            alert(err.message || 'حدث خطأ أثناء حفظ الإعدادات.');
        } finally {
            adminLoader.style.display = 'none';
        }
    });
}

// Initialize Desktop Printer settings
async function initPrinterSettings() {
    if (!window.electronAPI) return; // Only run in desktop app
    
    document.getElementById('printerSettingsTitle').style.display = 'block';
    document.getElementById('printerSettingsDesc').style.display = 'block';
    document.getElementById('printerSettingsDivider').style.display = 'block';
    document.getElementById('printerSettingsRow').style.display = 'flex';
    
    try {
        const printers = await window.electronAPI.getPrinters();
        const receiptSelect = document.getElementById('setReceiptPrinter');
        const barcodeSelect = document.getElementById('setBarcodePrinter');
        
        // Save current selections
        const savedReceipt = localStorage.getItem('receiptPrinterName') || '';
        const savedBarcode = localStorage.getItem('barcodePrinterName') || '';
        
        printers.forEach(p => {
            const opt1 = document.createElement('option');
            opt1.value = p.name;
            opt1.textContent = p.displayName || p.name;
            if (p.name === savedReceipt) opt1.selected = true;
            receiptSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = p.name;
            opt2.textContent = p.displayName || p.name;
            if (p.name === savedBarcode) opt2.selected = true;
            barcodeSelect.appendChild(opt2);
        });
    } catch (err) {
        console.error("Failed to load printers:", err);
    }
}

// Helper to update UI elements based on user role (manager vs cashier)
function updateRoleUI() {
    const profileSpan = document.querySelector('.user-profile span');
    if (profileSpan) {
        profileSpan.textContent = isCashierUser ? 'كاشير المتجر' : 'مدير المتجر';
    }
    
    const cashiersTabBtn = document.querySelector('.menu-item[data-tab="cashiers"]');
    if (cashiersTabBtn) {
        cashiersTabBtn.style.display = isCashierUser ? 'none' : 'flex';
    }
    
    const addProductBtn = document.getElementById('openAddProductModalBtn');
    if (addProductBtn) {
        addProductBtn.style.display = isCashierUser ? 'none' : 'inline-block';
    }
    
    const inShopPriceInput = document.getElementById('inShopPriceInput');
    if (inShopPriceInput) {
        inShopPriceInput.readOnly = true;
        inShopPriceInput.style.backgroundColor = '#f1f2f6';
        inShopPriceInput.style.cursor = 'not-allowed';
    }
    
    if (isCashierUser && currentTab === 'cashiers') {
        currentTab = 'general';
        sidebarMenuItems.forEach(item => {
            if (item.getAttribute('data-tab') === 'general') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        tabPanels.forEach(panel => {
            if (panel.id === 'tab-general') {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        updateTabTitle('general');
    }
}

// Background validation of user's cashier status
async function validateCashierSessionQuietly(userId) {
    try {
        const { data: cashier, error: cErr } = await supabaseClient
            .from('cashiers')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (cErr) {
            if (cErr.code === 'PGRST116') { // PGRST116 means user is not a cashier (so they are an admin)
                if (isCashierUser) {
                    isCashierUser = false;
                    sessionStorage.setItem('asel_user_session', JSON.stringify({
                        id: userId,
                        email: '',
                        isCashierUser: false
                    }));
                    updateRoleUI();
                }
            } else {
                console.error('Background cashier check error:', cErr);
            }
            return;
        }
        
        if (cashier) {
            if (cashier.status === 'pending') {
                await supabaseClient.auth.signOut();
                showLogin('طلب انضمامك ككاشير قيد الانتظار لموافقة مدير المتجر.');
            } else if (cashier.status === 'rejected') {
                await supabaseClient.auth.signOut();
                showLogin('تم رفض طلب انضمامك ككاشير من طرف مدير المتجر.');
            } else {
                const wasCashier = isCashierUser;
                isCashierUser = true;
                sessionStorage.setItem('asel_user_session', JSON.stringify({
                    id: userId,
                    email: cashier.email || '',
                    isCashierUser: true
                }));
                if (!wasCashier) {
                    updateRoleUI();
                }
            }
        }
    } catch (err) {
        console.error('Quiet validation error:', err);
    }
}

// ==========================================
// AUTHENTICATION & SECURITY GUARD FLOW
// ==========================================
async function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'grid';
    
    // Update role-specific UI
    updateRoleUI();
    
    if (!isDashboardInitialized) {
        try {
            // SWR: Load cache instantly if it exists
            const cacheLoaded = loadStateFromLocalCache();
            if (cacheLoaded) {
                console.log('Dashboard SWR: Loading local cache instantly.');
                
                // Render cached data immediately
                renderGeneralOrders();
                renderHistoryTable();
                
                if (currentTab === 'stock') renderStockGrid();
                if (currentTab === 'suppliers') renderSuppliersTab();
                if (currentTab === 'analytics') renderAnalytics();
                if (currentTab === 'cashiers') renderCashiersTab();
                if (currentTab === 'settings') populateSettingsForm();
                
                tabPanelsContainer.style.display = 'block';
                adminLoader.style.display = 'none'; // Hide loader immediately
                
                // Run setups
                setupTabSwitching();
                setupProductFormModal();
                setupSupplierModal();
                setupDemoReset();
                setupAnalyticsFilter();
                setupInShopOrderModal();
                setupRealtime();
                setupSettingsForm();
                initPrinterSettings();
                setupExpensesFeature();
                setupDebtsFeature();
                
                const stockSearch = document.getElementById('stockSearchInput');
                if (stockSearch) {
                    stockSearch.addEventListener('input', renderStockGrid);
                }
                if (historySearchInput) {
                    historySearchInput.addEventListener('input', filterHistory);
                }
                isDashboardInitialized = true;
                
                // Quietly run background refresh from Supabase
                loadDashboardData(true);
            } else {
                // No cache available, blocking load
                adminLoader.style.display = 'flex';
                await loadDashboardData(false);
                
                setupTabSwitching();
                setupProductFormModal();
                setupSupplierModal();
                setupDemoReset();
                setupAnalyticsFilter();
                setupInShopOrderModal();
                setupRealtime();
                setupSettingsForm();
                initPrinterSettings();
                setupExpensesFeature();
                setupDebtsFeature();
                
                const stockSearch = document.getElementById('stockSearchInput');
                if (stockSearch) {
                    stockSearch.addEventListener('input', renderStockGrid);
                }
                if (historySearchInput) {
                    historySearchInput.addEventListener('input', filterHistory);
                }
                isDashboardInitialized = true;
            }
        } catch (err) {
            console.error('Initialization error:', err);
            alert('حدث خطأ أثناء تحميل لوحة التحكم. تأكد من اتصالك بسوبابيس.');
        } finally {
            adminLoader.style.display = 'none';
        }
    } else {
        adminLoader.style.display = 'none';
    }
}


// ==========================================
// OFFLINE SYNC SYSTEM
// ==========================================
let isSyncingActions = false;

async function syncOfflineActions() {
    if (isSyncingActions) return;
    if (!navigator.onLine) return;

    let actionsQueue = [];
    try {
        actionsQueue = JSON.parse(localStorage.getItem('asel_offline_actions_queue') || '[]');
    } catch (e) {
        actionsQueue = [];
    }

    if (actionsQueue.length === 0) {
        await syncOfflineOrders();
        return;
    }

    try {
        isSyncingActions = true;
        const syncBadge = document.getElementById('syncStatusBadge');
        if (syncBadge) syncBadge.style.display = 'flex';

        console.log(`Starting synchronization of ${actionsQueue.length} offline dashboard actions...`);

        for (let i = 0; i < actionsQueue.length; i++) {
            const action = actionsQueue[i];
            const { type, payload } = action;

            if (type === 'CREATE_PRODUCT') {
                const { temp_id, name, description, price, purchase_price, images, supplier_name, supplier_phone, barcode, stockVariants } = payload;
                
                const finalImages = [];
                for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
                    const img = images[imgIdx];
                    if (img.startsWith('data:image/')) {
                        const fileExt = img.split(';')[0].split('/')[1] || 'jpg';
                        const fileName = `off_prod_${Date.now()}_${Math.floor(Math.random()*1000)}.${fileExt}`;
                        const file = dataURLtoFile(img, fileName);

                        const { error: uploadError } = await supabaseClient.storage
                            .from('product-images')
                            .upload(fileName, file);

                        if (uploadError) {
                            console.error('Offline sync image upload error:', uploadError);
                            throw uploadError;
                        }

                        const { data: publicUrlData } = supabaseClient.storage
                            .from('product-images')
                            .getPublicUrl(fileName);
                        
                        finalImages.push(publicUrlData.publicUrl);
                    } else {
                        finalImages.push(img);
                    }
                }

                const { data: newProd, error: pErr } = await supabaseClient
                    .from('products')
                    .insert({
                        name,
                        description,
                        price,
                        purchase_price,
                        images: finalImages,
                        supplier_name,
                        supplier_phone,
                        barcode
                    })
                    .select()
                    .single();

                if (pErr) throw pErr;

                const stockInserts = stockVariants.map(v => ({
                    product_id: newProd.id,
                    size: v.size,
                    color: v.color,
                    quantity: v.quantity
                }));

                const { error: sErr } = await supabaseClient
                    .from('stock')
                    .insert(stockInserts);

                if (sErr) throw sErr;

                for (let j = i + 1; j < actionsQueue.length; j++) {
                    const nextAct = actionsQueue[j];
                    if (nextAct.payload.product_id === temp_id) {
                        nextAct.payload.product_id = newProd.id;
                    }
                }

                let ordersQueue = [];
                try {
                    ordersQueue = JSON.parse(localStorage.getItem('asel_offline_orders_queue') || '[]');
                } catch (e) {}

                let orderQueueChanged = false;
                ordersQueue.forEach(ticket => {
                    ticket.items.forEach(item => {
                        if (item.product_id === temp_id) {
                            item.product_id = newProd.id;
                            orderQueueChanged = true;
                        }
                    });
                });

                if (orderQueueChanged) {
                    localStorage.setItem('asel_offline_orders_queue', JSON.stringify(ordersQueue));
                }

            } else if (type === 'EDIT_PRODUCT') {
                const { product_id, name, description, price, purchase_price, images, supplier_name, supplier_phone, barcode, stockVariants } = payload;

                const finalImages = [];
                for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
                    const img = images[imgIdx];
                    if (img.startsWith('data:image/')) {
                        const fileExt = img.split(';')[0].split('/')[1] || 'jpg';
                        const fileName = `off_prod_${Date.now()}_${Math.floor(Math.random()*1000)}.${fileExt}`;
                        const file = dataURLtoFile(img, fileName);

                        const { error: uploadError } = await supabaseClient.storage
                            .from('product-images')
                            .upload(fileName, file);

                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabaseClient.storage
                            .from('product-images')
                            .getPublicUrl(fileName);
                        
                        finalImages.push(publicUrlData.publicUrl);
                    } else {
                        finalImages.push(img);
                    }
                }

                const { error: pErr } = await supabaseClient
                    .from('products')
                    .update({
                        name,
                        description,
                        price,
                        purchase_price,
                        images: finalImages,
                        supplier_name,
                        supplier_phone,
                        barcode
                    })
                    .eq('id', product_id);

                if (pErr) throw pErr;

                await supabaseClient.from('stock').delete().eq('product_id', product_id);

                const stockInserts = stockVariants.map(v => ({
                    product_id,
                    size: v.size,
                    color: v.color,
                    quantity: v.quantity
                }));

                const { error: sErr } = await supabaseClient
                    .from('stock')
                    .insert(stockInserts);

                if (sErr) throw sErr;

            } else if (type === 'DELETE_PRODUCT') {
                const { product_id } = payload;
                const { error: err } = await supabaseClient
                    .from('products')
                    .delete()
                    .eq('id', product_id);
                if (err) throw err;

            } else if (type === 'TOGGLE_PRODUCT_STATUS') {
                const { product_id, is_active } = payload;
                const { error: err } = await supabaseClient
                    .from('products')
                    .update({ is_active })
                    .eq('id', product_id);
                if (err) throw err;

            } else if (type === 'UPDATE_SETTINGS') {
                const { error: err } = await supabaseClient
                    .from('settings')
                    .update({
                        hero_title: payload.hero_title,
                        hero_subtitle: payload.hero_subtitle,
                        about_text: payload.about_text,
                        phone_number: payload.phone_number,
                        email: payload.email,
                        location_url: payload.location_url,
                        facebook_url: payload.facebook_url,
                        instagram_url: payload.instagram_url,
                        tiktok_url: payload.tiktok_url,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', 1);
                if (err) throw err;

            } else if (type === 'CREATE_EXPENSE') {
                const { id, amount, reason, cashier_name, created_at } = payload;
                const insertPayload = {
                    amount,
                    reason,
                    cashier_name,
                    created_at
                };
                if (id && id.indexOf('exp_') !== 0) {
                    insertPayload.id = id;
                }
                const { error: err } = await supabaseClient
                    .from('expenses')
                    .insert(insertPayload);
                if (err) throw err;

            } else if (type === 'DELETE_EXPENSE') {
                const { id } = payload;
                if (id && id.indexOf('exp_') !== 0) {
                    const { error: err } = await supabaseClient
                        .from('expenses')
                        .delete()
                        .eq('id', id);
                    if (err) throw err;
                }
            } else if (type === 'RECORD_DEBT_PAYMENT') {
                const { debt_id, amount, cashier, date, invoice_number } = payload;
                if (debt_id && debt_id.indexOf('temp_debt_') === 0) {
                    continue;
                }
                
                const { data: dbDebt, error: fetchErr } = await supabaseClient
                    .from('debts')
                    .select('paid_amount, total_amount, history')
                    .eq('id', debt_id)
                    .single();
                
                if (fetchErr) throw fetchErr;

                const newPaid = Number(dbDebt.paid_amount) + Number(amount);
                const newStatus = (dbDebt.total_amount - newPaid) <= 0 ? 'paid' : 'unpaid';
                const paymentLog = {
                    date: date,
                    amount: amount,
                    cashier: cashier,
                    invoice_number: invoice_number
                };
                const newHistory = [...(dbDebt.history || []), paymentLog];

                const { error: updateErr } = await supabaseClient
                    .from('debts')
                    .update({
                        paid_amount: newPaid,
                        status: newStatus,
                        history: newHistory
                    })
                    .eq('id', debt_id);

                if (updateErr) throw updateErr;

            } else if (type === 'DELETE_DEBT') {
                const { id } = payload;
                if (id && id.indexOf('temp_debt_') === 0) {
                    continue;
                }
                const { error: err } = await supabaseClient
                    .from('debts')
                    .delete()
                    .eq('id', id);
                if (err) throw err;
            }
        }

        localStorage.removeItem('asel_offline_actions_queue');
        console.log('All offline dashboard actions synchronized successfully.');
        alert('تمت مزامنة جميع تعديلات المنتجات والمخزون والإعدادات مع السحابة بنجاح!');

        await syncOfflineOrders();
    } catch (err) {
        console.error('Failed to sync offline actions:', err);
        alert('حدث خطأ أثناء مزامنة تعديلات المخزون المحلية مع السحابة. سيتم المحاولة مجدداً عند استقرار الاتصال.');
    } finally {
        isSyncingActions = false;
        const syncBadge = document.getElementById('syncStatusBadge');
        if (syncBadge) syncBadge.style.display = 'none';
        await loadDashboardData();
    }
}

let isSyncing = false;

async function syncOfflineOrders() {
    if (isSyncing) return;
    
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('asel_offline_orders_queue') || '[]');
    } catch(e) {
        queue = [];
    }

    if (queue.length === 0) return;
    if (!navigator.onLine) return;

    try {
        isSyncing = true;
        const syncBadge = document.getElementById('syncStatusBadge');
        if (syncBadge) syncBadge.style.display = 'flex';

        console.log(`Starting synchronization of ${queue.length} offline tickets...`);

        for (let i = 0; i < queue.length; i++) {
            const ticket = queue[i];
            
            for (const item of ticket.items) {
                const { data: latestStock, error: fetchErr } = await supabaseClient
                    .from('stock')
                    .select('*')
                    .eq('product_id', item.product_id)
                    .eq('color', item.color)
                    .eq('size', item.size)
                    .single();
                
                if (!fetchErr && latestStock) {
                    const newQty = Math.max(0, latestStock.quantity - item.qty);
                    await supabaseClient
                        .from('stock')
                        .update({ quantity: newQty })
                        .eq('id', latestStock.id);
                }
            }

            const cName = ticket.client_name || 'زبون حضوري';
            const cPhone = ticket.phone || 'المحل';

            const ordersPayload = ticket.items.map(item => ({
                client_name: cName,
                phone: cPhone,
                wilaya: 'المحل',
                baladiya: 'المحل',
                delivery_type: 'استلام من المحل',
                product_id: item.product_id,
                product_name: item.product_name,
                size: item.size,
                color: item.color,
                total_price: item.price * item.qty,
                status: 'مؤكد',
                created_at: ticket.printed_at
            }));

            const { data: insertedOrders, error: orderErr } = await supabaseClient
                .from('orders')
                .insert(ordersPayload)
                .select();
            
            if (orderErr) throw orderErr;

            const { data: firstInvoice, error: invErr1 } = await supabaseClient
                .from('invoices')
                .insert({
                    order_id: insertedOrders[0].id,
                    client_name: cName,
                    phone: cPhone,
                    wilaya: 'المحل',
                    baladiya: 'المحل',
                    delivery_type: 'استلام من المحل',
                    product_name: ticket.items[0].product_name,
                    size: ticket.items[0].size,
                    color: ticket.items[0].color,
                    total_price: ticket.items[0].price * ticket.items[0].qty,
                    printed_at: ticket.printed_at
                })
                .select()
                .single();
            
            if (invErr1) throw invErr1;

            if (insertedOrders.length > 1) {
                const remainingInvoicesPayload = insertedOrders.slice(1).map((ord, idx) => {
                    const item = ticket.items[idx + 1];
                    return {
                        order_id: ord.id,
                        invoice_number: firstInvoice.invoice_number,
                        printed_at: firstInvoice.printed_at,
                        client_name: cName,
                        phone: cPhone,
                        wilaya: 'المحل',
                        baladiya: 'المحل',
                        delivery_type: 'استلام من المحل',
                        product_name: item.product_name,
                        size: item.size,
                        color: item.color,
                        total_price: item.price * item.qty
                    };
                });

                const { error: invErr2 } = await supabaseClient
                    .from('invoices')
                    .insert(remainingInvoicesPayload);
                
                if (invErr2) throw invErr2;
            }

            // Sync layout/debt if this ticket is a partial payment layaway
            if (ticket.isDebt) {
                const dbtCacheStr = localStorage.getItem('asel_debts_cache');
                let localDebts = [];
                try {
                    if (dbtCacheStr) localDebts = JSON.parse(dbtCacheStr);
                } catch(e) {}

                const matchingLocalDebt = localDebts.find(d => d.invoice_number === ticket.invoice_number);
                if (matchingLocalDebt) {
                    const updatedHistory = (matchingLocalDebt.history || []).map(h => ({
                        ...h,
                        invoice_number: firstInvoice.invoice_number
                    }));

                    const { error: debtErr } = await supabaseClient
                        .from('debts')
                        .insert({
                            client_name: matchingLocalDebt.client_name,
                            phone: matchingLocalDebt.phone,
                            total_amount: matchingLocalDebt.total_amount,
                            paid_amount: matchingLocalDebt.paid_amount,
                            products: matchingLocalDebt.products,
                            status: matchingLocalDebt.status,
                            history: updatedHistory,
                            invoice_number: firstInvoice.invoice_number,
                            created_at: ticket.printed_at
                        });
                    if (debtErr) console.error('Failed to insert debt during sync:', debtErr);
                } else {
                    const { error: debtErr } = await supabaseClient
                        .from('debts')
                        .insert({
                            client_name: cName,
                            phone: cPhone,
                            total_amount: ticket.items.reduce((sum, item) => sum + (item.price * item.qty), 0) - (ticket.remise || 0),
                            paid_amount: ticket.paidAmount,
                            products: ticket.items.map(item => ({
                                name: item.product_name,
                                color: item.color,
                                size: item.size,
                                qty: item.qty,
                                price: item.price
                            })),
                            status: 'unpaid',
                            history: ticket.paidAmount > 0 ? [{
                                date: ticket.printed_at,
                                amount: ticket.paidAmount,
                                cashier: getCurrentUserName(),
                                invoice_number: firstInvoice.invoice_number
                            }] : [],
                            invoice_number: firstInvoice.invoice_number,
                            created_at: ticket.printed_at
                        });
                    if (debtErr) console.error('Failed to insert debt during sync fallback:', debtErr);
                }
            }
        }

        localStorage.removeItem('asel_offline_orders_queue');
        console.log('All offline tickets synchronized successfully.');

        await loadDashboardData();
        
        alert('تمت مزامنة جميع الطلبات المسجلة دون اتصال بالإنترنت بنجاح مع السحابة!');
    } catch (err) {
        console.error('Failed to sync offline orders:', err);
        alert('حدث خطأ أثناء مزامنة الطلبات المحلية مع السحابة. سيتم المحاولة مجدداً عند استقرار الاتصال.');
    } finally {
        isSyncing = false;
        const syncBadge = document.getElementById('syncStatusBadge');
        if (syncBadge) syncBadge.style.display = 'none';
    }
}

// Function to update the visual indicator of connection status
function updateConnectionStatusUI() {
    const badge = document.getElementById('connectionStatusBadge');
    const dot = document.getElementById('connectionStatusDot');
    const text = document.getElementById('connectionStatusText');

    if (!badge || !dot || !text) return;

    if (navigator.onLine) {
        badge.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        badge.style.color = '#2ecc71';
        dot.style.backgroundColor = '#2ecc71';
        text.textContent = 'متصل بالإنترنت';
        
        syncOfflineActions();
    } else {
        badge.style.backgroundColor = 'rgba(231, 76, 60, 0.15)';
        badge.style.color = '#e74c3c';
        dot.style.backgroundColor = '#e74c3c';
        text.textContent = 'دون اتصال بالإنترنت';
    }
}

// Listen to browser network changes
window.addEventListener('online', updateConnectionStatusUI);
window.addEventListener('offline', updateConnectionStatusUI);

// PWA Installation Prompt Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
});

window.addEventListener('appinstalled', (evt) => {
    console.log('Asel Butik PWA was installed.');
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});

// Initial check on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatusUI();
    
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }
});
