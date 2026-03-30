import React, { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/Common';

const API_URL = '/api';

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const fetchAccounts = () => {
        fetch(`${API_URL}/accounts`,{credentials:'include'})
        .then(r=>r.json()).then(data=>{setAccounts(data.accounts||[]);setLoading(false);});
    };
    useEffect(()=>{fetchAccounts();}, []);

    const linkSteam = () => {
        window.location.href = `${API_URL}/auth/steam`;
    };

    return (
        <div style={{animation: 'fade-up 0.5s ease-out'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'32px'}}>
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                        <div style={{width:'30px', height:'2px', background:'var(--neon-cyan)'}}></div>
                        <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'3px'}}>ACCOUNTS.MGR</p>
                    </div>
                    <h2 className="section-title" style={{fontSize:'28px',color:'white'}}>CONNECTED <span className="neon-cyan">NODES</span></h2>
                </div>
                <button className="btn-gamer" onClick={linkSteam}>+ CONNECT STEAM</button>
            </div>
            
            {msg&&<div style={{border:'1px solid var(--neon-red)',background:'rgba(255,0,60,0.1)',padding:'12px 16px',fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--neon-red)',marginBottom:'16px'}}>⚠ {msg.toUpperCase()}</div>}
            
            {loading ? <LoadingState/> : accounts.length === 0 ? (
                <EmptyState icon="◈" title="NO NODES DETECTED" desc="Connect a gaming platform to initialize monitoring" action={linkSteam} actionLabel="CONNECT PRIMARY NODE"/>
            ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    {accounts.map(acc=>(
                        <div key={acc.id} className="hud-card glass-panel" style={{padding:'24px',display:'flex',alignItems:'center',gap:'24px'}}>
                            <div style={{position:'relative'}}>
                                <img src={acc.avatar_url} alt={acc.display_name} style={{width:'64px',height:'64px',borderRadius:'50%',border:'2px solid var(--neon-cyan)',boxShadow:'0 0 20px rgba(0,245,255,0.2)'}}/>
                                <div style={{position:'absolute', bottom:0, right:0, width:'16px', height:'16px', background:'var(--neon-green)', borderRadius:'50%', border:'3px solid var(--bg-dark)'}}></div>
                            </div>
                            <div style={{flex:1}}>
                                <div style={{fontFamily:'Orbitron,monospace',fontWeight:'700',fontSize:'18px',color:'white',letterSpacing:'1px',marginBottom:'6px'}}>{acc.display_name}</div>
                                <div style={{display:'flex', gap:'20px'}}>
                                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'1px'}}>
                                        PLATFORM: <span style={{color:'var(--neon-cyan)'}}>{acc.platform.toUpperCase()}</span>
                                    </div>
                                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'var(--text-dim)',letterSpacing:'1px'}}>
                                        STATUS: <span style={{color:'var(--neon-green)'}}>ENCRYPTED_LINK</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:'10px', color:'var(--text-dim)', fontFamily:'Share Tech Mono', marginBottom:'4px'}}>LAST_SYNC</div>
                                <div style={{fontSize:'12px', color:'white', fontFamily:'Share Tech Mono'}}>{new Date(acc.linked_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Accounts;
