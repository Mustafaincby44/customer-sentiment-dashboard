
import React from 'react';
import type { SentimentDistribution } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { useLanguage } from '../i18n';

interface SentimentDonutChartProps {
  data: SentimentDistribution;
  title: string;
  icon: React.ReactNode;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
        <p className="label text-popover-foreground" style={{ color: payload[0].payload.fill }}>
            {`${payload[0].name}: ${payload[0].value} ${payload[0].value === 1 ? 'review' : 'reviews'}`}
        </p>
      </div>
    );
  }
  return null;
};

const SentimentDonutChart: React.FC<SentimentDonutChartProps> = ({ data, title, icon }) => {
  const Recharts = (window as any).Recharts;
  const { t } = useLanguage();

  if (!Recharts) {
    return <Card><CardContent><p>{t('loading.chart')}</p></CardContent></Card>;
  }

  const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const chartData = [
    { name: t('dashboard.sentimentDistribution.positive'), value: data.positive },
    { name: t('dashboard.sentimentDistribution.neutral'), value: data.neutral },
    { name: t('dashboard.sentimentDistribution.negative'), value: data.negative },
  ];

  const COLORS = [
    'hsl(var(--chart-positive))', 
    'hsl(var(--chart-neutral))', 
    'hsl(var(--chart-negative))'
  ];
  const total = data.positive + data.negative + data.neutral;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
            {t('dashboard.sentimentDistribution.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }} className="relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }}/>
            </PieChart>
          </ResponsiveContainer>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-4xl font-bold text-foreground">{total}</span>
                <p className="text-sm text-muted-foreground">{t('dashboard.sentimentDistribution.totalReviews')}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDonutChart;