// src/components/KanbanColumn.jsx
import { MoreHorizontal, Clock, Trash2, Edit2 } from 'lucide-react'; 

const KanbanColumn = ({ 
  title, 
  status, 
  tasks, 
  onDragOver, 
  onDrop, 
  onDragStart, 
  footerAction,
  openDropdownId,
  setOpenDropdownId,
  onDeleteTask,
  onEditTask 
}) => {
  return (
    <div 
      className="flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl min-h-[500px] border border-slate-200 dark:border-slate-700/50"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {title}
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">
            {tasks.length}
          </span>
        </h3>
      </div>
      
      <div className="p-3 flex-1 flex flex-col gap-3">
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                task.priority === 'Urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                task.priority === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {task.priority}
              </span>
              
              <div className="relative">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setOpenDropdownId(openDropdownId === task.id ? null : task.id); 
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {openDropdownId === task.id && (
                  <div 
                    className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 animate-in fade-in slide-in-from-top-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEditTask(task)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Task
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {task.title}
            </h4>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {task.client}
              </div>
            </div>
          </div>
        ))}
        
        {footerAction}
      </div>
    </div>
  );
};

export default KanbanColumn;