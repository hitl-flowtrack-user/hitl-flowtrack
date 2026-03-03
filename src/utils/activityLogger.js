import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Enterprise Level Activity Logger
 * Every important action in system should call this function
 */

export async function logActivity({
  userId,
  companyId,
  module,
  action,
  details = {}
}) {
  try {
    if (!userId || !companyId) return;

    await addDoc(collection(db, "activityLogs"), {
      userId,
      companyId,
      module,          // e.g. "Inventory"
      action,          // e.g. "Created Product"
      details,         // optional extra info
      timestamp: serverTimestamp()
    });

  } catch (error) {
    console.error("Activity Log Error:", error);
  }
}