import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user?.companyId) return;

        const q = query(
          collection(db, "orders"),
          where("companyId", "==", user.companyId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const orderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(orderList);
      } catch (error) {
        console.error("Order history error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center p-10 text-gray-400 font-bold">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-black text-white">
          Order History
        </h1>
        <p className="text-gray-400 mt-1">
          All booked orders
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">

        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead className="bg-white/10 text-sm uppercase text-gray-300">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Booked By</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="p-4 font-semibold">
                      {order.customerName}
                    </td>
                    <td className="p-4 text-indigo-400 font-bold">
                      PKR {order.totalAmount}
                    </td>
                    <td className="p-4">
                      {order.bookedBy}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-bold">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default OrderHistory;