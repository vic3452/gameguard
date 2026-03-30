import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Accounts({ token }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const fetchAccounts = () => {
        fetch(`${API_URL}/accounts`,{headers:{'Authorization':`Bearer ${token}`}})
        .then(r=>r.json()).then(data=>{setAccounts(data.accounts||[]);setLoading(false);});
    };
    useEffect(()=>{fetchAccounts();}, [token]);

    const linkDemo = async () => {
        const res = await fetch(`${API_URL}/accounts/link-demo`,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify({displayName:'PLAYER_'+Math.floor(Math.random()*9999)})
        });
        const data = await res.json();
        if (res.ok){fetchAccounts();setMsg('');}else setMsg(data.error);
    };

    return (
        <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'3px',marginBottom:'8px'}}>◈ ACCOUNTS.MGR</p>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white',marginBottom:'4px'}}>GAMING <span className="neon-cyan">ACCOUNTS</span></h2>
                    <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)'}}>// LINKED PLATFORM MONITORING</p>
                </div>
                <button className="btn-gamer" onClick={linkDemo}>+ LINK ACCOUNT</button>
            </div>
            {msg&&<div style={{border:'1px solid var(--neon-red)',background:'rgba(255,0,60,0.1)',padding:'12px 16px',fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--neon-red)',marginBottom:'16px'}}>⚠ {msg.toUpperCase()}</div>}
            {loading?<LoadingState/>:accounts.length===0?<EmptyState icon="◈" title="NO ACCOUNTS LINKED" desc="Link a gaming account to begin monitoring" action={linkDemo} actionLabel="LINK FIRST ACCOUNT"/>:(
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {accounts.map(acc=>(
                        <div key={acc.id} className="hud-card" style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'20px',border:'1px solid var(--border-dim)'}}>
                            <img src={acc.avatar_url} alt={acc.display_name} style={{width:'56px',height:'56px',borderRadius:'50%',border:'2px solid var(--neon-cyan)',boxShadow:'0 0 15px rgba(0,245,255,0.3)'}}/>
                            <div style={{flex:1}}>
                                <div style={{fontFamily:'Orbitron,monospace',fontWeight:'700',fontSize:'15px',color:'white',letterSpacing:'1px',marginBottom:'4px'}}>{acc.display_name}</div>
                                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'1px'}}>
                                    PLATFORM: <span style={{color:'var(--neon-cyan)'}}>{acc.platform.toUpperCase()}</span> &nbsp;|&nbsp; LINKED: <span style={{color:'var(--neon-cyan)'}}>{new Date(acc.linked_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <span className="status-badge" style={{border:'1px solid var(--neon-green)',color:'var(--neon-green)',background:'rgba(0,255,136,0.08)'}}>● ACTIVE</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Accounts;
