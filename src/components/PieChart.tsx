'use client';

import { useState } from 'react';

interface PieChartData {
  option_id: string;
  option_text: string;
  percentage: number;
  vote_count: number;
}

interface PieChartProps {
  data: PieChartData[];
}

// Color palette using TailwindCSS colors
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

interface PathSegment {
  path: string;
  color: string;
  data: PieChartData;
}

function calculatePiePath(
  startAngle: number,
  endAngle: number,
  radius: number,
  centerX: number,
  centerY: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${centerX} ${centerY}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ');
}

export default function PieChart({ data }: PieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Filter out options with 0 votes
  const chartData = data.filter((item) => item.percentage > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-primary-600">
        No votes to display
      </div>
    );
  }

  const size = 300;
  const radius = 120;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate paths for each segment
  let currentAngle = -90; // Start from top
  const segments: PathSegment[] = chartData.map((item, index) => {
    const sweepAngle = (item.percentage / 100) * 360;
    const path = calculatePiePath(
      currentAngle,
      currentAngle + sweepAngle,
      radius,
      centerX,
      centerY
    );
    const segment = {
      path,
      color: COLORS[index % COLORS.length],
      data: item,
    };
    currentAngle += sweepAngle;
    return segment;
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pie Chart SVG */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="max-w-full h-auto"
        >
          {segments.map((segment, index) => (
            <g key={segment.data.option_id}>
              <path
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-all duration-200 ${
                  hoveredSegment === segment.data.option_id
                    ? 'opacity-80 filter drop-shadow-lg'
                    : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredSegment(segment.data.option_id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredSegment && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-primary-300 rounded-lg px-4 py-2 shadow-lg pointer-events-none z-10">
            <p className="font-semibold text-primary-900 text-sm whitespace-nowrap">
              {segments.find((s) => s.data.option_id === hoveredSegment)?.data.option_text}
            </p>
            <p className="text-primary-600 text-xs">
              {segments.find((s) => s.data.option_id === hoveredSegment)?.data.percentage}%
              {' '}
              ({segments.find((s) => s.data.option_id === hoveredSegment)?.data.vote_count} votes)
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {segments.map((segment, index) => (
          <div
            key={segment.data.option_id}
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
              hoveredSegment === segment.data.option_id ? 'bg-primary-50' : ''
            }`}
            onMouseEnter={() => setHoveredSegment(segment.data.option_id)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-900 truncate">
                {segment.data.option_text}
              </p>
              <p className="text-xs text-primary-600">
                {segment.data.percentage}% ({segment.data.vote_count} votes)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
