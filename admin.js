// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Variables
let currentTab = 'general';
let productsList = [];
let stockList = [];
let ordersList = [];
let invoicesList = [];
let addedStockVariants = []; // temp list for the Add Product modal

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
document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitching();
    loadDashboardData();
    setupProductFormModal();
    setupDemoReset();
    historySearchInput.addEventListener('input', filterHistory);
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
            } else if (tabId === 'analytics') {
                renderAnalytics();
            }
        });
    });
}

function updateTabTitle(tabId) {
    const titles = {
        'general': 'الطلبات الجديدة',
        'history': 'الأرشيف والوصولات المطبوعة',
        'stock': 'إدارة مخزون البوتيك',
        'analytics': 'الإحصائيات والتقارير المالية'
    };
    tabTitle.textContent = titles[tabId] || 'لوحة التحكم';
}

// Fetch all data from Supabase
async function loadDashboardData() {
    try {
        adminLoader.style.display = 'flex';
        tabPanelsContainer.style.display = 'none';

        // 1. Fetch products
        const { data: products, error: pErr } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (pErr) throw pErr;
        productsList = products;

        // 2. Fetch stock
        const { data: stock, error: sErr } = await supabaseClient
            .from('stock')
            .select('*');
        if (sErr) throw sErr;
        stockList = stock;

        // 3. Fetch orders
        const { data: orders, error: oErr } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (oErr) throw oErr;
        ordersList = orders;

        // 4. Fetch invoices
        const { data: invoices, error: iErr } = await supabaseClient
            .from('invoices')
            .select('*')
            .order('printed_at', { ascending: false });
        if (iErr) throw iErr;
        invoicesList = invoices;

        // Render sections
        renderGeneralOrders();
        renderHistoryTable();
        
        if (currentTab === 'stock') renderStockGrid();
        if (currentTab === 'analytics') renderAnalytics();

        tabPanelsContainer.style.display = 'block';
    } catch (err) {
        console.error('Error loading admin data:', err);
        alert('حدث خطأ أثناء تحميل لوحة التحكم. تأكد من اتصالك بسوبابيس.');
    } finally {
        adminLoader.style.display = 'none';
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
        document.getElementById('printInvoiceNumber').textContent = newInvoice.invoice_number;
        document.getElementById('printInvoiceDate').textContent = new Date(newInvoice.printed_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
        });
        document.getElementById('printClientName').textContent = newInvoice.client_name;
        document.getElementById('printClientPhone').textContent = newInvoice.phone;
        document.getElementById('printClientWilaya').textContent = newInvoice.wilaya;
        document.getElementById('printClientBaladiya').textContent = newInvoice.baladiya;
        document.getElementById('printDeliveryType').textContent = newInvoice.delivery_type;
        document.getElementById('printProdName').textContent = newInvoice.product_name;
        document.getElementById('printProdColor').textContent = newInvoice.color;
        document.getElementById('printProdSize').textContent = newInvoice.size;
        document.getElementById('printTotalAmount').textContent = Number(newInvoice.total_price).toLocaleString('ar-DZ') + ' د.ج';

        // Reload data from DB
        await loadDashboardData();
        
        // Open Print dialogue
        window.print();

    } catch (err) {
        console.error('Error confirming order:', err);
        alert('حدث خطأ أثناء تأكيد الطلب.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Action: Cancel Order (Restores Stock quantity)
async function cancelOrder(order) {
    const confirmed = await showConfirmModal('إلغاء الطلب', `هل أنت متأكد من إلغاء طلب الزبون: ${order.client_name}؟ (ستتم استعادة كمية المخزون)`);
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

    invoices.forEach(inv => {
        const tr = document.createElement('tr');
        const formattedDate = new Date(inv.printed_at).toLocaleDateString('ar-DZ', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        });

        tr.innerHTML = `
            <td style="font-family: var(--font-serif); font-weight: bold;">#${inv.invoice_number}</td>
            <td>${formattedDate}</td>
            <td>
                <strong>${inv.client_name}</strong><br>
                <small style="color: var(--text-muted);">${inv.phone}</small>
            </td>
            <td>${inv.product_name}</td>
            <td>${inv.color} / <span style="font-family: var(--font-serif);">${inv.size}</span></td>
            <td>${inv.wilaya.split('. ')[1] || inv.wilaya}</td>
            <td>${inv.delivery_type}</td>
            <td style="font-family: var(--font-serif); font-weight: bold; color: var(--success-color);">${Number(inv.total_price).toLocaleString('ar-DZ')} د.ج</td>
            <td>
                <button class="btn btn-sm btn-print reprint-btn" data-id="${inv.id}"><i class="fa-solid fa-print"></i> إعادة طبع</button>
            </td>
        `;

        tr.querySelector('.reprint-btn').addEventListener('click', () => reprintInvoice(inv));
        historyTableBody.appendChild(tr);
    });
}

function reprintInvoice(inv) {
    document.getElementById('printInvoiceNumber').textContent = inv.invoice_number;
    document.getElementById('printInvoiceDate').textContent = new Date(inv.printed_at).toLocaleDateString('ar-DZ', {
        hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
    });
    document.getElementById('printClientName').textContent = inv.client_name;
    document.getElementById('printClientPhone').textContent = inv.phone;
    document.getElementById('printClientWilaya').textContent = inv.wilaya;
    document.getElementById('printClientBaladiya').textContent = inv.baladiya;
    document.getElementById('printDeliveryType').textContent = inv.delivery_type;
    document.getElementById('printProdName').textContent = inv.product_name;
    document.getElementById('printProdColor').textContent = inv.color;
    document.getElementById('printProdSize').textContent = inv.size;
    document.getElementById('printTotalAmount').textContent = Number(inv.total_price).toLocaleString('ar-DZ') + ' د.ج';

    window.print();
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

    productsList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'stock-product-card';

        const img = product.images[0] || './images/kaftan_gold_1.png';
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

        card.innerHTML = `
            <div class="stock-product-info">
                <div class="stock-product-header">
                    <img class="stock-product-image" src="${img}" alt="${product.name}">
                    <div class="stock-product-meta">
                        <h3>${product.name}</h3>
                        <p>${price}</p>
                    </div>
                </div>
            </div>
            <div class="stock-levels-list">
                <div class="stock-levels-title">تفاصيل المخزون:</div>
                ${stockRowsHtml}
            </div>
            <div class="stock-card-footer">
                <button class="btn btn-sm btn-outline edit-prod-btn" data-id="${product.id}"><i class="fa-solid fa-pen-to-square"></i> تعديل</button>
                <button class="btn btn-sm btn-danger delete-prod-btn" data-id="${product.id}"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;

        card.querySelector('.edit-prod-btn').addEventListener('click', () => openEditProductModal(product));
        card.querySelector('.delete-prod-btn').addEventListener('click', () => deleteProduct(product));

        adminProductsGrid.appendChild(card);
    });
}

// Setup Product add/edit modal form
function setupProductFormModal() {
    openAddProductModalBtn.addEventListener('click', () => {
        // Clear form for addition
        document.getElementById('formProductId').value = '';
        productForm.reset();
        document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
        addedStockVariants = [];
        renderAddedStockTable();
        addProductModal.classList.add('active');
    });

    closeProductFormModalBtn.addEventListener('click', () => {
        addProductModal.classList.remove('active');
    });

    // Handle adding stock variant row in the modal form
    addStockRowBtn.addEventListener('click', () => {
        const color = document.getElementById('creatorColor').value.trim();
        const size = document.getElementById('creatorSize').value;
        const qty = parseInt(document.getElementById('creatorQty').value);

        if (!color) {
            alert('يرجى تحديد لون أولاً.');
            return;
        }
        if (isNaN(qty) || qty < 0) {
            alert('الكمية غير صالحة.');
            return;
        }

        // Check if variant already added to the list
        const existingIdx = addedStockVariants.findIndex(v => v.color === color && v.size === size);
        if (existingIdx > -1) {
            addedStockVariants[existingIdx].quantity = qty; // overwrite qty
        } else {
            addedStockVariants.push({ color, size, quantity: qty });
        }

        document.getElementById('creatorColor').value = '';
        renderAddedStockTable();
    });

    // Form Submit
    productForm.addEventListener('submit', handleProductFormSubmit);
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
        tr.innerHTML = `
            <td>${variant.color}</td>
            <td>${variant.size}</td>
            <td><strong>${variant.quantity}</strong></td>
            <td><button type="button" class="btn-sm btn-danger remove-var-btn" data-idx="${idx}"><i class="fa-solid fa-times"></i></button></td>
        `;
        tr.querySelector('.remove-var-btn').addEventListener('click', () => {
            addedStockVariants.splice(idx, 1);
            renderAddedStockTable();
        });
        addedStockTableBody.appendChild(tr);
    });
}

// Open modal in EDIT mode
function openEditProductModal(product) {
    document.getElementById('formProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodImages').value = product.images.join(', ');
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج ومخزونه';
    
    // Load variants
    const pStock = stockList.filter(s => s.product_id === product.id);
    addedStockVariants = pStock.map(s => ({ color: s.color, size: s.size, quantity: s.quantity }));
    renderAddedStockTable();

    addProductModal.classList.add('active');
}

// Handle Add/Edit Product Submission to Supabase
async function handleProductFormSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('formProductId').value;
    const name = document.getElementById('prodName').value.trim();
    const description = document.getElementById('prodDesc').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const imagesStr = document.getElementById('prodImages').value.trim();
    
    if (addedStockVariants.length === 0) {
        alert('الرجاء إضافة خيار واحد على الأقل للمخزون (لون ومقاس).');
        return;
    }

    // Split image URLs
    const images = imagesStr.split(',').map(url => url.trim()).filter(url => url !== '');

    try {
        adminLoader.style.display = 'flex';
        addProductModal.classList.remove('active');

        let targetProductId = productId;

        if (productId) {
            // EDIT Product
            const { error: pErr } = await supabaseClient
                .from('products')
                .update({ name, description, price, images })
                .eq('id', productId);
            if (pErr) throw pErr;

            // Clear old stock for this product to replace with new configurations
            await supabaseClient.from('stock').delete().eq('product_id', productId);
        } else {
            // ADD Product
            const { data: newProd, error: pErr } = await supabaseClient
                .from('products')
                .insert({ name, description, price, images })
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
    } catch (err) {
        console.error('Error saving product:', err);
        alert('حدث خطأ أثناء حفظ المنتج والمخزون.');
    } finally {
        adminLoader.style.display = 'none';
    }
}

// Delete Product
async function deleteProduct(product) {
    const confirmed = await showConfirmModal('حذف المنتج', `هل أنت متأكد من رغبتك في حذف المنتج: "${product.name}" بشكل نهائي؟ سيتم حذف المخزون المرتبط به كذلك.`);
    if (!confirmed) {
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

// TAB 4: ANALYTICS (CALCULATIONS & CHART.JS)
function renderAnalytics() {
    // 1. Calculations
    const totalEarnings = invoicesList.reduce((sum, inv) => sum + Number(inv.total_price), 0);
    const completedCount = invoicesList.length;
    const totalStock = stockList.reduce((sum, item) => sum + item.quantity, 0);

    statTotalEarnings.textContent = totalEarnings.toLocaleString('ar-DZ') + ' د.ج';
    statCompletedOrders.textContent = completedCount;
    statTotalStock.textContent = totalStock + ' قطعة';

    // 2. Best selling products list
    // Group invoices by product_name
    const salesByProduct = {};
    invoicesList.forEach(inv => {
        salesByProduct[inv.product_name] = (salesByProduct[inv.product_name] || 0) + 1;
    });

    const sortedProducts = Object.entries(salesByProduct)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales);

    topSellingList.innerHTML = '';
    if (sortedProducts.length === 0) {
        topSellingList.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size:13px; padding: 15px;">لا توجد مبيعات مسجلة لعرض المنتجات الأكثر مبيعاً.</p>';
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

    // 3. Render Daily Sales Chart (Chart.js)
    // Group invoices by date
    const salesByDate = {};
    // Let's create labels for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
        salesByDate[dateStr] = 0;
    }

    invoicesList.forEach(inv => {
        const dateStr = new Date(inv.printed_at).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'numeric' });
        if (salesByDate[dateStr] !== undefined) {
            salesByDate[dateStr] += Number(inv.total_price);
        }
    });

    const dateLabels = Object.keys(salesByDate);
    const dateValues = Object.values(salesByDate);

    if (salesChart) salesChart.destroy();
    const ctx1 = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'المبيعات اليومية (د.ج)',
                data: dateValues,
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
    invoicesList.forEach(inv => {
        // clean wilaya name
        const cleanName = inv.wilaya.split('. ')[1] || inv.wilaya;
        salesByWilaya[cleanName] = (salesByWilaya[cleanName] || 0) + 1;
    });

    const wilayaLabels = Object.keys(salesByWilaya);
    const wilayaValues = Object.values(salesByWilaya);

    if (wilayaChart) wilayaChart.destroy();
    const ctx2 = document.getElementById('wilayaChart').getContext('2d');
    
    // Nice gold / pastel color palette for pie chart
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
    resetDemoDataBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal('إعادة تعيين البيانات', 'تحذير: سيتم مسح جميع المنتجات والطلبات الحالية واستعادة البيانات التجريبية الافتراضية. هل تريد الاستمرار؟');
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

            // Add new demo data
            console.log('Re-inserting default demo products...');
            
            // Insert Products
            const demoProducts = [
                {
                    name: 'فستان القفطان الملكي الذهبي',
                    description: 'قفطان فاخر مصمم بأرقى خيوط الحرير والذهب، مطرز يدوياً بحرفية عالية ليمنحك إطلالة ملكية في المناسبات السعيدة.',
                    price: 18900,
                    images: ['./images/kaftan_gold_1.png', './images/kaftan_gold_2.png']
                },
                {
                    name: 'فستان السهرة الحريري الأبيض',
                    description: 'فستان سهرة ناعم وأنيق مصنوع من قماش الحرير الطبيعي ذو اللمعة الساحرة، مثالي للأعراس والمناسبات الخاصة.',
                    price: 15500,
                    images: ['./images/dress_white_1.png', './images/dress_white_2.png']
                },
                {
                    name: 'عباءة النخبة المخملية السوداء',
                    description: 'عباءة كلاسيكية فاخرة من المخمل الفاخر المزين بتطريزات ذهبية مميزة على الأكمام والحاشية، تجمع بين الاحتشام والأناقة.',
                    price: 11200,
                    images: ['./images/abaya_black_1.png', './images/abaya_black_2.png']
                },
                {
                    name: 'طقم فستان وسترة البيج الفاخر',
                    description: 'طقم مكون من قطعتين فستان ناعم مع سترة مطرزة بتفاصيل دقيقة وراقية باللون البيج والذهبي الخفيف.',
                    price: 13800,
                    images: ['./images/dress_beige_1.png', './images/dress_beige_2.png']
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
