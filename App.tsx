
import React, { useState, useEffect, useRef } from 'react';
import { BehaviorType, BehaviorLogEntry, ChatMessage } from './types';
import { getBehaviorAdvice, createSimulatorChat, generateStrategyLibrary } from './services/geminiService';
import { BehaviorChart } from './components/BehaviorChart';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coach' | 'simulator' | 'logs'>('dashboard');
  
  // State for Coaching
  const [scenarioInput, setScenarioInput] = useState('');
  const [selectedBehavior, setSelectedBehavior] = useState<BehaviorType>(BehaviorType.DISENGAGEMENT);
  const [coachingAdvice, setCoachingAdvice] = useState<string | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  // State for Simulator
  const [simMessages, setSimMessages] = useState<ChatMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [isSimActive, setIsSimActive] = useState(false);
  const [simBehavior, setSimBehavior] = useState<BehaviorType>(BehaviorType.DEFIANCE);
  const [simStudentLevel, setSimStudentLevel] = useState('Primary School');
  const chatRef = useRef<any>(null);

  // State for Logs
  const [logs, setLogs] = useState<BehaviorLogEntry[]>([]);
  const [newLog, setNewLog] = useState({ studentName: '', description: '', intensity: 3 });

  // Load initial strategies (simplified for this demo)
  const [strategies, setStrategies] = useState<any[]>([]);

  useEffect(() => {
    const fetchStrats = async () => {
      try {
        const strats = await generateStrategyLibrary();
        setStrategies(strats);
      } catch (err) {
        console.error("Failed to fetch strategies", err);
      }
    };
    fetchStrats();
  }, []);

  const handleGetAdvice = async () => {
    if (!scenarioInput) return;
    setIsLoadingCoach(true);
    try {
      const advice = await getBehaviorAdvice(scenarioInput, selectedBehavior);
      setCoachingAdvice(advice || "No advice found.");
    } catch (err) {
      setCoachingAdvice("Error getting advice. Please try again.");
    } finally {
      setIsLoadingCoach(false);
    }
  };

  const startSimulator = () => {
    chatRef.current = createSimulatorChat(simBehavior, simStudentLevel);
    setSimMessages([{ role: 'model', text: `(The student is looking at the floor, refusing to open their workbook).` }]);
    setIsSimActive(true);
  };

  const sendSimMessage = async () => {
    if (!simInput || !chatRef.current) return;
    const userMsg = { role: 'user', text: simInput } as ChatMessage;
    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');

    try {
      const result = await chatRef.current.sendMessage({ message: simInput });
      setSimMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (err) {
      setSimMessages(prev => [...prev, { role: 'model', text: "Error in simulation. Connection lost." }]);
    }
  };

  const addLog = () => {
    if (!newLog.studentName) return;
    const entry: BehaviorLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      studentName: newLog.studentName,
      behaviorType: selectedBehavior,
      description: newLog.description,
      intensity: newLog.intensity
    };
    setLogs([entry, ...logs]);
    setNewLog({ studentName: '', description: '', intensity: 3 });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">TutorAlly</h1>
          </div>
          <nav className="flex space-x-1">
            <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
            <NavBtn active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} label="AI Coach" />
            <NavBtn active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} label="Simulator" />
            <NavBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Tracker" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Behavior Trends</h2>
                <BehaviorChart logs={logs} />
              </div>
              <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
                <h2 className="text-lg font-semibold mb-2">Daily Insight</h2>
                <p className="opacity-90 text-sm">Most tutors find that 5 minutes of rapport-building at the start of a session reduces defiance by 40%.</p>
                <div className="mt-6 flex justify-end">
                   <button onClick={() => setActiveTab('coach')} className="text-xs bg-white text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors">Learn More</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <h3 className="col-span-full font-bold text-gray-700 mt-4">Quick Strategies</h3>
              {strategies.length > 0 ? strategies.map((s, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="inline-block px-2 py-1 text-[10px] uppercase font-bold bg-blue-50 text-blue-600 rounded mb-2">{s.category}</div>
                  <h4 className="font-bold text-gray-800">{s.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                </div>
              )) : [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)}
            </div>
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold mb-4">Describe the Situation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Behavior Type</label>
                  <select 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedBehavior}
                    onChange={(e) => setSelectedBehavior(e.target.value as BehaviorType)}
                  >
                    {Object.values(BehaviorType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Context / Scenario</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. My student refuses to start the math worksheet and becomes visibly angry when prompted..."
                    value={scenarioInput}
                    onChange={(e) => setScenarioInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleGetAdvice}
                  disabled={isLoadingCoach || !scenarioInput}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {isLoadingCoach ? (
                    <><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating Advice...</>
                  ) : "Get AI Advice"}
                </button>
              </div>
            </div>

            {coachingAdvice && (
              <div className="bg-white p-8 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-2 mb-4 text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  <span className="font-bold uppercase tracking-wider text-xs">Recommended Action Plan</span>
                </div>
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {coachingAdvice}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto h-[70vh] flex flex-col space-y-4">
            {!isSimActive ? (
              <div className="flex-1 bg-white p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Practice Simulator</h2>
                <p className="text-gray-500 max-w-md mt-2 mb-8">Test your de-escalation skills in a safe environment. Select a behavior profile to start the simulation.</p>
                
                <div className="w-full max-w-sm space-y-4">
                   <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Age Level</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={simStudentLevel}
                      onChange={(e) => setSimStudentLevel(e.target.value)}
                    >
                      <option>Primary School</option>
                      <option>Middle School</option>
                      <option>High School</option>
                    </select>
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Behavior to Practice</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={simBehavior}
                      onChange={(e) => setSimBehavior(e.target.value as BehaviorType)}
                    >
                      {Object.values(BehaviorType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={startSimulator}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Start Simulation
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-700">Simulating: Alex ({simBehavior})</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{simStudentLevel}</p>
                  </div>
                  <button onClick={() => setIsSimActive(false)} className="text-xs text-red-500 font-bold hover:underline">End Session</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdfdfd]">
                  {simMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t bg-white">
                  <form onSubmit={(e) => { e.preventDefault(); sendSimMessage(); }} className="flex space-x-2">
                    <input 
                      type="text" 
                      className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="Type your response to the student..."
                      value={simInput}
                      onChange={(e) => setSimInput(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Send</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white p-6 rounded-2xl border shadow-sm h-fit">
              <h2 className="text-lg font-bold mb-4">Log Incident</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg"
                    value={newLog.studentName}
                    onChange={(e) => setNewLog({ ...newLog, studentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Behavior</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={selectedBehavior}
                    onChange={(e) => setSelectedBehavior(e.target.value as BehaviorType)}
                  >
                    {Object.values(BehaviorType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Intensity ({newLog.intensity}/5)</label>
                   <input 
                    type="range" min="1" max="5" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={newLog.intensity}
                    onChange={(e) => setNewLog({ ...newLog, intensity: parseInt(e.target.value) })}
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                  <textarea 
                    className="w-full p-2 border rounded-lg h-24"
                    value={newLog.description}
                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  />
                </div>
                <button 
                  onClick={addLog}
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <h2 className="text-lg font-bold px-2">Recent Logs</h2>
              {logs.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
                  No behavior logs yet. Use the form to start tracking.
                </div>
              ) : logs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-start space-x-4">
                  <div className={`w-2 h-16 rounded-full flex-shrink-0 ${
                    log.intensity >= 4 ? 'bg-red-500' : log.intensity >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800">{log.studentName}</h4>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">{log.behaviorType}</span>
                      <span className="text-xs text-gray-400">Intensity: {log.intensity}/5</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status */}
      <footer className="bg-gray-50 border-t py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>&copy; 2024 TutorAlly Support</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>AI Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavBtnProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const NavBtn: React.FC<NavBtnProps> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
      active ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export default App;
