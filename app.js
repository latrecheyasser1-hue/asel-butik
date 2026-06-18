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
    fetchProducts();
    populateWilayas();
    updateCartBadge();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Cart open/close
    cartTrigger.addEventListener('click', () => toggleModal(cartModal, true));
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
        document.body.style.overflow = 'auto';
    }
}

// Fetch Products from Supabase
async function fetchProducts() {
    try {
        productsLoader.style.display = 'flex';
        productsGrid.style.display = 'none';

        // Fetch products
        const { data: products, error: pError } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (pError) throw pError;
        productsList = products;

        // Fetch stock
        const { data: stock, error: sError } = await supabaseClient
            .from('stock')
            .select('*');

        if (sError) throw sError;
        stockList = stock;

        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `<p class="error-msg">حدث خطأ أثناء تحميل المنتجات. يرجى إعادة المحاولة.</p>`;
        productsGrid.style.display = 'grid';
    } finally {
        productsLoader.style.display = 'none';
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
        card.className = 'product-card';
        
        const mainImage = product.images[0] || './images/kaftan_gold_1.png';
        const formattedPrice = Number(product.price).toLocaleString('ar-DZ') + ' د.ج';

        card.innerHTML = `
            <div class="product-image-container">
                <img class="product-card-image" src="${mainImage}" alt="${product.name}">
                <div class="product-card-actions">
                    <button class="btn btn-gold btn-view" data-id="${product.id}">معاينة سريعة</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price-row">
                    <span class="product-price">${formattedPrice}</span>
                </div>
            </div>
        `;

        // Add event listener to view details
        card.querySelector('.btn-view').addEventListener('click', () => {
            openProductDetails(product);
        });

        productsGrid.appendChild(card);
    });

    productsGrid.style.display = 'grid';
}

// Open Product Details Modal
function openProductDetails(product) {
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
    const colors = [...new Set(pStock.map(s => s.color))];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL']; // standard size list

    // Populate colors
    modalColorOptions.innerHTML = '';
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.textContent = color;
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

    modalStockStatus.innerHTML = '<span style="color: var(--text-muted);">الرجاء اختيار اللون أولاً</span>';
    addToCartBtn.disabled = true;

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
    openCartModal();
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
    cartCount.textContent = totalCount;
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
        fetchProducts();

    } catch (error) {
        console.error('Error placing order:', error);
        alert(error.message || 'حدث خطأ أثناء إرسال طلبك. يرجى مراجعة الاتصال والمحاولة مرة أخرى.');
    } finally {
        submitOrderBtn.disabled = false;
        btnNormalText.style.display = 'inline-block';
        btnLoadingText.style.display = 'none';
    }
}
