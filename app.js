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

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Variables
let productsList = [];
let stockList = [];
let shoppingCart = JSON.parse(localStorage.getItem('asel_cart')) || [];
let activeProduct = null;
let activeSize = null;
let activeColor = null;

// Algerian 58 Wilayas List
const algerianWilayas = [
    "01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة",
    "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة",
    "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو",
    "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة",
    "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة",
    "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة",
    "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس",
    "36. الطارف", "37. تندوف", "38. تيسمسيلت", "39. الوادي", "40. خنشلة",
    "41. سوق أهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. النعامة",
    "46. عين تموشنت", "47. غرداية", "48. غليزان", "49. تيميمون", "50. برج باجي مختار",
    "51. أولاد جلال", "52. بني عباس", "53. عين صالح", "54. عين قزام", "55. تقرت",
    "56. جانت", "57. المغير", "58. المنيعة"
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const productsLoader = document.getElementById('productsLoader');
const cartCount = document.getElementById('cartCount');
const cartTrigger = document.getElementById('cartTrigger');
const cartModal = document.getElementById('cartModal');
const cartClose = document.getElementById('cartClose');
const cartItemsList = document.getElementById('cartItemsList');
const cartEmptyState = document.getElementById('cartEmptyState');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartFooter = document.getElementById('cartFooter');
const startShopping = document.getElementById('startShopping');

const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalMainImage = document.getElementById('modalMainImage');
const modalThumbnails = document.getElementById('modalThumbnails');
const modalProductName = document.getElementById('modalProductName');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductDesc = document.getElementById('modalProductDesc');
const modalColorOptions = document.getElementById('modalColorOptions');
const modalSizeOptions = document.getElementById('modalSizeOptions');
const modalStockStatus = document.getElementById('modalStockStatus');
const addToCartBtn = document.getElementById('addToCartBtn');

const checkoutModal = document.getElementById('checkoutModal');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const clientWilayaSelect = document.getElementById('clientWilaya');
const checkoutSummaryList = document.getElementById('checkoutSummaryList');
const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const btnNormalText = document.getElementById('btnNormalText');
const btnLoadingText = document.getElementById('btnLoadingText');

const successModal = document.getElementById('successModal');
const successCloseBtn = document.getElementById('successCloseBtn');

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    // SWR implementation: load cache instantly if it exists
    let cacheLoaded = false;
    try {
        const prod = localStorage.getItem('asel_products_cache');
        const st = localStorage.getItem('asel_stock_cache');
        const sett = localStorage.getItem('asel_settings_cache');
        
        if (prod && st) {
            productsList = JSON.parse(prod).filter(p => p.is_active !== false);
            stockList = JSON.parse(st);
            displayProducts();
            
            if (sett) {
                applySettingsToUI(JSON.parse(sett));
            }
            
            // Hide loader and show grid instantly
            productsLoader.style.display = 'none';
            productsGrid.style.display = 'grid';
            cacheLoaded = true;
            console.log('Storefront SWR: Rendered cached products and settings instantly.');
        }
    } catch (e) {
        console.error('Failed to load initial storefront cache:', e);
    }
    
    if (cacheLoaded) {
        // Initialize interactive elements
        populateWilayas();
        updateCartBadge();
        setupEventListeners();
        setupRealtime();
        
        // Quietly fetch fresh data from Supabase in background
        fetchStorefrontData(true);
    } else {
        // Standard blocking fetch from Supabase
        fetchStorefrontData(false).then(() => {
            populateWilayas();
            updateCartBadge();
            setupEventListeners();
            setupRealtime();
        });
    }
});

// Setup Event Listeners
function setupEventListeners() {
    // Cart open/close
    cartTrigger.addEventListener('click', () => openCartModal());
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => openCartModal());
    }
    cartClose.addEventListener('click', () => toggleModal(cartModal, false));
    startShopping.addEventListener('click', () => toggleModal(cartModal, false));
    
    // Product modal close
    modalClose.addEventListener('click', () => toggleModal(productModal, false));
    
    // Checkout modal open/close
    checkoutBtn.addEventListener('click', () => {
        toggleModal(cartModal, false);
        openCheckoutModal();
    });
    checkoutClose.addEventListener('click', () => toggleModal(checkoutModal, false));
    
    // Form submission
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    
    // Success Modal Close
    successCloseBtn.addEventListener('click', () => toggleModal(successModal, false));

    // Close on backdrop click
    [productModal, cartModal, checkoutModal, successModal].forEach(modal => {
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => toggleModal(modal, false));
        }
    });
}

// Helper to open/close modals
function toggleModal(modal, show) {
    if (show) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.remove('active');
        const anyActive = document.querySelector('.modal.active');
        document.body.style.overflow = anyActive ? 'hidden' : 'auto';
    }
}

// Fetch products, stock, and settings in parallel from Supabase
async function fetchStorefrontData(isQuiet = false) {
    try {
        if (!isQuiet) {
            productsLoader.style.display = 'grid';
            productsGrid.style.display = 'none';
        }

        if (!navigator.onLine) {
            throw new Error('OfflineModeActive');
        }

        // Fetch products, stock, and settings in parallel to dramatically improve performance
        const [productsRes, stockRes, settingsRes] = await Promise.all([
            supabaseClient.from('products').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('stock').select('*'),
            supabaseClient.from('settings').select('*').eq('id', 1).single()
        ]);

        if (productsRes.error) throw productsRes.error;
        if (stockRes.error) throw stockRes.error;

        productsList = productsRes.data.filter(p => p.is_active !== false);
        stockList = stockRes.data;

        // Cache state locally on success
        try {
            localStorage.setItem('asel_products_cache', JSON.stringify(productsRes.data));
            localStorage.setItem('asel_stock_cache', JSON.stringify(stockRes.data));
            if (!settingsRes.error && settingsRes.data) {
                localStorage.setItem('asel_settings_cache', JSON.stringify(settingsRes.data));
            }
        } catch (e) {
            console.error('Failed to cache storefront data locally:', e);
        }

        displayProducts();

        if (!settingsRes.error && settingsRes.data) {
            applySettingsToUI(settingsRes.data);
        }

        if (activeProduct) {
            const updatedProduct = productsList.find(p => p.id === activeProduct.id);
            if (updatedProduct) {
                openProductDetails(updatedProduct, activeColor, activeSize);
            } else {
                toggleModal(productModal, false);
                activeProduct = null;
            }
        }

        if (!isQuiet) {
            productsLoader.style.display = 'none';
            productsGrid.style.display = 'grid';
        }
    } catch (error) {
        console.warn('Network storefront fetch failed, falling back to local cache:', error);
        try {
            const prod = localStorage.getItem('asel_products_cache');
            const st = localStorage.getItem('asel_stock_cache');
            const sett = localStorage.getItem('asel_settings_cache');

            if (prod && st) {
                productsList = JSON.parse(prod).filter(p => p.is_active !== false);
                stockList = JSON.parse(st);
                displayProducts();

                if (sett) {
                    applySettingsToUI(JSON.parse(sett));
                }
                
                console.log('Successfully loaded storefront data from offline cache.');
                return;
            }
        } catch (cacheErr) {
            console.error('Failed to load storefront cache:', cacheErr);
        }

        if (!isQuiet) {
            productsGrid.innerHTML = `<p class="error-msg">حدث خطأ أثناء تحميل المنتجات. يرجى التحقق من اتصالك بالإنترنت.</p>`;
            productsGrid.style.display = 'grid';
            productsLoader.style.display = 'none';
        }
    }
}

// Fetch Products from Supabase
async function fetchProducts() {
    await fetchStorefrontData(false);
}

// Fetch Settings from Supabase
async function fetchSettings() {
    try {
        if (!navigator.onLine) {
            throw new Error('OfflineModeActive');
        }

        const { data: settings, error } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        try {
            localStorage.setItem('asel_settings_cache', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to cache settings locally:', e);
        }
        
        applySettingsToUI(settings);
    } catch (err) {
        console.warn('Network settings fetch failed, attempting local cache fallback:', err);
        try {
            const cached = localStorage.getItem('asel_settings_cache');
            if (cached) {
                applySettingsToUI(JSON.parse(cached));
            }
        } catch (cacheErr) {
            console.error('Failed to load settings from cache:', cacheErr);
        }
    }
}

// Helper to apply website settings to UI
function applySettingsToUI(settings) {
    if (!settings) return;

    // 1. Hero Content
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroTitle) heroTitle.textContent = settings.hero_title;
    if (heroSubtitle) heroSubtitle.textContent = settings.hero_subtitle;

    // 2. Footer About Text
    const footerAbout = document.getElementById('footerAboutText');
    if (footerAbout) footerAbout.textContent = settings.about_text;

    // 3. Contacts
    const footerPhone = document.getElementById('footerPhone');
    const footerPhoneLink = document.getElementById('footerPhoneLink');
    if (footerPhone) footerPhone.textContent = settings.phone_number;
    if (footerPhoneLink) {
        const rawPhone = settings.phone_number.replace(/\s+/g, '');
        footerPhoneLink.href = `tel:${rawPhone}`;
    }

    const footerEmail = document.getElementById('footerEmail');
    const footerEmailLink = document.getElementById('footerEmailLink');
    if (footerEmail) footerEmail.textContent = settings.email;
    if (footerEmailLink) footerEmailLink.href = `mailto:${settings.email.trim()}`;

    const footerLocationLink = document.getElementById('footerLocationLink');
    if (footerLocationLink) {
        footerLocationLink.href = settings.location_url;
    }

    // 4. Social Media Links
    const fbLink = document.getElementById('footerFacebookLink');
    const instLink = document.getElementById('footerInstagramLink');
    const tiktokLink = document.getElementById('footerTiktokLink');

    if (fbLink) {
        if (settings.facebook_url && settings.facebook_url.trim() !== '') {
            fbLink.href = settings.facebook_url.trim();
            fbLink.style.display = 'inline-flex';
        } else {
            fbLink.style.display = 'none';
        }
    }

    if (instLink) {
        if (settings.instagram_url && settings.instagram_url.trim() !== '') {
            instLink.href = settings.instagram_url.trim();
            instLink.style.display = 'inline-flex';
        } else {
            instLink.style.display = 'none';
        }
    }

    if (tiktokLink) {
        if (settings.tiktok_url && settings.tiktok_url.trim() !== '') {
            tiktokLink.href = settings.tiktok_url.trim();
            tiktokLink.style.display = 'inline-flex';
        } else {
            tiktokLink.style.display = 'none';
        }
    }
}

// Display Products in Grid
function displayProducts() {
    productsGrid.innerHTML = '';
    
    if (productsList.length === 0) {
        productsGrid.innerHTML = `<p class="no-products">لا توجد منتجات معروضة حالياً.</p>`;
        productsGrid.style.display = 'grid';
        return;
    }

    productsList.forEach(product => {
        const card = document.createElement('div');
        
        // Calculate total stock for this product
        const pStock = stockList.filter(s => s.product_id === product.id);
        const totalQty = pStock.reduce((acc, s) => acc + s.quantity, 0);
        const isOutOfStock = totalQty <= 0;
        
        card.className = `product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`;
        card.style.cursor = 'pointer';
        
        const mainImage = product.images[0] || './images/kaftan_gold_1.png';
        const formattedPrice = Number(product.price).toLocaleString('ar-DZ') + ' د.ج';

        card.innerHTML = `
            <div class="product-image-container">
                ${isOutOfStock ? '<span class="out-of-stock-badge">نفذت الكمية</span>' : ''}
                <img class="product-card-image" src="${mainImage}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price-row">
                    <span class="product-price">${formattedPrice}</span>
                </div>
            </div>
        `;

        // Add event listener to view details on entire card
        card.addEventListener('click', () => {
            openProductDetails(product);
        });

        productsGrid.appendChild(card);
    });

    productsGrid.style.display = 'grid';
    setupScrollReveal();
}

// Open Product Details Modal
function openProductDetails(product, initialColor = null, initialSize = null) {
    activeProduct = product;
    activeSize = null;
    activeColor = null;

    modalProductName.textContent = product.name;
    modalProductPrice.textContent = Number(product.price).toLocaleString('ar-DZ') + ' د.ج';
    modalProductDesc.textContent = product.description || 'لا يوجد وصف متاح.';
    
    // Set Images
    const images = product.images && product.images.length > 0 ? product.images : ['./images/kaftan_gold_1.png'];
    modalMainImage.src = images[0];
    
    // Thumbnails
    modalThumbnails.innerHTML = '';
    images.forEach((imgSrc, idx) => {
        const thumb = document.createElement('img');
        thumb.className = `thumbnail ${idx === 0 ? 'active' : ''}`;
        thumb.src = imgSrc;
        thumb.alt = `صورة مصغرة ${idx + 1}`;
        thumb.addEventListener('click', () => {
            modalMainImage.src = imgSrc;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        modalThumbnails.appendChild(thumb);
    });

    // Get product colors and sizes available in stock
    const pStock = stockList.filter(s => s.product_id === product.id);
    const colors = [...new Set(pStock.filter(s => s.quantity > 0).map(s => s.color))];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL']; // standard size list

    // Populate colors
    modalColorOptions.innerHTML = '';
    
    if (colors.length === 0) {
        modalColorOptions.innerHTML = '<span style="color: #c0392b; font-weight: 600; font-size: 14px;">هذا المنتج غير متوفر حالياً (نفذت الكمية)</span>';
        modalSizeOptions.innerHTML = '';
        modalStockStatus.innerHTML = '<span class="stock-status out-of-stock"><i class="fa-solid fa-circle-xmark"></i> نفذت الكمية</span>';
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = 'نفذت الكمية';
        addToCartBtn.onclick = null;
    } else {
        addToCartBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة';
        colors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-btn';
            colorBtn.textContent = color;
            if (color === initialColor) {
                colorBtn.classList.add('active');
                activeColor = color;
            }
            colorBtn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                colorBtn.classList.add('active');
                activeColor = color;
                updateSizeOptions(sizes, pStock);
                checkStockStatus(pStock);
            });
            modalColorOptions.appendChild(colorBtn);
        });

        // Populate sizes (disabled initially until color is selected)
        modalSizeOptions.innerHTML = '';
        sizes.forEach(size => {
            const sizeBtn = document.createElement('button');
            sizeBtn.className = 'size-btn';
            sizeBtn.textContent = size;
            sizeBtn.disabled = true; // wait for color first
            modalSizeOptions.appendChild(sizeBtn);
        });

        if (activeColor) {
            updateSizeOptions(sizes, pStock);
            if (initialSize) {
                const sizeBtns = modalSizeOptions.querySelectorAll('.size-btn');
                sizeBtns.forEach(btn => {
                    if (btn.textContent === initialSize && !btn.disabled) {
                        btn.classList.add('active');
                        activeSize = initialSize;
                    }
                });
            }
            checkStockStatus(pStock);
        } else {
            modalStockStatus.innerHTML = '<span style="color: var(--text-muted);">الرجاء اختيار اللون أولاً</span>';
            addToCartBtn.disabled = true;
        }
    }

    toggleModal(productModal, true);
}

// Update Size buttons based on selected color
function updateSizeOptions(sizes, pStock) {
    modalSizeOptions.innerHTML = '';
    activeSize = null;
    addToCartBtn.disabled = true;

    sizes.forEach(size => {
        const sizeBtn = document.createElement('button');
        sizeBtn.className = 'size-btn';
        sizeBtn.textContent = size;

        // Check if this size + color combo has stock quantity > 0
        const stockItem = pStock.find(s => s.color === activeColor && s.size === size);
        const availableQty = stockItem ? stockItem.quantity : 0;

        if (availableQty <= 0) {
            sizeBtn.disabled = true;
        }

        sizeBtn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            sizeBtn.classList.add('active');
            activeSize = size;
            checkStockStatus(pStock);
        });

        modalSizeOptions.appendChild(sizeBtn);
    });
}

// Check stock quantity and update status text and Add to Cart button
function checkStockStatus(pStock) {
    if (!activeColor) {
        modalStockStatus.innerHTML = '<span style="color: var(--text-muted);">الرجاء اختيار اللون أولاً</span>';
        addToCartBtn.disabled = true;
        return;
    }
    if (!activeSize) {
        modalStockStatus.innerHTML = '<span style="color: var(--text-muted);">الرجاء تحديد المقاس</span>';
        addToCartBtn.disabled = true;
        return;
    }

    const stockItem = pStock.find(s => s.color === activeColor && s.size === activeSize);
    const availableQty = stockItem ? stockItem.quantity : 0;

    if (availableQty > 5) {
        modalStockStatus.innerHTML = '<span class="stock-status in-stock"><i class="fa-solid fa-circle-check"></i> متوفر في المخزن</span>';
        addToCartBtn.disabled = false;
    } else if (availableQty > 0) {
        modalStockStatus.innerHTML = `<span class="stock-status low-stock"><i class="fa-solid fa-triangle-exclamation"></i> قطع أخيرة متوفرة (${availableQty})</span>`;
        addToCartBtn.disabled = false;
    } else {
        modalStockStatus.innerHTML = '<span class="stock-status out-of-stock"><i class="fa-solid fa-circle-xmark"></i> نفذت الكمية</span>';
        addToCartBtn.disabled = true;
    }

    // Set Add to Cart trigger action
    addToCartBtn.onclick = () => {
        addToCart(activeProduct, activeSize, activeColor, availableQty);
    };
}

// Add Item to Shopping Cart
function addToCart(product, size, color, maxQty) {
    const existingIndex = shoppingCart.findIndex(item => 
        item.product_id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
        if (shoppingCart[existingIndex].quantity < maxQty) {
            shoppingCart[existingIndex].quantity += 1;
        } else {
            alert('عذراً، لقد حددت أقصى كمية متوفرة في المخزن لهذا المقاس واللون.');
            return;
        }
    } else {
        shoppingCart.push({
            product_id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images[0] || './images/kaftan_gold_1.png',
            size: size,
            color: color,
            quantity: 1
        });
    }

    localStorage.setItem('asel_cart', JSON.stringify(shoppingCart));
    updateCartBadge();
    toggleModal(productModal, false);
    
    // Animate floating badge to indicate item added
    const floatingBtn = document.getElementById('floatingCartBtn');
    if (floatingBtn) {
        floatingBtn.classList.add('bounce');
        setTimeout(() => floatingBtn.classList.remove('bounce'), 600);
    }
}

// Open/refresh Cart Modal
function openCartModal() {
    cartItemsList.innerHTML = '';
    
    if (shoppingCart.length === 0) {
        cartEmptyState.style.display = 'flex';
        cartFooter.style.display = 'none';
    } else {
        cartEmptyState.style.display = 'none';
        cartFooter.style.display = 'block';

        let total = 0;

        shoppingCart.forEach((item, index) => {
            total += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            itemEl.innerHTML = `
                <img class="cart-item-image" src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div>
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-meta">المقاس: ${item.size} | اللون: ${item.color} | الكمية: ${item.quantity}</div>
                    </div>
                    <div class="cart-item-price">${(item.price * item.quantity).toLocaleString('ar-DZ')} د.ج</div>
                </div>
                <button class="cart-item-remove" aria-label="حذف" data-idx="${index}"><i class="fa-regular fa-trash-can"></i></button>
            `;

            itemEl.querySelector('.cart-item-remove').addEventListener('click', () => {
                removeFromCart(index);
            });

            cartItemsList.appendChild(itemEl);
        });

        cartTotalPrice.textContent = total.toLocaleString('ar-DZ') + ' د.ج';
    }

    toggleModal(cartModal, true);
}

// Remove Item from Cart
function removeFromCart(idx) {
    shoppingCart.splice(idx, 1);
    localStorage.setItem('asel_cart', JSON.stringify(shoppingCart));
    updateCartBadge();
    openCartModal();
}

// Update Cart Badge count
function updateCartBadge() {
    const totalCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalCount;
    
    const floatingBtn = document.getElementById('floatingCartBtn');
    const floatingCount = document.getElementById('floatingCartCount');
    if (floatingCount) floatingCount.textContent = totalCount;
    if (floatingBtn) {
        floatingBtn.style.display = totalCount > 0 ? 'flex' : 'none';
    }
}

// Populate Wilayas dropdown
function populateWilayas() {
    clientWilayaSelect.innerHTML = '<option value="" disabled selected>اختر الولاية...</option>';
    algerianWilayas.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        clientWilayaSelect.appendChild(option);
    });
}

// Open Checkout Modal and summarize items
function openCheckoutModal() {
    checkoutSummaryList.innerHTML = '';
    let total = 0;

    shoppingCart.forEach(item => {
        total += item.price * item.quantity;
        const sumItem = document.createElement('div');
        sumItem.className = 'summary-item';
        sumItem.innerHTML = `
            <span>${item.name} (${item.color} - ${item.size}) × ${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString('ar-DZ')} د.ج</span>
        `;
        checkoutSummaryList.appendChild(sumItem);
    });

    checkoutTotalAmount.textContent = total.toLocaleString('ar-DZ') + ' د.ج';
    toggleModal(checkoutModal, true);
}

// Handle Order Checkout Submission to Supabase
async function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (shoppingCart.length === 0) {
        alert('سلة التسوق فارغة!');
        return;
    }

    const clientName = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const wilaya = clientWilayaSelect.value;
    const baladiya = document.getElementById('clientBaladiya').value.trim();
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

    submitOrderBtn.disabled = true;
    btnNormalText.style.display = 'none';
    btnLoadingText.style.display = 'inline-block';

    try {
        // We will insert each cart item as a separate order row for accurate stock & tracking
        for (const item of shoppingCart) {
            // 1. Double check and reduce stock in database
            // Fetch current stock
            const { data: stockItem, error: fetchError } = await supabaseClient
                .from('stock')
                .select('id, quantity')
                .eq('product_id', item.product_id)
                .eq('size', item.size)
                .eq('color', item.color)
                .single();

            if (fetchError) throw fetchError;

            const currentQty = stockItem ? stockItem.quantity : 0;
            if (currentQty < item.quantity) {
                throw new Error(`عذراً، المنتج ${item.name} بالمقاس ${item.size} واللون ${item.color} لم يعد متوفراً بالكمية المطلوبة.`);
            }

            // 2. Reduce stock quantity
            const { error: updateError } = await supabaseClient
                .from('stock')
                .update({ quantity: currentQty - item.quantity })
                .eq('id', stockItem.id);

            if (updateError) throw updateError;

            // 3. Create order record
            const { error: orderError } = await supabaseClient
                .from('orders')
                .insert({
                    client_name: clientName,
                    phone: phone,
                    wilaya: wilaya,
                    baladiya: baladiya,
                    delivery_type: deliveryType === 'home' ? 'توصيل للمنزل' : 'مكتب شركة التوصيل',
                    product_id: item.product_id,
                    product_name: item.name,
                    size: item.size,
                    color: item.color,
                    total_price: item.price * item.quantity,
                    status: 'جديد'
                });

            if (orderError) throw orderError;
        }

        // Clean cart
        shoppingCart = [];
        localStorage.removeItem('asel_cart');
        updateCartBadge();
        checkoutForm.reset();

        // Close modals and show success modal
        toggleModal(checkoutModal, false);
        toggleModal(successModal, true);

        // Refresh product list and stock in background
        fetchProductsQuietly();

    } catch (error) {
        console.error('Error placing order:', error);
        alert(error.message || 'حدث خطأ أثناء إرسال طلبك. يرجى مراجعة الاتصال والمحاولة مرة أخرى.');
    } finally {
        submitOrderBtn.disabled = false;
        btnNormalText.style.display = 'inline-block';
        btnLoadingText.style.display = 'none';
    }
}

// Fetch products in the background quietly without showing loader
async function fetchProductsQuietly() {
    await fetchStorefrontData(true);
}

// Subscribe to real-time updates on products and stock
function setupRealtime() {
    supabaseClient
        .channel('public-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
            fetchProductsQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => {
            fetchProductsQuietly();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
            fetchSettings();
        })
        .subscribe();
}

// Setup Scroll Reveal Observer
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                obs.unobserve(entry.target); // Animates only once
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}
