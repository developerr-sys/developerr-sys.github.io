/**
 * Serverless Storage Database & Demo Data Manager for WhatsApp Shop Generator
 * Enables 100% offline & client-side functionality using localStorage.
 */

const DEFAULT_DEMO_SHOPS = {
    'demo': {
        shop: {
            id: 1001,
            shop_name: 'TechVerse Store',
            slug: 'demo',
            whatsapp_number: '+923222510615',
            shop_description: '⚡ Premium Tech Accessories & Electronics. Order directly on WhatsApp with fast delivery!',
            theme: 'theme-sleek-dark',
            currency: '$',
            created_at: new Date().toISOString()
        },
        products: [
            {
                id: 2001,
                product_name: 'Wireless Noise-Cancelling Headphones',
                price: 149.99,
                category: 'Audio',
                image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
            },
            {
                id: 2002,
                product_name: 'Smart Fitness Watch Pro',
                price: 89.50,
                category: 'Wearables',
                image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
            },
            {
                id: 2003,
                product_name: 'RGB Mechanical Gaming Keyboard',
                price: 65.00,
                category: 'Gaming',
                image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'
            },
            {
                id: 2004,
                product_name: 'Ultra-Slim 20,000mAh Power Bank',
                price: 34.99,
                category: 'Accessories',
                image_url: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500&q=80'
            },
            {
                id: 2005,
                product_name: 'Ergonomic Wireless Optical Mouse',
                price: 29.99,
                category: 'Accessories',
                image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80'
            }
        ]
    },
    'designer': {
        shop: {
            id: 1002,
            shop_name: 'Designer Apparel Studio',
            slug: 'designer',
            whatsapp_number: '+923222510615',
            shop_description: 'Welcome to our boutique! Quick and easy ordering via WhatsApp.',
            theme: 'theme-slate-grey',
            currency: '$',
            created_at: new Date().toISOString()
        },
        products: [
            {
                id: 2006,
                product_name: 'Minimalist Cotton T-Shirt',
                price: 24.99,
                category: 'Clothing',
                image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'
            },
            {
                id: 2007,
                product_name: 'Urban Oversized Hoodie',
                price: 49.99,
                category: 'Clothing',
                image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80'
            },
            {
                id: 2008,
                product_name: 'Classic Vintage Denim Jacket',
                price: 69.99,
                category: 'Outerwear',
                image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80'
            }
        ]
    },
    'coffee-express': {
        shop: {
            id: 1003,
            shop_name: 'Artisan Roast & Bakery',
            slug: 'coffee-express',
            whatsapp_number: '+923119876543',
            shop_description: 'Fresh coffee beans, freshly baked pastries, and specialty brews delivered to your door.',
            theme: 'theme-coffee-mocha',
            currency: 'Rs.',
            created_at: new Date().toISOString()
        },
        products: [
            {
                id: 2009,
                product_name: 'Espresso Dark Roast Beans 500g',
                price: 2800,
                category: 'Coffee',
                image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80'
            },
            {
                id: 2010,
                product_name: 'French Vanilla Cold Brew Kit',
                price: 3200,
                category: 'Coffee',
                image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80'
            },
            {
                id: 2011,
                product_name: 'Handcrafted Butter Croissants (Pack of 4)',
                price: 1500,
                category: 'Bakery',
                image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80'
            }
        ]
    }
};

function slugify(text) {
    if (!text) return 'shop-' + Date.now();
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function createSvgPlaceholder(name, category) {
    const bgColors = ['#25D366', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#10b981', '#06b6d4', '#eab308'];
    const safeName = (name || 'Product').trim();
    const charCodeSum = safeName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const bg = bgColors[charCodeSum % bgColors.length];
    const initial = safeName.charAt(0).toUpperCase() || 'P';
    
    // Escaping XML characters for SVG
    const escapedName = safeName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
        
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="100%" height="100%" fill="${bg}" />
        <circle cx="200" cy="170" r="70" fill="rgba(255,255,255,0.25)" />
        <text x="50%" y="195" font-family="sans-serif" font-size="75" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
        <text x="50%" y="310" font-family="sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.95)" text-anchor="middle">${escapedName}</text>
    </svg>`;
    
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

window.StoreStorage = {
    getShops: function() {
        const data = localStorage.getItem('whatsapp_shops');
        if (!data) {
            localStorage.setItem('whatsapp_shops', JSON.stringify(DEFAULT_DEMO_SHOPS));
            return DEFAULT_DEMO_SHOPS;
        }
        try {
            const parsed = JSON.parse(data);
            // Ensure default demo shops are always present
            let updated = false;
            for (let key in DEFAULT_DEMO_SHOPS) {
                if (!parsed[key]) {
                    parsed[key] = DEFAULT_DEMO_SHOPS[key];
                    updated = true;
                }
            }
            if (updated) {
                localStorage.setItem('whatsapp_shops', JSON.stringify(parsed));
            }
            return parsed;
        } catch (e) {
            console.error('Error parsing localStorage shops, resetting to defaults:', e);
            localStorage.setItem('whatsapp_shops', JSON.stringify(DEFAULT_DEMO_SHOPS));
            return DEFAULT_DEMO_SHOPS;
        }
    },

    getShopBySlug: function(slug) {
        const shops = this.getShops();
        if (!slug) return shops['demo'] || DEFAULT_DEMO_SHOPS['demo'];
        
        const cleanSlug = slug.toLowerCase().trim();
        
        if (shops[cleanSlug]) {
            return shops[cleanSlug];
        }

        // Search by shop name matching or slug
        for (let key in shops) {
            const s = shops[key];
            if (key === cleanSlug || (s.shop && s.shop.slug === cleanSlug)) {
                return s;
            }
        }

        // If not found, return demo shop
        return shops['demo'] || DEFAULT_DEMO_SHOPS['demo'];
    },

    saveShop: function(shopData, productsArray) {
        const shops = this.getShops();
        let slug = slugify(shopData.shopName);
        if (!slug) slug = 'shop-' + Date.now();
        
        const newShop = {
            shop: {
                id: Date.now(),
                shop_name: shopData.shopName,
                slug: slug,
                whatsapp_number: shopData.whatsappNumber,
                shop_description: shopData.shopDescription || '',
                theme: shopData.theme || 'theme-whatsapp-green',
                currency: shopData.currency || '$',
                created_at: new Date().toISOString()
            },
            products: productsArray.map((prod, index) => ({
                id: Date.now() + index,
                product_name: prod.name,
                price: parseFloat(prod.price) || 0,
                category: prod.category || 'General',
                image_url: prod.imageUrl || createSvgPlaceholder(prod.name, prod.category)
            }))
        };
        
        shops[slug] = newShop;
        localStorage.setItem('whatsapp_shops', JSON.stringify(shops));
        return { slug: slug, shopUrl: `shop.html?name=${slug}` };
    },

    deleteShop: function(slug) {
        const shops = this.getShops();
        if (shops[slug]) {
            delete shops[slug];
            localStorage.setItem('whatsapp_shops', JSON.stringify(shops));
            return true;
        }
        return false;
    },

    createPlaceholder: createSvgPlaceholder
};
