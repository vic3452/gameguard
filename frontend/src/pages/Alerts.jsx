import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Alerts({ token }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = () => {
        fetch(`${API_URL}/alerts`,{headers:{'Authorization':`Bearer ${token}`}})
        .then(r=>r.json()).then(data=>{setAlerts(data.alerts||[]);setLoading(false);});
    };
    useEffect(()=>{fetchAlerts();},[token]);

    const createDemo = async()=>{ 
        await fetch(`${API_URL}/alerts/demo`,{
            method:'POST',
            headers:{'Authorization':`Bearer ${token}`}
        }); 
        fetchAlerts(); 
    };

    const updateAlert = async(id,status)=>{ 
        await fetch(`${API_URL}/alerts/${id}`,{
            method:'PATCH',
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify({status})
        }); 
        fetchAlerts(); 
    };

    const sev = {
        high:{border:'var(--neon-red)',badge:'rgba(255,0,60,0.15)',color:'var(--neon-red)',label:'HIGH'},
        medium:{border:'var(--neon-orange)',badge:'rgba(255,102,0,0.15)',color:'var(--neon-orange)',label:'MEDIUM'},
        low:{border:'var(--neon-cyan)',badge:'rgba(0,245,255,0.15)',color:'var(--neon-cyan)',label:'LOW'},
    };

    return (
        <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-red)',letterSpacing:'3px',marginBottom:'8px'}}>⚠ ALERT.CENTER</p>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white',marginBottom:'4px'}}>SECURITY <span className="neon-red">ALERTS</span></h2>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)'}}>// REVIEW AND RESPOND TO SECURITY EVENTS</p>
                </div>
                <button className="btn-gamer danger" onClick={createDemo}>+ SIMULATE ALERT</button>
            </div>
            {loading?<LoadingState/>:alerts.length===0?<EmptyState icon="🛡" title="NO ACTIVE ALERTS" desc="All gaming accounts are secure." color="green"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    {alerts.map(alert=>{
                        const s=sev[alert.severity]||sev.low;
                        let details={};try{details=JSON.parse(alert.details);}catch(e){}
                        return(
                            <div key={alert.id} style={{border:`1px solid ${s.border}`,background:`linear-gradient(135deg,${s.badge},transparent)`,padding:'24px',boxShadow:`0 0 20px ${s.badge}`,clipPath:'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                                        <div style={{fontFamily:'Orbitron,monospace',fontWeight:'900',fontSize:'11px',letterSpacing:'2px',padding:'6px 12px',border:`1px solid ${s.color}`,color:s.color,background:s.badge}}>{s.label}</div>
                                        <div>
                                            <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'2px',marginBottom:'4px'}}>{alert.alert_type?.replace(/_/g,' ').toUpperCase()}</div>
                                            <div style={{fontFamily:'Orbitron,monospace',fontSize:'14px',color:'white',fontWeight:'700'}}>{alert.display_name}</div>
                                        </div>
                                    </div>
                                    <span className="status-badge" style={{border:`1px solid ${alert.status==='pending'?'var(--neon-orange)':alert.status==='verified'?'var(--neon-green)':'var(--neon-red)'}`,color:alert.status==='pending'?'var(--neon-orange)':alert.status==='verified'?'var(--neon-green)':'var(--neon-red)'}}>{alert.status?.toUpperCase()}</span>
                                </div>
                                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'#8892b0',marginBottom:'16px',paddingLeft:'4px',borderLeft:`2px solid ${s.color}`}}>
                                    <div style={{marginBottom:'4px'}}>MSG: {details.message}</div>
                                    <div style={{marginBottom:'4px'}}>LOC: {details.location} | DEV: {details.device}</div>
                                    <div style={{color:'var(--text-dim)'}}>TIME: {new Date(alert.created_at).toLocaleString()}</div>
                                </div>
                                {alert.status==='pending'&&(
                                    <div style={{display:'flex',gap:'12px',paddingTop:'16px',borderTop:'1px solid var(--border-dim)'}}>
                                        <button className="btn-gamer success" style={{fontSize:'11px',padding:'8px 20px'}} onClick={()=>updateAlert(alert.id,'verified')}>✓ AUTHORIZED</button>
                                        <button className="btn-gamer danger" style={{fontSize:'11px',padding:'8px 20px'}} onClick={()=>updateAlert(alert.id,'threat')}>⚠ REPORT THREAT</button>
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
