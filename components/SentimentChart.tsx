import React from 'react';
import type { SentimentDataPoint } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

// Since Recharts is loaded from CDN, we will access it inside the component
// to prevent race conditions on script load.

interface SentimentChartProps {
  data: SentimentDataPoint[];
  title: string;
  icon: React.ReactNode;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 p-3 rounded-lg shadow-lg">
        <p className="label text-gray-300">{`Review #${label}`}</p>
        <p className="intro text-cyan-400">{`Sentiment Score: ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const SentimentChart: React.FC<SentimentChartProps> = ({ data, title, icon }) => {
  const Recharts = (window as any).Recharts;

  // Render a fallback if the library isn't loaded yet.
  if (!Recharts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }} className="flex items-center justify-center text-gray-500">
            <p>Loading Chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="reviewNumber" stroke="#A0AEC0" name="Review #" />
              <YAxis stroke="#A0AEC0" domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#2DD4BF" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;