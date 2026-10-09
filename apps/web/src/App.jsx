import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  Plus,
  Users,
  BookOpen,
  FileText,
  History,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Sun,
  Moon,
  Activity,
  Share2,
  Bookmark,
  Sparkles,
  Search,
  MessageSquare,
  Compass,
  ArrowRight,
  LogOut,
  Sliders,
  HelpCircle,
  Award
} from 'lucide-react';

// Chime generator using Web Audio API (no external audio assets required)
const playChime = (type = 'complete') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      // Gentle Tibetan Singing Bell Chord
      [528, 660, 792].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2 + i * 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + 1.4);
      });
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
};

// Initial Room Data for realistic study groups
const INITIAL_ROOMS = [
  {
    id: 'room-1',
    code: 'OS-3410',
    title: 'CS 3410 — Operating Systems & Concurrency',
    category: 'Computer Science',
    description: 'Kernel architectures, virtual memory paging, and semaphore lock implementations.',
    color: 'emerald',
    membersCount: 4,
    members: [
      { id: 'u1', name: 'Alex Rivera (You)', role: 'Owner', status: 'Focusing', avatar: 'AR', color: 'bg-emerald-600', goal: 'Paging algorithm exercises' },
      { id: 'u2', name: 'Priya Kapoor', role: 'Member', status: 'Focusing', avatar: 'PK', color: 'bg-teal-600', goal: 'Reviewing Chapter 8 slides' },
      { id: 'u3', name: 'Marcus Tan', role: 'Member', status: 'Library Quiet', avatar: 'MT', color: 'bg-sky-600', goal: 'Deadlock avoidance proofs' },
      { id: 'u4', name: 'Jordan Lee', role: 'Member', status: 'On Break', avatar: 'JL', color: 'bg-slate-600', goal: 'Coffee refill' },
    ],
    resources: [
      { id: 'res-1', title: 'Interactive Virtual Memory Simulator', url: 'https://os-simulator.org/paging', tag: 'Tool', author: 'Priya K.', time: '20 min ago' },
      { id: 'res-2', title: 'Midterm 2 Practice Exam Solutions (PDF)', url: 'https://courses.edu/cs3410/midterm2-sol.pdf', tag: 'Exam Prep', author: 'Marcus T.', time: '1 hour ago' },
      { id: 'res-3', title: 'Semaphore vs Mutex Cheat Sheet', url: 'https://cheatsheets.dev/concurrency', tag: 'Cheat Sheet', author: 'Alex R.', time: 'Yesterday' },
    ],
    notes: `## CS 3410 Session Goals (Today)
- [x] Review multi-level page tables (32-bit vs 64-bit address translation)
- [ ] Implement LRU Page Replacement simulation in C
- [ ] Understand Peterson's Algorithm conditions (Mutual Exclusion, Progress, Bounded Waiting)

### Key Formula
- Effective Access Time (EAT) = (1 - p) * MemoryAccess + p * (PageFaultOverhead + MemoryAccess)`,
    chat: [
      { id: 'm1', sender: 'Priya Kapoor', avatar: 'PK', text: 'Hey team, starting the 25m block to finish Problem 4 on page replacement.', time: '10:14 AM', type: 'text' },
      { id: 'm2', sender: 'Marcus Tan', avatar: 'MT', text: 'Sounds good! I just uploaded the solutions PDF to the Resources tab.', time: '10:15 AM', type: 'text' },
      { id: 'm3', sender: 'System', avatar: '⚡', text: 'Study session started: 25-minute Focus Block.', time: '10:16 AM', type: 'system' }
    ]
  },
  {
    id: 'room-2',
    code: 'MATH-2240',
    title: 'MATH 2240 — Multivariable Calculus & ODEs',
    category: 'Mathematics',
    description: 'Stokes Theorem, Green Theorem, and second-order non-homogeneous differential equations.',
    color: 'indigo',
    membersCount: 3,
    members: [
      { id: 'u1', name: 'Alex Rivera (You)', role: 'Member', status: 'Focusing', avatar: 'AR', color: 'bg-indigo-600', goal: 'Green theorem practice set' },
      { id: 'u5', name: 'Elena Sokolov', role: 'Owner', status: 'Focusing', avatar: 'ES', color: 'bg-blue-600', goal: 'Flux integrals via Stokes' },
      { id: 'u6', name: 'Liam Chen', role: 'Member', status: 'Reviewing', avatar: 'LC', color: 'bg-violet-600', goal: 'Second-order ODE forms' },
    ],
    resources: [
      { id: 'res-4', title: '3D Vector Field Visualizer', url: 'https://calcplot3d.edu', tag: 'Tool', author: 'Elena S.', time: 'Yesterday' },
      { id: 'res-5', title: 'Surface Integrals Summary Sheet', url: 'https://math-notes.org/calc3', tag: 'Notes', author: 'Liam C.', time: '2 days ago' }
    ],
    notes: `### Multivariable Calculus Key Points
- Green's Theorem: ∮ (L dx + M dy) = ∬ (∂M/∂x - ∂L/∂y) dA
- Divergence Theorem: ∯ F · dS = ∭ div(F) dV
- Stokes' Theorem: ∮ F · dr = ∬ (curl F) · dS`,
    chat: [
      { id: 'm4', sender: 'Elena Sokolov', avatar: 'ES', text: 'Working through Section 16.8 problems. Ping me if you have questions on the curl.', time: '9:45 AM', type: 'text' },
      { id: 'm5', sender: 'Liam Chen', avatar: 'LC', text: 'Calculated problem 14, answer matches textbook curl vector!', time: '9:50 AM', type: 'text' }
    ]
  },
  {
    id: 'room-3',
    code: 'MCAT-770',
    title: 'MCAT Prep — Biochemistry & Organ Systems',
    category: 'Pre-Med / Biology',
    description: 'Enzyme kinetics, Michaelis-Menten derivation, and renal filtration pathways.',
    color: 'rose',
    membersCount: 2,
    members: [
      { id: 'u1', name: 'Alex Rivera (You)', role: 'Member', status: 'Reviewing', avatar: 'AR', color: 'bg-rose-600', goal: 'Lineweaver-Burk plots' },
      { id: 'u7', name: 'Hannah Burke', role: 'Owner', status: 'Focusing', avatar: 'HB', color: 'bg-amber-600', goal: 'Nephron loop active transport' }
    ],
    resources: [
      { id: 'res-6', title: 'Enzyme Inhibition Anki Deck', url: 'https://ankiweb.net/shared/mcat-biochem', tag: 'Flashcards', author: 'Hannah B.', time: '3 days ago' }
    ],
    notes: `### Enzyme Kinetics
- Michaelis-Menten: V0 = (Vmax * [S]) / (Km + [S])
- Competitive: Km increases, Vmax unchanged
- Non-competitive: Km unchanged, Vmax decreases`,
    chat: [
      { id: 'm6', sender: 'Hannah Burke', avatar: 'HB', text: 'Targeting 2 Pomodoros of flashcard recall today.', time: '11:00 AM', type: 'text' }
    ]
  }
];

export default function App() {
  // Theme state (Light mode by default according to light-first-web-design)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Health API ping state
  const [apiHealth, setApiHealth] = useState(null);
  const [apiLatency, setApiLatency] = useState(null);

  // Active view: 'room' or 'explore'
  const [view, setView] = useState('room');
  
  // Room state
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState('room-1');
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Active sub-tab in study room: 'workspace' | 'resources' | 'notes' | 'history'
  const [roomTab, setRoomTab] = useState('workspace');

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [focusGoal, setFocusGoal] = useState('Implement Virtual Memory address translation');
  
  // Study Metrics (Insights)
  const [focusMinutesToday, setFocusMinutesToday] = useState(75);
  const [studyStreak, setStudyStreak] = useState(5);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(3);
  
  // Session History List
  const [sessionHistory, setSessionHistory] = useState([
    { id: 'ses-1', date: 'Today, 9:30 AM', duration: '25 min', phase: 'Focus Block', task: 'Kernel Threads & Process Context', participants: 4 },
    { id: 'ses-2', date: 'Today, 10:05 AM', duration: '25 min', phase: 'Focus Block', task: 'Virtual Memory Paging Exercises', participants: 4 },
    { id: 'ses-3', date: 'Yesterday', duration: '50 min', phase: 'Deep Study Sprint', task: 'Page Fault Handler Pseudocode', participants: 3 },
  ]);

  // Chat message input
  const [messageInput, setMessageInput] = useState('');
  const chatBottomRef = useRef(null);

  // Scratchpad collaborative notes
  const [sharedNotes, setSharedNotes] = useState(activeRoom.notes);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Modals
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({ title: '', category: 'Computer Science', description: '' });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  // Resource form modal
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '', tag: 'Notes' });

  // Update notes when switching rooms
  useEffect(() => {
    setSharedNotes(activeRoom.notes);
  }, [activeRoomId]);

  // API Backend Health Check
  const checkApiHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:3000/health');
      if (res.ok) {
        const data = await res.json();
        setApiHealth(data);
        setApiLatency(Math.round(performance.now() - start));
      } else {
        setApiHealth(null);
      }
    } catch {
      setApiHealth(null);
      setApiLatency(null);
    }
  };

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      if (!isMuted) playChime('complete');

      // Add to session history
      const durationMin = timerMode === 'focus' ? 25 : timerMode === 'shortBreak' ? 5 : 15;
      if (timerMode === 'focus') {
        setFocusMinutesToday((prev) => prev + durationMin);
        setCompletedSessionsCount((prev) => prev + 1);
      }

      const newSession = {
        id: `ses-${Date.now()}`,
        date: 'Just now',
        duration: `${durationMin} min`,
        phase: timerMode === 'focus' ? 'Focus Interval' : 'Break Time',
        task: focusGoal || 'Study session',
        participants: activeRoom.members.length
      };
      setSessionHistory((prev) => [newSession, ...prev]);

      // Broadcast system message in active room
      const finishMsg = {
        id: `m-${Date.now()}`,
        sender: 'System',
        avatar: '🎉',
        text: `Focus interval completed! Great work on: "${focusGoal || 'study session'}" (${durationMin}m logged).`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };

      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoomId ? { ...r, chat: [...r.chat, finishMsg] } : r
        )
      );
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, timerMode, activeRoomId, focusGoal, isMuted]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom.chat]);

  // Timer controls
  const handleStartPause = () => {
    if (!timerRunning) {
      if (!isMuted) playChime('start');
    }
    setTimerRunning(!timerRunning);
  };

  const handleReset = () => {
    setTimerRunning(false);
    if (timerMode === 'focus') setTimeLeft(25 * 60);
    else if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setTimerRunning(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Chat message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Alex Rivera (You)',
      avatar: 'AR',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId ? { ...r, chat: [...r.chat, newMsg] } : r
      )
    );
    setMessageInput('');

    // Optional simulated peer acknowledgment after 3 seconds
    if (Math.random() > 0.6) {
      setTimeout(() => {
        const peer = activeRoom.members.find((m) => m.name !== 'Alex Rivera (You)');
        if (peer) {
          const peerReplies = [
            'Makes total sense! 👍',
            'Added that to my notes as well.',
            'Let’s double check during the next break.',
            'Agreed, good catch!'
          ];
          const replyMsg = {
            id: `reply-${Date.now()}`,
            sender: peer.name,
            avatar: peer.avatar,
            text: peerReplies[Math.floor(Math.random() * peerReplies.length)],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'user'
          };
          setRooms((prevRooms) =>
            prevRooms.map((r) =>
              r.id === activeRoomId ? { ...r, chat: [...r.chat, replyMsg] } : r
            )
          );
        }
      }, 2500);
    }
  };

  // Quick preset message send
  const sendPresetPing = (text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Alex Rivera (You)',
      avatar: 'AR',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId ? { ...r, chat: [...r.chat, newMsg] } : r
      )
    );
  };

  // Add Resource
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) return;

    const resItem = {
      id: `res-${Date.now()}`,
      title: newResource.title,
      url: newResource.url.startsWith('http') ? newResource.url : `https://${newResource.url}`,
      tag: newResource.tag || 'Resource',
      author: 'Alex R. (You)',
      time: 'Just now'
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId ? { ...r, resources: [resItem, ...r.resources] } : r
      )
    );
    setNewResource({ title: '', url: '', tag: 'Notes' });
    setShowAddResource(false);
  };

  // Create Room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomForm.title.trim()) return;

    const newId = `room-${Date.now()}`;
    const generatedCode = `${newRoomForm.title.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdRoom = {
      id: newId,
      code: generatedCode,
      title: newRoomForm.title,
      category: newRoomForm.category || 'General Study',
      description: newRoomForm.description || 'Private peer study room for collaborative focus.',
      color: 'teal',
      membersCount: 1,
      members: [
        { id: 'u1', name: 'Alex Rivera (You)', role: 'Owner', status: 'Focusing', avatar: 'AR', color: 'bg-teal-600', goal: 'Initial room setup' }
      ],
      resources: [],
      notes: `# ${newRoomForm.title}\n\nShared notes and formulas for this study group.\n- [ ] Define meeting schedule\n- [ ] Outline topics for upcoming exams`,
      chat: [
        { id: `sys-${Date.now()}`, sender: 'System', avatar: '⚡', text: `Room created by Alex Rivera. Invite code is ${generatedCode}.`, time: 'Just now', type: 'system' }
      ]
    };

    setRooms((prev) => [createdRoom, ...prev]);
    setActiveRoomId(newId);
    setView('room');
    setShowCreateRoomModal(false);
    setNewRoomForm({ title: '', category: 'Computer Science', description: '' });
  };

  // Join Room by Code
  const handleJoinByCode = (e) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    const found = rooms.find((r) => r.code === cleanCode);
    if (found) {
      setActiveRoomId(found.id);
      setView('room');
      setJoinCodeInput('');
      setJoinError('');
    } else {
      setJoinError('Invalid room code. Please check with your study group owner.');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(`Join our Finneas study room with code: ${activeRoom.code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyNotesToClipboard = () => {
    navigator.clipboard.writeText(sharedNotes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const totalSeconds = timerMode === 'focus' ? 25 * 60 : timerMode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0A0E17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Application Bar */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md px-4 sm:px-6 py-3 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Finneas</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Study Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Private Real-time Collaborative Library</p>
            </div>
          </div>

          {/* Quick Metrics & System Status */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Daily Streak Indicator */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{studyStreak} Day Streak</span>
            </div>

            {/* Today's Focus Minutes */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{focusMinutesToday}m Focused Today</span>
            </div>

            {/* Backend Connection Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              apiHealth?.status === 'ok'
                ? isDarkMode ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${apiHealth?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="hidden sm:inline">{apiHealth?.status === 'ok' ? 'API Synced' : 'Offline Mode'}</span>
              {apiLatency && <span className="text-[10px] opacity-75">({apiLatency}ms)</span>}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Light / Dark mode"
              className={`p-2 rounded-lg border transition ${
                isDarkMode 
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Pill */}
            <div className={`flex items-center gap-2 pl-2 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center">
                AR
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 leading-none">Alex Rivera</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Student Member</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Navigation Bar between Active Room & Browse Rooms */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('room')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                view === 'room'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Current Study Room</span>
            </button>

            <button
              onClick={() => setView('explore')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                view === 'explore'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>All Study Rooms ({rooms.length})</span>
            </button>
          </div>

          {/* Quick Actions: Create Room or Join by Code */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleJoinByCode} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Enter invite code..."
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-mono ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                Join
              </button>
            </form>

            <button
              onClick={() => setShowCreateRoomModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Room</span>
            </button>
          </div>
        </div>

        {joinError && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center justify-between">
            <span>{joinError}</span>
            <button onClick={() => setJoinError('')} className="font-bold">&times;</button>
          </div>
        )}

        {/* VIEW 1: ACTIVE STUDY ROOM */}
        {view === 'room' && (
          <div className="flex flex-col gap-6">
            
            {/* Room Header Banner */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {activeRoom.category}
                  </span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    Code: {activeRoom.code}
                  </span>
                  <button
                    onClick={copyInviteCode}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition"
                    title="Copy invite code link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeRoom.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {activeRoom.description}
                </p>
              </div>

              {/* Room Stats & Switcher */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="flex -space-x-2 overflow-hidden">
                  {activeRoom.members.map((m) => (
                    <div
                      key={m.id}
                      title={`${m.name} (${m.status})`}
                      className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 ${m.color} text-white font-semibold text-xs flex items-center justify-center`}
                    >
                      {m.avatar}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeRoom.members.length} Active Students
                </div>
              </div>
            </div>

            {/* Core Study Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (8 cols): Pomodoro Timer + Study Panels */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Synchronized Pomodoro Timer Widget */}
                <div className={`p-6 sm:p-8 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-6 relative overflow-hidden`}>
                  {/* Subtle timer glow line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <button
                        onClick={() => switchTimerMode('focus')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          timerMode === 'focus'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        🎯 Focus Block (25m)
                      </button>
                      <button
                        onClick={() => switchTimerMode('shortBreak')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          timerMode === 'shortBreak'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        ☕ Short Break (5m)
                      </button>
                      <button
                        onClick={() => switchTimerMode('longBreak')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          timerMode === 'longBreak'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        🛋️ Long Break (15m)
                      </button>
                    </div>

                    {/* Audio Chime Mute Button */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      title={isMuted ? 'Unmute chime' : 'Mute chime'}
                      className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition ${
                        isMuted ? 'text-slate-400 hover:text-slate-600' : 'text-emerald-600 hover:text-emerald-700 font-semibold'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
                    </button>
                  </div>

                  {/* Timer Display Display */}
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
                      {formatTime(timeLeft)}
                    </div>
                    
                    {/* Active Goal Input */}
                    <div className="w-full max-w-md flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target:</span>
                      <input
                        type="text"
                        value={focusGoal}
                        onChange={(e) => setFocusGoal(e.target.value)}
                        placeholder="What are you focusing on this session?..."
                        className={`flex-1 text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Timer Action Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleStartPause}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm transition active:scale-95 ${
                        timerRunning
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{timerRunning ? 'Pause Session' : 'Start Focus'}</span>
                    </button>

                    <button
                      onClick={handleReset}
                      title="Reset Timer"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Developer/User Fast Forward button for quick demo */}
                    <button
                      onClick={() => setTimeLeft(Math.max(5, timeLeft - 60))}
                      title="Fast forward 1 minute for testing"
                      className="text-xs px-2.5 py-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    >
                      -1m Demo
                    </button>
                  </div>
                </div>

                {/* Study Room Functional Tabs */}
                <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} overflow-hidden`}>
                  
                  {/* Tabs Navigation Header */}
                  <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2 overflow-x-auto">
                    <button
                      onClick={() => setRoomTab('workspace')}
                      className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                        roomTab === 'workspace'
                          ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Shared Scratchpad</span>
                    </button>

                    <button
                      onClick={() => setRoomTab('resources')}
                      className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                        roomTab === 'resources'
                          ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Resources ({activeRoom.resources.length})</span>
                    </button>

                    <button
                      onClick={() => setRoomTab('history')}
                      className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                        roomTab === 'history'
                          ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Session History ({sessionHistory.length})</span>
                    </button>
                  </div>

                  {/* TAB 1: SHARED SCRATCHPAD / NOTES */}
                  {roomTab === 'workspace' && (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Collaborative scratchpad (synced to all room members)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyNotesToClipboard}
                            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition"
                          >
                            {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedNotes ? 'Copied' : 'Copy Notes'}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={sharedNotes}
                        onChange={(e) => setSharedNotes(e.target.value)}
                        rows={9}
                        placeholder="Type notes, formulas, equations, or tasks for the group..."
                        className={`w-full text-xs font-mono p-4 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  )}

                  {/* TAB 2: RESOURCES BOARD */}
                  {roomTab === 'resources' && (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Curated study links, past papers, and reference documents
                        </p>
                        <button
                          onClick={() => setShowAddResource(true)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-emerald-600 font-semibold flex items-center gap-1 shadow-sm transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Resource</span>
                        </button>
                      </div>

                      {/* Add resource inline form */}
                      {showAddResource && (
                        <form onSubmit={handleAddResource} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">Share a new study resource</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              placeholder="Title (e.g. Lecture 4 Slides)"
                              value={newResource.title}
                              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              placeholder="URL (https://...)"
                              value={newResource.url}
                              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <select
                              value={newResource.tag}
                              onChange={(e) => setNewResource({ ...newResource, tag: e.target.value })}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            >
                              <option value="Notes">Notes</option>
                              <option value="Tool">Tool</option>
                              <option value="Exam Prep">Exam Prep</option>
                              <option value="Cheat Sheet">Cheat Sheet</option>
                              <option value="Flashcards">Flashcards</option>
                            </select>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddResource(false)}
                                className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
                              >
                                Post to Room
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Resource Items List */}
                      <div className="space-y-2">
                        {activeRoom.resources.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No resources posted yet. Be the first to share a link!
                          </div>
                        ) : (
                          activeRoom.resources.map((res) => (
                            <div
                              key={res.id}
                              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1 truncate">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {res.tag}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {res.title}
                                  </h4>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                                  <span>Added by {res.author}</span>
                                  <span>•</span>
                                  <span>{res.time}</span>
                                </div>
                              </div>

                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition shrink-0"
                                title="Open resource link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SESSION HISTORY */}
                  {roomTab === 'history' && (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Logged focus sessions in this study group</span>
                        <span className="font-semibold">{completedSessionsCount} sessions completed</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                              <th className="py-2.5 px-3">Session Date</th>
                              <th className="py-2.5 px-3">Duration</th>
                              <th className="py-2.5 px-3">Phase</th>
                              <th className="py-2.5 px-3">Target Focus</th>
                              <th className="py-2.5 px-3 text-right">Students</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sessionHistory.map((ses) => (
                              <tr key={ses.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  {ses.date}
                                </td>
                                <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                                  {ses.duration}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {ses.phase}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                  {ses.task}
                                </td>
                                <td className="py-3 px-3 text-right text-slate-500 font-mono">
                                  {ses.participants} 👤
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (4 cols): Online Presence Roster & Real-time Chat */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Active Presence Roster (F5) */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>In Room ({activeRoom.members.length})</span>
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  <div className="space-y-2">
                    {activeRoom.members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2.5 transition"
                      >
                        <div className={`w-8 h-8 rounded-full ${member.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                          {member.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {member.name}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              member.status === 'Focusing'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : member.status === 'On Break'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            🎯 {member.goal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-Time Room Chat (F4) */}
                <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col h-[480px] overflow-hidden`}>
                  
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Study Group Chat</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Synced live</span>
                  </div>

                  {/* Chat Stream Messages */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                    {activeRoom.chat.map((msg) => (
                      <div
                        key={msg.id}
                        className={msg.type === 'system' ? 'text-center my-2' : 'space-y-1'}
                      >
                        {msg.type === 'system' ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {msg.text}
                          </span>
                        ) : (
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {msg.avatar}
                            </div>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                                  {msg.sender}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {msg.time}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                                {msg.text}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Quick Preset Reactions / Pings */}
                  <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <button
                      onClick={() => sendPresetPing('☕ Taking a quick 5m break')}
                      className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap transition"
                    >
                      ☕ Break
                    </button>
                    <button
                      onClick={() => sendPresetPing('🎯 Starting a 25m focus sprint')}
                      className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap transition"
                    >
                      🎯 Focusing
                    </button>
                    <button
                      onClick={() => sendPresetPing('🔥 Nice work everyone!')}
                      className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap transition"
                    >
                      🔥 Hype
                    </button>
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
                    <input
                      type="text"
                      placeholder="Send a study message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: EXPLORE / ALL STUDY ROOMS */}
        {view === 'explore' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Student Study Rooms</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Join a peer study session or create an invite-only room for your course</p>
              </div>

              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="self-start sm:self-auto text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Room</span>
              </button>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className={`p-6 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                    r.id === activeRoomId
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500/50'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {r.category}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {r.code}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>{r.members.length} peers studying</span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveRoomId(r.id);
                        setView('room');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        r.id === activeRoomId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {r.id === activeRoomId ? 'Entered Room' : 'Enter Room →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base">Create Private Study Room</h3>
              <button onClick={() => setShowCreateRoomModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Room / Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHYS 2210 — Quantum Mechanics"
                  value={newRoomForm.title}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category / Subject
                </label>
                <select
                  value={newRoomForm.category}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Pre-Med / Biology">Pre-Med / Biology</option>
                  <option value="Physics / Engineering">Physics / Engineering</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                  <option value="Law & Humanities">Law & Humanities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is your group studying this term?..."
                  value={newRoomForm.description}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoomModal(false)}
                  className="text-xs px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-4 px-6 text-center text-xs ${isDarkMode ? 'border-slate-800 text-slate-500 bg-[#0A0E17]' : 'border-slate-200 text-slate-500 bg-white'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Finneas Collaborative Study Platform • Designed for focused peer groups</span>
          <span>Light-First Editorial Design • Real-time Pomodoro Sync • React 18 & JavaScript</span>
        </div>
      </footer>
    </div>
  );
}
