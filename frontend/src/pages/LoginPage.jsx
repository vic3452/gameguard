import React, { useState } from 'react';

const API_URL = '/api';

function LoginPage({ setToken, setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}${isLogin?'/auth/login':'/auth/register'}`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password})
            });
            const data = await res.json();
            if (res.ok) { 
                localStorage.setItem('token',data.token); 
                setToken(data.token); 
                setUser(data.user); 
            }
            else setError(data.error);
        } catch { setError('BACKEND OFFLINE — IS SERVER RUNNING ON :5000?'); }
        setLoading(false);
    };

    return (
        <div className="login-bg">
            <div style={{width:'100%',maxWidth:'440px',animation:'fade-up 0.6s ease both'}}>
                <div style={{textAlign:'center',marginBottom:'40px'}}>
                    <div style={{fontSize:'52px',marginBottom:'16px',filter:'drop-shadow(0 0 20px rgba(0,245,255,0.5))'}}>🎮</div>
                    <h1 style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'32px',letterSpacing:'6px',marginBottom:'8px'}}>
                        <span className="neon-cyan">GAME</span><span style={{color:'white'}}>GUARD</span>
                    </h1>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'8px'}}>
                        <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,transparent,var(--neon-purple))'}}></div>
                        <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-purple)',letterSpacing:'4px'}}>SECURITY MONITOR</span>
                        <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,var(--neon-purple),transparent)'}}></div>
                    </div>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'2px'}}>
                        {isLogin?'// ENTER CREDENTIALS TO ACCESS':'// CREATE NEW OPERATOR ACCOUNT'}
                    </p>
                </div>

                <div className="hud-card" style={{padding:'32px',animation:'rgb-border 4s linear infinite'}}>
                    <div style={{display:'flex',marginBottom:'28px',border:'1px solid var(--border-dim)'}}>
                        {['LOGIN','REGISTER'].map(mode => (
                            <button key={mode} onClick={() => { setIsLogin(mode==='LOGIN'); setError(''); }} style={{
                                flex:1,padding:'10px',fontFamily:'Orbitron,monospace',fontSize:'11px',letterSpacing:'2px',
                                border:'none',cursor:'pointer',
                                background:(isLogin?mode==='LOGIN':mode==='REGISTER')?'rgba(0,245,255,0.1)':'transparent',
                                color:(isLogin?mode==='LOGIN':mode==='REGISTER')?'var(--neon-cyan)':'var(--text-dim)',
                                borderBottom:(isLogin?mode==='LOGIN':mode==='REGISTER')?'2px solid var(--neon-cyan)':'2px solid transparent',
                                transition:'all 0.3s'
                            }}>{mode}</button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                        <div>
                            <label style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'2px',display:'block',marginBottom:'6px'}}>// EMAIL_ADDRESS</label>
                            <input type="email" className="gamer-input" placeholder="operator@gameguard.io" value={email} onChange={e=>setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'2px',display:'block',marginBottom:'6px'}}>// PASSCODE</label>
                            <input type="password" className="gamer-input" placeholder="••••••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
                        </div>
                        {error && <div style={{background:'rgba(255,0,60,0.1)',border:'1px solid var(--neon-red)',padding:'12px 16px',fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--neon-red)',letterSpacing:'1px'}}>⚠ {error.toUpperCase()}</div>}
                        <button type="submit" disabled={loading} style={{
                            marginTop:'8px',padding:'14px',fontFamily:'Orbitron,monospace',fontWeight:'700',
                            fontSize:'13px',letterSpacing:'3px',textTransform:'uppercase',
                            border:'1px solid var(--neon-cyan)',color:loading?'var(--text-dim)':'var(--neon-cyan)',
                            background:loading?'transparent':'rgba(0,245,255,0.08)',cursor:loading?'not-allowed':'pointer',transition:'all 0.3s',
                            clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))'
                        }}>
                            {loading?<span>AUTHENTICATING<span className="loading-dot">.</span><span className="loading-dot">.</span><span className="loading-dot">.</span></span>:(isLogin?'▶ ENTER SYSTEM':'▶ CREATE ACCOUNT')}
                        </button>
                    </form>
                </div>
                <p style={{textAlign:'center',fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',marginTop:'16px',letterSpacing:'1px'}}>
                    {isLogin?'NO ACCOUNT? ':'HAVE ACCOUNT? '}
                    <button onClick={()=>{setIsLogin(!isLogin);setError('');}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--neon-purple)',fontFamily:'inherit',fontSize:'inherit',letterSpacing:'inherit'}}>
                        {isLogin?'[ REGISTER ]':'[ LOGIN ]'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
