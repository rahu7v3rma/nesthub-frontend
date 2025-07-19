'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface BarChartData {
  name: string;
  offerPrice: number;
  closingPrice: number;
}

interface OffersBarChartProps {
  data: BarChartData[];
  showTitle?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const offer = payload.find((p: any) => p.dataKey === 'offerPrice');
    const closing = payload.find((p: any) => p.dataKey === 'closingPrice');
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-[180px]">
        <div className="font-bold text-[#2D2C31] text-sm mb-1">{label}</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A9A6B2]">Offer price:</span>
            <span className="font-semibold text-[#333]">
              ${offer?.value?.toLocaleString() ?? '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A9A6B2]">Closing price:</span>
            <span className="font-semibold text-[#333]">
              ${closing?.value?.toLocaleString() ?? '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ChartSkeleton() {
  const bars = [60, 90, 50, 80, 70];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
            <span className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />
            <span className="animate-pulse bg-gray-200 h-4 w-20 rounded" />
          </div>
        </div>
      </div>
      <div className="flex items-end h-60 w-full px-6 pb-4 bg-gray-100 rounded animate-pulse gap-8">
        {bars.map((height, i) => (
          <div
            key={i}
            className="bg-gray-300 rounded-t flex-1 mx-2"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between px-6 mt-2 gap-8">
        {bars.map((_, i) => (
          <div
            key={i}
            className="h-3 w-full bg-gray-200 rounded animate-pulse flex-1 mx-2"
          />
        ))}
      </div>
    </div>
  );
}

export default function OffersBarChart({
  data,
  showTitle = true,
}: OffersBarChartProps) {
  const widthPerDataPoint = 120;
  const minChartWidth = 800;
  const chartWidth = Math.max(minChartWidth, data.length * widthPerDataPoint);

  const barSize =
    data.length <= 5 ? 20 : Math.max(8, 20 - (data.length - 5) * 2);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Title and Legend remain static at the top */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6 w-full">
          <h2
            className="font-[700] text-[18px] leading-[120%] text-[#2D2C31] font-[Figtree] m-0 p-0"
            style={{ letterSpacing: 0 }}
          >
            Offers vs. Closing prices
          </h2>
          <div className="flex flex-col justify-center gap-2">
            <div className="grid grid-cols-[20px_auto] items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#BDBDBD] justify-self-center" />
              <span
                className="text-xs"
                style={{ color: '#A9A6B2', fontFamily: 'Figtree' }}
              >
                Offer price, $
              </span>
            </div>
            <div className="grid grid-cols-[20px_auto] items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#333333] justify-self-center" />
              <span
                className="text-xs"
                style={{ color: '#A9A6B2', fontFamily: 'Figtree' }}
              >
                Closing price, $
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div style={{ width: chartWidth, minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              barGap={0}
              barCategoryGap={12}
              margin={{ top: showTitle ? 0 : 20, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E5E5E5"
                vertical={false}
                horizontal={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13 }}
                axisLine={{ stroke: '#E5E5E5' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[100000, 'auto']}
                ticks={[100000, 200000, 300000, 400000, 500000, 600000]}
                tickFormatter={(v: any) => `${v / 1000}K`}
                axisLine={{ stroke: '#E5E5E5' }}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar
                dataKey="offerPrice"
                fill="#BDBDBD"
                name="Offer price, $"
                radius={[4, 4, 0, 0]}
                barSize={barSize}
                activeBar={{ style: { outline: 'none', stroke: 'none' } }}
              />
              <Bar
                dataKey="closingPrice"
                fill="#333333"
                name="Closing price, $"
                radius={[4, 4, 0, 0]}
                barSize={barSize}
                activeBar={{ style: { outline: 'none', stroke: 'none' } }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
