import React, { useEffect, useState } from "react";
import { getWatchlist } from "../api";

const thS = {
  padding:'8px 16px', fontSize:9, color:'#3d404a', textTransform:'uppercase',
  letterSpacing:'0.1em', fontWeight:700, borderBottom:'1px solid #1c1c1c',
  textAlign:'left', background:'#0a0a0a', whiteSpace:'nowrap'
};
const tdS = (opts={}) => ({
  padding:'12px 16px', borderBottom:'1px solid #0d0d0d',
  fontSize:12, color:opts.color||'#c9ccd4',
  fontFamily:opts.mono?'monospace':undefined,
  fontWeight:opts.bold?700:400,
  textAlign:opts.right?'right':'left', whiteSpace:'nowrap',
});

export default function StatsView({ portfolio }) {
  const { summary={}, active_bots=[] } = portfolio;
  const [watchlist, setWatchlist] = useState([]);
  useEffect(() => { getWatchlist().then(setWatchlist).catch(()=>{}); }, []);

  const pnl        = summary.total_pnl||0;
  const openBots   = active_bots.length;
  const maxAbsChg  = watchlist.length ? Math.max(...watchlist.map(w => Math.abs(w.pct))) : 1;

  return (
    <div style={{ height:'100%', overflowY:'auto', background:'#000', padding:16 }}>

      {/* ── Summary strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Open Positions',   value: openBots,       sub: openBots===0?'No active orders':'AI-managed', color:'#e0e0e0',     subColor:'#3d404a' },
          { label:'Shares Deployed',  value: summary.total_qty||0, sub:'Total units',  color:'#e0e0e0',     subColor:'#3d404a' },
          { label:'Total P&L',        value:`₹${pnl.toFixed(2)}`, sub: pnl>=0?'In profit':'In loss', color:pnl>=0?'#089981':'#F23645', subColor:pnl>=0?'rgba(8,153,129,0.5)':'rgba(242,54,69,0.5)', mono:true },
          { label:'System Status',    value: summary.status||'STANDBY', sub: openBots>0?'AI active':'Awaiting orders', color:openBots>0?'#089981':'#6b7280', subColor:'#3d404a' },
        ].map(({ label, value, sub, color, subColor, mono }) => (
          <div key={label} style={{
            background:'#050505', border:'1px solid #1c1c1c', borderRadius:10,
            padding:'16px 18px', position:'relative', overflow:'hidden'
          }}>
            {/* subtle top accent bar */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: color==='#089981'?'rgba(8,153,129,0.3)':color==='#F23645'?'rgba(242,54,69,0.3)':'rgba(255,255,255,0.05)', borderRadius:'10px 10px 0 0' }} />
            <div style={{ fontSize:9, color:'#3d404a', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:10 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:700, color, fontFamily:mono?'monospace':undefined, lineHeight:1, marginBottom:6 }}>{value}</div>
            <div style={{ fontSize:10, color:subColor }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Market Overview ── */}
      <div style={{ background:'#050505', border:'1px solid #1c1c1c', borderRadius:10, marginBottom:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1c1c1c', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>Market Overview</span>
          <span style={{ fontSize:9, color:'#3d404a' }}>NSE · Backtest data · {watchlist.length} pairs</span>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Symbol','Last Price','Change ₹','Change %','Vol. Bar','Trend'].map(h=>(
                <th key={h} style={thS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {watchlist.map(w => {
              const barWidth = Math.min(100, Math.abs(w.pct) / maxAbsChg * 100);
              const barColor = w.trend==='up' ? 'rgba(8,153,129,0.4)' : 'rgba(242,54,69,0.4)';
              return (
                <tr key={w.ticker}
                  onMouseEnter={e=>e.currentTarget.style.background='#080808'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{ transition:'background 0.1s', cursor:'default' }}>

                  <td style={{ ...tdS({ bold:true }), color:'#e0e0e0' }}>{w.ticker}</td>
                  <td style={tdS({ mono:true })}>₹{w.price.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                  <td style={tdS({ mono:true, color: w.trend==='up'?'#089981':'#F23645' })}>
                    {w.change>0?'+':''}{w.change?.toFixed(2) ?? '0.00'}
                  </td>
                  <td style={tdS({ mono:true, bold:true, color: w.trend==='up'?'#089981':'#F23645' })}>
                    {w.pct>0?'+':''}{w.pct.toFixed(3)}%
                  </td>
                  {/* Mini bar indicator */}
                  <td style={{ padding:'12px 16px', borderBottom:'1px solid #0d0d0d', minWidth:120 }}>
                    <div style={{ height:4, background:'#111', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${barWidth}%`, height:'100%', background:barColor, borderRadius:2, transition:'width 0.5s' }} />
                    </div>
                  </td>
                  <td style={tdS()}>
                    <span style={{
                      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                      background: w.trend==='up'?'rgba(8,153,129,0.10)':'rgba(242,54,69,0.10)',
                      border:`1px solid ${w.trend==='up'?'rgba(8,153,129,0.25)':'rgba(242,54,69,0.25)'}`,
                      color: w.trend==='up'?'#089981':'#F23645',
                    }}>
                      {w.trend==='up'?'▲ Bullish':'▼ Bearish'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Active Positions ── */}
      <div style={{ background:'#050505', border:'1px solid #1c1c1c', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1c1c1c', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>Active AI Positions</span>
          <span style={{
            padding:'2px 10px', borderRadius:14, fontSize:10, fontWeight:600,
            background: openBots>0?'rgba(8,153,129,0.10)':'transparent',
            border:`1px solid ${openBots>0?'rgba(8,153,129,0.25)':'#1c1c1c'}`,
            color: openBots>0?'#089981':'#3d404a',
          }}>
            {openBots} open
          </span>
        </div>

        {active_bots.length === 0 ? (
          <div style={{ padding:'50px 20px', textAlign:'center' }}>
              <div style={{ fontSize:13, color:'#3d404a', fontWeight:600, marginBottom:6 }}>No active positions</div>
            <div style={{ fontSize:11, color:'#2a2a2a' }}>
              Go to <strong style={{color:'#6b7280'}}>Chart</strong> or <strong style={{color:'#6b7280'}}>Orders</strong> and execute an AI order to see it here.
            </div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Symbol','Side','Qty','AI Entry Price','P&L','Return %','Entry Date','Status'].map(h=>(
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active_bots.map(bot => {
                const returnPct = bot.ai_exec_price ? ((bot.pnl / (bot.ai_exec_price * bot.qty)) * 100) : 0;
                return (
                  <tr key={bot.id}
                    onMouseEnter={e=>e.currentTarget.style.background='#080808'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    style={{ transition:'background 0.1s' }}>
                    <td style={{ ...tdS({bold:true}), color:'#e0e0e0' }}>{bot.ticker}</td>
                    <td style={tdS()}>
                      <span style={{
                        padding:'3px 10px', borderRadius:14, fontSize:11, fontWeight:700,
                        background: bot.strat.includes('Buy')?'rgba(8,153,129,0.12)':'rgba(242,54,69,0.12)',
                        border:`1px solid ${bot.strat.includes('Buy')?'rgba(8,153,129,0.3)':'rgba(242,54,69,0.3)'}`,
                        color: bot.strat.includes('Buy')?'#089981':'#F23645',
                      }}>
                        {bot.strat.includes('Buy')?'LONG':'SHORT'}
                      </span>
                    </td>
                    <td style={tdS()}>{bot.qty}</td>
                    <td style={tdS({mono:true})}>₹{bot.ai_exec_price?.toFixed(2)}</td>
                    <td style={tdS({mono:true, bold:true, color: bot.pnl>=0?'#089981':'#F23645'})}>
                      {bot.pnl>=0?'+':''}₹{bot.pnl?.toFixed(2)}
                    </td>
                    <td style={{ ...tdS({mono:true}), color: returnPct>=0?'#089981':'#F23645', fontWeight:600 }}>
                      {returnPct>=0?'+':''}{returnPct.toFixed(2)}%
                    </td>
                    <td style={tdS({color:'#6b7280'})}>{bot.entry_date}</td>
                    <td style={tdS()}>
                      <span style={{ fontSize:10 }}>
                        <span style={{ color:'#089981' }}>●</span>
                        <span style={{ color:'#6b7280', marginLeft:5 }}>Executed</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
