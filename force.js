'use strict'

let force = ((data, color = 'rci', selector = '#force') => {

    ////////////////////////////////////
    ///////////// options //////////////
    ////////////////////////////////////

    const use_size = false

    ////////////////////////////////////
    //////////// svg setup /////////////
    ////////////////////////////////////

    var body = d3.select(selector)
    body.html("")

    // margins for SVG
    const margin = {
        left: 100,
        right: 100,
        top: 100,
        bottom: 100
    }

    // responsive width & height
    const svgWidth = parseInt(d3.select(selector).style('width'), 10)
    const svgHeight = svgWidth

    // helper calculated variables for inner width & height
    const height = svgHeight - margin.top - margin.bottom
    const width = svgWidth - margin.left - margin.right


    // add SVG
    d3.select(`${selector} svg`).remove();

    const svg = d3.select(selector)
        .append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ////////////////////////////////////
    //////////////globals///////////////
    ////////////////////////////////////

    const radius = 10
    const metric_strength = 0.2
    const cluster_strength = 0.2
    const collide_alpha = 0.5; // fixed for greater rigidity!
    const padding = radius * 0.2 // separation between same-color circles
    const clusterPadding = radius * 0.5 // separation between different-color circles


    const metrics = ['rci', 'personal', 'social', 'cultural']

    const layouts = [
        [{ x: 0.5, y: 0.5 }],
        [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }],
        [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.5, y: 0.8 }],
        [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.2, y: 0.8 }, { x: 0.8, y: 0.8 }],
        [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.2, y: 0.8 }, { x: 0.8, y: 0.8 }, { x: 0.5, y: 0.5 }]
    ]

    const colors = {
        rci: ['white', 'blue'],
        personal: ['white', 'red'],
        social: ['white', 'yellow'],
        cultural: ['white', 'green']
    }

    const options = ['provider', 'location', 'gender', 'race']

    let cluster = 'participant'
    let select = 'provider'
    let rci = 'true'

    ////////////////////////////////////
    //////////////scales////////////////
    ////////////////////////////////////

    const xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, 1])

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0])

    const sizeScale = d3.scaleLinear()
        .domain([0, 60])
        .range([0, 5])

    const colorScales = {}

    Object.keys(colors).forEach(d => {
        colorScales[d] = d3.scaleLinear()
            .domain([0, 100])
            .range(colors[d])
    })

    ////////////////////////////////////
    //////////////wrangle///////////////
    ////////////////////////////////////

    data.forEach(d => {
        d.coords = {}
    });

    let label_coords = []

    for (let option of options) {

        const values = Array.from(new Set(data.map(d => d[option])))

        values.forEach(d => {
            label_coords.push([option, d, layouts[values.length - 1][values.indexOf(d)]])
        })

        data.forEach(d => {
            d.coords[option] = layouts[values.length - 1][values.indexOf(d[option])]
        });

    }

    const wrangled = metrics.map(d => {
        return data.map(x => { return { ...x, metric: d, radius: d == 'rci' ? use_size ? sizeScale(x[cluster]) * radius : radius : 1e-6, x: xScale(0.5), y: yScale(0.5) } })
    }).flat()

    console.log(wrangled)

    ////////////////////////////////////
    //////////// add to DOM ////////////
    ////////////////////////////////////   

    let balls = svg.selectAll('.balls')
        .data(wrangled)
        .join('circle')
        .attr('fill', d => colorScales[d.metric](d[color]))
        .attr('stroke', 'black')
        .attr('stroke-opacity', 0.2)
        .attr('cy', d => yScale(d.coords[select]))
        .attr('cx', d => xScale(d.coords[select]))
        .attr('class', 'balls')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    balls.transition()
        .duration(500)
        .delay(function (d, i) { return i * 2; })
        .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.radius);
            return function (t) { return d.radius = i(t); };
        });

    let labels = svg.selectAll('.labels')
        .data(label_coords)
        .join('text')
        .text(d => d[1])
        .attr('text-anchor', "middle")
        .attr('y', d => yScale(d[2].y) - 100)
        .attr('x', d => xScale(d[2].x))
        .attr('opacity', d => d[0] == select ? 1 : 0)
        .attr('pointer-events', 'none')
        .attr('class', 'labels')

    ////////////////////////////////////
    //////// simulation setup //////////
    ////////////////////////////////////   

    var simulation;

    function restartSimulation() {

        simulation = d3.forceSimulation(wrangled)
            .force('y', d3.forceY(d => yScale(d.coords[select].y)).strength(metric_strength))
            .force('x', d3.forceX(d => xScale(d.coords[select].x)).strength(metric_strength))
            .force("collide", forceCollide())
            .force("cluster", forceCluster())
            .alpha(0.5)
            .alphaMin(0.01)
            .velocityDecay(0.2)
            .on('tick', tick)

    }

    function tick() {
        balls
            .attr("cx", function (d) { return d.x })
            .attr("cy", function (d) { return d.y });
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alpha(0.6).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0.01);
        d.fx = null;
        d.fy = null;
    }

    function forceCluster() {
        let nodes;

        function force(alpha) {
            const centroids = d3.rollup(nodes, centroid, d => d[cluster]);
            let l = alpha * cluster_strength;
            if (l === Number.NEGATIVE_INFINITY) l = 0
            for (const d of nodes) {
                const { x: cx, y: cy } = centroids.get(d[cluster]);
                d.vx -= (d.x - cx) * l;
                d.vy -= (d.y - cy) * l;
            }
        }

        force.initialize = _ => nodes = _;

        return force;
    }

    function centroid(nodes) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const d of nodes) {
            let k = d.radius ** 2;
            x += d.x * k;
            y += d.y * k;
            z += k;
        }
        return { x: x / z, y: y / z };
    }


    function forceCollide() {
        let nodes;
        let maxRadius;

        function force() {
            const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
            for (const d of nodes) {
                const r = d.radius + maxRadius;
                const nx1 = d.x - r, ny1 = d.y - r;
                const nx2 = d.x + r, ny2 = d.y + r;
                quadtree.visit((q, x1, y1, x2, y2) => {
                    if (!q.length) do {
                        if (q.data !== d) {
                            const r = d.radius + q.data.radius + (d[cluster] === q.data[cluster] ? padding : clusterPadding);
                            let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
                            if (l < r) {
                                l = (l - r) / l * collide_alpha;
                                if (l === Number.NEGATIVE_INFINITY) l = 0
                                d.x -= x *= l, d.y -= y *= l;
                                q.data.x += x, q.data.y += y;
                            }
                        }
                    } while (q = q.next);
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            }
        }

        force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.radius) + Math.max(padding, clusterPadding);

        return force;
    }

    // initate Simulation
    restartSimulation()


    ////////////////////////////////////
    ///////// update methods ///////////
    ////////////////////////////////////   

    function handle_change(metric, rci_select) {

        select = metric;

        if (rci_select != rci) {
            if (rci_select == "true") {
                cluster = 'participant'
                update()
                setTimeout(() => {
                    rci = rci_select
                    update()
                }, 1500)
            } else {
                cluster = 'participant'
                rci = rci_select
                update()
                setTimeout(() => {
                    cluster = 'metric'
                    update()
                }, 1500)
            }
        } else {
            update()
        }

    }

    function update() {

        const transition_time = 750

        var rci_radius = rci == "true" ? radius : 1e-6
        var other_radius = rci != "true" ? radius / 2 : 1e-6

        wrangled.forEach(d => d.radius = d.metric == 'rci' ? use_size ? sizeScale(d[cluster]) * rci_radius : rci_radius : use_size ? sizeScale(d[cluster]) * other_radius : other_radius)

        labels
            .join()
            .text(d => d[1])
            .attr('y', d => yScale(d[2].y) - 20)
            .attr('x', d => xScale(d[2].x))
            .attr('opacity', d => d[0] == select ? 1 : 0)

        balls
            .filter(d => d.radius == 1e-6)
            .transition()
            .duration(transition_time / 2)
            .attr("r", d => d.radius);

        balls
            .filter(d => d.radius != 1e-6)
            .transition()
            .duration(transition_time)
            .attr("r", d => d.radius);

        restartSimulation()

    }

    return {
        update: handle_change,
    }

})