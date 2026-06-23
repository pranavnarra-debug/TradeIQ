/* ============================================================
   TradeIQ — charts.js
   Shared Chart.js helpers for candle/indicator overlays,
   admin charts, and small utility chart builders.
   ============================================================ */

const ChartHelpers = (() => {
  const COLORS = {
    price: '#e6edf3',
    ema9: '#58a6ff',
    ema21: '#d29922',
    ema50: '#bc8cff',
    bbBand: '#8b949e',
    volume: 'rgba(88,166,255,0.25)',
    green: '#3fb950',
    red: '#f85149',
    grid: 'rgba(255,255,255,0.06)',
  };

  function destroyIfExists(chartRef) {
    if (chartRef && typeof chartRef.destroy === 'function') {
      chartRef.destroy();
    }
  }

  /**
   * Builds the main candle/indicator overlay chart used by AI Trader and My Desk.
   * @param {HTMLCanvasElement} canvas
   * @param {Array} candles - [{date, open, high, low, close, volume}]
   * @param {Object} indicators - {ema9, ema21, ema50, bbUpper, bbLower} arrays aligned to candles
   * @param {Array} tradeMarkers - [{index, type: 'BUY'|'SELL', price}]
   */
  function buildPriceChart(canvas, candles, indicators = {}, tradeMarkers = []) {
    const labels = candles.map((c) => c.date);
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);

    const datasets = [
      {
        label: 'Close',
        data: closes,
        borderColor: COLORS.price,
        backgroundColor: 'transparent',
        borderWidth: 1.75,
        pointRadius: 0,
        tension: 0.15,
        yAxisID: 'price',
        order: 1,
      },
    ];

    if (indicators.ema9) {
      datasets.push({
        label: 'EMA 9', data: indicators.ema9, borderColor: COLORS.ema9,
        borderWidth: 1.25, pointRadius: 0, tension: 0.15, yAxisID: 'price', order: 2,
      });
    }
    if (indicators.ema21) {
      datasets.push({
        label: 'EMA 21', data: indicators.ema21, borderColor: COLORS.ema21,
        borderWidth: 1.25, pointRadius: 0, tension: 0.15, yAxisID: 'price', order: 2,
      });
    }
    if (indicators.ema50) {
      datasets.push({
        label: 'EMA 50', data: indicators.ema50, borderColor: COLORS.ema50,
        borderWidth: 1.25, pointRadius: 0, tension: 0.15, yAxisID: 'price', order: 2,
      });
    }
    if (indicators.bbUpper) {
      datasets.push({
        label: 'BB Upper', data: indicators.bbUpper, borderColor: COLORS.bbBand,
        borderDash: [4, 4], borderWidth: 1, pointRadius: 0, yAxisID: 'price', order: 3,
        fill: '+1', backgroundColor: 'rgba(139,148,158,0.06)',
      });
    }
    if (indicators.bbLower) {
      datasets.push({
        label: 'BB Lower', data: indicators.bbLower, borderColor: COLORS.bbBand,
        borderDash: [4, 4], borderWidth: 1, pointRadius: 0, yAxisID: 'price', order: 3,
      });
    }

    // Trade markers as a scatter-like dataset using pointStyle triangles
    if (tradeMarkers && tradeMarkers.length > 0) {
      const markerData = new Array(candles.length).fill(null);
      const markerColors = new Array(candles.length).fill(COLORS.green);
      const markerStyles = new Array(candles.length).fill('triangle');
      tradeMarkers.forEach((m) => {
        if (m.index >= 0 && m.index < candles.length) {
          markerData[m.index] = m.price;
          markerColors[m.index] = m.type === 'BUY' ? COLORS.green : COLORS.red;
        }
      });
      datasets.push({
        label: 'Trades',
        data: markerData,
        borderColor: 'transparent',
        backgroundColor: markerColors,
        pointStyle: markerStyles,
        pointRadius: 7,
        pointRotation: tradeMarkers.some((m) => m.type === 'SELL') ? 180 : 0,
        showLine: false,
        yAxisID: 'price',
        order: 0,
      });
    }

    datasets.push({
      label: 'Volume',
      data: volumes,
      backgroundColor: COLORS.volume,
      type: 'bar',
      yAxisID: 'volume',
      order: 4,
    });

    return new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#8b949e', boxWidth: 12, font: { size: 11 } },
            position: 'top',
          },
          tooltip: {
            backgroundColor: '#161b22',
            borderColor: '#30363d',
            borderWidth: 1,
            titleColor: '#e6edf3',
            bodyColor: '#e6edf3',
          },
        },
        scales: {
          x: {
            grid: { color: COLORS.grid },
            ticks: { color: '#8b949e', maxTicksLimit: 8, font: { size: 10 } },
          },
          price: {
            position: 'left',
            grid: { color: COLORS.grid },
            ticks: { color: '#8b949e', font: { size: 10 } },
          },
          volume: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#8b949e', font: { size: 10 } },
            max: Math.max(...volumes) * 4,
          },
        },
      },
    });
  }

  function buildLineChart(canvas, labels, data, label, color) {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label, data, borderColor: color, backgroundColor: `${color}22`,
          borderWidth: 2, pointRadius: 0, tension: 0.25, fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: COLORS.grid }, ticks: { color: '#8b949e', font: { size: 10 }, maxTicksLimit: 8 } },
          y: { grid: { color: COLORS.grid }, ticks: { color: '#8b949e', font: { size: 10 } } },
        },
      },
    });
  }

  function buildBarChart(canvas, labels, data, label, color) {
    return new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: color, borderRadius: 3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8b949e', font: { size: 9 } } },
          y: { grid: { color: COLORS.grid }, ticks: { color: '#8b949e', font: { size: 10 } } },
        },
      },
    });
  }

  function buildPieChart(canvas, labels, data) {
    const palette = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#39c5cf', '#ff9492', '#8b949e'];
    return new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: palette }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8b949e', boxWidth: 10, font: { size: 10 } } },
        },
      },
    });
  }

  return { destroyIfExists, buildPriceChart, buildLineChart, buildBarChart, buildPieChart, COLORS };
})();

window.ChartHelpers = ChartHelpers;
