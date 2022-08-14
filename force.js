'use strict'

let force = ((data, selector = '#force') => {

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false

    ////////////////////////////////////
    ///////////// options //////////////
    ////////////////////////////////////

    const use_size = true

    ////////////////////////////////////
    //////////// svg setup /////////////
    ////////////////////////////////////

    var body = d3.select(selector)
    body.html("")

    // margins for SVG
    const margin = isMobile ? {
        left: 100,
        right: 100,
        top: 100,
        bottom: 200
    } : {
        left: 50,
        right: 50,
        top: 50,
        bottom: 100
    }


    // responsive width & height
    const svgWidth = parseInt(d3.select(selector).style('width'), 10)
    const svgHeight = parseInt(d3.select(selector).style('height'), 10)

    // helper calculated variables for inner width & height
    const height = svgHeight - margin.top - margin.bottom
    const width = svgWidth - margin.left - margin.right


    // add SVG
    d3.select(`${selector} svg`).remove();

    const svg = d3.select(selector)
        .append('svg')
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ////////////////////////////////////
    //////////////globals///////////////
    ////////////////////////////////////

    var simulation;

    const transition_time = 750

    const labels_offset = -100
    const radius = isMobile ? 10 : 15
    const metric_strength = 0.3
    const cluster_strength = 1

    const simulation_alpha = 0.5
    const simulation_velocity_decay = 0.5
    const simulation_alpha_min = 0.1

    const collide_alpha = 0.2; // fixed for greater rigidity!

    const padding = radius * 0.1 // separation between same-color circles
    const clusterPadding = radius * 0.3 // separation between different-color circles


    const metrics = ['TOTAL_RCI_SCORE', 'PERSONAL_SCORE', 'SOCIAL_SCORE', 'CULTURAL_SCORE']

    const desktop_layouts = [
        [{ x: 0.5, y: 0.5 }],
        [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.5, y: 0.9 }],
        [{ x: 0.2, y: 0.1 }, { x: 0.8, y: 0.1 }, { x: 0.2, y: 0.9 }, { x: 0.8, y: 0.9 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: 0.5, y: 0.5 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }]
    ]

    const mobile_layouts = [
        [{ x: 0.5, y: 0.5 }],
        [{ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.5 }, { x: 0.1, y: 0.9 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.9 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: 0.5, y: 0.5 }],
        [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }]
    ]

    const layouts = isMobile ? mobile_layouts : desktop_layouts

    const colors = {
        TOTAL_RCI_SCORE: ['white', '#1F547A'],
        PERSONAL_SCORE: ['white', '#1268B3'],
        SOCIAL_SCORE: ['white', '#63C2A1'],
        CULTURAL_SCORE: ['white', '#C69530']
    }

    const options = ['PROVIDER', 'GENDER', 'RACE', 'LOCATION']

    let cluster = 'GENERIC_PARTICIPANT_ID'
    let select = 'PROVIDER'
    let rci = 'true'
    let selected_timeframe = 0

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
        .domain([0, 100])
        .range([0, 1])

    const labelOffsetScale = d3.scaleSymlog()
        .domain([1, 30])
        .range([10, 50])

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

    let filtered = {}

    data.forEach(d => {
        if (!filtered.hasOwnProperty(d.GENERIC_PARTICIPANT_ID)) {
            filtered[d.GENERIC_PARTICIPANT_ID] = {
                GENERIC_PARTICIPANT_ID: d.GENERIC_PARTICIPANT_ID,
                PROVIDER: d.PROVIDER,
                LOCATION: d.LOCATION,
                GENDER: d.GENDER,
                RACE: d.RACE,
                coords: {}
            }
        }

        if (d.DAYS_FROM_FIRST_ASSESSMENT <= selected_timeframe && (!filtered[d.GENERIC_PARTICIPANT_ID].hasOwnProperty(d.DAYS_FROM_FIRST_ASSESSMENT) || filtered[d.GENERIC_PARTICIPANT_ID].DAYS_FROM_FIRST_ASSESSMENT < d.DAYS_FROM_FIRST_ASSESSMENT)) {
            filtered[d.GENERIC_PARTICIPANT_ID].DAYS_FROM_FIRST_ASSESSMENT = d.DAYS_FROM_FIRST_ASSESSMENT
            filtered[d.GENERIC_PARTICIPANT_ID].ASSESSMENT_CREATED_AT = d.ASSESSMENT_CREATED_AT
            filtered[d.GENERIC_PARTICIPANT_ID].TOTAL_RCI_SCORE = d.TOTAL_RCI_SCORE
            filtered[d.GENERIC_PARTICIPANT_ID].PERSONAL_SCORE = d.PERSONAL_SCORE
            filtered[d.GENERIC_PARTICIPANT_ID].CULTURAL_SCORE = d.CULTURAL_SCORE
            filtered[d.GENERIC_PARTICIPANT_ID].SOCIAL_SCORE = d.SOCIAL_SCORE
        }
    })


    filtered = Object.values(filtered)

    let label_coords = []

    for (let option of options) {

        const values = Array.from(new Set(data.map(d => d[option])))

        values.forEach(d => {
            label_coords.push([option, d, layouts[values.length - 1][values.indexOf(d)]])
        })

        filtered.forEach(d => {
            d.coords[option] = layouts[values.length - 1][values.indexOf(d[option])]
        });

    }


    let wrangled = metrics.map(d => {
        return filtered.map(x => {
            return { ...x, metric: d, radius: d == 'TOTAL_RCI_SCORE' ? use_size ? sizeScale(x[d]) * radius : radius : 1e-6 }
        })
    }).flat()

    console.log(label_coords)
    console.log(wrangled)

    ////////////////////////////////////
    //////////// add to DOM ////////////
    ////////////////////////////////////   

    let bubble_groups = svg.selectAll('.bubble_groups')
        .data(wrangled)
        .join('g')
        .attr("transform", d => `translate(${xScale(d.coords[select].x)},${yScale(d.coords[select].y)})`)

    let bubbles = bubble_groups
        .append('circle')
        .attr('fill', d => colorScales[d.metric](d[d.metric]))
        .attr('class', 'bubbles')
        .on('mouseover', function (d, i) {

            wrangled.forEach(x => {
                if (x == wrangled[bubbles.nodes().indexOf(this)]) {
                    x.OLD = { radius: x.radius }
                    x.radius = 20
                }
            })

            d3.select(this)
                .transition()
                .duration(transition_time / 2)
                .attr('stroke', d => colorScales[d.metric](d[d.metric]))
                .attr('fill', 'white')
                .attr('r', d => d.radius)

            d3.select(this.parentNode).raise()

            d3.select(this.parentNode)
                .append('text')
                .attr('opacity', 0)
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none')
                .attr('alignment-baseline', 'middle')
                .text(d => d[d.metric].toFixed(0))

            d3.select(this.parentNode)
                .selectAll('text')
                .transition()
                .duration(transition_time / 2)
                .attr('opacity', 1)

            simulation.alpha(0.01).restart()

        })
        .on('mouseout', function (d, i) {

            wrangled.forEach(x => {
                if (x == wrangled[bubbles.nodes().indexOf(this)]) {
                    x.radius = x.OLD.radius
                }
            })

            d3.select(this).transition()
                .duration(transition_time / 2)
                .attr('fill', d => colorScales[d.metric](d[d.metric]))
                .attr('stroke', 'none')
                .attr('r', d => d.radius)

            d3.select(this.parentNode)
                .selectAll('text')
                .remove()

            simulation.restart()

        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    setTimeout(() => {
        bubbles.transition()
            .duration(transition_time)
            .delay(function (d, i) { return i * 10; })
            .attrTween("r", function (d) {
                var i = d3.interpolate(0, d.radius);
                return function (t) { return d.radius = i(t); };
            });
    }, 500)

    let labels = svg.selectAll('.labels')
        .data(label_coords)
        .join('text')
        .text(d => d[1])
        .attr('text-anchor', "middle")
        .attr('y', d => yScale(d[2].y) - labelOffsetScale(wrangled.filter(x => x[d[0]] == d[1]).length))
        .attr('x', d => xScale(d[2].x))
        .attr('opacity', d => d[0] == select ? 1 : 0)
        .attr('pointer-events', 'none')
        .attr('class', 'labels')
        .call(getTextBox);

    let label_backgrounds = svg.selectAll('.label_backgrounds')
        .data(label_coords)
        .join("rect")
        .attr("x", function (d) { return d.bbox.x - 5 })
        .attr("y", function (d) { return d.bbox.y })
        .attr("width", function (d) { return d.bbox.width + 10 })
        .attr("height", function (d) { return d.bbox.height })
        .attr("rx", 4)
        .attr('opacity', d => d[0] == select ? 0.8 : 0)
        .attr("class", "label_backgrounds")
        .style("fill", "white");

    labels.call(raise)

    function raise(selection) {
        selection.each(function (d) { d3.select(this).raise(); })
    }

    function getTextBox(selection) {
        selection.each(function (d) { d.bbox = this.getBBox(); })
    }

    /////////////////////////////////////
    ////////////// Legend ///////////////
    /////////////////////////////////////

    const legend_width = isMobile ? width / 3 : width / 6
    const legend_height = 20

    const legend_options = {
        TOTAL_RCI_SCORE: [{ key: 'TOTAL_RCI_SCORE', text: 'Total RCI', transform_x: (width * 0.5) - (legend_width / 2) }],
        INDICATORS: [
            { key: 'PERSONAL_SCORE', text: 'Personal Capital', transform_x: (width * (isMobile ? 0.1 : 0.2)) - (legend_width / 2) },
            { key: 'SOCIAL_SCORE', text: 'Social Capital', transform_x: (width * 0.5) - (legend_width / 2) },
            { key: 'CULTURAL_SCORE', text: 'Cultural Capital', transform_x: (width * (isMobile ? 0.9 : 0.8)) - (legend_width / 2) }
        ]
    }

    const legendScale = d3.scaleLinear()
        .domain([0, legend_width])
        .range([0, 100])

    const legend_container_group = svg.append("g")

    function create_legend() {

        legend_container_group.selectAll('*').remove()

        for (let index in legend_options[rci == 'true' ? 'TOTAL_RCI_SCORE' : 'INDICATORS']) {

            let legend = legend_options[rci == 'true' ? 'TOTAL_RCI_SCORE' : 'INDICATORS'][index]

            const legend_group = legend_container_group.append("g")
                .attr("transform", `translate(${legend.transform_x},${height + margin.bottom - (legend_height * 2)})`)
                .attr("id", "legend")

            const legend_data = new Array(Math.floor(legend_width)).fill(1)

            legend_group.selectAll('.colorlegend' + legend.key)
                .data(legend_data)
                .join('line')
                .attr('y1', -legend_height) // legend height
                .attr('y2', 0)
                .attr('x1', (d, i) => i)
                .attr('x2', (d, i) => i)
                .attr("stroke", (d, i) => colorScales[legend.key](legendScale(i)))
                .attr("class", "colorlegend" + legend.key)

            legend_group.selectAll('.legend_text' + legend.key)
                .data([legend.text])
                .join('text')
                .attr('y', legend_height)
                .attr('x', (legend_width / 2))
                .attr('text-anchor', "middle")
                .text(d => d)
                .attr("class", "legend_text" + legend.key)

            legend_group.selectAll('.domain_0' + legend.key)
                .data(['0'])
                .join('text')
                .attr('y', -legend_height - 5)
                .attr('x', 0)
                .attr('text-anchor', "start")
                .text(d => d)
                .attr("class", "domain_0" + legend.key)

            legend_group.selectAll('.domain_1' + legend.key)
                .data(['100'])
                .join('text')
                .attr('y', -legend_height - 5)
                .attr('x', legend_width)
                .attr('text-anchor', "end")
                .text(d => d)
                .attr("class", "domain_1" + legend.key)

        }
    }

    create_legend()


    ////////////////////////////////////
    //////// simulation setup //////////
    ////////////////////////////////////   

    function restartSimulation() {

        simulation = d3.forceSimulation(wrangled)
            .force('y', d3.forceY(d => yScale(d.coords[select].y)).strength(metric_strength))
            .force('x', d3.forceX(d => xScale(d.coords[select].x)).strength(metric_strength))
            .force("charge", d3.forceManyBody().strength(rci == 'true' ? 0 : -20))
            .force("collide", forceCollide())
            .force("cluster", forceCluster())
            .alpha(simulation_alpha)
            .on('tick', tick)

    }

    function tick() {
        bubble_groups
            .attr("transform", function (d) { return `translate(${d.x},${d.y})` })
    }

    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(simulation_alpha).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    function forceCluster() {
        let nodes;

        function force(alpha) {
            const centroids = d3.rollup(nodes, centroid, d => `${d[cluster]}-${d[select]}`);

            let l = alpha * cluster_strength;
            for (const d of nodes) {
                const { x: cx, y: cy } = centroids.get(`${d[cluster]}-${d[select]}`);
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

                const nx1 = d.x - r
                const ny1 = d.y - r
                const nx2 = d.x + r
                const ny2 = d.y + r;

                quadtree.visit((q, x1, y1, x2, y2) => {
                    if (!q.length) do {
                        if (q.data !== d) {
                            const r = d.radius > 1e-6 ? d.radius + q.data.radius + (d[cluster] === q.data[cluster] ? padding : clusterPadding) : 1e-6;
                            let x = d.x - q.data.x
                            let y = d.y - q.data.y
                            let l = Math.hypot(x, y)

                            if (l < r) {
                                l = (l - r) / l * collide_alpha;
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

    function handle_change(metric, rci_select, timeframe_select) {

        select = metric;

        if (selected_timeframe != timeframe_select) {

            selected_timeframe = timeframe_select

            let filter_map = {}

            // create a map of the values for each participant that is most recent to the selected timeframe and update the wrangled data
            data.forEach(d => {
                if (!filter_map.hasOwnProperty(d.GENERIC_PARTICIPANT_ID) || (d.DAYS_FROM_FIRST_ASSESSMENT <= selected_timeframe && (!filter_map[d.GENERIC_PARTICIPANT_ID].hasOwnProperty(d.DAYS_FROM_FIRST_ASSESSMENT) || filter_map[d.GENERIC_PARTICIPANT_ID].DAYS_FROM_FIRST_ASSESSMENT < d.DAYS_FROM_FIRST_ASSESSMENT))) {
                    filter_map[d.GENERIC_PARTICIPANT_ID] = {
                        DAYS_FROM_FIRST_ASSESSMENT: d.DAYS_FROM_FIRST_ASSESSMENT,
                        ASSESSMENT_CREATED_AT: d.ASSESSMENT_CREATED_AT,
                        TOTAL_RCI_SCORE: d.TOTAL_RCI_SCORE,
                        PERSONAL_SCORE: d.PERSONAL_SCORE,
                        CULTURAL_SCORE: d.CULTURAL_SCORE,
                        SOCIAL_SCORE: d.SOCIAL_SCORE
                    }
                }
            })

            wrangled.forEach(d => {
                d.OLD = {
                    DAYS_FROM_FIRST_ASSESSMENT: d.DAYS_FROM_FIRST_ASSESSMENT,
                    TOTAL_RCI_SCORE: d.TOTAL_RCI_SCORE,
                    PERSONAL_SCORE: d.PERSONAL_SCORE,
                    CULTURAL_SCORE: d.CULTURAL_SCORE,
                    SOCIAL_SCORE: d.SOCIAL_SCORE
                }
                d.DAYS_FROM_FIRST_ASSESSMENT = filter_map[d.GENERIC_PARTICIPANT_ID].DAYS_FROM_FIRST_ASSESSMENT
                d.ASSESSMENT_CREATED_AT = filter_map[d.GENERIC_PARTICIPANT_ID].ASSESSMENT_CREATED_AT
                d.TOTAL_RCI_SCORE = filter_map[d.GENERIC_PARTICIPANT_ID].TOTAL_RCI_SCORE
                d.PERSONAL_SCORE = filter_map[d.GENERIC_PARTICIPANT_ID].PERSONAL_SCORE
                d.CULTURAL_SCORE = filter_map[d.GENERIC_PARTICIPANT_ID].CULTURAL_SCORE
                d.SOCIAL_SCORE = filter_map[d.GENERIC_PARTICIPANT_ID].SOCIAL_SCORE
            })

            valueUpdate()

        } else if (rci_select != rci) {


            if (rci_select == "true") {
                cluster = 'GENERIC_PARTICIPANT_ID'
                // rci = rci_select
                update()
                create_legend()
                setTimeout(() => {
                    rci = rci_select
                    update()
                    create_legend()
                }, 1200)
            } else {
                cluster = 'GENERIC_PARTICIPANT_ID'
                rci = rci_select
                update()
                create_legend()
                setTimeout(() => {
                    cluster = 'metric'
                    update()
                }, 1200)
            }

        } else {
            update()
        }

    }

    function valueUpdate() {

        var rci_radius = rci == "true" ? radius : 1e-6
        var other_radius = rci != "true" ? radius / 2 : 1e-6

        wrangled.forEach(d => d.radius = d.metric == 'TOTAL_RCI_SCORE' ? use_size ? sizeScale(d[d.metric]) * rci_radius : rci_radius : use_size ? sizeScale(d[d.metric]) * other_radius : other_radius)

        bubbles
            .filter(d => d.OLD[d.metric] != d[d.metric])
            .attr('fill', d => colorScales[d.metric](100))
            .transition()
            .duration(transition_time)
            .delay(function (d, i) { return i * 10; })
            .attr("r", d => d.radius)
            .attr('fill', d => colorScales[d.metric](d[d.metric]))


        simulation.alpha(0.01).restart();

    }

    function update() {

        const transition_time = 750

        var rci_radius = rci == "true" ? radius : 1e-6
        var other_radius = rci != "true" ? radius / 2 : 1e-6

        wrangled.forEach(d => d.radius = d.metric == 'TOTAL_RCI_SCORE' ? use_size ? sizeScale(d[d.metric]) * rci_radius : rci_radius : use_size ? sizeScale(d[d.metric]) * other_radius : other_radius)

        simulation.stop()

        labels
            .attr('opacity', d => d[0] == select ? 1 : 0)

        label_backgrounds
            .attr('opacity', d => d[0] == select ? 0.8 : 0)

        bubbles
            .filter(d => d.radius == 1e-6)
            .transition()
            .duration(transition_time / 2)
            .attr("r", d => d.radius);

        bubbles
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

