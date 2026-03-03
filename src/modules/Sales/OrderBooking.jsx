import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Loader2 } from "lucide-react";

export default function OrderBooking() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.companyId) return;
      try {
        const q = query(
          collection(db, "products"),
          where("companyId", "==", user.companyId)
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    
    if (!user?.companyId || !user?.email) {
      return alert("User session not found. Please log in again.");
    }

    setIsPlacing(true);
    try {
      const orderData = {
        companyId: user.companyId,
        bookedBy: user.email,
        items: cart.map(item => ({
          id: item.id,
          name: item.name || "Unknown Item",
          price: Number(item.price) || 0,
          quantity: item.quantity
        })),
        total: totalAmount,
        status: "completed",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "orders"), orderData);
      
      alert("Order Placed Successfully!");
      setCart([]);
    } catch (error) {
      console.error("Order Error:", error);
      alert("Error placing order: " + error.message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={40} /></div>;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-950 text-white font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-black italic uppercase flex items-center gap-3">
          <ShoppingCart className="text-amber-500" size={32} /> POS Terminal
        </h2>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Order Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.length === 0 && <p className="text-zinc-500 italic p-10 col-span-full text-center">No products found. Please add products first.</p>}
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white/5 border border-white/10 p-4 rounded-3xl hover:border-amber-500/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={20} className="text-amber-500" />
              </div>
              <h4 className="font-black uppercase text-sm mb-1">{product.name}</h4>
              <p className="text-amber-500 font-black italic text-lg">Rs.{product.price}</p>
              <p className="text-[9px] text-zinc-500 uppercase font-bold mt-2">Stock: {product.stock || 0}</p>
            </div>
          ))}
        </div>

        {/* Cart Sidebar */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 h-fit sticky top-8">
          <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 italic">
            Current Order <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full not-italic">{cart.length}</span>
          </h3>

          <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.length === 0 && (
              <p className="text-zinc-600 italic text-center py-10 text-xs font-black uppercase">Your cart is empty</p>
            )}
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[11px] font-black uppercase">{item.name}</p>
                  <p className="text-[10px] text-amber-500 font-black">Rs.{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-amber-500"><Minus size={14} /></button>
                    <span className="text-xs font-black px-2">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-amber-500"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total Payable</span>
              <span className="text-3xl font-black italic text-white">Rs.{totalAmount}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black uppercase py-4 rounded-2xl tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isPlacing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              {isPlacing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}