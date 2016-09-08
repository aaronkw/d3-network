# d3-network

This is a d3-based gene network visualization. The module is a wrapper for a d3 force-directed layout but customized for visuzalizing weighted gene networks.

## Usage

The wrapper uses the design pattern suggested by Mike Bostock: http://bost.ocks.org/mike/chart/

Add the js file:


```html
<script src="d3.network.js" charset="utf-8"></script>`
```

Create the network:

```js
var network = d3.network()
	.genes(data.genes)
	.edges(data.edges);
d3.select("#chart")
	.append("svg")
	.attr("width",500)
	.attr("height",500)
	.call(network); // associates the network with the svg element
			// drawing is delayed so that a filter can be applied - most
			// likely from a UI element (e.g. slider)
network.showLegend()
	.filter(.5, 10)	// a filter is recommended before drawing fully connected networks
	.draw();
```

Customize the network styling:

```css
line.edge {
    stroke-opacity: .6;
}

circle.gene {
    stroke-width: 2px;
    stroke: #AAA;
    fill: #FFF;
}

circle.gene-query {
    stroke-width: 3px;
}

text.gene-name {
    font-weight: bold;
}
```
## Examples

[Toy example with styling](https://gist.github.com/aaronkw/5ab0840151369a7217f6f8400f5ca91b) (dongbohu)

## API Reference

<a name="network" href="#network">#</a> d3.<b>network</b>()

Constructs a new network instance.

<a name="genes" href="#genes">#</a> <b>genes</b>([genes])

Sets the associated genes to the given array. If <em>genes</em> is not specified, returns the genes associated to the network. Provides the same functionality as d3.force.nodes()

<a name="edges" href="#edges">#</a> <b>edges</b>([edges])

Sets the associated edges to the given array. If <em>edges</em> is not specified, returns the edges associated to the network. Provides the same functionality as d3.force.links()

<a name="filter" href="#filter">#</a> <b>filter</b>(edge_cutoff, node_cutoff)

Filters the network to be visualized. <em>edge_cutoff</em> specifies the minimum edge weight for an edge to be included in the display. <em>node_cutoff</em> specifies the maximum number of genes to be displayed (beyond any query genes). For example, for a network with 2 query genes and <em>node_cutoff</em>=2, the displayed network will contain 4 genes. Nodes are prioritized by their connectivity to the query genes.

<a name="draw" href="#draw">#</a> <b>draw</b>()

Draws the gene network with the gene and edge cutoffs applied by filter().

<a name="width" href="#width">#</a> <b>width</b>(width)

Specifies the width of the network layout. If <em>width</em> is not specified, returns the current width. The default width is the parent svg width. The width and height of this network are applied in [d3.force.size([width,height])](https://github.com/mbostock/d3/wiki/Force-Layout#size).

<a name="height" href="#height">#</a> <b>height</b>(height)

Specifies the height of the network layout. If <em>height</em> is not specified, returns the current height. The default height is the parent svg height. The width and height of this network are applied in [d3.force.size([width,height])](https://github.com/mbostock/d3/wiki/Force-Layout#size).

<a name="bind" href="#bind">#</a> <b>bindNetworks</b>([networks])

Binds this network to the input array of networks. The layouts of bound networks will be coordinated and will follow the positions of the first networks <em>networks[0]</em>.


### Visual 
<a name="genetext" href="#genetext">#</a> <b>geneText</b>(genetext)

If <em>genetext</em> is specified, sets the displayed text of genes to the specified string. If <em>genetext</em> is not specified, returns the current geneText function. If <em>genetext</em> is a function, the function is evaluated to obtain the displayed text (e.g. standard_name) for a gene.

By default, the standard_name attribute of a gene object is displayed.

<a name="showlegend" href="#showlegend">#</a> <b>showLegend</b>(show)

If <em>show</em> is true or not provided, a legend mapping edge colors to weights will be drawn when draw() is called.

<a name="edgecolor" href="#edgecolor">#</a> <b>edgeColor</b>(color)

If <em>color</em> is specified, sets the color of an edge to the specified color. If <em>color</em> is not specified, returns the current color function. If <em>color</em> is a function, the function is evaluated for each edge from its weight.

Typically, a d3 [scale](https://github.com/mbostock/d3/wiki/Quantitative-Scales#linear_domain) function that maps edge weights to colors is used here.

<a name="edgeWidth" href="#edgewidth">#</a> <b>edgeWidth</b>(edgewidth)

If <em>edgewidth</em> is specified, sets the width of edges to the specified value. If <em>edgewidth</em> is not specified, returns the current edgeWidth function. If <em>edgewidth</em> is a function, the function is evaluated for each edge when determining the stroke-width of an edge.

<a name="generadius" href="#generadius">#</a> <b>geneRadius</b>(generadius)

If <em>generadius</em> is specified, sets the radius of genes to the specified value. If <em>generadius</em> is not specified, returns the current generadius function. If <em>generadius</em> is a function, the function is evaluated for each gene when determining the radius of each node.

### Events

<a name="on" href="#on">#</a> <b>on</b>(type, listener)

Registers the specified <em>listener</em> to receive custom events of the specified <em>type</em>. Two events are currently supported: <em>geneadd</em> and <em>edgeadd</em>

The <em>geneadd</em> event is dispached when a gene node that was not visible previously is added to the network display. Listeners are called with an array of added genes.

The <em>edgeadd</em> event is dispatched when an edge that was not visible previously is added to the network display. Listeners are called with an array of added edges.

This function is typically used to register tooltip listeners to genes and edges.

<a name="ongene" href="#ongene">#</a> <b>onGene</b>(type, listener)

Registers the specified <em>listener</em> to receive events of the specified <em>type</em>. Specifying listeners for <em>mouseover</em>, <em>mouseout</em>, <em>mouseclick</em>, <em>mouseout</em> will override the default actions. To add a listener, specify a suffix to the type, for example, `network.onGene("mouseover.custom", mouseovercustom)`

<a name="onedge" href="#onedge">#</a> <b>onEdge</b>(type, listener)

Registers the specified <em>listener</em> to receive events of the specified <em>type</em>. Specifying listeners for <em>mouseover</em> and <em>mouseout</em> will override the default actions.


