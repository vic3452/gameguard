import React from 'react';

export function LoadingState() {
    return(
        <div style={{textAlign:'center',padding:'60px',fontFamily:'Share Tech Mono,monospace',color:'var(--neon-cyan)'}}>
            <div style={{fontSize:'32px',marginBottom:'12px',animation:'pulse-glow 1s infinite'}}>⬡</div>
            <div style={{fontSize:'12px',letterSpacing:'4px'}}>LOADING<span className="loading-dot">.</span><span className="loading-dot">.</span><span className="loading-dot">.</span></div>
        </div>
    );
}

export function EmptyState({ icon, title, desc, action, actionLabel, color='cyan' }) {
    const c = color==='green'?'var(--neon-green)':'var(--neon-cyan)';
    return(
        <div style={{border:'1px solid var(--border-dim)',background:'var(--bg-card)',padding:'60px',textAlign:'center',clipPath:'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))'}}>
            <div style={{fontSize:'40px',marginBottom:'16px',color:c,filter:`drop-shadow(0 0 10px ${c})`}}>{icon}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontWeight:'700',fontSize:'14px',letterSpacing:'3px',color:'white',marginBottom:'8px'}}>{title}</div>
            <p style={{fontFamily:'Share Tech Mono,monospace',fontSize:'12px',color:'var(--text-dim)',marginBottom:action?'24px':'0'}}>{desc}</p>
            {action&&<button className={`btn-gamer ${color==='green'?'success':''}`} onClick={action}>{actionLabel}</button>}
        </div>
    );
}
