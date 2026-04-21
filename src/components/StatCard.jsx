import { ArrowUpRight } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {trend}
        </span>
        <span className="text-slate-500 dark:text-slate-400 ml-2">vs last month</span>
      </div>
    )}
  </div>
);

export default StatCard;