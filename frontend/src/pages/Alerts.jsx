import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = () => {
        fetch(`${API_URL}/alerts`,{credentials:'include'})
        .then(r=>r.json()).then(data=>{setAlerts(data.alerts||[]);setLoading(false);});
    };
    useEffect(()=>{fetchAlerts();},[]);

    const updateAlert = async(id,status)=>{ 
        await fetch(`${API_URL}/alerts/${id}`,{
            method:'PATCH',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({status}),
            credentials:'include'
        }); 
        fetchAlerts(); 
    };

    const sev = {
        high:{border:'var(--neon-red)',badge:'rgba(255,0,60,0.15)',color:'var(--neon-red)',label:'CRITICAL'},
        medium:{border:'var(--neon-orange)',badge:'rgba(255,102,0,0.15)',color:'var(--neon-orange)',label:'WARNING'},
        low:{border:'var(--neon-cyan)',badge:'rgba(0,245,255,0.15)',color:'var(--neon-cyan)',label:'NOTICE'},
    };

    return (
        <div style={{animation: 'fade-up 0.5s ease-out'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                        <div style={{width:'30px', height:'2px', background:'var(--neon-red)'}}></div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-red)',letterSpacing:'3px'}}>THREAT.DETECTION</p>
                    </div>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white'}}>SECURITY <span className="neon-red">ANOMALIES</span></h2>
                </div>
                <button className="btn-gamer danger" onClick={fetchAlerts}>⟳ SCAN FOR THREATS</button>
            </div>

            {loading?<LoadingState/>:alerts.length===0?<EmptyState icon="🛡" title="NO ACTIVE THREATS" desc="All connected nodes are reporting nominal status." color="green"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    {alerts.map(alert=>{
                        const s=sev[alert.severity]||sev.low;
                        let details={};try{details=JSON.parse(alert.details);}catch(e){}
                        return(
                            <div key={alert.id} className="hud-card glass-panel" style={{border:`1px solid ${s.border}`, padding:'24px', position:'relative', overflow:'hidden'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'11px',letterSpacing:'2px',padding:'6px 12px',border:`1px solid ${s.color}`,color:s.color,background:s.badge}}>{s.label}</div>
                                        <div>
                                            <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'2px',marginBottom:'4px'}}>{alert.alert_type?.replace(/_/g,' ').toUpperCase()}</div>
                                            <div style={{fontFamily:'Orbitron,monospace',fontSize:'14px',color:'white',fontWeight:'700'}}>{alert.display_name}</div>
                                        </div>
                                    </div>
                                    <span className="status-badge" style={{border:`1px solid ${alert.status==='pending'?'#fff':alert.status==='verified'?'var(--neon-green)':'var(--neon-red)'}`,color:alert.status==='pending'?'#fff':alert.status==='verified'?'var(--neon-green)':'var(--neon-red)', fontSize:'10px', padding:'4px 10px'}}>{alert.status?.toUpperCase()}</span>
                                </div>
                                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'#8892b0',marginBottom:'16px',paddingLeft:'12px',borderLeft:`2px solid ${s.color}`}}>
                                    <div style={{marginBottom:'4px'}}>MESSAGE: {details.message}</div>
                                    <div style={{marginBottom:'4px'}}>LOCATION: {details.location} | DEVICE: {details.device}</div>
                                    <div style={{color:'var(--text-dim)'}}>TIMESTAMP: {new Date(alert.created_at).toLocaleString()}</div>
                                </div>
                                {alert.status==='pending'&&(
                                    <div style={{display:'flex',gap:'12px',paddingTop:'16px',borderTop:'1px solid var(--border-dim)'}}>
                                        <button className="btn-gamer success" style={{fontSize:'10px',padding:'8px 20px'}} onClick={()=>updateAlert(alert.id,'verified')}>✓ AUTHORIZE ACCESS</button>
                                        <button className="btn-gamer danger" style={{fontSize:'10px',padding:'8px 20px'}} onClick={()=>updateAlert(alert.id,'threat')}>⚠ FLAG AS THREAT</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Alerts;
