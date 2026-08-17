import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3, Check, Circle, GripVertical, ListTodo, MoreHorizontal,
  Plus, Rows3, SlidersHorizontal, Trash2, X
} from 'lucide-react';
import './styles.css';

const initialProjects = [
  {
    id: 'launch', name: '产品发布计划', color: '#ec6a4b', emoji: '🚀', due: '8月18日',
    description: '完成首版产品设计、开发与上线准备',
    tasks: [
      { id: 1, title: '梳理核心用户流程', date: '今天', estimate: 90, actual: 70, done: true, priority: '高' },
      { id: 2, title: '完成首页高保真设计', date: '今天', estimate: 120, actual: 45, done: false, priority: '高' },
      { id: 3, title: '整理首轮测试反馈', date: '今天', estimate: 60, actual: 0, done: false, priority: '中' },
      { id: 4, title: '搭建用户登录模块', date: '明天', estimate: 150, actual: 0, done: false, priority: '高' },
      { id: 5, title: '准备产品演示数据', date: '周四', estimate: 80, actual: 0, done: false, priority: '中' },
    ]
  },
  {
    id: 'content', name: '内容增长实验', color: '#317d72', emoji: '✦', due: '9月1日',
    description: '验证三个内容方向并形成稳定发布节奏',
    tasks: [
      { id: 11, title: '分析上周内容数据', date: '今天', estimate: 60, actual: 60, done: true, priority: '中' },
      { id: 12, title: '确定本周三个选题', date: '今天', estimate: 45, actual: 20, done: false, priority: '高' },
      { id: 13, title: '撰写第一篇内容', date: '明天', estimate: 120, actual: 0, done: false, priority: '中' },
    ]
  },
  {
    id: 'learn', name: '系统学习 AI', color: '#d99b2b', emoji: '◉', due: '长期',
    description: '建立 AI 工具与工程实践的知识体系',
    tasks: [
      { id: 21, title: '完成提示词课程第三章', date: '今天', estimate: 50, actual: 0, done: false, priority: '中' },
      { id: 22, title: '整理学习笔记', date: '明天', estimate: 40, actual: 0, done: false, priority: '低' },
    ]
  }
];
const sampleTaskIds = new Set([1,2,3,4,5,11,12,13,21,22]);
const blankProjects = initialProjects.map(project => ({ ...project, tasks: [] }));
const localTitleTranslations = {
  '第一个任务':'First task', '第二个任务':'Second task', '第三个任务':'Third task',
  '准备产品演示数据':'Prepare product demo data', '完成首页高保真设计':'Complete homepage high-fidelity design',
  '梳理核心用户流程':'Map core user flow', '整理首轮测试反馈':'Organize first-round test feedback',
  '搭建用户登录模块':'Build user login module'
};
const translateTaskTitle = title => {
  if (!title || !/[\u4e00-\u9fff]/.test(title)) return title || '';
  if (localTitleTranslations[title]) return localTitleTranslations[title];
  const ordinal = title.match(/^第([一二三四五六七八九十])个任务$/);
  if (ordinal) return `${({一:'First',二:'Second',三:'Third',四:'Fourth',五:'Fifth',六:'Sixth',七:'Seventh',八:'Eighth',九:'Ninth',十:'Tenth'})[ordinal[1]]} task`;
  return title;
};

function App() {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('daycraft-projects')) || blankProjects;
      return saved.map(project => ({ ...project, tasks: project.tasks.filter(task => !sampleTaskIds.has(task.id)) }));
    }
    catch { return blankProjects; }
  });
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [notice, setNotice] = useState('');
  const [viewMode, setViewMode] = useState('gantt');
  const [timeScale, setTimeScale] = useState('week');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [fontScale, setFontScale] = useState(() => localStorage.getItem('daycraft-font-scale') || 'normal');
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem('daycraft-language') || 'sans');
  const [density, setDensity] = useState('comfortable');
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(285);
  const [resizing, setResizing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
  const [barDraft, setBarDraft] = useState(null);
  const pointerDrag = useRef(null);
  const suppressTaskClick = useRef(false);
  const active = projects.find(p => p.id === activeId) || projects[0];
  const isEnglish = fontStyle === 'system';
  const ui = {
    settings:isEnglish?'Interface settings':'界面设置', fontSize:isEnglish?'Text size':'字号', small:isEnglish?'Small':'小', normal:isEnglish?'Standard':'标准', large:isEnglish?'Large':'大',
    font:isEnglish?'Language':'字体', chinese:isEnglish?'Chinese':'中文', english:isEnglish?'English':'英文', density:isEnglish?'Task density':'任务密度', compact:isEnglish?'Compact':'紧凑', comfortable:isEnglish?'Comfortable':'舒适', grid:isEnglish?'Show time grid':'显示时间网格',
    todayDone:isEnglish?'completed today':'今日完成', noTasks:isEnglish?'No tasks yet':'暂无任务', addTask:isEnglish?'Add task':'添加任务', completeTask:isEnglish?'Complete task':'完成任务', dragSort:isEnglish?'Drag to reorder':'拖动排序', resizeSidebar:isEnglish?'Resize task panel':'调整任务栏宽度',
    day:isEnglish?'D':'日', week:isEnglish?'W':'周', month:isEnglish?'M':'月', gantt:isEnglish?'Gantt':'甘特图', schedule:isEnglish?'Schedule':'时间表', noPeriodTasks:isEnglish?'No tasks in this period':'该周期暂无任务',
    confirmAdd:isEnglish?'Add':'确认添加', close:isEnglish?'Close':'关闭', editTask:isEnglish?'Edit task':'编辑任务', taskName:isEnglish?'Task name':'任务名称', startTime:isEnglish?'Start time':'开始时间', date:isEnglish?'Date':'安排日期', priority:isEnglish?'Priority':'优先级', plannedMinutes:isEnglish?'Planned minutes':'计划分钟', actualMinutes:isEnglish?'Actual minutes':'实际分钟', deleteTask:isEnglish?'Delete':'删除任务', save:isEnglish?'Save':'保存修改',
    high:isEnglish?'High':'高', medium:isEnglish?'Medium':'中', low:isEnglish?'Low':'低', more:isEnglish?'More settings':'更多设置'
  };
  const displayDate = value => isEnglish ? ({'今天':'Today','明天':'Tomorrow','周一':'Monday','周二':'Tuesday','周三':'Wednesday','周四':'Thursday','周五':'Friday','周六':'Saturday','周日':'Sunday'}[value] || value) : value;
  const getTaskTitle = task => isEnglish ? (task.titleEn || translateTaskTitle(task.title)) : task.title;

  useEffect(() => localStorage.setItem('daycraft-projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('daycraft-font-scale', fontScale), [fontScale]);
  useEffect(() => localStorage.setItem('daycraft-language', fontStyle), [fontStyle]);
  useEffect(() => {
    if (!showFontMenu) return;
    const closeOnOutsideClick = event => {
      if (!event.target.closest('.font-menu-wrap')) setShowFontMenu(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [showFontMenu]);
  useEffect(() => {
    if (!resizing) return;
    const move = e => {
      const workspace = document.querySelector('.planner-workspace');
      if (!workspace) return;
      const left = workspace.getBoundingClientRect().left;
      setSidebarWidth(Math.max(210, Math.min(480, e.clientX - left)));
    };
    const stop = () => setResizing(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
  }, [resizing]);
  useEffect(() => {
    const move = e => {
      const drag = pointerDrag.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.max(Math.abs(dx),Math.abs(dy)) > 5) drag.moved = true;
      if (!drag.moved) return;
      e.preventDefault();
      if (drag.mode !== 'vertical' && (drag.mode !== 'move' || Math.abs(dx) >= Math.abs(dy))) {
        drag.axis = 'horizontal';
        const gantt = document.querySelector('.gantt-body');
        if (!gantt) return;
        const units = drag.units || 7;
        const columnWidth = gantt.getBoundingClientRect().width / units;
        const delta = Math.round(dx / columnWidth);
        let start = drag.originalStart;
        let span = drag.originalSpan;
        if (drag.mode === 'resize-end') span = Math.max(1,Math.min(units-start,drag.originalSpan+delta));
        if (drag.mode === 'resize-start') {
          start = Math.max(0,Math.min(drag.originalStart+drag.originalSpan-1,drag.originalStart+delta));
          span = drag.originalSpan + (drag.originalStart-start);
        }
        if (drag.mode === 'move') start = Math.max(0,Math.min(units-span,drag.originalStart+delta));
        drag.currentStart = start;
        drag.currentSpan = span;
        setBarDraft({id:drag.id,start,span});
        return;
      }
      drag.axis = 'vertical';
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-task-id]');
      const targetId = target ? Number(target.dataset.taskId) : null;
      if (targetId && targetId !== drag.id) setDragOverTaskId(targetId);
    };
    const stop = () => {
      const drag = pointerDrag.current;
      if (!drag) return;
      if (drag.moved && drag.axis === 'horizontal') {
        applyTimelineChange(drag.id,drag.currentStart ?? drag.originalStart,drag.currentSpan ?? drag.originalSpan);
        suppressTaskClick.current = true;
        setTimeout(() => { suppressTaskClick.current = false; }, 0);
      } else if (drag.moved && dragOverTaskId) {
        reorderTask(drag.id, dragOverTaskId);
        suppressTaskClick.current = true;
        setTimeout(() => { suppressTaskClick.current = false; }, 0);
      }
      pointerDrag.current = null;
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      setBarDraft(null);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragOverTaskId, active?.id, timeScale]);
  const todayTasks = active?.tasks.filter(t => t.date === '今天') || [];
  const doneCount = todayTasks.filter(t => t.done).length;
  const progress = todayTasks.length ? Math.round(doneCount / todayTasks.length * 100) : 0;
  const planned = todayTasks.reduce((sum, t) => sum + t.estimate, 0);
  const actual = todayTasks.reduce((sum, t) => sum + t.actual, 0);

  function updateTask(taskId, patch) {
    setProjects(list => list.map(p => p.id === active.id
      ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) }
      : p));
  }

  function addTask(e) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const task = { id: Date.now(), title: taskTitle.trim(), ...(isEnglish ? {titleEn:taskTitle.trim()} : {}), date: '今天', startTime: '09:00', estimate: 60, actual: 0, done: false, priority: '中' };
    setProjects(list => list.map(p => p.id === active.id ? { ...p, tasks: [...p.tasks, task] } : p));
    setTaskTitle(''); setShowAddTask(false);
  }

  function addProject(e) {
    e.preventDefault();
    if (!projectName.trim()) return;
    const id = `project-${Date.now()}`;
    setProjects(list => [...list, { id, name: projectName.trim(), color: '#5b66a8', emoji: '◆', due: '待设定', description: '一个新的项目', tasks: [] }]);
    setActiveId(id); setProjectName(''); setShowAddProject(false);
  }

  function saveTask(e) {
    e.preventDefault();
    const editedTitle = isEnglish ? (editingTask?.titleEn || translateTaskTitle(editingTask?.title)).trim() : editingTask?.title.trim();
    if (!editedTitle) return;
    updateTask(editingTask.id, {
      title: isEnglish ? editingTask.title : editedTitle,
      ...(isEnglish ? {titleEn:editedTitle} : {}),
      date: editingTask.date,
      estimate: Math.max(15, Number(editingTask.estimate) || 15),
      actual: Math.max(0, Number(editingTask.actual) || 0),
      priority: editingTask.priority,
      startTime: editingTask.startTime || '09:00'
    });
    setEditingTask(null);
    setNotice(isEnglish ? 'Task updated' : '任务已更新');
    setTimeout(() => setNotice(''), 1800);
  }

  function deleteTask() {
    if (!editingTask) return;
    setProjects(list => list.map(project => project.id === active.id
      ? { ...project, tasks: project.tasks.filter(task => task.id !== editingTask.id) }
      : project));
    setEditingTask(null);
    setNotice(isEnglish ? 'Task deleted' : '任务已删除');
    setTimeout(() => setNotice(''), 1800);
  }

  function reorderTask(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setProjects(list => list.map(project => {
      if (project.id !== active.id) return project;
      const tasks = [...project.tasks];
      const from = tasks.findIndex(task => task.id === sourceId);
      const to = tasks.findIndex(task => task.id === targetId);
      if (from < 0 || to < 0) return project;
      const [moved] = tasks.splice(from, 1);
      tasks.splice(to, 0, moved);
      return { ...project, tasks };
    }));
  }

  function finishDrop(targetId) {
    reorderTask(draggedTaskId, targetId);
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  }

  function startPointerDrag(e, taskId) {
    if (e.button !== 0) return;
    pointerDrag.current = { id: taskId, mode:'vertical', startX:e.clientX, startY: e.clientY, moved: false };
    setDraggedTaskId(taskId);
  }

  function startTimelineDrag(e, task, mode, start, span, units) {
    if (e.button !== 0) return;
    e.stopPropagation();
    pointerDrag.current = { id:task.id, mode, units, startX:e.clientX, startY:e.clientY, originalStart:start, originalSpan:span, currentStart:start, currentSpan:span, moved:false, axis:null };
    setDraggedTaskId(task.id);
  }

  if (!active) return null;

  const timelineTasks = active.tasks;
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(now);
  const todayIndex = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - todayIndex);
  const weekDates = dayNames.map((name, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { name: displayDate(name), date: date.getDate(), index };
  });
  const weekdayIndex = { '周一':0, '周二':1, '周三':2, '周四':3, '周五':4, '周六':5, '周日':6 };
  const taskDayIndex = task => task.date === '今天' ? todayIndex : task.date === '明天' ? Math.min(6, todayIndex + 1) : (weekdayIndex[task.date] ?? todayIndex);
  const dayHours = Array.from({length:24},(_,index)=>`${String(index).padStart(2,'0')}:00`);
  const monthRanges = ['1-5','6-10','11-15','16-20','21-25','26-30','31'];
  const timelineColumns = timeScale === 'day'
    ? dayHours.map((label,index)=>({label,sub:'',index}))
    : timeScale === 'month'
      ? monthRanges.map((label,index)=>({label:isEnglish ? new Intl.DateTimeFormat('en-US',{month:'short'}).format(now) : `${now.getMonth()+1}月`,sub:label,index}))
      : weekDates.map(day=>({label:day.name,sub:String(day.date),index:day.index}));
  const highlightIndex = timeScale === 'day'
    ? now.getHours()
    : timeScale === 'month'
      ? Math.min(6,Math.floor((now.getDate()-1)/5))
      : todayIndex;
  const getTaskStart = task => {
    const scheduled = task.scheduledDate ? new Date(`${task.scheduledDate}T00:00:00`) : null;
    if (timeScale === 'day') {
      if (scheduled && toLocalISO(scheduled) !== toLocalISO(now)) return 18;
      if (!scheduled && task.date !== '今天') return 18;
      const [hour,minute] = (task.startTime || '09:00').split(':').map(Number);
      return Math.max(0,Math.min(47,hour*2+(minute>=30?1:0)));
    }
    if (timeScale === 'month') {
      if (scheduled && scheduled.getMonth() === now.getMonth() && scheduled.getFullYear() === now.getFullYear()) return Math.max(0,Math.min(6,Math.floor((scheduled.getDate()-1)/5)));
      const dayOffset = task.date === '今天' ? 0 : task.date === '明天' ? 1 : (taskDayIndex(task)-todayIndex);
      const taskDate = new Date(now);
      taskDate.setDate(now.getDate()+dayOffset);
      return Math.max(0,Math.min(6,Math.floor((taskDate.getDate()-1)/5)));
    }
    if (scheduled) return Math.max(0,Math.min(6,Math.round((scheduled-weekStart)/86400000)));
    return taskDayIndex(task);
  };
  const getTaskSpan = task => timeScale === 'day'
    ? Math.max(1,Math.min(48,Math.ceil(task.estimate/30)))
    : timeScale === 'month' ? 1 : Math.max(1,Math.min(3,Math.ceil(task.estimate/60)));
  const planTitle = timeScale === 'day' ? (isEnglish?'Daily plan':'日内计划') : timeScale === 'month' ? (isEnglish?'Monthly plan':'月内计划') : (isEnglish?'Weekly plan':'周内计划');
  const timelineUnits = timeScale === 'day' ? 48 : 7;
  const headerColumns = timeScale === 'day' ? 24 : 7;
  const toLocalISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const formatTaskSchedule = task => {
    const [hour, minute] = (task.startTime || '09:00').split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + task.estimate;
    const formatTime = total => `${Math.floor(total / 60) % 24}:${String(total % 60).padStart(2,'0')}`;
    const nextDay = endMinutes >= 24 * 60 ? (isEnglish?'next day ':'次日') : '';
    return isEnglish ? `${formatTime(startMinutes)}-${nextDay}${formatTime(endMinutes)}, ${task.estimate} min` : `${formatTime(startMinutes)}-${nextDay}${formatTime(endMinutes)}，${task.estimate} 分钟`;
  };
  const scheduleTasks = timelineTasks.filter(task => {
    if (!task.scheduledDate) return timeScale === 'day' ? task.date === '今天' : true;
    const scheduled = new Date(`${task.scheduledDate}T00:00:00`);
    if (timeScale === 'day') return toLocalISO(scheduled) === toLocalISO(now);
    if (timeScale === 'week') return scheduled >= weekStart && scheduled < new Date(weekStart.getTime() + 7 * 86400000);
    return scheduled.getFullYear() === now.getFullYear() && scheduled.getMonth() === now.getMonth();
  });
  const scheduleTitle = timeScale === 'day' ? (isEnglish?'Today schedule':'今日时间表') : timeScale === 'week' ? (isEnglish?'Weekly schedule':'本周时间表') : (isEnglish?'Monthly schedule':'本月时间表');

  function applyTimelineChange(taskId,start,span) {
    const patch = {};
    if (timeScale === 'day') {
      const totalMinutes = start*30;
      patch.startTime = `${String(Math.floor(totalMinutes/60)).padStart(2,'0')}:${totalMinutes%60===30?'30':'00'}`;
      patch.estimate = span*30;
      patch.date = '今天';
      patch.scheduledDate = toLocalISO(now);
    } else if (timeScale === 'week') {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate()+start);
      patch.scheduledDate = toLocalISO(date);
      patch.date = start === todayIndex ? '今天' : start === todayIndex+1 ? '明天' : dayNames[start];
      patch.estimate = span*60;
    } else {
      const date = new Date(now.getFullYear(),now.getMonth(),Math.min(new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),start*5+1));
      patch.scheduledDate = toLocalISO(date);
      patch.date = `${date.getMonth()+1}月${date.getDate()}日`;
      patch.estimate = Math.max(60,span*60);
    }
    updateTask(taskId,patch);
  }

  return <div className={`app-shell font-${fontScale} type-${fontStyle} density-${density} ${resizing?'is-resizing':''}`}>
    <main>
      <header className="topbar">
        <span className="date-label">{dateLabel}</span>
        <div className="top-actions">
          <div className="font-menu-wrap">
            <button className={`icon-button ${showFontMenu ? 'active' : ''}`} title={ui.more} aria-label={ui.more} onClick={() => setShowFontMenu(v => !v)}><MoreHorizontal size={20}/></button>
            {showFontMenu && <div className="font-menu">
              <div className="font-menu-title"><SlidersHorizontal size={14}/>{ui.settings}</div>
              <label><span>{ui.fontSize}</span><div className="setting-options"><button className={fontScale==='compact'?'selected':''} onClick={()=>setFontScale('compact')}>{ui.small}</button><button className={fontScale==='normal'?'selected':''} onClick={()=>setFontScale('normal')}>{ui.normal}</button><button className={fontScale==='large'?'selected':''} onClick={()=>setFontScale('large')}>{ui.large}</button></div></label>
              <label><span>{ui.font}</span><div className="setting-options"><button className={fontStyle==='sans'?'selected':''} onClick={()=>setFontStyle('sans')}>{ui.chinese}</button><button className={fontStyle==='system'?'selected':''} onClick={()=>setFontStyle('system')}>{ui.english}</button></div></label>
              <label><span>{ui.density}</span><div className="setting-options"><button className={density==='compact'?'selected':''} onClick={()=>setDensity('compact')}>{ui.compact}</button><button className={density==='comfortable'?'selected':''} onClick={()=>setDensity('comfortable')}>{ui.comfortable}</button></div></label>
              <label className="toggle-setting"><span>{ui.grid}</span><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/></label>
            </div>}
          </div>
        </div>
      </header>

      <div className="compact-stats">
        <span><strong>{doneCount}/{todayTasks.length}</strong> {ui.todayDone}</span>
      </div>

      <section className="planner-workspace" style={{'--sidebar-width':`${sidebarWidth}px`}}>
        <aside className="task-sidebar">
          <div className="workspace-heading" aria-hidden="true"/>
          {viewMode === 'gantt' && <div className="task-axis-spacer" aria-hidden="true"/>}
          <div className="side-task-list">
            {timelineTasks.length === 0 && <div className="empty-state"><ListTodo size={22}/><p>{ui.noTasks}</p></div>}
            {timelineTasks.map(task => <div
              className={`side-task ${task.done ? 'done' : ''} ${draggedTaskId===task.id?'dragging':''} ${dragOverTaskId===task.id?'drag-over':''}`}
              key={task.id}
              data-task-id={task.id}
            >
              <button className="drag-handle" title={ui.dragSort} aria-label={`${ui.dragSort}: ${getTaskTitle(task)}`} onPointerDown={e=>startPointerDrag(e,task.id)}><GripVertical size={15}/></button>
              <button className="check-button" aria-label={ui.completeTask} onClick={() => updateTask(task.id, {done:!task.done})}>{task.done ? <Check size={14}/> : <Circle size={17}/>}</button>
              <button className="task-edit-trigger" onClick={() => setEditingTask({...task})}><strong>{getTaskTitle(task)}</strong><span><i className={`priority-dot priority-${task.priority}`}/>{formatTaskSchedule(task)}</span></button>
            </div>)}
          </div>
          <button className="sidebar-add-task" aria-label={ui.addTask} title={ui.addTask} onClick={() => setShowAddTask(true)}><Plus size={17}/></button>
        </aside>

        <button className="column-resizer" aria-label={ui.resizeSidebar} title={ui.resizeSidebar} onPointerDown={e=>{e.preventDefault();setResizing(true)}}><span/></button>

        <div className="visual-planner">
          <div className="workspace-heading">
            <div><span className="section-kicker">PLAN</span><h3>{viewMode === 'gantt' ? planTitle : scheduleTitle}</h3></div>
            <div className="planner-controls">
              <div className="scale-switch" aria-label={isEnglish?'Plan period':'计划周期'}><button title={isEnglish?'Day':'日'} className={timeScale==='day'?'selected':''} onClick={()=>setTimeScale('day')}>{ui.day}</button><button title={isEnglish?'Week':'周'} className={timeScale==='week'?'selected':''} onClick={()=>setTimeScale('week')}>{ui.week}</button><button title={isEnglish?'Month':'月'} className={timeScale==='month'?'selected':''} onClick={()=>setTimeScale('month')}>{ui.month}</button></div>
              <div className="view-switch" aria-label={isEnglish?'View':'显示方式'}>
                <button className={viewMode==='gantt'?'selected':''} title={ui.gantt} onClick={()=>setViewMode('gantt')}><BarChart3 size={15}/>{ui.gantt}</button>
                <button className={viewMode==='schedule'?'selected':''} title={ui.schedule} onClick={()=>setViewMode('schedule')}><Rows3 size={15}/>{ui.schedule}</button>
              </div>
            </div>
          </div>
          {viewMode === 'gantt' ? <div className={`gantt scale-${timeScale} ${showGrid?'show-grid':''}`} style={{'--timeline-units':timelineUnits,'--header-columns':headerColumns,'--timeline-min-width':timeScale === 'day' ? '1800px' : '546px'}}>
            <div className="gantt-days">{timelineColumns.map(column=><span key={`${timeScale}-${column.index}`} className={column.index===highlightIndex?'today':''}>{column.label}{column.sub && <small>{column.sub}</small>}</span>)}</div>
            <div className="gantt-body">
              {timelineTasks.map((task,i) => {
                const computedStart = getTaskStart(task);
                const computedSpan = Math.min(getTaskSpan(task), timelineUnits - computedStart);
                const start = barDraft?.id===task.id ? barDraft.start : computedStart;
                const span = barDraft?.id===task.id ? barDraft.span : computedSpan;
                return <div
                  className={`gantt-row ${dragOverTaskId===task.id?'drag-over':''}`}
                  key={task.id}
                  data-task-id={task.id}
                ><span className="today-line" style={{left:`calc(100% / ${timelineUnits} * ${timeScale==='day' ? (highlightIndex*2 + Math.min(1,now.getMinutes()/30)) : (highlightIndex + .5)})`}}/><button
                  title={isEnglish?'Drag to reorder, click to edit':'拖动排序，点击编辑'}
                  className={`gantt-bar ${task.done?'done':''} ${draggedTaskId===task.id?'dragging':''}`}
                  style={{gridColumn:`${start+1} / span ${span}`}}
                  onPointerDown={e=>startTimelineDrag(e,task,'move',start,span,timelineUnits)}
                  onClick={() => {if(!suppressTaskClick.current)setEditingTask({...task})}}
                ><span className="bar-resize-handle start" onPointerDown={e=>startTimelineDrag(e,task,'resize-start',start,span,timelineUnits)}/><GripVertical size={12}/><i style={{width:`${task.done?100:Math.min(100,Math.round(task.actual/task.estimate*100))}%`}}/><span className="bar-label">{getTaskTitle(task)}</span><span className="bar-resize-handle end" onPointerDown={e=>startTimelineDrag(e,task,'resize-end',start,span,timelineUnits)}/></button></div>
              })}
            </div>
          </div> : <div className="schedule-view">
            {[...scheduleTasks].sort((a,b)=>(a.startTime||'99:99').localeCompare(b.startTime||'99:99')).map((task,i)=><button className="schedule-row" key={task.id} onClick={() => setEditingTask({...task,startTime:task.startTime||`${String(9+i*2).padStart(2,'0')}:00`})}><time>{task.startTime || `${String(9+i*2).padStart(2,'0')}:00`}</time><span/><div><strong>{getTaskTitle(task)}</strong><small>{isEnglish?`${task.estimate} min · ${displayDate(task.date)}`:`${task.estimate} 分钟 · ${task.date}`}</small></div></button>)}
            {scheduleTasks.length === 0 && <div className="empty-state"><ListTodo size={22}/><p>{ui.noPeriodTasks}</p></div>}
          </div>}
        </div>
      </section>
    </main>

    {(showAddTask || showAddProject) && <div className="modal-backdrop" onMouseDown={() => {setShowAddTask(false);setShowAddProject(false)}}>
      <form className={`modal ${showAddTask ? 'add-task-modal' : ''}`} onSubmit={showAddTask ? addTask : addProject} onMouseDown={e=>e.stopPropagation()}>
        <button type="button" className="icon-button close" title={ui.close} aria-label={ui.close} onClick={()=>{setShowAddTask(false);setShowAddProject(false)}}><X size={19}/></button>
        {!showAddTask && <><span className="section-kicker">NEW PROJECT</span><h3>{isEnglish?'Create project':'创建新项目'}</h3></>}
        <label>{!showAddTask && <span>{isEnglish?'Project name':'项目名称'}</span>}<input aria-label={showAddTask ? ui.taskName : (isEnglish?'Project name':'项目名称')} autoFocus value={showAddTask ? taskTitle : projectName} onChange={e => showAddTask ? setTaskTitle(e.target.value) : setProjectName(e.target.value)} placeholder={showAddTask ? '' : (isEnglish?'Personal portfolio':'个人作品集')}/></label>
        <button className="primary-button" type="submit">{ui.confirmAdd}</button>
      </form>
    </div>}
    {editingTask && <div className="modal-backdrop" onMouseDown={() => setEditingTask(null)}>
      <form className="modal task-editor" onSubmit={saveTask} onMouseDown={e=>e.stopPropagation()}>
        <button type="button" className="icon-button close" title={ui.close} aria-label={ui.close} onClick={()=>setEditingTask(null)}><X size={19}/></button>
        <span className="section-kicker">EDIT TASK</span>
        <h3>{ui.editTask}</h3>
        <label><span>{ui.taskName}</span><input autoFocus value={isEnglish ? (editingTask.titleEn || translateTaskTitle(editingTask.title)) : editingTask.title} onChange={e=>setEditingTask(isEnglish ? {...editingTask,titleEn:e.target.value} : {...editingTask,title:e.target.value})}/></label>
        <div className="editor-grid">
          <label><span>{ui.startTime}</span><input type="time" value={editingTask.startTime || '09:00'} onChange={e=>setEditingTask({...editingTask,startTime:e.target.value})}/></label>
          <label><span>{ui.date}</span><select value={editingTask.date} onChange={e=>setEditingTask({...editingTask,date:e.target.value})}>{['今天','明天','周四','周五','周六','周日'].map(value=><option key={value} value={value}>{displayDate(value)}</option>)}</select></label>
          <label><span>{ui.priority}</span><div className="priority-options" role="group" aria-label={ui.priority}>{['高','中','低'].map((priority,index)=><button type="button" key={priority} className={editingTask.priority===priority?'selected':''} onClick={()=>setEditingTask({...editingTask,priority})}>{[ui.high,ui.medium,ui.low][index]}<i className={`priority-color priority-color-${priority}`}/></button>)}</div></label>
          <label><span>{ui.plannedMinutes}</span><input type="number" min="15" step="15" value={editingTask.estimate} onChange={e=>setEditingTask({...editingTask,estimate:e.target.value})}/></label>
          <label><span>{ui.actualMinutes}</span><input type="number" min="0" step="5" value={editingTask.actual} onChange={e=>setEditingTask({...editingTask,actual:e.target.value})}/></label>
        </div>
        <div className="editor-actions">
          <button className="delete-task-button" type="button" onClick={deleteTask}><Trash2 size={15}/>{ui.deleteTask}</button>
          <button className="primary-button" type="submit">{ui.save}</button>
        </div>
      </form>
    </div>}
    {notice && <div className="toast"><Check size={16}/>{notice}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />);
