// src/pages/Dashboard.jsx
import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { DollarSign, Briefcase, Clock, ArrowUpRight, UserPlus, CheckSquare, Loader2, PieChart as PieIcon, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../components/StatCard';

const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = timestamp.toDate();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [data, setData] = useState({ clients: [], tasks: [], invoices: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(5);

    useEffect(() => {
        if (!currentUser) return;

        const qClients = query(collection(db, 'clients'), orderBy('createdAt', 'desc'), limit(25));
        const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(25));
        const qInvoices = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'), limit(25));

        let clients = [], tasks = [], invoices = [];

        const sync = () => {
            setData({ clients, tasks, invoices });
            setIsLoading(false);
        };

        const unsubC = onSnapshot(qClients, (s) => { clients = s.docs.map(d => ({ id: d.id, type: 'client', ...d.data() })); sync(); });
        const unsubT = onSnapshot(qTasks, (s) => { tasks = s.docs.map(d => ({ id: d.id, type: 'task', ...d.data() })); sync(); });
        const unsubI = onSnapshot(qInvoices, (s) => { invoices = s.docs.map(d => ({ id: d.id, type: 'invoice', ...d.data() })); sync(); });

        return () => { unsubC(); unsubT(); unsubI(); };
    }, [currentUser]);

    const stats = useMemo(() => {
        const revenue = data.invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + (inv.amount || 0), 0);

        const activeProjects = new Set(
            data.tasks.filter(t => t.status === 'in-progress').map(t => t.client)
        ).size;

        const pendingTasks = data.tasks.filter(t => t.status !== 'done').length;

        return { revenue, activeProjects, pendingTasks };
    }, [data]);

    const chartData = useMemo(() => {
        const groups = data.invoices.reduce((acc, inv) => {
            acc[inv.client] = (acc[inv.client] || 0) + (inv.amount || 0);
            return acc;
        }, {});
        return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }, [data.invoices]);

    const recentActivity = useMemo(() => {
        return [...data.clients, ...data.tasks, ...data.invoices]
            .filter(item => item.userId === currentUser?.uid)
            .sort((a, b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now()));
    }, [data, currentUser]);

    if (isLoading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} trend="+12%" />
                <StatCard title="Active Projects" value={stats.activeProjects} icon={Briefcase} />
                <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} />
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">

                {/* Recent Activity Feed - Now 3/5 width */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 flex flex-col transition-colors">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>

                    {recentActivity.length > 0 ? (
                        <div className="space-y-3 flex-1">
                            {recentActivity.slice(0, displayCount).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                                >
                                    {/* Icon Container */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${activity.type === 'client' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                            activity.type === 'invoice' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                                                'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                        }`}>
                                        {activity.type === 'client' ? <UserPlus className="w-5 h-5" /> :
                                            activity.type === 'invoice' ? <FileText className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                                            {activity.type === 'client' ? (
                                                <span>Added client <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{activity.name}</span></span>
                                            ) : activity.type === 'invoice' ? (
                                                <span>Invoice generated for <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{activity.client}</span></span>
                                            ) : (
                                                <span>Task created: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{activity.title}</span></span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{activity.type}</span>
                                            <span className="text-slate-300 dark:text-slate-600">•</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {getRelativeTime(activity.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Arrow (Visual indicator) */}
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                                </div>
                            ))}

                            {recentActivity.length > displayCount && (
                                <button
                                    onClick={() => setDisplayCount(prev => prev + 5)}
                                    className="mt-4 w-full py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all"
                                >
                                    View Older Activity
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm italic">Waiting for your first move...</p>
                        </div>
                    )}
                </div>

                {/* Revenue Pie Chart - Now 2/5 width */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 flex flex-col min-h-[450px]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-indigo-500" /> Revenue Split
                    </h2>

                    <div className="flex-1 w-full h-full flex items-center justify-center">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center px-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PieIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Analytics Unavailable</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                    Charts will populate once you record and complete paid invoices.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;