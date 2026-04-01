import React, { useEffect, useState } from "react";
import { getWatchlist } from "../api";

const thS = {
  padding:'8px 16px', fontSize:9, color:'var(--tv-text3)', textTransform:'uppercase',
  letterSpacing:'0.1em', fontWeight:700, borderBottom:'1px solid var(--tv-border)',
  textAlign:'left', background:'var(--tv-bg)', whiteSpace:'nowrap'
};
const tdS = (opts={}) => ({
  padding:'12px 16px', borderBottom:'1px solid var(--tv-border)',
  fontSize:12, color:opts.color||'var(--tv-text)',
  fontFamily:opts.mono?'monospace':undefined,
  fontWeight:opts.bold?700:400,
  textAlign:opts.right?'right':'left', whiteSpace:'nowrap',
});

export default function StatsView({ portfolio, t }) {
  const { summary={}, active_bots=[] } = portfolio;
  const [watchlist, setWatchlist] = useState([]);
  const [showAllMarketOverview, setShowAllMarketOverview] = useState(false);
  useEffect(() => { getWatchlist().then(setWatchlist).catch(()=>{}); }, []);

  const pnl        = summary.total_pnl||0;
  const openBots   = active_bots.length;
  const maxAbsChg  = watchlist.length ? Math.max(...watchlist.map(w => Math.abs(w.pct))) : 1;

  return (
    <div style={{ height:'100%', overflowY:'auto', background:'var(--tv-bg)', padding:16 }}>

      {/* ── Summary strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:t('stats.openPositions'),   value: openBots,       sub: openBots===0?t('stats.noActiveOrders'):t('stats.aiManaged'), color:'var(--tv-text)',     subColor:'var(--tv-text3)' },
          { label:t('stats.sharesDeployed'),  value: summary.total_qty||0, sub:t('stats.totalUnits'),  color:'var(--tv-text)',     subColor:'var(--tv-text3)' },
          { label:t('stats.totalPnl'),        value:`₹${pnl.toFixed(2)}`, sub: pnl>=0?t('stats.inProfit'):t('stats.inLoss'), color:pnl>=0?'#089981':'#F23645', subColor:pnl>=0?'rgba(8,153,129,0.5)':'rgba(242,54,69,0.5)', mono:true },
          { label:t('stats.systemStatus'),    value: summary.status||t('status.standby'), sub: openBots>0?t('stats.aiActive'):t('stats.awaitingOrders'), color:openBots>0?'#089981':'var(--tv-text2)', subColor:'var(--tv-text3)' },
        ].map(({ label, value, sub, color, subColor, mono }) => (
          <div key={label} style={{
            background:'var(--tv-bg2)', border:'1px solid var(--tv-border)', borderRadius:10,
            padding:'16px 18px', position:'relative', overflow:'hidden'
          }}>
            {/* subtle top accent bar */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: color==='#089981'?'rgba(8,153,129,0.3)':color==='#F23645'?'rgba(242,54,69,0.3)':'var(--tv-border)', borderRadius:'10px 10px 0 0' }} />
            <div style={{ fontSize:9, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:10 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:700, color, fontFamily:mono?'monospace':undefined, lineHeight:1, marginBottom:6 }}>{value}</div>
            <div style={{ fontSize:10, color:subColor }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Active Positions ── */}
      <div style={{ background:'var(--tv-bg2)', border:'1px solid var(--tv-border)', borderRadius:10, marginBottom:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--tv-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:'var(--tv-text2)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>{t('stats.activeAiPositions')}</span>
          <span style={{
            padding:'2px 10px', borderRadius:14, fontSize:10, fontWeight:600,
            background: openBots>0?'rgba(8,153,129,0.10)':'transparent',
            border:`1px solid ${openBots>0?'rgba(8,153,129,0.25)':'var(--tv-border)'}`,
            color: openBots>0?'#089981':'var(--tv-text3)',
          }}>
            {t('analytics.positionsOpen', { count: openBots })}
          </span>
        </div>

        {active_bots.length === 0 ? (
          <div style={{ padding:'50px 20px', textAlign:'center' }}>
              <div style={{ fontSize:13, color:'var(--tv-text3)', fontWeight:600, marginBottom:6 }}>{t('stats.noActivePositions')}</div>
            <div style={{ fontSize:11, color:'var(--tv-text2)' }}>
              {t('stats.goToChartOrders')}
            </div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {[t('stats.symbol'),t('stats.side'),t('stats.qty'),t('stats.entryPrice'),t('stats.pnl'),t('stats.returnPct'),t('stats.entryDate'),t('stats.status')].map(h=>(
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active_bots.map(bot => {
                const returnPct = bot.ai_exec_price ? ((bot.pnl / (bot.ai_exec_price * bot.qty)) * 100) : 0;
                return (
                  <tr key={bot.id}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--tv-bg3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    style={{ transition:'background 0.1s' }}>
                    <td style={{ ...tdS({bold:true}), color:'var(--tv-text)' }}>{bot.ticker}</td>
                    <td style={tdS()}>
                      <span style={{
                        padding:'3px 10px', borderRadius:14, fontSize:11, fontWeight:700,
                        background: bot.strat.includes('Buy')?'rgba(8,153,129,0.12)':'rgba(242,54,69,0.12)',
                        border:`1px solid ${bot.strat.includes('Buy')?'rgba(8,153,129,0.3)':'rgba(242,54,69,0.3)'}`,
                        color: bot.strat.includes('Buy')?'#089981':'#F23645',
                      }}>
                        {bot.strat.includes('Buy')?t('portfolio.buyLabel'):t('portfolio.sellLabel')}
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
                    <td style={tdS({color:'var(--tv-text2)'})}>{bot.entry_date}</td>
                    <td style={tdS()}>
                      <span style={{ fontSize:10 }}>
                        <span style={{ color:'#089981' }}>●</span>
                        <span style={{ color:'var(--tv-text2)', marginLeft:5 }}>{t('stats.executed')}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Market Overview ── */}
      <div style={{ background:'var(--tv-bg2)', border:'1px solid var(--tv-border)', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--tv-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:'var(--tv-text2)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>{t('stats.marketOverview')}</span>
          <span style={{ fontSize:9, color:'var(--tv-text3)' }}>{t('stats.marketMeta', { count: watchlist.length })}</span>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {[t('stats.symbol'),t('stats.lastPrice'),t('stats.changeRupee'),t('stats.changePct'),t('stats.volBar'),t('stats.trend')].map(h=>(
                <th key={h} style={thS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(showAllMarketOverview ? watchlist : watchlist.slice(0, 10)).map(w => {
              const barWidth = Math.min(100, Math.abs(w.pct) / maxAbsChg * 100);
              const barColor = w.trend==='up' ? 'rgba(8,153,129,0.4)' : 'rgba(242,54,69,0.4)';
              return (
                <tr key={w.ticker}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--tv-bg3)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{ transition:'background 0.1s', cursor:'default' }}>

                  <td style={{ ...tdS({ bold:true }), color:'var(--tv-text)' }}>{w.ticker}</td>
                  <td style={tdS({ mono:true })}>₹{w.price.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                  <td style={tdS({ mono:true, color: w.trend==='up'?'#089981':'#F23645' })}>
                    {w.change>0?'+':''}{w.change?.toFixed(2) ?? '0.00'}
                  </td>
                  <td style={tdS({ mono:true, bold:true, color: w.trend==='up'?'#089981':'#F23645' })}>
                    {w.pct>0?'+':''}{w.pct.toFixed(3)}%
                  </td>
                  {/* Mini bar indicator */}
                  <td style={{ padding:'12px 16px', borderBottom:'1px solid var(--tv-border)', minWidth:120 }}>
                    <div style={{ height:4, background:'var(--tv-bg)', borderRadius:2, overflow:'hidden' }}>
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
                      {w.trend==='up'?`▲ ${t('stats.bullish')}`:`▼ ${t('stats.bearish')}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {watchlist.length > 10 && (
          <div 
            onClick={() => setShowAllMarketOverview(!showAllMarketOverview)}
            style={{ 
              padding:'12px', textAlign:'center', cursor:'pointer', color:'var(--tv-text2)', fontSize:12, fontWeight:500,
              borderTop:'1px solid var(--tv-border)', transition:'background 0.2s', background: 'var(--tv-bg2)'
            }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--tv-bg3)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--tv-bg2)'}
          >
            {showAllMarketOverview ? t('stats.showLess') : t('stats.showAllPairs', { count: watchlist.length })}
          </div>
        )}
      </div>
    </div>
  );
}
