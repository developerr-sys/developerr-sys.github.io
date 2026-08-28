document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopNameParam = urlParams.get('name');
    
    const displayShopName = document.getElementById('displayShopName');
    const displayShopDescription = document.getElementById('displayShopDescription');
    const productsContainer = document.getElementById('productsContainer');
    const categoryContainer = document.getElementById('categoryContainer');
    
    // Navbar Elements
    const navShopName = document.getElementById('navShopName');
    const navContactBtn = document.getElementById('navContactBtn');
    const searchInput = document.getElementById('searchInput');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const cartBadge = document.getElementById('cartBadge');

    // Cart Sidebar Elements
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // State Variables
    let allProducts = [];
    let currentShop = null;
    let cart = [];
    let activeCategory = 'All';

    // ==========================================
    // INITIALIZE UI LISTENERS
    // ==========================================
    
    if (darkModeToggle) {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-override');
            darkModeToggle.textContent = '☀️';
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-override');
            const isDark = document.body.classList.contains('dark-override');
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });
    }

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    if (closeCartBtn) closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    if (cartOverlay) cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }

    // ==========================================
    // LOAD SHOP DATA (SERVERLESS)
    // ==========================================
    
    try {
        // Fetch shop data directly from local storage via StoreStorage helper
        const shopData = window.StoreStorage.getShopBySlug(shopNameParam || 'demo');

        if (shopData && shopData.shop) {
            const shop = shopData.shop;
            allProducts = shopData.products || [];
            currentShop = shop;

            // Apply Theme without overwriting dark-override
            document.body.className = '';
            document.body.classList.add('shop-body');
            if (shop.theme) {
                document.body.classList.add(shop.theme);
            } else {
                document.body.classList.add('theme-whatsapp-green');
            }

            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-override');
            }

            const formattedName = shop.shop_name;

            // Set Document Title and Header
            document.title = `${formattedName} - Shop`;
            displayShopName.textContent = formattedName;
            
            // Populate Navbar
            if (navShopName) navShopName.textContent = formattedName;
            if (navContactBtn) {
                const cleanNumber = (shop.whatsapp_number || '').replace(/\D/g, '');
                const defaultMessage = `Hello, I'm reaching out from your WhatsApp Shop website!`;
                navContactBtn.href = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(defaultMessage)}`;
            }
            
            // Render Description
            if (shop.shop_description && shop.shop_description.trim() !== '') {
                displayShopDescription.textContent = shop.shop_description;
                displayShopDescription.style.display = 'block';
            } else {
                displayShopDescription.style.display = 'none';
            }

            // Render Categories
            renderCategories(allProducts);

            // Render Products
            renderProducts(allProducts, shop.currency);

        } else {
            displayShopName.textContent = 'Shop Not Found';
            displayShopDescription.textContent = 'Could not find the requested shop. You can create a new one anytime!';
        }
    } catch (error) {
        console.error('Error initializing shop:', error);
        displayShopName.textContent = 'Shop Loaded with Fallback';
        displayShopDescription.textContent = 'Displaying default demo store.';
    }

    // ==========================================
    // RENDER FUNCTIONS
    // ==========================================
    
    function renderCategories(products) {
        const categories = new Set();
        products.forEach(p => {
            if (p.category) categories.add(p.category);
        });

        categoryContainer.innerHTML = '';
        if (categories.size === 0) return;

        // Add 'All' category pill
        const allPill = document.createElement('div');
        allPill.className = 'category-pill active';
        allPill.textContent = 'All';
        allPill.addEventListener('click', () => filterByCategory('All'));
        categoryContainer.appendChild(allPill);

        // Add specific categories
        categories.forEach(cat => {
            const pill = document.createElement('div');
            pill.className = 'category-pill';
            pill.textContent = cat;
            pill.addEventListener('click', () => filterByCategory(cat));
            categoryContainer.appendChild(pill);
        });
    }

    function renderProducts(productsToRender, currency) {
        productsContainer.innerHTML = '';

        if (productsToRender.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <h2>No Products Found</h2>
                    <p>Try adjusting your search or category filters.</p>
                </div>
            `;
            return;
        }

        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            let imageUrl = product.image_url;
            if (!imageUrl || imageUrl.startsWith('/uploads/')) {
                imageUrl = window.StoreStorage.createPlaceholder(product.product_name, product.category);
            }

            const formattedPrice = `${currency || '$'}${parseFloat(product.price).toFixed(2)}`;

            card.innerHTML = `
                <div class="product-image-wrapper">
                    <img src="${imageUrl}" alt="${product.product_name}" class="product-image" onerror="this.onerror=null; this.src=window.StoreStorage.createPlaceholder('${product.product_name.replace(/'/g, "\\'")}', '${(product.category || '').replace(/'/g, "\\'")}');">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.product_name}</h3>
                    <p class="product-price">${formattedPrice}</p>
                    <button class="btn-whatsapp add-to-cart-btn" data-id="${product.id}">
                        🛒 Add to Cart
                    </button>
                </div>
            `;
            productsContainer.appendChild(card);
        });

        // Event Listeners for Add to Cart buttons
        productsContainer.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                addToCart(id);
            });
        });
    }

    // ==========================================
    // FILTERING LOGIC
    // ==========================================
    
    function filterByCategory(category) {
        activeCategory = category;
        
        document.querySelectorAll('.category-pill').forEach(pill => {
            if (pill.textContent === category) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        applyFilters();
    }

    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filtered = allProducts.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = p.product_name.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        renderProducts(filtered, currentShop ? currentShop.currency : '$');
    }

    // ==========================================
    // CART LOGIC
    // ==========================================
    
    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        updateCartUI();
        
        // Visual bounce feedback
        if (cartToggleBtn) {
            cartToggleBtn.style.transform = 'scale(1.15)';
            setTimeout(() => cartToggleBtn.style.transform = 'scale(1)', 200);
        }
        
        openCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }

    function changeQuantity(productId, delta) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartUI();
            }
        }
    }

    function updateCartUI() {
        const currency = currentShop ? currentShop.currency : '$';
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) cartBadge.textContent = totalItems;
        
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty-state">Your cart is empty.</div>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (checkoutBtn) checkoutBtn.disabled = false;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                let imageUrl = item.image_url;
                if (!imageUrl || imageUrl.startsWith('/uploads/')) {
                    imageUrl = window.StoreStorage.createPlaceholder(item.product_name, item.category);
                }

                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${imageUrl}" class="cart-item-img" alt="${item.product_name}" onerror="this.onerror=null; this.src=window.StoreStorage.createPlaceholder('${item.product_name.replace(/'/g, "\\'")}');">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.product_name}</div>
                        <div class="cart-item-price">${currency}${parseFloat(item.price).toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
                            <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });
        }

        if (cartTotalPrice) cartTotalPrice.textContent = `${currency}${totalPrice.toFixed(2)}`;

        // Attach Cart Event Listeners
        cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const action = e.target.getAttribute('data-action');
                changeQuantity(id, action === 'plus' ? 1 : -1);
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(id);
            });
        });
    }

    function openCart() {
        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
    }

    function closeCart() {
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
    }

    // ==========================================
    // CHECKOUT LOGIC (WHATSAPP REDIRECT)
    // ==========================================
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!currentShop || cart.length === 0) return;
            
            const currency = currentShop.currency || '$';
            let message = `Hello ${currentShop.shop_name}! I would like to place an order from your catalog:\n\n`;
            
            let total = 0;
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `${index + 1}. ${item.product_name} x ${item.quantity} = ${currency}${itemTotal.toFixed(2)}\n`;
            });
            
            message += `\n*Total Amount: ${currency}${total.toFixed(2)}*`;
            
            const cleanNumber = (currentShop.whatsapp_number || '').replace(/\D/g, '');
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});
