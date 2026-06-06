import { useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export default function AddProgressModal({ goal, onClose, onSaved }) {
  const [form, setForm] = useState({
    completedAmount: "",
    hoursSpent: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.completedAmount) {
      alert("Enter completed amount.");
      return;
    }
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "dailyLogs"), {
      goalId: goal.id,
      userId: auth.currentUser.uid,
      date: today,
      completedAmount: Number(form.completedAmount),
      hoursSpent: Number(form.hoursSpent) || 0,
      notes: form.notes,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "goals", goal.id), {
      completed: increment(Number(form.completedAmount)),
    });

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-5 w-full max-w-md mx-4 flex flex-col gap-4">
        <h3 className="text-white text-lg font-semibold">Log Progress — {goal.title}</h3>

        <input
          name="completedAmount"
          value={form.completedAmount}
          onChange={handleChange}
          type="number"
          placeholder="Completed today *"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500"
        />
        <input
          name="hoursSpent"
          value={form.hoursSpent}
          onChange={handleChange}
          type="number"
          placeholder="Hours spent (optional)"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500"
        />
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (optional)"
          rows={3}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500 resize-none"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}