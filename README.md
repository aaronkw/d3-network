# d3-network

This is a d3-based gene network visualization. The module is a wrapper for a d3 force-directed layout but customized for visuzalizing weighted gene networks.

## Usage

The module uses the design pattern suggested by Mike Bostock: http://bost.ocks.org/mike/chart/

Add the js file:

<script src="d3.network.js" charset="utf-8"></script>

```js
var network = d3.network()
		.nodes(data.genes)
		.edges(data.edges);
d3.select("#chart").append("svg").attr("width",500).attr("height",500).call(network);
network.filter(.5, 10).draw();
```

## API Reference

<a name="network" href="#network">#</a> d3.<b>network</b>()
Constructs a new network instance.

<a name="nodes" href="#nodes">#</a> <b>nodes</b>([nodes])
Sets the associated nodes (genes) to the given array. Provides the same functionality as d3.force.nodes()

<a name="edges" href="#edges">#</a> <b>edges</b>([edges])
Sets the associated edges to the given array. Provides the same functionality as d3.force.links()

<a name="filter" href="#filter">#</a> <b>filter</b>(edge_cutoff, node_cutoff)
Filters the network to be visualized. <em>edge_cutoff</em> specifies the minimum edge weight for an edge to be included in the display. <em>node_cutoff</em> specifies the maximum numver of genes to be displayed (beyond any query genes). Nodes are prioritized by their connectivity to the query genes.
