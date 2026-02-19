// Is code mein writeBatch use kiya gaya hai jo foran save karta hai
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, addDoc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  // ... (purana state logic wahi rahega)

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Data missing!");
    setLoading(true);
    
    const batch = writeBatch(db); // Fast Batch processing
    const saleRef = collection(db, "sales_records");
    const newSaleData = {
      customerName,
      items: cart,
      totalAmount: calculateTotal(),
      createdAt: serverTimestamp()
    };

    try {
      // 1. Add Sale Record
      await addDoc(saleRef, newSaleData);

      // 2. Fast Inventory Update
      cart.forEach(product => {
        const itemRef = doc(db, "inventory_records", product.id);
        const newStockPcs = (parseFloat(product.totalPcs) || 0) - product.quantity;
        const newBoxes = newStockPcs / (parseFloat(product.pcsPerBox) || 1);
        
        batch.update(itemRef, {
          totalPcs: newStockPcs,
          openingStock: newBoxes.toFixed(2)
        });
      });

      await batch.commit(); // Ek saath sab update!
      printInvoice(newSaleData);
      setCart([]); setCustomerName('');
      alert("Sale Fast Saved!");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };
  // ... (baqi UI logic same)
