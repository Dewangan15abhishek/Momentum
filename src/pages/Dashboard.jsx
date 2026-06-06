import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, serverTimestamp
} from "firebase/firestore";
import AddProgressModal from "../components/AddProgressModal";
import HeatmapView from "../components/HeatmapView";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [heatmapLogs, setHeatmapLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", totalTarget: "", deadline: "", dailyTarget: "",
  });

  const fetchGoals = async () => {
    const q = query(collection(db, "goals"), where("createdBy", "==", user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setGoals(data);
    setLoading(false);
    await fetchHeatmapData(data);
  };

  const fetchHeatmapData = async (goalsList) => {
    if (goalsList.length === 0) return;
    const logsQuery = query(collection(db, "dailyLogs"), where("userId", "==", user.uid));
    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(d => d.data());

    const dateMap = {};
    logs.forEach((log) => {
      const goal = goalsList.find(g => g.id === log.goalId);
      if (!goal) return;
      const percent = Math.min(Math.round((log.completedAmount / goal.dailyTarget) * 100), 100);
      if (!dateMap[log.date]) dateMap[log.date] = { total: 0, count: 0 };
      dateMap[log.date].total += percent;
      dateMap[log.date].count += 1;
    });

    const heatData = Object.entries(dateMap).map(([date, val]) => ({
      date,
      completionPercent: Math.round(val.total / val.count),
    }));

    setHeatmapLogs(heatData);
    calculateStreak(heatData);
  };

  const calculateStreak = (heatData) => {
    const dateSet = new Set(heatData.filter(d => d.completionPercent >= 50).map(d => d.date));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split("T")[0];
      if (dateSet.has(str)) count++;
      else break;
    }
    setStreak(count);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleLogout = async () => { await signOut(auth); navigate("/"); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddGoal = async () => {
    if (!form.title || !form.totalTarget || !form.deadline || !form.dailyTarget) {
      alert("Fill all required fields."); return;
    }
    await addDoc(collection(db, "goals"), {
      title: form.title, description: form.description,
      totalTarget: Number(form.totalTarget), completed: 0,
      deadline: form.deadline, dailyTarget: Number(form.dailyTarget),
      createdBy: user.uid, createdAt: serverTimestamp(),
    });
    setForm({ title: "", description: "", totalTarget: "", deadline: "", dailyTarget: "" });
    setShowForm(false);
    fetchGoals();
  };

  const handleDelete = async (id) => { await deleteDoc(doc(db, "goals", id)); fetchGoals(); };
  const getProgress = (completed, total) => Math.min(Math.round((completed / total) * 100), 100);
  const getDaysLeft = (deadline) => Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <div className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight">Momentum</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          <button onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full grid grid-cols-3 gap-3 px-6 pt-6">
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-gray-400 text-xs uppercase tracking-widest">Streak</span>
          <span className="text-3xl font-bold text-indigo-400">{streak} 🔥</span>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-gray-400 text-xs uppercase tracking-widest">Active Goals</span>
          <span className="text-3xl font-bold text-white">{goals.length}</span>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-gray-400 text-xs uppercase tracking-widest">Days Logged</span>
          <span className="text-3xl font-bold text-white">{heatmapLogs.length}</span>
        </div>
      </div>

      {/* Main: Goals left, Heatmap right */}
      <div className="w-full flex flex-col lg:flex-row gap-4 px-6 py-6 flex-1">

        {/* LEFT — Goals */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Goals</h2>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
              {showForm ? "Cancel" : "+ New Goal"}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
              <h3 className="text-base font-semibold">Create Goal</h3>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="Goal title *"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500 w-full" />
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="Description (optional)"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500 w-full" />
              <input name="totalTarget" value={form.totalTarget} onChange={handleChange}
                placeholder="Total target *" type="number"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500 w-full" />
              <input name="dailyTarget" value={form.dailyTarget} onChange={handleChange}
                placeholder="Daily target *" type="number"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none placeholder-gray-500 w-full" />
              <input name="deadline" value={form.deadline} onChange={handleChange}
                type="date"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none w-full" />
              <button onClick={handleAddGoal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition self-start">
                Save Goal
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading goals...</p>
          ) : goals.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg">No goals yet.</p>
              <p className="text-sm mt-1">Click "+ New Goal" to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map((goal) => {
                const progress = getProgress(goal.completed, goal.totalTarget);
                const daysLeft = getDaysLeft(goal.deadline);
                const remaining = goal.totalTarget - goal.completed;
                const requiredPerDay = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null;

                return (
                  <div key={goal.id} className="bg-gray-900 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-3">
                        <h3 className="text-base font-semibold">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-gray-400 text-xs mt-1">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex gap-3 items-center shrink-0">
                        <button onClick={() => setSelectedGoal(goal)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs transition">
                          Log Progress
                        </button>
                        <button onClick={() => handleDelete(goal.id)}
                          className="text-gray-600 hover:text-red-500 text-xs transition">
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }} />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{goal.completed} / {goal.totalTarget} ({progress}%)</span>
                      <span className={daysLeft < 5 ? "text-red-400" : "text-gray-400"}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Deadline passed"}
                      </span>
                    </div>

                    {requiredPerDay && (
                      <p className="text-xs text-gray-500 mt-1">
                        Need <span className="text-indigo-400 font-medium">{requiredPerDay}</span> per day to finish on time
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Heatmap */}
        <div className="w-full lg:w-1/2 shrink-0">
          <HeatmapView logs={heatmapLogs} />
        </div>

      </div>

      {selectedGoal && (
        <AddProgressModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSaved={fetchGoals}
        />
      )}
    </div>
  );
}