import { Component, ElementRef, ViewChild, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { GraphStore } from './graph.store';
import { GraphNode, ENTITY_DISPLAY_NAMES, ENTITY_ROUTES } from './graph.interface';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [NgStyle, FormsModule],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit {
  private router = inject(Router);
  store = inject(GraphStore);

  @ViewChild('graphContainer') graphContainer?: ElementRef<HTMLDivElement>;

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation?: d3.Simulation<GraphNode, { source: string | GraphNode; target: string | GraphNode; type: string }>;
  private width = 900;
  private height = 600;

  entityDisplayNames = ENTITY_DISPLAY_NAMES;

  get searchQuery(): string {
    return this.store.searchQuery();
  }

  set searchQuery(value: string) {
    this.store.setSearchQuery(value);
  }

  constructor() {
    effect(() => {
      const data = this.store.graphData();
      if (data) {
        requestAnimationFrame(() => this.renderGraph(data));
      }
    });
  }

  ngOnInit(): void {
    this.store.loadMetadata();
  }

  onGenerate(): void {
    const selected = this.store.entities().filter((e) => e.selected).map((e) => e.key);
    if (selected.length === 0) {
      this.store.setError('Por favor selecciona al menos una entidad para visualizar');
      return;
    }
    this.store.loadGraph({ entities: selected, query: this.store.searchQuery() || null });
  }

  private renderGraph(data: { nodes: GraphNode[]; links: { source: string | GraphNode; target: string | GraphNode; type: string }[] }): void {
    const el = this.graphContainer?.nativeElement;
    if (!data.nodes?.length || !el) return;

    const container = d3.select(el);
    container.selectAll('*').remove();

    this.width = el.clientWidth || 900;
    this.height = el.clientHeight || 600;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        this.g?.attr('transform', event.transform);
      });

    this.svg = container
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .call(zoom);

    this.g = this.svg.append('g');

    const linkGroup = this.g.append('g');
    const nodeGroup = this.g.append('g');
    const labelGroup = this.g.append('g');

    const links = linkGroup
      .selectAll<SVGLineElement, { source: string | GraphNode; target: string | GraphNode; type: string }>('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    const nodes = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => d.color || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) this.simulation?.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) this.simulation?.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('mouseover', (event: MouseEvent, d: GraphNode) => {
        d3.select(event.currentTarget as SVGCircleElement)
          .transition().duration(200)
          .attr('r', 15).attr('stroke-width', 3);
        this.showTooltip(event, d);
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGCircleElement)
          .transition().duration(200)
          .attr('r', 10).attr('stroke-width', 2);
        this.hideTooltip();
      })
      .on('click', (_event: MouseEvent, d: GraphNode) => {
        const route = ENTITY_ROUTES[d.entityType];
        if (route) this.router.navigate([route, d.entityId]);
      });

    const labels = labelGroup
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text((d) => d.label)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4)
      .attr('pointer-events', 'none');

    this.simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink<GraphNode, { source: string | GraphNode; target: string | GraphNode; type: string }>(data.links)
        .id((d) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(30))
      .on('tick', () => {
        links
          .attr('x1', (d: any) => (typeof d.source === 'object' ? d.source.x : 0))
          .attr('y1', (d: any) => (typeof d.source === 'object' ? d.source.y : 0))
          .attr('x2', (d: any) => (typeof d.target === 'object' ? d.target.x : 0))
          .attr('y2', (d: any) => (typeof d.target === 'object' ? d.target.y : 0));

        nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
        labels.attr('x', (d: any) => d.x!).attr('y', (d: any) => d.y!);
      });
  }

  private showTooltip(event: MouseEvent, d: GraphNode): void {
    const tooltip = d3.select('#graph-tooltip');
    tooltip
      .style('display', 'block')
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 10 + 'px')
      .html(`<strong>${d.label}</strong><br/>Tipo: ${ENTITY_DISPLAY_NAMES[d.entityType] || d.entityType}<br/>ID: ${d.entityId}`);
  }

  private hideTooltip(): void {
    d3.select('#graph-tooltip').style('display', 'none');
  }
}
