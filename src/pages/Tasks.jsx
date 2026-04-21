import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import KanbanColumn from '../components/KanbanColumn';

const Tasks = () => {
  const { currentUser } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    client: '',
    priority: 'Medium'
  });

  useEffect(() => {
    if (!currentUser) return;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setNetworkError(true);
      }
    }, 5000);

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const userTasks = taskData.filter(task => task.userId === currentUser.uid);
      setTasks(userTasks);
      setIsLoading(false);
      setNetworkError(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
      setNetworkError(true);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [currentUser, isLoading]);

  const handleDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move'; 
    setOpenDropdownId(null); 
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, newStatus) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    
    if (!draggedTaskId) return;

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const taskRef = doc(db, 'tasks', draggedTaskId);
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      console.error("Failed to sync drag and drop to database", error);
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        setOpenDropdownId(null);
      } catch (error) {
        console.error("Error deleting task: ", error);
        alert("Failed to delete task.");
      }
    }
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setNewTaskForm({ title: '', client: '', priority: 'Medium' });
    setEditingTaskId(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setNewTaskForm({
      title: task.title,
      client: task.client === 'Unassigned' ? '' : task.client,
      priority: task.priority
    });
    setEditingTaskId(task.id);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  }, []);

  const handleSubmitTask = useCallback(async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim() || !currentUser) return;

    setIsSaving(true);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("NETWORK_TIMEOUT")), 5000);
    });

    try {
      if (editingTaskId) {
        const taskRef = doc(db, 'tasks', editingTaskId);
        await Promise.race([
          updateDoc(taskRef, {
            title: newTaskForm.title,
            client: newTaskForm.client || 'Unassigned',
            priority: newTaskForm.priority
          }),
          timeoutPromise
        ]);
      } else {
        await Promise.race([
          addDoc(collection(db, 'tasks'), {
            title: newTaskForm.title,
            client: newTaskForm.client || 'Unassigned',
            status: 'todo', // Default column
            priority: newTaskForm.priority,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
          }),
          timeoutPromise
        ]);
      }
      
      setNewTaskForm({ title: '', client: '', priority: 'Medium' });
      setEditingTaskId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving task: ", error);
      if (error.message === "NETWORK_TIMEOUT") {
        alert("The server took too long to respond. Task cached locally.");
        setIsModalOpen(false); 
      } else {
        alert("Failed to save task.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [newTaskForm, editingTaskId, currentUser]);

  const todoTasks = useMemo(() => tasks.filter(task => task.status === 'todo'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(task => task.status === 'in-progress'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(task => task.status === 'done'), [tasks]);

  const todoFooterAction = (
    <button 
      onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }}
      className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium p-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full border border-dashed border-slate-300 dark:border-slate-600"
    >
      <Plus className="w-4 h-4" /> Add Task
    </button>
  );

  return (
    <div className="h-full flex flex-col space-y-6 relative" onClick={() => setOpenDropdownId(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your workflow and track project status.</p>
        </div>
      </div>

      {networkError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 flex items-start gap-3 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Blocked</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              We couldn't connect to the database. Please ensure your adblocker or Brave Shields are disabled for localhost.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            title="To Do" 
            status="todo" 
            tasks={todoTasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            footerAction={todoFooterAction}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
          <KanbanColumn 
            title="In Progress" 
            status="in-progress" 
            tasks={inProgressTasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
          <KanbanColumn 
            title="Done" 
            status="done" 
            tasks={doneTasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="e.g. Design wireframes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned To (Client/User)
                </label>
                <input
                  type="text"
                  value={newTaskForm.client}
                  onChange={(e) => setNewTaskForm({...newTaskForm, client: e.target.value})}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:opacity-70 flex items-center justify-center gap-2 rounded-md transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTaskId ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;