import React, { useState, useEffect } from 'react';

const API_URL = '/api';

function Dashboard({ setView }) {
    const [stats, setStats] = useState({accounts:0,activities:0,alerts:0});
    const [loading, setLoading] = useState(true);

    const monitoredModules = [
        { id: 1, title: 'Steam Security', banner: 'https://images.unsplash.com/photo-1605898399783-1820b735e127?q=80&w=1000&auto=format&fit=crop', status: 'Protected' },
        { id: 2, title: 'Epic Guard', banner: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop', status: 'Protected' },
        { id: 3, title: 'Network Vault', banner: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop', status: 'Stable' },
    ];

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/accounts`,{credentials:'include'}),
            fetch(`${API_URL}/activities`,{credentials:'include'}),
            fetch(`${API_URL}/alerts`,{credentials:'include'})
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
    }, []);

    const statCards = [
        {id:'accounts',  label:'ACTIVE NODES',        value:stats.accounts,   color:'cyan',  icon:'◈',desc:'Monitored platforms'},
        {id:'activities',label:'SECURITY EVENTS',     value:stats.activities, color:'green', icon:'◉',desc:'Processed logs'},
        {id:'alerts',    label:'ACTIVE THREATS',      value:stats.alerts,     color:'red',   icon:'⚠',desc:'Critical anomalies'},
    ];
    
    const getColor = c => c==='cyan'?'var(--neon-cyan)':c==='green'?'var(--neon-green)':'var(--neon-red)';

    return (
        <div style={{animation: 'fade-up 0.8s ease-out'}}>
            <div style={{marginBottom:'40px',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
                        <div style={{width:'40px', height:'2px', background:'var(--neon-cyan)'}}></div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--neon-cyan)',letterSpacing:'4px'}}>SYSTEM.MAIN_MODULE</p>
                    </div>
                    <h2 className="section-title" style={{fontSize:'36px',color:'white',textShadow:'0 0 20px rgba(0,245,255,0.3)'}}>OPERATOR <span className="neon-cyan">HUD</span></h2>
                </div>
                <div style={{textAlign:'right',fontFamily:'Share Tech Mono,monospace'}}>
                    <div className="neon-green" style={{marginBottom:'4px',fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'8px'}}>
                        <span style={{width:'8px', height:'8px', background:'var(--neon-green)', borderRadius:'50%', animation:'pulse-glow 1.5s infinite'}}></span>
                        MONITORING ACTIVE
                    </div>
                    <div style={{fontSize:'12px', color:'var(--text-dim)', letterSpacing:'1px'}}>{new Date().toUTCString()}</div>
                </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'40px'}}>
                {monitoredModules.map((m, i) => (
                    <div key={m.id} className="hud-card game-card" style={{height:'180px', overflow:'hidden', animationDelay:`${i*0.15}s`}}>
                        <img src={m.banner} className="game-banner" alt={m.title} />
                        <div style={{position:'absolute', bottom:0, left:0, right:0, padding:'20px', background:'linear-gradient(transparent, rgba(2,2,10,0.95))'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                                <div>
                                    <div style={{fontSize:'10px', color:'var(--neon-cyan)', fontFamily:'Share Tech Mono', marginBottom:'4px'}}>// MODULE_STATUS</div>
                                    <div style={{fontSize:'16px', fontWeight:'700', fontFamily:'Orbitron', color:'white'}}>{m.title}</div>
                                </div>
                                <div style={{
                                    fontSize:'10px', 
                                    padding:'4px 8px', 
                                    border:`1px solid ${m.status==='Protected'?'var(--neon-green)':'var(--neon-cyan)'}`,
                                    color: m.status==='Protected'?'var(--neon-green)':'var(--neon-cyan)',
                                    background: 'rgba(0,0,0,0.5)',
                                    fontFamily: 'Share Tech Mono'
                                }}>
                                    {m.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'40px'}}>
                {statCards.map((card,i) => (
                    <div key={card.id} className="stat-card" style={{animationDelay:`${(i+3)*0.1}s`}} onClick={()=>setView(card.id)}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'2px'}}>{card.label}</span>
                            <span style={{fontSize:'20px',color:getColor(card.color),filter:`drop-shadow(0 0 8px ${getColor(card.color)})`}}>{card.icon}</span>
                        </div>
                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'52px',color:getColor(card.color),textShadow:`0 0 20px ${getColor(card.color)}`,lineHeight:1,marginBottom:'12px'}}>
                            {loading?'—':card.value}
                        </div>
                        <div style={{height:'4px', width:'100%', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden', marginBottom:'12px'}}>
                            <div style={{height:'100%', width:loading?'0%':'70%', background:getColor(card.color), boxShadow:`0 0 10px ${getColor(card.color)}`, transition:'width 1s ease-out'}}></div>
                        </div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'1px'}}>{card.desc}</p>
                    </div>
                ))}
            </div>

            <div style={{
                border:`1px solid ${stats.alerts>0?'var(--neon-red)':'var(--neon-green)'}`,
                background:stats.alerts>0?'rgba(255,0,60,0.03)':'rgba(0,255,136,0.03)',
                padding:'32px',
                position:'relative',
                overflow:'hidden',
                clipPath:'polygon(0 0,calc(100% - 30px) 0,100% 30px,100% 100%,30px 100%,0 calc(100% - 30px))'
            }} className="glass-panel">
                <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.1, background:'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)', backgroundSize:'100% 4px'}}></div>
                
                <div style={{display:'flex',alignItems:'center',gap:'32px', position:'relative', zIndex:2}}>
                    <div style={{
                        width:'80px', height:'80px', 
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px',
                        border:`2px solid ${stats.alerts>0?'var(--neon-red)':'var(--neon-green)'}`,
                        borderRadius:'50%',
                        boxShadow:`0 0 20px ${stats.alerts>0?'rgba(255,0,60,0.3)':'rgba(0,255,136,0.3)'}`,
                        animation:'pulse-glow 2s infinite'
                    }}>
                        {stats.alerts>0?'⚠':'🛡'}
                    </div>
                    <div style={{flex:1}}>
                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'20px',letterSpacing:'4px',marginBottom:'8px',color:stats.alerts>0?'var(--neon-red)':'var(--neon-green)'}}>
                            SYSTEM STATE: {stats.alerts>0?'ANOMALY DETECTED':'NOMINAL'}
                        </div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'14px',color:'rgba(204, 214, 246, 0.7)', lineHeight:1.6}}>
                            {stats.alerts>0 
                                ? `// ${stats.alerts} unauthorized access attempts detected. Security protocols engaged. Immediate intervention required.` 
                                : '// All monitored gaming platforms are reporting secure. No packet injection or geolocation anomalies detected.'}
                        </p>
                    </div>
                    {stats.alerts > 0 && (
                        <button className="btn-gamer danger" onClick={() => setView('alerts')}>VIEW ANOMALIES</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
