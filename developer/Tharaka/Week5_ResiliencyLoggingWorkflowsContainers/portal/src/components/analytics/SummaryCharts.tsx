'use client';

/**
 * DevExtreme Chart + PieChart. Client components by necessity (they measure the
 * DOM), but the data arrives already fetched from the server component above -
 * so there is no loading spinner and no client-side API round trip.
 */
import {
  Chart, Series, ArgumentAxis, ValueAxis, CommonSeriesSettings, Label,
  Tooltip, Legend, Grid, Export
} from 'devextreme-react/chart';
import PieChart, { Series as PieSeries, Label as PieLabel, Connector, Tooltip as PieTooltip, Legend as PieLegend } from 'devextreme-react/pie-chart';
import type { SeriesPoint } from '@/lib/types';
import { CHART_INK, PRIORITY_RAMP, SERIES_1 } from '@/lib/viz';

/**
 * DevExtreme's own PointInfo types are wide unions (argument can be a string,
 * number or Date). The charts here only ever plot string categories, so a
 * narrow local alias keeps the callbacks readable without fighting the union.
 */
type PointLike = {
  argument?: unknown;
  argumentText?: string;
  value?: unknown;
  percentText?: string;
};

export default function SummaryCharts({
  byPriority,
  byProject
}: {
  byPriority: SeriesPoint[];
  byProject: SeriesPoint[];
}) {
  const priorityPalette = byPriority.map(p => PRIORITY_RAMP[p.label] ?? SERIES_1);

  return (
    <div className="chart-row">
      <section className="card">
        <h2 className="card-title">Tasks by priority</h2>
        <PieChart
          dataSource={byPriority}
          type="doughnut"
          innerRadius={0.62}
          palette={priorityPalette}
          sizeGroup="dash"
          height={260}
          redrawOnResize
        >
          <PieSeries argumentField="label" valueField="value">
            <PieLabel visible customizeText={(e: PointLike) => `${e.argumentText}: ${e.value}`}>
              <Connector visible width={1} />
            </PieLabel>
          </PieSeries>
          <PieLegend
            visible
            horizontalAlignment="center"
            verticalAlignment="bottom"
            itemTextPosition="right"
          />
          <PieTooltip
            enabled
            customizeTooltip={(e: PointLike) => ({
              text: `${e.argument}: ${e.value} tasks (${e.percentText})`
            })}
          />
        </PieChart>
        <TableView caption="Tasks by priority" rows={byPriority} />
      </section>

      <section className="card">
        <h2 className="card-title">Open + completed tasks per project</h2>
        <Chart dataSource={byProject} rotated height={260} redrawOnResize palette={[SERIES_1]}>
          <CommonSeriesSettings
            argumentField="label"
            valueField="value"
            type="bar"
            cornerRadius={4}
            barPadding={0.32}
            ignoreEmptyPoints
          />
          <Series name="Tasks">
            <Label visible backgroundColor="transparent" font={{ color: CHART_INK.secondary, size: 12 }} />
          </Series>
          <ArgumentAxis label={{ font: { color: CHART_INK.secondary, size: 12 } }}>
            <Grid visible={false} />
          </ArgumentAxis>
          <ValueAxis allowDecimals={false} label={{ font: { color: CHART_INK.muted, size: 11 } }}>
            <Grid visible color={CHART_INK.gridline} width={1} />
          </ValueAxis>
          {/* One series only, so no legend - the heading names it. */}
          <Legend visible={false} />
          <Tooltip
            enabled
            customizeTooltip={(e: PointLike) => ({
              text: `${e.argument}: ${e.value} tasks`
            })}
          />
          <Export enabled={false} />
        </Chart>
        <TableView caption="Tasks per project" rows={byProject} />
      </section>
    </div>
  );
}

/** Every chart ships a text equivalent - colour is never the only channel. */
function TableView({ caption, rows }: { caption: string; rows: SeriesPoint[] }) {
  return (
    <details style={{ marginTop: 10 }}>
      <summary className="muted" style={{ cursor: 'pointer', fontSize: 12 }}>
        View as table
      </summary>
      <table style={{ marginTop: 8, borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <caption className="muted" style={{ captionSide: 'bottom', fontSize: 11, paddingTop: 6 }}>
          {caption}
        </caption>
        <thead>
          <tr>
            <th style={th}>Category</th>
            <th style={{ ...th, textAlign: 'right' }}>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <td style={td}>{r.label}</td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '4px 8px',
  borderBottom: `1px solid ${CHART_INK.baseline}`,
  fontWeight: 600,
  color: CHART_INK.secondary
};

const td: React.CSSProperties = {
  padding: '4px 8px',
  borderBottom: `1px solid ${CHART_INK.gridline}`
};
