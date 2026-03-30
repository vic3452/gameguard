import React, { useState, useEffect } from 'react';

const API_URL = '/api';

function Dashboard({ token, setView }) {
    const [stats, setStats] = useState({accounts:0,activities:0,alerts:0});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/accounts`,{headers:{'Authorization':`Bearer ${token}`}}),
            fetch(`${API_URL}/activities`,{headers:{'Authorization':`Bearer ${token}`}}),
            fetch(`${API_URL}/alerts`,{headers:{'Authorization':`Bearer ${token}`}})
        ])
        .then(r=>Promise.all(r.map(x=>x.json())))
        .then(([a,b,c])=>{ 
            setStats({
                accounts: a.accounts?.length || 0,
                activities: b.count || 0,
                alerts: c.alerts?.filter(x => x.status === 'pending').length || 0
            }); 
            setLoading(false); 
        })
        .catch(err => {
            console.error('Dashboard stats fetch error:', err);
            setLoading(false);
        });
    }, [token]);

    const cards = [
        {id:'accounts',  label:'LINKED ACCOUNTS',   value:stats.accounts,   color:'cyan',  icon:'◈',desc:'Active gaming platforms'},
        {id:'activities',label:'ACTIVITIES LOGGED',  value:stats.activities, color:'green', icon:'◉',desc:'Monitored login events'},
        {id:'alerts',    label:'PENDING ALERTS',     value:stats.alerts,     color:'red',   icon:'⚠',desc:'Threats awaiting review'},
    ];
    
    const getColor = c => c==='cyan'?'var(--neon-cyan)':c==='green'?'var(--neon-green)':'var(--neon-red)';

    return (
        <div>
            <div style={{marginBottom:'32px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'3px',marginBottom:'8px'}}>◈ SYSTEM.HQ</p>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white',marginBottom:'4px'}}>SECURITY <span className="neon-cyan">OVERVIEW</span></h2>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)'}}>// REAL-TIME ACCOUNT MONITORING DASHBOARD</p>
                </div>
                <div style={{textAlign:'right',fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)'}}>
                    <div className="neon-green" style={{marginBottom:'4px',fontSize:'12px'}}>● SYSTEM ONLINE</div>
                    <div>{new Date().toLocaleString()}</div>
                </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'24px'}}>
                {cards.map((card,i) => (
                    <div key={card.id} className={`stat-card ${card.color}`} style={{animationDelay:`${i*0.1}s`}} onClick={()=>setView(card.id)}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'2px'}}>{card.label}</span>
                            <span style={{fontSize:'20px',color:getColor(card.color),filter:`drop-shadow(0 0 8px ${getColor(card.color)})`}}>{card.icon}</span>
                        </div>
                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'44px',color:getColor(card.color),textShadow:`0 0 20px ${getColor(card.color)}`,lineHeight:1,marginBottom:'8px'}}>
                            {loading?'—':card.value}
                        </div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)'}}>{card.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{border:`1px solid ${stats.alerts>0?'var(--neon-red)':'var(--neon-green)'}`,background:stats.alerts>0?'rgba(255,0,60,0.05)':'rgba(0,255,136,0.05)',padding:'20px 24px',boxShadow:stats.alerts>0?'0 0 20px rgba(255,0,60,0.1)':'0 0 20px rgba(0,255,136,0.1)',clipPath:'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 16px))'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontSize:'24px'}}>{stats.alerts>0?'⚠':'🛡'}</span>
                    <div>
                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'700',fontSize:'13px',letterSpacing:'2px',marginBottom:'4px',color:stats.alerts>0?'var(--neon-red)':'var(--neon-green)'}}>
                            {stats.alerts>0?`THREAT DETECTED — ${stats.alerts} ALERT(S) PENDING`:'ALL SYSTEMS NOMINAL — NO THREATS DETECTED'}
                        </div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)'}}>
                            {stats.alerts>0?'// Navigate to ALERTS to review and respond to security events':'// Monitoring active. All gaming accounts are secure.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
