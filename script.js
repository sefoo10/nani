// المتغيرات العامة
let currentUserType = null;
let selectedRestaurant = null;

// وظائف إدارة النماذج المنبثقة
function showUserLogin() {
    document.getElementById('userLoginModal').style.display = 'block';
}

function showVendorLogin() {
    document.getElementById('vendorLoginModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showUserSignup() {
    closeModal('userLoginModal');
    // يمكن إضافة نموذج التسجيل هنا
    alert('سيتم فتح نموذج التسجيل للمستخدم');
}

function showVendorSignup() {
    closeModal('vendorLoginModal');
    // يمكن إضافة نموذج التسجيل هنا
    alert('سيتم فتح نموذج التسجيل للبائع');
}

// اختيار نوع الحساب
function selectUserType() {
    currentUserType = 'user';
    document.getElementById('userInterface').classList.remove('hidden');
    document.querySelector('.account-type').style.display = 'none';
    loadUserInterface();
}

function selectVendorType() {
    currentUserType = 'vendor';
    document.getElementById('vendorInterface').classList.remove('hidden');
    document.querySelector('.account-type').style.display = 'none';
    loadVendorInterface();
}

// تحميل واجهة المستخدم
function loadUserInterface() {
    // يمكن جلب البيانات من API هنا
    console.log('تم تحميل واجهة المستخدم');
}

// تحميل واجهة البائع
function loadVendorInterface() {
    // يمكن جلب البيانات من API هنا
    loadMenuItems();
    loadOrders();
    console.log('تم تحميل واجهة البائع');
}

// عرض قائمة المطعم
function viewRestaurantMenu(restaurantId) {
    selectedRestaurant = restaurantId;
    // يمكن فتح صفحة القائمة هنا
    alert(`عرض قائمة المطعم رقم ${restaurantId}`);
}

// إدارة الطلبات للبائع
function acceptOrder(orderId) {
    if (confirm(`هل تريد قبول الطلب رقم ${orderId}؟`)) {
        // إرسال طلب القبول إلى API
        alert(`تم قبول الطلب رقم ${orderId}`);
        updateOrderStatus(orderId, 'accepted');
    }
}

function rejectOrder(orderId) {
    if (confirm(`هل تريد رفض الطلب رقم ${orderId}؟`)) {
        // إرسال طلب الرفض إلى API
        alert(`تم رفض الطلب رقم ${orderId}`);
        updateOrderStatus(orderId, 'rejected');
    }
}

function updateOrderStatus(orderId, status) {
    // تحديث حالة الطلب في الواجهة
    const orderElement = document.querySelector(`[onclick*="${orderId}"]`).closest('.order-item');
    if (orderElement) {
        orderElement.style.opacity = '0.5';
        setTimeout(() => {
            orderElement.remove();
        }, 1000);
    }
}

// إدارة قائمة الطعام للبائع
function loadMenuItems() {
    // جلب الأصناف من API
    const menuItems = [
        { id: 1, name: 'شاورما دجاج', price: 60, category: 'وجبات رئيسية' },
        { id: 2, name: 'برجر لحم', price: 45, category: 'وجبات سريعة' },
        { id: 3, name: 'بطاطس مقلية', price: 15, category: 'مقبلات' }
    ];

    const menuContainer = document.querySelector('.menu-items');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <strong>${item.name}</strong>
                <span>${item.price} جنيه</span>
                <span>${item.category}</span>
            </div>
            <div class="item-actions">
                <button onclick="editItem(${item.id})">تعديل</button>
                <button onclick="deleteItem(${item.id})">حذف</button>
            </div>
        `;
        menuContainer.appendChild(itemElement);
    });
}

function showAddItemForm() {
    const itemName = prompt('اسم الصنف:');
    const itemPrice = prompt('السعر:');
    const itemCategory = prompt('الفئة:');

    if (itemName && itemPrice && itemCategory) {
        // إرسال البيانات إلى API
        alert(`تم إضافة ${itemName} بسعر ${itemPrice} جنيه`);
        loadMenuItems(); // إعادة تحميل القائمة
    }
}

function editItem(itemId) {
    // فتح نموذج التعديل
    alert(`تعديل الصنف رقم ${itemId}`);
}

function deleteItem(itemId) {
    if (confirm('هل تريد حذف هذا الصنف؟')) {
        // إرسال طلب الحذف إلى API
        alert(`تم حذف الصنف رقم ${itemId}`);
        loadMenuItems(); // إعادة تحميل القائمة
    }
}

// تحميل الطلبات للبائع
function loadOrders() {
    // جلب الطلبات من API
    console.log('تم تحميل الطلبات');
}

// إغلاق النماذع عند النقر خارجها
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// إدارة حالة تسجيل الدخول
document.querySelectorAll('.login-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;

        // محاكاة تسجيل الدخول
        if (email && password) {
            alert('تم تسجيل الدخول بنجاح!');
            this.closest('.modal').style.display = 'none';
            
            if (this.closest('#userLoginModal')) {
                selectUserType();
            } else {
                selectVendorType();
            }
        }
    });
});