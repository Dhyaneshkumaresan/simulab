import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface WaveformPlotProps {
  title: string;
  xData: number[];
  yData1: number[];
  yData2?: number[];
  xLabel?: string;
  yLabel?: string;
  trace1Name?: string;
  trace2Name?: string;
  plotType?: 'time' | 'bode' | 'iv_curve' | 'xy';
  height?: number;
  logX?: boolean;
}

export const WaveformPlot: React.FC<WaveformPlotProps> = ({
  title,
  xData,
  yData1,
  yData2,
  xLabel = 'Time (s)',
  yLabel = 'Amplitude (V)',
  trace1Name = 'Input CH1',
  trace2Name = 'Output CH2',
  plotType = 'time',
  height = 320,
  logX = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !xData || xData.length === 0) return;

    const traces: Plotly.Data[] = [
      {
        x: xData,
        y: yData1,
        mode: 'lines',
        name: trace1Name,
        line: { color: '#06b6d4', width: 2.2 },
      },
    ];

    if (yData2 && yData2.length > 0) {
      traces.push({
        x: xData,
        y: yData2,
        mode: 'lines',
        name: trace2Name,
        line: { color: '#f59e0b', width: 2.2, dash: plotType === 'bode' ? 'dash' : 'solid' },
      });
    }

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: title,
        font: { color: '#e2e8f0', size: 14, family: 'Inter, system-ui, sans-serif' },
      },
      paper_bgcolor: 'rgba(15, 23, 42, 0.95)',
      plot_bgcolor: 'rgba(2, 6, 23, 0.9)',
      margin: { l: 55, r: 25, t: 35, b: 40 },
      height: height,
      showlegend: !!yData2,
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0,
        font: { color: '#94a3b8', size: 11 },
      },
      xaxis: {
        title: { text: xLabel, font: { color: '#94a3b8', size: 11 } },
        color: '#64748b',
        gridcolor: '#1e293b',
        zerolinecolor: '#334155',
        type: logX ? 'log' : 'linear',
      },
      yaxis: {
        title: { text: yLabel, font: { color: '#94a3b8', size: 11 } },
        color: '#64748b',
        gridcolor: '#1e293b',
        zerolinecolor: '#334155',
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.newPlot(containerRef.current, traces, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [title, xData, yData1, yData2, xLabel, yLabel, trace1Name, trace2Name, plotType, height, logX]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-inner">
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
};
