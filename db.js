// Firebase Configuration - استخدم الإعدادات الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyD639471Xuyi-Mfmedia_r99infc8j1U4LV9UHv",
    authDomain: "my-kitchen-49a81.firebaseapp.com",
    databaseURL: "https://my-kitchen-49a81-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "my-kitchen-49a81",
    storageBucket: "my-kitchen-49a81.appspot.com",
    messagingSenderId: "207795153976",
    appId: "1:207795153976:web:ic7f5e5a1effd913773881"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// إعدادات البائع الافتراضية
const DEFAULT_ADMIN_EMAIL = "admin@kitchen.com";
const DEFAULT_ADMIN_PASSWORD = "1234";

// الدوال الأساسية
async function initializeAppData() {
    // تهيئة بيانات البائع إذا لم تكن موجودة
    const adminRef = firebase.database().ref('admin');
    const snapshot = await adminRef.once('value');
    
    if (!snapshot.exists()) {
        await adminRef.set({
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD,
            createdAt: new Date().toISOString()
        });
    }
}

// دوال البائع
async function getAdminData() {
    const snapshot = await firebase.database().ref('admin').once('value');
    return snapshot.val();
}

async function verifyAdminLogin(email, password) {
    const adminData = await getAdminData();
    return adminData && adminData.email === email && adminData.password === password;
}

async function updateAdminPassword(currentPassword, newPassword) {
    try {
        const adminData = await getAdminData();
        
        // التحقق من الكود الحالي
        if (adminData.password !== currentPassword) {
            throw new Error('الكود الحالي غير صحيح');
        }
        
        // تحديث الكود الجديد
        await firebase.database().ref('admin').update({
            password: newPassword,
            lastPasswordChange: new Date().toISOString()
        });
        
        return true;
    } catch (error) {
        console.error('Error updating admin password:', error);
        throw error;
    }
}

// دوال المنتجات
async function saveProduct(product) {
    try {
        const newProductRef = firebase.database().ref('products').push();
        const productId = newProductRef.key;
        await newProductRef.set({
            ...product,
            id: productId,
            createdAt: new Date().toISOString(),
            available: true
        });
        return productId;
    } catch (error) {
        console.error('Error saving product:', error);
        alert('حدث خطأ في حفظ المنتج');
    }
}

function getProducts(callback) {
    firebase.database().ref('products').on('value', (snapshot) => {
        const productsData = snapshot.val();
        const productsArray = [];
        
        if (productsData) {
            Object.keys(productsData).forEach(key => {
                productsArray.push({
                    ...productsData[key],
                    firebaseId: key
                });
            });
        }
        
        callback(productsArray);
    });
}

async function updateProduct(productId, updates) {
    try {
        await firebase.database().ref('products/' + productId).update(updates);
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        alert('حدث خطأ في تحديث المنتج');
        return false;
    }
}

async function deleteProduct(productId) {
    try {
        await firebase.database().ref('products/' + productId).remove();
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ في حذف المنتج');
        return false;
    }
}

// دوال العملاء
async function saveCustomer(customer) {
    try {
        const customerRef = firebase.database().ref('customers/' + customer.phone);
        await customerRef.set({
            ...customer,
            createdAt: new Date().toISOString()
        });
        return customer.phone;
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('حدث خطأ في حفظ بيانات العميل');
    }
}

async function getCustomer(phone) {
    const snapshot = await firebase.database().ref('customers/' + phone).once('value');
    return snapshot.val();
}

// دوال الطلبات
async function saveOrder(order) {
    try {
        const newOrderRef = firebase.database().ref('orders').push();
        const orderId = newProductRef.key;
        const orderData = {
            ...order,
            id: orderId,
            orderDate: new Date().toISOString(),
            date: new Date().toLocaleDateString('ar-EG'),
            status: 'قيد الانتظار'
        };
        
        await newOrderRef.set(orderData);
        
        // تحديث المخزون
        await updateProductStock(order.productId, order.quantity);
        
        return orderId;
    } catch (error) {
        console.error('Error saving order:', error);
        alert('حدث خطأ في حفظ الطلب');
    }
}

async function updateProductStock(productId, quantity) {
    const productRef = firebase.database().ref('products/' + productId);
    const snapshot = await productRef.once('value');
    const product = snapshot.val();
    
    if (product && product.stock !== undefined) {
        const newStock = parseFloat(product.stock) - parseFloat(quantity);
        await productRef.update({ stock: Math.max(0, newStock) });
    }
}

function getOrders(callback) {
    firebase.database().ref('orders').on('value', (snapshot) => {
        const ordersData = snapshot.val();
        const ordersArray = [];
        
        if (ordersData) {
            Object.keys(ordersData).forEach(key => {
                ordersArray.push({
                    ...ordersData[key],
                    firebaseId: key
                });
            });
        }
        
        callback(ordersArray);
    });
}

function getTodayOrders(callback) {
    const today = new Date().toLocaleDateString('ar-EG');
    firebase.database().ref('orders').on('value', (snapshot) => {
        const ordersData = snapshot.val();
        const todayOrders = [];
        
        if (ordersData) {
            Object.keys(ordersData).forEach(key => {
                const order = ordersData[key];
                if (order.date === today) {
                    todayOrders.push({
                        ...order,
                        firebaseId: key
                    });
                }
            });
        }
        
        callback(todayOrders);
    });
}

async function updateOrder(orderId, updates) {
    try {
        await firebase.database().ref('orders/' + orderId).update(updates);
        return true;
    } catch (error) {
        console.error('Error updating order:', error);
        alert('حدث خطأ في تحديث الطلب');
        return false;
    }
}

async function deleteOrder(orderId) {
    try {
        await firebase.database().ref('orders/' + orderId).remove();
        return true;
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('حدث خطأ في حذف الطلب');
        return false;
    }
}

// تهيئة البيانات عند التحميل
initializeAppData();