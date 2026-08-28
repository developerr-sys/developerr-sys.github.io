document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('addProductBtn');
    const productList = document.getElementById('product-list');
    const shopForm = document.getElementById('shopForm');
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');
    let productCount = 1;

    // Helper: Convert File object to Base64 Data URL
    const fileToBase64 = (file) => {
        return new Promise((resolve) => {
            if (!file || !file.size) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    // Dynamically add product input fields
    addProductBtn.addEventListener('click', () => {
        productCount++;
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        
        productItem.style.animation = 'fadeInUp 0.4s ease';

        productItem.innerHTML = `
            <div class="product-item-header">
                <h4>Product #${productCount}</h4>
                <button type="button" class="remove-btn" title="Remove Product">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="product-grid">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" name="productNames" placeholder="Product name" required>
                </div>
                <div class="form-group">
                    <label>Price (Numbers Only)</label>
                    <input type="number" step="0.01" min="0" name="productPrices" placeholder="e.g. 20.99" required>
                </div>
                <div class="form-group full-width">
                    <label>Category</label>
                    <input type="text" name="productCategories" placeholder="e.g. Clothing, Electronics, Food" required>
                </div>
                <div class="form-group full-width file-input-group">
                    <label>Product Image (Optional)</label>
                    <input type="file" name="productImages" accept="image/*" class="file-input">
                </div>
            </div>
        `;
        
        productItem.querySelector('.remove-btn').addEventListener('click', function() {
            productItem.remove();
        });

        productList.appendChild(productItem);
    });

    // Handle form submission with 100% Client-Side Serverless Storage
    shopForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner"></span> Creating Shop...
        `;
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';

        try {
            const shopName = document.getElementById('shopName').value.trim();
            const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
            const shopDescription = document.getElementById('shopDescription').value.trim();
            const theme = document.getElementById('theme').value;
            const currency = document.getElementById('currency').value;

            // Extract all products from DOM
            const productItems = document.querySelectorAll('.product-item');
            const productsData = [];

            for (let item of productItems) {
                const nameInput = item.querySelector('input[name="productNames"]');
                const priceInput = item.querySelector('input[name="productPrices"]');
                const categoryInput = item.querySelector('input[name="productCategories"]');
                const fileInput = item.querySelector('input[name="productImages"]');

                if (nameInput && nameInput.value) {
                    let imageBase64 = null;
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        imageBase64 = await fileToBase64(fileInput.files[0]);
                    }

                    productsData.push({
                        name: nameInput.value.trim(),
                        price: parseFloat(priceInput.value) || 0,
                        category: categoryInput ? categoryInput.value.trim() : 'General',
                        imageUrl: imageBase64
                    });
                }
            }

            if (productsData.length === 0) {
                throw new Error('Please add at least one product with a name and price.');
            }

            const shopData = {
                shopName,
                whatsappNumber,
                shopDescription,
                theme,
                currency
            };

            // Save to localStorage using StoreStorage
            const result = window.StoreStorage.saveShop(shopData, productsData);

            statusMessage.innerHTML = '✨ Shop created successfully! Redirecting to your shop...';
            statusMessage.className = 'status-message status-success';
            
            setTimeout(() => {
                window.location.href = result.shopUrl;
            }, 1000);

        } catch (error) {
            console.error('Error creating shop:', error);
            statusMessage.textContent = error.message || 'An error occurred while creating the shop.';
            statusMessage.className = 'status-message status-error';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    // Render quick access section for demo & user-created shops
    renderQuickAccessShops();

    function renderQuickAccessShops() {
        const shopsContainer = document.getElementById('quickAccessShops');
        if (!shopsContainer) return;

        const shops = window.StoreStorage.getShops();
        shopsContainer.innerHTML = '';

        Object.keys(shops).forEach(key => {
            const s = shops[key];
            const shopObj = s.shop;
            const btn = document.createElement('a');
            btn.className = 'btn-quick-shop';
            btn.href = `shop.html?name=${shopObj.slug}`;
            btn.innerHTML = `
                <span class="shop-name">${shopObj.shop_name}</span>
                <span class="shop-theme-badge">${shopObj.products ? shopObj.products.length : 0} items</span>
            `;
            shopsContainer.appendChild(btn);
        });
    }
});
