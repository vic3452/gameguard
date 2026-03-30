import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Activities from './pages/Activities';
import Alerts from './pages/Alerts';

const API_URL = '/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef();

    // Verify auth on mount
    useEffect(() => {
        fetch(`${API_URL}/auth/verify`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                    setupSocket(data.user.userId || data.user.id);
                }
            })
            .catch(e => console.error('Auth verify failed:', e))
            .finally(() => setLoading(false));
    }, []);

    const setupSocket = (userId) => {
        if (!userId || socketRef.current) return;

        socketRef.current = io('/', { withCredentials: true });

        socketRef.current.on('connect', () => {
            console.log('🔌 Connected to GameGuard Real-time');
            socketRef.current.emit('join', userId);
        });

        socketRef.current.on('new_alert', (alert) => {
            setNotifications(prev => [alert, ...prev]);
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
        });
    };

    const loginSuccess = (userData) => {
        setUser(userData);
        setupSocket(userData.id || userData.userId);
    };

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setUser(null);
    };

    const renderContent = () => {
        if (loading) return (
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontFamily:'Orbitron', color:'var(--neon-cyan)', letterSpacing:'5px'}}>
                LOADING_SYSTEM...
            </div>
        );
        
        if (!user) return <LoginPage onLoginSuccess={loginSuccess} />;

        return (
            <>
                <nav className="gamer-nav">
                    <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'center',height:'60px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <span style={{fontSize:'22px'}} role="img" aria-label="game-controller">🎮</span>
                            <span style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'18px',letterSpacing:'3px'}}>
                                <span className="neon-cyan">GAME</span><span style={{color:'#ccd6f6'}}>GUARD</span>
                            </span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                            {[{id:'dashboard',label:'HQ'},{id:'accounts',label:'ACCOUNTS'},{id:'activities',label:'ACTIVITY'},{id:'alerts',label:'ALERTS'}].map(item => (
                                <button key={item.id} className={`nav-link ${view===item.id?'active':''}`} onClick={() => setView(item.id)}>{item.label}</button>
                            ))}
                            <div style={{width:'1px',height:'20px',background:'var(--border-dim)',margin:'0 8px'}}></div>
                            <button className="btn-gamer danger" style={{padding:'6px 16px',fontSize:'10px'}} onClick={logout}>LOGOUT</button>
                        </div>
                    </div>
                </nav>
                <div style={{maxWidth:'1200px',margin:'0 auto',padding:'32px 24px'}}>
                    {view==='dashboard'  && <Dashboard setView={setView} />}
                    {view==='accounts'   && <Accounts />}
                    {view==='activities' && <Activities />}
                    {view==='alerts'     && <Alerts />}
                </div>
            </>
        );
    };

    return (
        <div style={{minHeight:'100vh', position:'relative'}}>
            {/* Immersive Background Layers */}
            <div className="background-container">
                <div className="bg-nebula"></div>
                <div className="bg-grid"></div>
            </div>
            <div className="scanline-overlay"></div>
            <div className="rgb-bar"></div>
            
            {notifications.length > 0 && (
                <div style={{position:'fixed', top:'80px', right:'24px', zIndex:2000, display:'flex', flexDirection:'column', gap:'12px', maxWidth:'300px'}}>
                    {notifications.map((n, i) => (
                        <div key={i} className="hud-card glass-panel" style={{padding:'16px', border:'1px solid var(--neon-red)', animation:'slide-in 0.3s ease both'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                <span style={{color:'var(--neon-red)', fontSize:'10px', fontFamily:'Orbitron'}}>NEW THREAT</span>
                                <button onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>×</button>
                            </div>
                            <div style={{fontSize:'12px', marginBottom:'4px'}}>{n.alert_type?.replace(/_/g,' ').toUpperCase()}</div>
                            <div style={{fontSize:'10px', color:'var(--text-dim)'}}>Time: {new Date(n.created_at).toLocaleTimeString()}</div>
                        </div>
                    ))}
                </div>
            )}

            {renderContent()}
        </div>
    );
}

export default App;
