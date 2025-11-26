// حالة التطبيق
let currentUser = null;
let currentAdmin = null;

// دالة تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    const path = window.location.pathname;
    
    if (path.includes('login.html') || path === '/' || path === '/my-kitchn-1/') {
        setupLoginPage();
    } else if (path.includes('customer.html')) {
        if (!currentUser || currentAdmin) {
            window.location.href = 'login.html';
            return;
        }
        setupCustomerPage();
    } else if (path.includes('admin-panel.html')) {
        if (!currentAdmin) {
            window.location.href = 'login.html';
            return;
        }
        setupAdminPage();
    }
});

// التحقق من حالة التسجيل
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('currentAdmin');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
    }
}

// إعداد صفحة تسجيل الدخول
function setupLoginPage() {
    const customerLoginForm = document.getElementById('customerLoginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (customerLoginForm) {
        customerLoginForm.addEventListener('submit', handleCustomerLogin);
    }
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
}

// إعداد صفحة العميل
function setupCustomerPage() {
    displayCustomerInfo();
    loadCustomerProducts();
    loadCustomerOrders();
}

// إعداد صفحة البائع
function setupAdminPage() {
    displayAdminInfo();
    setupAdminEventListeners();
    loadAdminData();
}

// عرض معلومات البائع
function displayAdminInfo() {
    const adminEmailDisplay = document.getElementById('adminEmailDisplay');
    if (adminEmailDisplay && currentAdmin) {
        adminEmailDisplay.textContent = currentAdmin.email;
    }
}

// إعداد مستمعات الأحداث للبائع
function setupAdminEventListeners() {
    const addProductForm = document.getElementById('addProductForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
}

// معالجة تسجيل الدخول كعميل
async function handleCustomerLogin(e) {
    e.preventDefault();
    
    const phone = document.getElementById('customerPhone').value;
    const name = document.getElementById('customerName').value;
    
    if (!phone || !name) {
        alert('⚠️ الرجاء ملء جميع الحقول');
        return;
    }
    
    const customer = {
        phone: phone,
        name: name,
        lastLogin: new Date().toISOString()
    };
    
    await saveCustomer(customer);
    
    currentUser = customer;
    localStorage.setItem('currentUser', JSON.stringify(customer));
    localStorage.removeItem('currentAdmin');
    
    window.location.href = 'customer.html';
}

// معالجة تسجيل الدخول كبائع
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminCode').value;
    
    if (!email || !password) {
        alert('⚠️ الرجاء ملء جميع الحقول');
        return;
    }
    
    try {
        const isValid = await verifyAdminLogin(email, password);
        
        if (isValid) {
            const adminData = await getAdminData();
            currentAdmin = {
                email: adminData.email,
                loggedInAt: new Date().toISOString()
            };
            
            localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
            localStorage.removeItem('currentUser');
            
            window.location.href = 'admin-panel.html';
        } else {
            alert('❌ البريد الإلكتروني أو الكود السري غير صحيح');
        }
    } catch (error) {
        alert('❌ حدث خطأ في تسجيل الدخول');
    }
}

// معالجة تغيير كود البائع
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('⚠️ الرجاء ملء جميع الحقول');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('⚠️ تأكيد الكود غير متطابق');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('⚠️ الكود يجب أن يكون 4 أحرف على الأقل');
        return;
    }
    
    try {
        await updateAdminPassword(currentPassword, newPassword);
        alert('✅ تم تغيير الكود السري بنجاح');
        hideChangePasswordModal();
        document.getElementById('changePasswordForm').reset();
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

// إظهار نافذة تغيير الكود
function showChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('hidden');
}

// إخفاء نافذة تغيير الكود
function hideChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('hidden');
}

// دوال العرض للواجهات
function showCustomerLogin() {
    document.getElementById('customerLogin').classList.remove('hidden');
    document.getElementById('adminLogin').classList.add('hidden');
}

function showAdminLogin() {
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('customerLogin').classList.add('hidden');
}

// دوال تحميل البيانات
function loadCustomerProducts() {
    getProducts(function(products) {
        displayProductsForCustomer(products);
    });
}

function loadCustomerOrders() {
    const customerPhone = currentUser.phone;
    getOrders(function(orders) {
        const customerOrders = orders.filter(order => order.customerPhone === customerPhone);
        displayCustomerOrders(customerOrders);
    });
}

function loadAdminData() {
    getProducts(function(products) {
        displayAdminStats(products);
        displayProductsForAdmin(products);
    });
    
    getTodayOrders(function(orders) {
        displayAdminStats(null, orders);
        displayTodayOrders(orders);
    });
}

// دوال العرض
function displayProductsForCustomer(products) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    const availableProducts = products.filter(product => product.available && product.stock > 0);
    
    if (availableProducts.length === 0) {
        productsList.innerHTML = '<p style="text-align:center; padding:2rem;">لا توجد منتجات متاحة حالياً</p>';
        return;
    }
    
    availableProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card customer-card';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">` : '🍲'}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">${product.price} جنية/كيلو</div>
                <div class="stock">المتاح: ${product.stock} كيلو</div>
                <div class="order-controls">
                    <div class="quantity-controls">
                        <input type="number" id="qty-${product.firebaseId}" min="0.1" max="${product.stock}" step="0.1" value="0.5" placeholder="الكمية">
                        <span>كيلو</span>
                    </div>
                    <button onclick="addToCart('${product.firebaseId}')" class="btn">أضف إلى الطلبات</button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// دوال إضافية للعرض والإدارة
function displayAdminStats(products = null, orders = null) {
    const todayOrdersElem = document.getElementById('todayOrders');
    const availableProductsElem = document.getElementById('availableProducts');
    const pendingOrdersElem = document.getElementById('pendingOrders');
    
    if (todayOrdersElem && orders) {
        todayOrdersElem.textContent = orders.length;
    }
    
    if (availableProductsElem && products) {
        const availableCount = products.filter(p => p.available && p.stock > 0).length;
        availableProductsElem.textContent = availableCount;
    }
    
    if (pendingOrdersElem && orders) {
        const pendingCount = orders.filter(o => o.status === 'قيد الانتظار').length;
        pendingOrdersElem.textContent = pendingCount;
    }
}

// دوال إضافية للطلبات والعرض...
// (هنا تكمل بقية دوال العرض والإدارة)

// إضافة منتج جديد
async function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDesc').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseFloat(document.getElementById('productStock').value);
    const image = document.getElementById('productImage').value;
    
    if (!name || !description || !price || !stock) {
        alert('⚠️ الرجاء ملء جميع الحقول الإلزامية');
        return;
    }
    
    const product = {
        name: name,
        description: description,
        price: price,
        stock: stock,
        image: image || '🍲',
        available: true,
        createdAt: new Date().toISOString()
    };
    
    await saveProduct(product);
    document.getElementById('addProductForm').reset();
    alert('✅ تم إضافة المنتج بنجاح!');
}

// إضافة طلب
async function addToCart(productId) {
    getProducts(function(products) {
        const product = products.find(p => p.firebaseId === productId && p.available && p.stock > 0);
        const quantityInput = document.getElementById(`qty-${productId}`);
        const quantity = parseFloat(quantityInput.value);
        
        if (!product) {
            alert('⚠️ المنتج غير متاح حالياً');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            alert('⚠️ الرجاء إدخال كمية صحيحة');
            return;
        }
        
        if (quantity > product.stock) {
            alert(`⚠️ الكمية المطلوبة (${quantity} كيلو) تتجاوز الكمية المتاحة (${product.stock} كيلو)`);
            return;
        }
        
        const order = {
            productId: productId,
            productName: product.name,
            customerPhone: currentUser.phone,
            customerName: currentUser.name,
            quantity: quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
            status: 'قيد الانتظار',
            date: new Date().toLocaleDateString('ar-EG'),
            orderDate: new Date().toISOString()
        };
        
        saveOrder(order);
        alert(`✅ تم إضافة الطلب: ${quantity} كيلو من ${product.name}`);
        quantityInput.value = 0.5;
    });
}