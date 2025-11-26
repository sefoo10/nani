// دوال العرض للبائع
function displayProductsForAdmin(products) {
    const adminProductsList = document.getElementById('adminProductsList');
    if (!adminProductsList) return;
    
    adminProductsList.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsList.innerHTML = `
            <div class="empty-state">
                <i>📝</i>
                <p>لا توجد منتجات حتى الآن</p>
                <p>ابدأ بإضافة منتجك الأول</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        productCard.innerHTML = `
            <div class="admin-product-header">
                <div class="admin-product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="price">${product.price} جنية/كيلو</div>
                    <div class="stock">المخزون: ${product.stock} كيلو</div>
                    ${product.image && product.image !== '🍲' ? 
                        `<div class="product-image-preview">
                            <img src="${product.image}" alt="${product.name}" style="max-width: 100px; max-height: 80px; border-radius: 5px;">
                        </div>` : ''
                    }
                </div>
                <div class="admin-product-controls">
                    <button onclick="toggleProductAvailability('${product.firebaseId}', ${!product.available})" 
                            class="btn btn-small ${product.available ? 'btn-warning' : 'btn-success'}">
                        ${product.available ? 'إخفاء' : 'إظهار'}
                    </button>
                    <button onclick="editProductStock('${product.firebaseId}')" class="btn btn-small btn-success">
                        تعديل المخزون
                    </button>
                    <button onclick="deleteProduct('${product.firebaseId}')" class="btn btn-small btn-danger">
                        حذف
                    </button>
                </div>
            </div>
            <div class="product-stock-control">
                <input type="number" id="stock-${product.firebaseId}" value="${product.stock}" min="0" step="0.1" 
                       placeholder="الكمية المتاحة">
                <button onclick="updateProductStock('${product.firebaseId}')" class="btn btn-small">تحديث المخزون</button>
            </div>
        `;
        adminProductsList.appendChild(productCard);
    });
}

// عرض طلبات اليوم للبائع
function displayTodayOrders(orders) {
    const todayOrdersList = document.getElementById('todayOrdersList');
    if (!todayOrdersList) return;
    
    todayOrdersList.innerHTML = '';
    
    if (orders.length === 0) {
        todayOrdersList.innerHTML = `
            <div class="empty-state">
                <i>📦</i>
                <p>لا توجد طلبات اليوم</p>
                <p>سيظهر هنا طلبات العملاء</p>
            </div>
        `;
        return;
    }
    
    // ترتيب الطلبات من الأحدث إلى الأقدم
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-customer">${order.customerName}</div>
                    <div class="order-product">${order.productName}</div>
                </div>
                <span class="order-status status-${getStatusClass(order.status)}">${order.status}</span>
            </div>
            
            <div class="order-details">
                <div class="order-detail">
                    <span class="detail-label">رقم الهاتف</span>
                    <span class="detail-value">
                        <a href="tel:${order.customerPhone}" style="color: #ee5a24; text-decoration: none;">
                            ${order.customerPhone}
                        </a>
                    </span>
                </div>
                <div class="order-detail">
                    <span class="detail-label">الكمية</span>
                    <span class="detail-value">${order.quantity} كيلو</span>
                </div>
                <div class="order-detail">
                    <span class="detail-label">السعر الإجمالي</span>
                    <span class="detail-value">${order.totalPrice} جنية</span>
                </div>
                <div class="order-detail">
                    <span class="detail-label">وقت الطلب</span>
                    <span class="detail-value">${new Date(order.orderDate).toLocaleTimeString('ar-EG')}</span>
                </div>
            </div>
            
            <div class="order-controls">
                <select id="status-${order.firebaseId}" onchange="updateOrderStatus('${order.firebaseId}', this.value)">
                    <option value="قيد الانتظار" ${order.status === 'قيد الانتظار' ? 'selected' : ''}>قيد الانتظار</option>
                    <option value="قيد التحضير" ${order.status === 'قيد التحضير' ? 'selected' : ''}>قيد التحضير</option>
                    <option value="جاهز" ${order.status === 'جاهز' ? 'selected' : ''}>جاهز</option>
                    <option value="ملغى" ${order.status === 'ملغى' ? 'selected' : ''}>ملغى</option>
                </select>
                
                <button onclick="contactCustomer('${order.customerPhone}')" class="btn btn-small btn-success">
                    📞 اتصل بالعميل
                </button>
                
                ${order.status !== 'ملغى' ? `
                    <button onclick="cancelOrder('${order.firebaseId}')" class="btn btn-small btn-danger">
                        إلغاء الطلب
                    </button>
                ` : ''}
            </div>
        `;
        todayOrdersList.appendChild(orderCard);
    });
}

// عرض طلبات العميل
function displayCustomerOrders(orders) {
    const myOrdersList = document.getElementById('myOrdersList');
    if (!myOrdersList) return;
    
    myOrdersList.innerHTML = '';
    
    if (orders.length === 0) {
        myOrdersList.innerHTML = `
            <div class="empty-state">
                <i>📦</i>
                <p>لا توجد طلبات سابقة</p>
                <p>اطلب الآن من قائمة المنتجات</p>
            </div>
        `;
        return;
    }
    
    // ترتيب الطلبات من الأحدث إلى الأقدم
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-product">${order.productName}</div>
                    <div class="order-detail">
                        <span class="detail-label">الكمية:</span>
                        <span class="detail-value">${order.quantity} كيلو</span>
                    </div>
                </div>
                <span class="order-status status-${getStatusClass(order.status)}">${order.status}</span>
            </div>
            
            <div class="order-details">
                <div class="order-detail">
                    <span class="detail-label">السعر الإجمالي</span>
                    <span class="detail-value">${order.totalPrice} جنية</span>
                </div>
                <div class="order-detail">
                    <span class="detail-label">وقت الطلب</span>
                    <span class="detail-value">${new Date(order.orderDate).toLocaleString('ar-EG')}</span>
                </div>
            </div>
            
            ${order.status === 'جاهز' ? `
                <div class="order-controls">
                    <button onclick="contactAdmin()" class="btn btn-success">
                        📞 اتصل بالمطعم
                    </button>
                </div>
            ` : ''}
        `;
        myOrdersList.appendChild(orderCard);
    });
}

// دوال المساعدة
function getStatusClass(status) {
    const statusMap = {
        'قيد الانتظار': 'pending',
        'قيد التحضير': 'preparing',
        'جاهز': 'ready',
        'ملغى': 'cancelled',
        'تم التسليم': 'delivered'
    };
    return statusMap[status] || 'pending';
}

// دوال إدارة المنتجات
async function toggleProductAvailability(productId, newStatus) {
    const success = await updateProduct(productId, { available: newStatus });
    if (success) {
        alert(`✅ تم ${newStatus ? 'إظهار' : 'إخفاء'} المنتج`);
        loadAdminData();
    }
}

async function updateProductStock(productId) {
    const stockInput = document.getElementById(`stock-${productId}`);
    const newStock = parseFloat(stockInput.value);
    
    if (isNaN(newStock) || newStock < 0) {
        alert('⚠️ الرجاء إدخال كمية صحيحة');
        return;
    }
    
    const success = await updateProduct(productId, { stock: newStock });
    if (success) {
        alert('✅ تم تحديث المخزون بنجاح');
        loadAdminData();
    }
}

async function editProductStock(productId) {
    const stockInput = document.getElementById(`stock-${productId}`);
    stockInput.focus();
    stockInput.select();
}

async function deleteProduct(productId) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف جميع الطلبات المرتبطة به.')) {
        const success = await deleteProduct(productId);
        if (success) {
            alert('✅ تم حذف المنتج بنجاح');
            loadAdminData();
        }
    }
}

// دوال إدارة الطلبات
async function updateOrderStatus(orderId, newStatus) {
    const success = await updateOrder(orderId, { status: newStatus });
    if (success) {
        alert('✅ تم تحديث حالة الطلب');
        loadAdminData();
    }
}

async function cancelOrder(orderId) {
    if (confirm('⚠️ هل أنت متأكد من إلغاء هذا الطلب؟')) {
        const success = await updateOrder(orderId, { status: 'ملغى' });
        if (success) {
            alert('✅ تم إلغاء الطلب');
            loadAdminData();
        }
    }
}

function contactCustomer(phoneNumber) {
    window.open(`tel:${phoneNumber}`, '_self');
}

function contactAdmin() {
    // يمكن إضافة رقم المطعم هنا
    alert('📞 اتصل بالمطعم على: 0123456789');
}

// دوال العميل
function displayCustomerInfo() {
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    if (customerNameDisplay && currentUser) {
        customerNameDisplay.textContent = `مرحباً، ${currentUser.name}`;
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAdmin');
    window.location.href = 'login.html';
}

// إضافة مستمع حدث للخروج
document.addEventListener('DOMContentLoaded', function() {
    const logoutButtons = document.querySelectorAll('[href="login.html"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});

// تهيئة الصفحة عند التحميل
window.addEventListener('load', function() {
    // أي تهيئة إضافية هنا
});