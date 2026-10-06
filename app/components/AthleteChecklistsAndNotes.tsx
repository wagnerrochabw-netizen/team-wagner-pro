'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Clock,
  Sparkles,
  Cloud
} from 'lucide-react';
import { ChecklistItem, CalendarEvent, UserNote } from '@/lib/types';
import { useAuth } from './FirebaseAuthProvider';
import {
  saveChecklistItem,
  deleteChecklistItem,
  subscribeChecklists,
  saveNote,
  deleteNote,
  subscribeNotes,
  saveEvent,
  deleteEvent,
  subscribeEvents
} from '@/lib/db-service';

export const AthleteChecklistsAndNotes: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'offline_user';

  const [activeSubTab, setActiveSubTab] = useState<'checklists' | 'notas' | 'eventos'>('checklists');

  // Checklists state
  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    { id: 'chk-1', userId, title: 'Consumir 3 Litros de Água', completed: true, category: 'Hidratação' },
    { id: 'chk-2', userId, title: 'Bater meta de Proteína (140g)', completed: false, category: 'Nutrição' },
    { id: 'chk-3', userId, title: 'Mobilidade articular antes do treino', completed: true, category: 'Treino' },
    { id: 'chk-4', userId, title: 'Dormir no mínimo 7h30', completed: false, category: 'Sono' },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Notes state
  const [notes, setNotes] = useState<UserNote[]>([
    {
      id: 'nt-1',
      userId,
      title: 'Ajuste de Cargas - Agachamento',
      content: 'Aumentar 5kg totais no agachamento livre na próxima semana se a RPE continuar abaixo de 8.',
      createdAt: 1729600000000,
    },
    {
      id: 'nt-2',
      userId,
      title: 'Feedback da Semana',
      content: 'Treino de costas excelente. Menor cansaço articular com os intervalos de 90s.',
      createdAt: 1729700000000,
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'ev-1',
      userId,
      title: 'Treino A - Dorsais & Bíceps',
      date: '2024-10-25',
      time: '07:30',
      type: 'Musculação',
      completed: true,
    },
    {
      id: 'ev-2',
      userId,
      title: 'Corrida Contínua 5km',
      date: '2024-10-26',
      time: '08:00',
      type: 'Cardio',
      completed: false,
    },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2024-10-27');
  const [newEventTime, setNewEventTime] = useState('08:00');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!user) return;
    const unsubChk = subscribeChecklists(user.uid, (items) => {
      if (items.length > 0) setChecklists(items);
    });
    const unsubNotes = subscribeNotes(user.uid, (items) => {
      if (items.length > 0) setNotes(items);
    });
    const unsubEv = subscribeEvents(user.uid, (items) => {
      if (items.length > 0) setEvents(items);
    });

    return () => {
      unsubChk();
      unsubNotes();
      unsubEv();
    };
  }, [user]);

  // Checklist Actions
  const handleToggleChecklist = async (item: ChecklistItem) => {
    const updated = { ...item, completed: !item.completed };
    setChecklists((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
    if (user) {
      await saveChecklistItem(user.uid, updated);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      userId,
      title: newChecklistText.trim(),
      completed: false,
      category: 'Hábito',
    };
    setChecklists((prev) => [...prev, newItem]);
    setNewChecklistText('');
    if (user) {
      await saveChecklistItem(user.uid, newItem);
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== id));
    if (user) {
      await deleteChecklistItem(user.uid, id);
    }
  };

  // Notes Actions
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const newNote: UserNote = {
      id: `note_${Date.now()}`,
      userId,
      title: newNoteTitle.trim() || 'Anotação de Treino',
      content: newNoteContent.trim(),
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    if (user) {
      await saveNote(user.uid, newNote);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (user) {
      await deleteNote(user.uid, id);
    }
  };

  // Event Actions
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      userId,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      type: 'Treino',
      completed: false,
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewEventTitle('');
    setIsAddingEvent(false);
    if (user) {
      await saveEvent(user.uid, newEvent);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (user) {
      await deleteEvent(user.uid, id);
    }
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-space font-bold text-sm text-white flex items-center gap-1.5">
            <span>Rotina, Checklists & Eventos</span>
            <span className="text-[10px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              Banco de Dados
            </span>
          </h3>
          <p className="text-[11px] text-[#849396] font-mono">
            Tarefas, anotações de treino e calendário integrados
          </p>
        </div>

        {user && (
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            Nuvem Ativa
          </span>
        )}
      </div>

      {/* Subtabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0E14] border border-[#1D2026] rounded-xl text-xs font-space">
        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'checklists'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Checklists ({checklists.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notas')}
          className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'notas'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notas ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('eventos')}
          className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'eventos'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda ({events.length})</span>
        </button>
      </div>

      {/* 1. CHECKLISTS TAB */}
      {activeSubTab === 'checklists' && (
        <div className="space-y-3">
          <form onSubmit={handleAddChecklist} className="flex gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Adicionar novo hábito ou checklist..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#0B0E14] border border-[#222938] text-xs text-white placeholder-[#849396] focus:outline-none focus:border-[#00E5FF]"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </form>

          <div className="space-y-1.5">
            {checklists.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-[#0B0E14]/60 border-[#1D2026] text-[#849396]'
                    : 'bg-[#171B26] border-[#222938] text-white hover:border-[#00E5FF]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#849396] shrink-0" />
                  )}
                  <span
                    className={`text-xs font-space truncate ${
                      item.completed ? 'line-through opacity-70' : 'font-medium'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.category && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0E14] text-[#BAC9CC]">
                      {item.category}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChecklist(item.id);
                    }}
                    className="text-[#849396] hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTES TAB */}
      {activeSubTab === 'notas' && (
        <div className="space-y-3">
          {!isAddingNote ? (
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] font-space text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Escrever Nova Nota de Treino</span>
            </button>
          ) : (
            <form onSubmit={handleAddNote} className="space-y-2 p-3 bg-[#0B0E14] border border-[#222938] rounded-xl">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Título da anotação..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#12161F] border border-[#222938] text-xs text-white placeholder-[#849396] focus:outline-none focus:border-[#00E5FF]"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Detalhes, ajustes de carga, percepção de esforço..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#12161F] border border-[#222938] text-xs text-white placeholder-[#849396] focus:outline-none focus:border-[#00E5FF]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#171B26] text-xs text-[#BAC9CC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs"
                >
                  Salvar Nota
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-[#0B0E14] border border-[#1D2026] rounded-xl space-y-1 relative group">
                <div className="flex items-center justify-between">
                  <h4 className="font-space font-bold text-xs text-white">{note.title}</h4>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-[#849396] hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#BAC9CC] leading-relaxed whitespace-pre-line">{note.content}</p>
                <span className="text-[10px] text-[#849396] font-mono block pt-1">
                  {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EVENTS TAB */}
      {activeSubTab === 'eventos' && (
        <div className="space-y-3">
          {!isAddingEvent ? (
            <button
              onClick={() => setIsAddingEvent(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] font-space text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Novo Treino ou Evento</span>
            </button>
          ) : (
            <form onSubmit={handleAddEvent} className="space-y-2 p-3 bg-[#0B0E14] border border-[#222938] rounded-xl">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Título do evento (ex: Treino de Pernas, Corrida)..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#12161F] border border-[#222938] text-xs text-white placeholder-[#849396] focus:outline-none focus:border-[#00E5FF]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#12161F] border border-[#222938] text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#12161F] border border-[#222938] text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#171B26] text-xs text-[#BAC9CC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs"
                >
                  Agendar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 bg-[#0B0E14] border border-[#1D2026] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-xs text-white">{ev.title}</h4>
                    <span className="text-[10px] text-[#849396] font-mono">
                      {ev.date} às {ev.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="text-[#849396] hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
