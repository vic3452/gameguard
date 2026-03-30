import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Activities({ token }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = () => {
        fetch(`${API_URL}/activities`,{headers:{'Authorization':`Bearer ${token}`}})
        .then(r=>r.json()).then(data=>{setActivities(data.activities||[]);setLoading(false);});
    };
    useEffect(()=>{fetchActivities();},[token]);

    const createDemo = async()=>{ 
        await fetch(`${API_URL}/activities/demo`,{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`}
        }); 
        fetchActivities(); 
    };

    return (
        <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-green)',letterSpacing:'3px',marginBottom:'8px'}}>◉ ACTIVITY.LOG</p>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white',marginBottom:'4px'}}>LOGIN <span className="neon-green">ACTIVITY</span></h2>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)'}}>// ALL MONITORED ACCESS EVENTS</p>
                </div>
                <button className="btn-gamer success" onClick={createDemo}>+ SIMULATE EVENT</button>
            </div>
            {loading?<LoadingState/>:activities.length===0?<EmptyState icon="◉" title="NO ACTIVITY RECORDED" desc="Simulate events to populate the log" action={createDemo} actionLabel="SIMULATE EVENT" color="green"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'16px',padding:'8px 20px',fontFamily:'Share Tech Mono,monospace',fontSize:'10px',color:'var(--text-dim)',letterSpacing:'2px',borderBottom:'1px solid var(--border-dim)'}}>
                        <span>TYPE // ACCOUNT</span><span>LOCATION // IP</span><span>TIMESTAMP</span><span>STATUS</span>
                    </div>
                    {activities.map(a=>(
                        <div key={a.id} className={`activity-row ${a.is_suspicious?'suspicious':''}`}>
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
                                <div>{a.is_suspicious?<span className="status-badge" style={{border:'1px solid var(--neon-red)',color:'var(--neon-red)',background:'rgba(255,0,60,0.1)'}}>⚠ THREAT</span>:<span className="status-badge" style={{border:'1px solid var(--neon-green)',color:'var(--neon-green)',background:'rgba(0,255,136,0.08)'}}>✓ CLEAR</span>}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Activities;
