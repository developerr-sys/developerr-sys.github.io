const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware (MOVED TO TOP)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize data.json if it doesn't exist
const dataFilePath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ shops: [], products: [] }));
}

// Helper to read and write data
const readData = () => JSON.parse(fs.readFileSync(dataFilePath));
const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API Endpoint to create a shop and add products
app.post('/api/shops', upload.array('productImages'), (req, res) => {
    const { shopName, whatsappNumber, shopDescription, theme, currency, productNames, productPrices, productCategories } = req.body;
    
    if (!shopName || !whatsappNumber) {
        return res.status(400).json({ error: 'Shop name and WhatsApp number are required.' });
    }

    const formattedShopName = shopName.toLowerCase().replace(/\s+/g, '-');
    const data = readData();

    // Find if shop already exists
    const existingShopIndex = data.shops.findIndex(s => s.shop_name === formattedShopName);
    
    let shopId;
    if (existingShopIndex !== -1) {
        // UPDATE existing shop to allow easy theme testing
        shopId = data.shops[existingShopIndex].id;
        data.shops[existingShopIndex].whatsapp_number = whatsappNumber;
        data.shops[existingShopIndex].shop_description = shopDescription || '';
        data.shops[existingShopIndex].theme = theme || 'theme-whatsapp-green';
        data.shops[existingShopIndex].currency = currency || '$';
        
        // Remove old products for this shop
        data.products = data.products.filter(p => p.shop_id !== shopId);
    } else {
        // CREATE new shop
        shopId = Date.now();
        const newShop = {
            id: shopId,
            shop_name: formattedShopName,
            whatsapp_number: whatsappNumber,
            shop_description: shopDescription || '',
            theme: theme || 'theme-whatsapp-green',
            currency: currency || '$',
            created_at: new Date().toISOString()
        };
        data.shops.push(newShop);
    }

    // Process products
    let pNames = [];
    let pPrices = [];
    let pCats = [];
    if (productNames) {
        pNames = Array.isArray(productNames) ? productNames : [productNames];
        pPrices = Array.isArray(productPrices) ? productPrices : [productPrices];
        pCats = Array.isArray(productCategories) ? productCategories : [productCategories];
    }

    if (pNames.length > 0) {
        pNames.forEach((name, index) => {
            const price = parseFloat(pPrices[index]) || 0; // Ensure it's a number
            const category = pCats[index] || 'Uncategorized';
            const imageFile = req.files && req.files[index] ? req.files[index].filename : '';
            
            data.products.push({
                id: Date.now() + index,
                shop_id: shopId,
                product_name: name,
                price: price,
                category: category,
                image_url: imageFile
            });
        });
    }

    writeData(data);

    res.status(201).json({ 
        message: 'Shop updated successfully!', 
        shopUrl: `/shop.html?name=${encodeURIComponent(formattedShopName)}` 
    });
});

// API Endpoint to get shop details and products
app.get('/api/shops/:shopName', (req, res) => {
    const shopName = req.params.shopName.toLowerCase();
    const data = readData();

    const shopRow = data.shops.find(s => s.shop_name === shopName);
    
    if (!shopRow) {
        return res.status(404).json({ error: 'Shop not found' });
    }

    const shopProducts = data.products.filter(p => p.shop_id === shopRow.id);

    res.json({
        shop: shopRow,
        products: shopProducts
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
