/* Reusable d3 force-directed layout for gene networks
 * Follows the design pattern suggested by Mike Bostock:
 * http://bost.ocks.org/mike/chart/
 */

(function() {

d3.network = function() {
        
    var options = 
        {start_edge:0,
        start_color:"#006E2E", 
        mid_color:"#FFFF88",
        end_color:"#FF0000"};

    var edges = [],
        genes = [], 
        draw_genes = [],
        draw_edges = [], 
        node_degrees = [],
        height, 
        width,
        selection,
        legend = false;

    // Functions for network attributes 
    var r = function(d) {return d.query ? 20 : Math.max(10,5+d.query_degree*10);};
    var w = function(d) {return Math.max(2,d.weight*6);};
    var edgeColor = d3.scale.linear().domain([options.start_edge,.15,1])
        .range([options.start_color, options.mid_color, options.end_color]);

    function my(_selection) {
        selection = _selection;

        if ( !width ) width = selection.attr("width");
        if ( !height) height = selection.attr("height");

        var i, 
            n = genes.length, m = edges.length, 
            node, edge;

        // Bind nodes to edges
        for (i = 0; i < m; ++i) {
          edge = edges[i];
          if (typeof edge.source == "number") edge.source = genes[edge.source];
          if (typeof edge.target == "number") edge.target = genes[edge.target];
        }

        // Calculate node degrees to query genes and all genes
        for( i = 0; i < n; i++ ) {
            gene= genes[i];
            gene.query_degree = 0;
            gene.query_degreen = 0;
            gene.degree = 0;
            gene.degreen = 0;
        }
        for( i = 0; i < m; i++ ) {
            edge = edges[i];
            if ( edge.source.query ) {
                edge.target.query_degree += edge.weight;
                edge.target.query_degreen ++;
            }
            if ( edge.target.query ) { 
                edge.source.query_degree += edge.weight;
                edge.source.query_degreen ++;
            }
            edge.target.degree += edge.weight;
            edge.source.degree += edge.weight;
            edge.target.degreen ++;
            edge.source.degreen ++;
        }
        for( i = 0; i < n; i++ ) {
            genes[i].query_degree /= genes[i].query_degreen;
            genes[i].degree /= genes[i].degreen;
        }

        // Sort nodes according to background corrected degree
        // Store corresponding ranks
        genes.sort(function(a,b){return b.query_degree/b.degree
                                        -a.query_degree/a.degree;})
        for( i = 0; i < n; i++ ) { genes[i].rank = i; }
    }

    function draw(genes, edges) {
        if ( typeof force != "undefined" ) force.stop();

        force = d3.layout.force()
            .charge(-800)
            .distance(150)
            .gravity(.15)
            .nodes(genes)
            .links(edges)
            .size([width, height]).start();

        var node_data = selection.selectAll("g.node-group")
                .data(genes, function(d) { return d.id; });
        var link_data = selection.selectAll("line.edge")
                .data(edges, function(d) { return d.id; });

        var link_rm = link_data.exit().remove();
        var link = link_data
                .enter().insert("svg:line", "g")
                .attr("class", "edge")
                .on("mouseover", linkMouseover)
                .on("mouseout", linkMouseout)
                .attr("id", function(d) { return d.id; })
                .style("stroke", function(d) {return edgeColor(d.weight);}) 
                .style("stroke-width", w); 

        var node_rm = node_data.exit().remove();
        var node = node_data
                .enter().append("svg:g")
                .attr("class", "gene-group")
                .on("mouseover", nodeMouseover)
                .on("mouseout", nodeMouseout)
                .on("mouseclick", nodeMouseclick)
                .on("mousedown", nodeMousedown)
                .attr("id", function(d) { return d.id; })

        node.append("svg:circle")
            .attr("class", "gene")
            .classed("gene-query", function(d) { return d.query; }) 
            .attr("r", r); 

        node.append("svg:text")
            .style("pointer-events","none")
            .attr("class", "gene-name")
            .text(function(d) {return d.standard_name;})
            .attr("text-anchor", "middle")
            .attr("y", function(d) { return "-"+ (r(d)+5);})

        node_data.call(force.drag);

        force.on("tick", function(event) {

            node_data.attr('cx', function(d) { 
                return d.x = Math.max(r(d),Math.min(width-r(d),d.x)); });
            node_data.attr('cy', function(d) { 
                return d.y = Math.max(r(d),Math.min(height-r(d),d.y)); });

            node_data.attr("transform", function(d,i) { 
                var x = Math.max(r(d),Math.min(width-r(d),d.x));
                var y = Math.max(r(d),Math.min(height-r(d),d.y)); 
                return "translate(" + x + "," + y + ")"; 
            });

            link_data.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });
    }            

    my.draw = function() {
        draw(draw_genes, draw_edges); 
        drawn = !selection.select("svg.legend").empty();
        if ( legend && !drawn ) addLegend();
        else if ( !legend && drawn ) removeLegend();
    };

    my.showLegend = function(x) {
        if (!arguments.length) x = true;
        legend = x;
        return my;
    };

    my.filter = function(edge_cut, node_cut) {
        var gene_filter = function(d) {
            return d.query || d.rank < node_cut; 
        };

        var edge_filter = function(d) {
            return d.weight > edge_cut && gene_filter(d.target)
                    && gene_filter(d.source);
        };
        
        draw_genes = genes.filter(gene_filter);
        draw_edges = edges.filter(edge_filter);

        // Remove hanging nodes: calculate node degrees to the filtered edges
        var n = genes.length, 
            m = draw_edges.length, 
            edge, i;
        for( i = 0; i < n; i++ ) {
            genes[i].draw_degree = 0; 
        }
        for( i = 0; i < m; i++ ) {
            edge = draw_edges[i];
            edge.source.draw_degree += edge.weight; 
            edge.target.draw_degree += edge.weight; 
        }
        draw_genes = draw_genes.filter(function(d) { 
            return d.draw_degree > 0 || d.query; })

        return my;
    };

    my.onGene = function(type, action) {
        selection.selectAll("g.node-group").on(type, action);
        return my;
    };

    my.onEdge = function(type, listener) {
        selection.selectAll("line.edge").on(type, action);
        return my;
    };

    my.edgeColor = function(x) {
        if (!arguments.length) return edgeColor;
        if ( typeof x == "function" ) edgeColor = x;
        else edgeColor = function(d) { return x; };
        return my;
    };

    my.geneRadius = function(x) {
        if (!arguments.length) return r;
        if ( typeof x == "function" ) r = x;
        else r = function(d) { return x; };
        return my;
    };

    my.edgeWidth = function(x) {
        if (!arguments.length) return w;
        if ( typeof x == "function" ) w = x;
        else w = function(d) { return x; };
        return my;
    };

    my.drawGenes = function() {
        return draw_genes;
    };

    my.drawEdges = function() {
        return draw_edges;
    };

    my.height = function(x) {
        if (!arguments.length) return height;
        height = x;
        return my;
    };

    my.width = function(x) {
        if (!arguments.length) return width;
        width = x;
        return my;
    };

    my.genes = function(x) {
        if (!arguments.length) return genes;
        genes = x;
        draw_genes = x;
        return my;
    };

    my.edges = function(x) {
        if (!arguments.length) return edges;
        edges = x;
        draw_edges = x;
        return my;
    };

    function linkMouseover(d) {
        d3.select(this).style("stroke-width",12).style("cursor","pointer");
        var genes = selection.selectAll("circle.node").filter(function(node,i) {
            return node.id == d.source.id || node.id == d.target.id;
        }).style("stroke-dasharray","6, 3");
    }

    function linkMouseout(d) {
        d3.select(this).style("stroke-width", w);
        var genes = selection.selectAll("circle.node").filter(function(node,i) {
            return node.id == d.source.id || node.id == d.target.id;
        }).style("stroke-dasharray",null);
    }

    function nodeMouseover(d) {
        selection.selectAll("line.edge").filter(function(edge,i) {
            return ( edge.source.id == d.id || edge.target.id == d.id );
        }).style("stroke-dasharray","6, 3"); 
    }

    function nodeMouseout(d) {
        selection.selectAll("line.edge").filter(function(edge,i) {
            return ( edge.source.id == d.id || edge.target.id == d.id );
        }).style("stroke-dasharray",null); 
    }

    function nodeMouseclick(d) {
        d.fixed = true;
    }

    function nodeMousedown(d) {
        d.fixed = true;
    }

    function addLegend(scale) {
        if ( ! scale ) scale = .8;

        var svg = selection.append("svg:svg")
            .attr("class","legend")
            .attr("width", width*scale)
            .attr("height", 35)
            .attr("x", width*(1-scale)*.5)
            .attr("y", height-40);

        legend = svg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "legend")
            .attr("x1","0%")
            .attr("y1","0%")
            .attr("x2","100%")
            .attr("y2","0%")
            .attr("spreadMethod", "pad");

        for ( var i=0; i<1; i+=.05 ) {
            legend.append("svg:stop")
                .attr("offset", parseInt(i*100)+"%")
                .style("stop-color", 
                        edgeColor(options.start_edge + (1-options.start_edge)*i))
                .style("stop-opacity", .9);
        }

        svg.append("svg:rect")
            .attr("width", width*scale-2)
            .attr("height", 20)
            .attr("y",12)
            .attr("x", 1)
            .attr("fill", "url(#legend)")
            .style("stroke","#AAA")
            .style("stroke-width",1);
            
        var text = svg.append("svg:text")
            .attr("y", 9)
            .text(options.start_edge.toFixed(1));

        svg.append("svg:text")
            .attr("y", 9)
            .attr("x", width*scale - text.node().getBBox().width)
            .text("1.0");

        svg.append("svg:text")
            .attr("y", 9)
            .attr("x", width*scale*.5 - text.node().getBBox().width/2)
            .text("0.5");
    }

    function removeLegend() {
        d3.select("svg.legend").remove();
    }

    return my;
} // network

})();
