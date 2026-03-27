import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from "lightweight-charts";

/* ── Error boundary — prevents a chart crash from blacking out the whole app ── */
class ChartErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#3d404a" }}>Chart render error</div>
          <div style={{ fontSize: 10, color: "#2a2a2a", maxWidth: 300, textAlign: "center" }}>{this.state.error.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const money = (v) => (v == null || Number.isNaN(Number(v)) ? "—" : `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`);
const pct = (v) => (v == null || Number.isNaN(Number(v)) ? "—" : `${Number(v).toFixed(3)}%`);

export default function CandlestickChart({ chartData, ticker, metrics, changePct }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !chartData || chartData.length === 0) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    // ── Colors matching TradingView exactly ──
    const BG          = "#000000";
    const GRID        = "#111111";
    const AXIS_TEXT   = "#4e5460";
    const AXIS_BORDER = "#1c1c1c";

    const chart = createChart(containerRef.current, {
      layout: {
        background:  { type: "solid", color: BG },
        textColor:   AXIS_TEXT,
        fontSize:    11,
        fontFamily:  "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', sans-serif",
      },
      grid: {
        vertLines: { color: GRID, style: 0 },
        horzLines: { color: GRID, style: 0 },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#363a45", labelBackgroundColor: "#1a1d24", width: 1, style: 2 },
        horzLine: { color: "#363a45", labelBackgroundColor: "#1a1d24", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor:    AXIS_BORDER,
        textColor:      AXIS_TEXT,
        scaleMargins:   { top: 0.08, bottom: 0.2 },  // leave room for volume
      },
      timeScale: {
        borderColor:      AXIS_BORDER,
        textColor:        AXIS_TEXT,
        timeVisible:      true,
        secondsVisible:   false,
        fixLeftEdge:      true,
        fixRightEdge:     true,
        rightOffset:      5,
        barSpacing:       6,
        minBarSpacing:    2,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
      handleScale:  { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    // ── Parse & sort data — handle both 'date' and 'timestamp' column names ──
    const validData = chartData
      .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
      .map((d, i) => {
        // Support: d.timestamp, d.date, d.datetime, d.time, or fallback to index
        const rawTime = d.timestamp ?? d.date ?? d.datetime ?? d.time ?? null;
        const t = rawTime ? new Date(rawTime).getTime() / 1000 : i;
        return {
          time:    isNaN(t) ? i : t,
          open:    parseFloat(d.open),
          high:    parseFloat(d.high),
          low:     parseFloat(d.low),
          close:   parseFloat(d.close),
          volume:  d.volume != null ? parseFloat(d.volume) : Math.abs(parseFloat(d.close) - parseFloat(d.open)) * 1000 + 5000,
          sma20:   d.sma_20   != null && !isNaN(d.sma_20)   ? parseFloat(d.sma_20)   : null,
          sma50:   d.sma_50   != null && !isNaN(d.sma_50)   ? parseFloat(d.sma_50)   : null,
          bbUpper: d.bb_upper != null && !isNaN(d.bb_upper) ? parseFloat(d.bb_upper) : null,
          bbLower: d.bb_lower != null && !isNaN(d.bb_lower) ? parseFloat(d.bb_lower) : null,
        };
      })
      .filter(d => !isNaN(d.open) && !isNaN(d.close) && !isNaN(d.high) && !isNaN(d.low))
      .sort((a, b) => a.time - b.time);

    if (validData.length === 0) return;


    // ── VOLUME histogram (bottom pane) ──
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color:        "#089981",
      priceFormat:  { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
      borderColor: AXIS_BORDER,
    });
    volumeSeries.setData(validData.map(d => ({
      time:  d.time,
      value: d.volume,
      color: d.close >= d.open ? "rgba(8,153,129,0.35)" : "rgba(242,54,69,0.35)",
    })));

    // ── CANDLESTICK series ──
    const candles = chart.addSeries(CandlestickSeries, {
      upColor:         "#089981",
      downColor:       "#F23645",
      borderUpColor:   "#089981",
      borderDownColor: "#F23645",
      wickUpColor:     "#089981",
      wickDownColor:   "#F23645",
    });
    candles.setData(validData);

    // ── SMA 20 ──
    const sma20 = chart.addSeries(LineSeries, {
      color:                  "#2962ff",
      lineWidth:              1,
      crosshairMarkerVisible: false,
      priceLineVisible:       false,
      lastValueVisible:       true,
      title:                  "SMA20",
    });
    sma20.setData(validData.filter(d => d.sma20 != null).map(d => ({ time: d.time, value: d.sma20 })));

    // ── SMA 50 ──
    const sma50 = chart.addSeries(LineSeries, {
      color:                  "#f39c12",
      lineWidth:              1,
      crosshairMarkerVisible: false,
      priceLineVisible:       false,
      lastValueVisible:       true,
      title:                  "SMA50",
    });
    sma50.setData(validData.filter(d => d.sma50 != null).map(d => ({ time: d.time, value: d.sma50 })));

    // ── BB Upper (very subtle dashed) ──
    const bbUpper = chart.addSeries(LineSeries, {
      color:                  "rgba(120,100,200,0.45)",
      lineWidth:              1,
      lineStyle:              2,
      crosshairMarkerVisible: false,
      priceLineVisible:       false,
      lastValueVisible:       true,
      title:                  "BB Upper",
    });
    bbUpper.setData(validData.filter(d => d.bbUpper != null).map(d => ({ time: d.time, value: d.bbUpper })));

    // ── BB Lower (very subtle dashed) ──
    const bbLower = chart.addSeries(LineSeries, {
      color:                  "rgba(120,100,200,0.45)",
      lineWidth:              1,
      lineStyle:              2,
      crosshairMarkerVisible: false,
      priceLineVisible:       false,
      lastValueVisible:       true,
      title:                  "BB Lower",
    });
    bbLower.setData(validData.filter(d => d.bbLower != null).map(d => ({ time: d.time, value: d.bbLower })));

    chart.timeScale().fitContent();

    // ── Auto-resize ──
    const ro = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    };
  }, [chartData, ticker]);
  return (
    <ChartErrorBoundary>
      <div style={{ width: "100%", height: "100%", background: "#000", position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#000" }} />

        {metrics && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 12,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            pointerEvents: "none",
            flexWrap: "wrap",
            maxWidth: "80%",
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: "#e0e0e0" }}>
              {money(metrics.current_price)}
            </span>

            <span style={{
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "monospace",
              color: (changePct ?? 0) >= 0 ? "#089981" : "#F23645",
            }}>
              {(changePct ?? 0) > 0 ? "+" : ""}{pct(changePct ?? 0)}
            </span>

            {[
              ["H", money(metrics.resistance)],
              ["L", money(metrics.support)],
              ["RSI", metrics.rsi?.toFixed?.(1) ?? "—"],
              ["ATR%", pct(metrics.volatility_atr_pct)],
              ["SMA20", money(metrics.sma_20)],
              ["SMA50", money(metrics.sma_50)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#c9ccd4", fontFamily: "monospace", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartErrorBoundary>
  );
}
