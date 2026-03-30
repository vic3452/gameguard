import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Activities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = () => {
        fetch(`${API_URL}/activities`,{credentials:'include'})
        .then(r=>r.json()).then(data=>{setActivities(data.activities||[]);setLoading(false);});
    };
    useEffect(()=>{fetchActivities();},[]);

    return (
        <div style={{animation: 'fade-up 0.5s ease-out'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                        <div style={{width:'30px', height:'2px', background:'var(--neon-green)'}}></div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-green)',letterSpacing:'3px'}}>ACTIVITY.LOG</p>
                    </div>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white'}}>ACCESS <span className="neon-green">HISTORY</span></h2>
                </div>
                <button className="btn-gamer success" onClick={fetchActivities}>⟳ REFRESH LOGS</button>
            </div>

            {loading?<LoadingState/>:activities.length===0?<EmptyState icon="◉" title="NO ACTIVITY RECORDED" desc="System monitoring is active. Waiting for incoming events..." color="green"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'16px',padding:'12px 24px',fontFamily:'Share Tech Mono,monospace',fontSize:'10px',color:'var(--text-dim)',letterSpacing:'2px',borderBottom:'1px solid var(--border-dim)'}}>
                        <span>ORIGIN // NODE</span><span>LOCATION // IP</span><span>TIMESTAMP</span><span>VALIDATION</span>
                    </div>
                    {activities.map(a=>(
                        <div key={a.id} className={`activity-row hud-card glass-panel ${a.is_suspicious?'suspicious':''}`} style={{borderLeft: a.is_suspicious ? '4px solid var(--neon-red)' : '1px solid var(--border-dim)'}}>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'16px',alignItems:'center'}}>
                                <div>
                                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'12px',color:'white',letterSpacing:'1px',marginBottom:'2px'}}>{a.activity_type.toUpperCase()}</div>
                                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)'}}>{a.display_name}</div>
                                </div>
                                <div>
                                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'#ccd6f6',marginBottom:'2px'}}>📍 {a.city}, {a.country}</div>
                                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)'}}>{a.ip_address}</div>
                                </div>
                                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)'}}>{new Date(a.created_at).toLocaleString()}</div>
                                <div>{a.is_suspicious?<span className="status-badge" style={{border:'1px solid var(--neon-red)',color:'var(--neon-red)',background:'rgba(255,0,60,0.1)'}}>⚠ ANOMALY</span>:<span className="status-badge" style={{border:'1px solid var(--neon-green)',color:'var(--neon-green)',background:'rgba(0,255,136,0.08)'}}>✓ VERIFIED</span>}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Activities;
