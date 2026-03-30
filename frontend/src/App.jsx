import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Activities from './pages/Activities';
import Alerts from './pages/Alerts';

const API_URL = '/api';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/auth/verify`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            })
            .then(r => r.json())
            .then(data => { 
                if (data.user) setUser(data.user); 
                else logout(); 
            })
            .catch(() => logout());
        }
    }, [token]);

    const logout = () => { 
        localStorage.removeItem('token'); 
        setToken(null); 
        setUser(null); 
    };

    if (!token) return <LoginPage setToken={setToken} setUser={setUser} />;

    return (
        <div style={{minHeight:'100vh'}}>
            <div className="rgb-bar"></div>
            <nav className="gamer-nav">
                <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'center',height:'60px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <span style={{fontSize:'22px'}} role="img" aria-label="game-controller">🎮</span>
                        <span style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'18px',letterSpacing:'3px'}}>
                            <span className="neon-cyan">GAME</span><span style={{color:'#ccd6f6'}}>GUARD</span>
                        </span>
                        <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'10px',color:'var(--text-dim)',letterSpacing:'1px'}}>v1.0</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                        {[
                            {id:'dashboard',label:'HQ'},
                            {id:'accounts',label:'ACCOUNTS'},
                            {id:'activities',label:'ACTIVITY'},
                            {id:'alerts',label:'ALERTS'}
                        ].map(item => (
                            <button 
                                key={item.id} 
                                className={`nav-link ${view===item.id?'active':''}`} 
                                onClick={() => setView(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                        <div style={{width:'1px',height:'20px',background:'var(--border-dim)',margin:'0 8px'}}></div>
                        <button className="btn-gamer danger" style={{padding:'6px 16px',fontSize:'10px'}} onClick={logout}>LOGOUT</button>
                    </div>
                </div>
            </nav>
            <div style={{maxWidth:'1200px',margin:'0 auto',padding:'32px 24px'}}>
                {view==='dashboard'  && <Dashboard token={token} setView={setView} />}
                {view==='accounts'   && <Accounts token={token} />}
                {view==='activities' && <Activities token={token} />}
                {view==='alerts'     && <Alerts token={token} />}
            </div>
        </div>
    );
}

export default App;
