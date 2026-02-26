import React, { useState, useEffect } from 'react';
import { db, logActivity } from '../../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, User, MapPin, CheckCircle, Trash2, FileText } from 'lucide-react';

const OrderBooking = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample Customer Location (Real app mein ye customer ke database se aayega)
  const CUSTOMER_SHOP_LOCATION = { lat: 31.3454, lng: 73.5123 }; 

  // 1. Location Check Karna (Geo-Restriction)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, CUSTOMER_SHOP_LOCATION.lat, CUSTOMER_SHOP_LOCATION.lng);
      if (dist <= 200) setIsLocationVerified(true);
    });
    fetchProducts();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // 2. Stock Load Karna (StoneCraft items)
  const fetchProducts = async () => {
    const q = query(collection(db, "products"), where("companyId", "==", currentUser.companyId));
    const snap = await getDocs(q);
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 3. Cart mein item dalna
  const addToCart = (product) => {
    if (product.stockLevel <= 0) return alert("Stock khatam hai!");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // 4. Order Finalize Karna
  const placeOrder = async () => {
    if (!isLocationVerified) return alert("Order Cancelled: Aap customer ki shop par maujood nahi hain!");
    if (!customerName || cart.length === 0) return alert("Customer name aur items zaroori hain!");

    setLoading(true);
    try {
      // Order save karna
      const orderRef = await addDoc(collection(db, "orders"), {
        customerName,
        items: cart,
        total: cart.reduce((sum, i) => sum + (i.price * i.qty), 0),
        bookedBy: currentUser.uid,
        companyId: currentUser.companyId,
        timestamp: serverTimestamp(),
        status: "Pending Dispatch"
      });

      // Stock update karna (Inventory se minus karna)
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        await updateDoc(productRef, {
          stockLevel: increment(-item.qty)
        });
      }

      await logActivity(currentUser.uid, currentUser.companyId, "ORDER_PLACED", "Sales", `Order #${orderRef.id} for ${customerName}`);
      
      alert("Order Book ho gaya! DocVault mein invoice check karen.");
      setCart([]);
      setCustomerName('');
      fetchProducts();
    } catch (e) {
      alert("Order failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Product List */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShoppingCart /> StoneCraft Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500 cursor-pointer" onClick={() => addToCart(p)}>
              <div className="flex justify-between">
                <span className="font-bold">{p.name}</span>
                <span className="text-green-600 font-bold">Rs.{p.price}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Stock Available: {p.stockLevel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Cart & Checkout */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 h-fit sticky top-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><FileText /> Order Summary</h2>
        
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
          <div className="flex items-center gap-2 border-b-2 py-2">
            <User size={18} className="text-gray-400" />
            <input className="w-full outline-none" placeholder="Enter Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.qty}</span>
              <span className="font-bold">Rs.{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between text-xl font-black">
            <span>Total:</span>
            <span>Rs.{cart.reduce((sum, i) => sum + (i.price * i.qty), 0)}</span>
          </div>
        </div>

        {/* Location Verification Tag */}
        <div className={`p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2 ${isLocationVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <MapPin size={14} /> {isLocationVerified ? "Shop Location Verified" : "Verification Failed: Not at Shop"}
        </div>

        <button 
          onClick={placeOrder}
          disabled={loading || !isLocationVerified}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all"
        >
          {loading ? "Processing..." : "Confirm & Book Order"}
        </button>
      </div>
    </div>
  );
};

export default OrderBooking;