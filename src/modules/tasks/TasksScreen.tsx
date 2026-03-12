import React, { useState, useMemo } from 'react';
import { t } from '../../i18n';
import { formatHebrewDateTime, priorityColor } from '../../utils';
import { TasksRepository, PersonsRepository } from '../../layers/data-access/repositories';
import { Card, SectionHeader, Badge, Tabs, EmptyState } from '../../components/common';
import { ListTodo, AlertTriangle, User, Tag, Clock, CheckCircle2, Circle, ArrowUpCircle } from 'lucide-react';

const statusTabs = [
  { key: 'all', label: t('tasks.all') },
  { key: 'todo', label: t('tasks.todo') },
  { key: 'in_progress', label: t('tasks.inProgress') },
  { key: 'done', label: t('tasks.done') },
];

export function TasksScreen() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allTasks = TasksRepository.getAll();
  const persons = PersonsRepository.getAll();

  const personMap = useMemo(() => {
    const m: Record<string, string> = {};
    persons.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [persons]);

  const filteredTasks = useMemo(() => {
    let tasks = allTasks;
    if (activeStatus !== 'all') {
      tasks = tasks.filter(t => t.status === activeStatus);
    }
    if (selectedCategory) {
      tasks = tasks.filter(t => t.category === selectedCategory);
    }
    // Sort: overdue first, then by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return tasks.sort((a, b) => {
      const aOverdue = a.status === 'todo' && a.dueDate && a.dueDate < new Date().toISOString();
      const bOverdue = b.status === 'todo' && b.dueDate && b.dueDate < new Date().toISOString();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    });
  }, [allTasks, activeStatus, selectedCategory]);

  const categories = [...new Set(allTasks.map(t => t.category))];
  const overdueCount = TasksRepository.getOverdue().length;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={16} className="text-sage-400" />;
      case 'in_progress': return <ArrowUpCircle size={16} className="text-sky-400" />;
      default: return <Circle size={16} className="text-sage-300" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-sage-900">{t('tasks.title')}</h1>
          <p className="text-sage-500 text-sm mt-0.5">
            {allTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length} משימות פתוחות
            {overdueCount > 0 && <span className="text-rose-500 mr-1"> · {overdueCount} {t('tasks.overdue')}</span>}
          </p>
        </div>
      </div>

      <Tabs tabs={statusTabs} activeTab={activeStatus} onTabChange={setActiveStatus} className="mb-4" />

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            !selectedCategory ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
          }`}
        >
          הכל
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedCategory === cat ? 'bg-brand-100 text-brand-700' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'
            }`}
          >
            {t(`tasks.category.${cat}`)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState title={t('tasks.noTasks')} icon={<ListTodo size={40} className="text-sage-300 mb-3" />} />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isOverdue = task.status === 'todo' && task.dueDate && task.dueDate < new Date().toISOString();
            return (
              <Card key={task.id} className={`p-4 ${isOverdue ? 'border-r-4 border-r-rose-300' : task.status === 'done' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-sage-400' : 'text-sage-800'}`}>
                        {task.title}
                      </span>
                      <Badge variant={
                        task.priority === 'critical' ? 'danger' :
                        task.priority === 'high' ? 'warning' :
                        task.priority === 'medium' ? 'info' : 'default'
                      }>
                        {t(`tasks.priority.${task.priority}`)}
                      </Badge>
                      <Badge>{t(`tasks.category.${task.category}`)}</Badge>
                      {isOverdue && <Badge variant="danger">{t('tasks.overdue')}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-sage-400">
                      {task.assigneeId && (
                        <span className="flex items-center gap-1">
                          <User size={12} /> {personMap[task.assigneeId] || task.assigneeId}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {formatHebrewDateTime(task.dueDate)}
                        </span>
                      )}
                      {task.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> {formatHebrewDateTime(task.completedAt)}
                        </span>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-sage-400 mt-1">{task.description}</p>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
