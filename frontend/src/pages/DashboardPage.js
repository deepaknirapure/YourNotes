import React, { useState, useEffect } from "react";
import { 
  FileText, Star, Trash2, Folder, Plus, Search, 
  Menu, X, Pin, MoreHorizontal, CheckCircle2,
  ChevronLeft, Edit3
} from "lucide-react";

// --- Mock Data for UI Demonstration ---
const MOCK_NOTES = [
  { id: 1, title: "Product Requirements", content: "We need to focus on user retention. The new feature set should include...", isStarred: true, isPinned: true, folder: "Work", updatedAt: new Date(Date.now() - 3600000) },
  { id: 2, title: "Grocery List", content: "Milk, Eggs, Bread, Avocados, Coffee beans.", isStarred: false, isPinned: false, folder: "Personal", updatedAt: new Date(Date.now() - 86400000) },
  { id: 3, title: "React Hooks deep dive", content: "useEffect vs useLayoutEffect. When the component mounts...", isStarred: true, isPinned: false, folder: "Study", updatedAt: new Date(Date.now() - 172800000) },
];

const MOCK_FOLDERS = ["Work", "Personal", "Study"];

export default function MinimalNotesDashboard() {
  // --- State ---
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [folders] = useState(MOCK_FOLDERS);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'starred', 'trash', or folder name
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // Mobile / UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived state
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // --- Actions ---
  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: "",
      content: "",
      isStarred: false,
      isPinned: false,
      folder: activeFilter !== "all" && activeFilter !== "starred" && activeFilter !== "trash" ? activeFilter : null,
      updatedAt: new Date()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateSelectedNote = (field, value) => {
    setNotes(prev => prev.map(n => {
      if (n.id === selectedNoteId) {
        return { ...n, [field]: value, updatedAt: new Date() };
      }
      return n;
    }));
    
    // Simulate auto-save indicator
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  // --- Filtering ---
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "starred") return note.isStarred;
    if (activeFilter === "trash") return note.isTrashed; // Assuming you add isTrashed to model
    if (activeFilter !== "all" && MOCK_FOLDERS.includes(activeFilter)) return note.folder === activeFilter;
    
    return !note.isTrashed;
  }).sort((a, b) => b.isPinned - a.isPinned || b.updatedAt - a.updatedAt);

  // --- Sub-components ---
  const NavItem = ({ icon: Icon, label, filterKey, count }) => {
    const isActive = activeFilter === filterKey;
    return (
      <button 
        onClick={() => { setActiveFilter(filterKey); setIsSidebarOpen(false); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400"} />
          {label}
        </div>
        {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- SIDEBAR --- */}
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:relative z-50 h-full w-64 bg-gray-50/50 backdrop-blur-xl border-r border-gray-200 
        flex flex-col transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg tracking-tight">
            <Edit3 size={20} className="text-blue-600" />
            YourNotes
          </div>
          <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button 
            onClick={handleCreateNote}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={16} /> New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-6">
          <div className="space-y-1">
            <NavItem icon={FileText} label="All Notes" filterKey="all" count={notes.length} />
            <NavItem icon={Star} label="Starred" filterKey="starred" count={notes.filter(n => n.isStarred).length} />
            <NavItem icon={Trash2} label="Trash" filterKey="trash" />
          </div>

          <div>
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Folders</div>
            <div className="space-y-1">
              {folders.map(folder => (
                <NavItem key={folder} icon={Folder} label={folder} filterKey={folder} />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* --- MIDDLE COLUMN: NOTE LIST --- */}
      <div className={`
        flex-1 md:w-80 md:flex-none border-r border-gray-200 flex flex-col bg-white
        ${selectedNoteId ? "hidden md:flex" : "flex"}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100/80 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400 text-sm mb-2">No notes found.</p>
              <button onClick={handleCreateNote} className="text-blue-600 text-sm font-medium hover:underline">
                Create a new note &rarr;
              </button>
            </div>
          ) : (
            filteredNotes.map(note => (
              <button 
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedNoteId === note.id 
                    ? "bg-blue-50/50 border-blue-200 shadow-sm" 
                    : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className={`font-medium text-sm truncate ${selectedNoteId === note.id ? "text-blue-900" : "text-gray-900"}`}>
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.isPinned && <Pin size={12} className="text-gray-400 shrink-0 mt-1" />}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                  {note.content || "No additional text"}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{note.updatedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  {note.isStarred && <Star size={12} className="text-amber-400 fill-amber-400" />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: EDITOR --- */}
      <div className={`
        flex-1 flex flex-col bg-white h-full relative
        ${!selectedNoteId ? "hidden md:flex" : "flex"}
      `}>
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium pr-2"
                  onClick={() => setSelectedNoteId(null)}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                {selectedNote.folder && (
                  <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                    <Folder size={12} className="mr-1.5 text-gray-400" />
                    {selectedNote.folder}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {isSaving && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
                    <CheckCircle2 size={12} className="text-green-500" /> Saved
                  </span>
                )}
                <button 
                  onClick={() => updateSelectedNote('isStarred', !selectedNote.isStarred)}
                  className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-50 rounded-md transition-colors"
                  title="Star note"
                >
                  <Star size={18} className={selectedNote.isStarred ? "text-amber-400 fill-amber-400" : ""} />
                </button>
                <button 
                  onClick={() => updateSelectedNote('isPinned', !selectedNote.isPinned)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-md transition-colors"
                  title="Pin note"
                >
                  <Pin size={18} className={selectedNote.isPinned ? "text-blue-500 fill-blue-500" : ""} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto w-full">
              <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-16">
                <input
                  type="text"
                  placeholder="Note title"
                  value={selectedNote.title}
                  onChange={(e) => updateSelectedNote('title', e.target.value)}
                  className="w-full text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent mb-6 resize-none"
                />
                
                <textarea
                  placeholder="Start writing..."
                  value={selectedNote.content}
                  onChange={(e) => updateSelectedNote('content', e.target.value)}
                  className="w-full h-[60vh] text-base md:text-lg leading-relaxed text-gray-700 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none"
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Edit3 size={28} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a note to view</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-6">Choose a note from the left panel, or create a new one to capture your thoughts.</p>
            <button 
              onClick={handleCreateNote}
              className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}