import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import * as d3 from 'd3';

export default function D3DonutChart({ data, width = 500, height = 500 }) {
  const svgRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range([
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
      ]);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);

    const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '10px 15px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Create donut slices
    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    // Add paths with animation
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.name))
      .attr('stroke', isDark ? '#1F2937' : 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0.9)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover)
          .style('opacity', 1);

        const percentage = ((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1);
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.data.name}</strong><br/>
            $${d.data.value.toFixed(2)}<br/>
            ${percentage}% of total
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');

        setSelectedCategory(d.data.name);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .style('opacity', 0.9);

        tooltip.style('opacity', 0);
        setSelectedCategory(null);
      })
      .transition()
      .duration(800)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add center text
    const centerGroup = svg.append('g');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '16px')
      .style('fill', isDark ? '#9CA3AF' : '#6B7280')
      .text('Total Spending');

    const total = d3.sum(data, d => d.value);
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '32px')
      .style('font-weight', 'bold')
      .style('fill', isDark ? '#F3F4F6' : '#1F2937')
      .text(`$${total.toFixed(2)}`);

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, isDark]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef}></svg>
      {selectedCategory && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Hovering: <span className="font-semibold">{selectedCategory}</span>
        </p>
      )}
    </div>
  );
}