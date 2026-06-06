import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

export default function HeatmapView({ logs }) {
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const values = logs.map((log) => ({
    date: log.date,
    count: log.completionPercent,
  }));

  const getColor = (value) => {
    if (!value || value.count === 0) return "color-empty";
    if (value.count < 40) return "color-scale-1";
    if (value.count < 70) return "color-scale-2";
    if (value.count < 100) return "color-scale-3";
    return "color-scale-4";
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs">Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-red-900" />
          <div className="w-3 h-3 rounded-sm bg-yellow-600" />
          <div className="w-3 h-3 rounded-sm bg-lime-500" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span className="text-gray-600 text-xs">More</span>
        </div>
      </div>
      <style>{`
        .react-calendar-heatmap {
          width: 100%;
          display: block;
        }
        .react-calendar-heatmap .color-empty { fill: #1f2937; }
        .react-calendar-heatmap .color-scale-1 { fill: #7c2d12; }
        .react-calendar-heatmap .color-scale-2 { fill: #ca8a04; }
        .react-calendar-heatmap .color-scale-3 { fill: #84cc16; }
        .react-calendar-heatmap .color-scale-4 { fill: #16a34a; }
        .react-calendar-heatmap text { fill: #6b7280; font-size: 9px; }
      `}</style>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={getColor}
        showWeekdayLabels={true}
      />
    </div>
  );
}