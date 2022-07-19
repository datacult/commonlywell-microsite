'use strict'

let force = ((data, data_map = {x:'x_value', y:'y_value', color:'color_value', step:'step_value'}, step = 1, selector = '#force') => {

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
    const svgWidth = parseInt(d3.select(selector).style('width'), 10) / 2
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
    //////////////wrangle///////////////
    ////////////////////////////////////

    data.forEach(d => {
        d['1'] = {x: 0.2, y: 0.2}
        d['2'] = {x: 0.8, y: 0.8}
    });

    ////////////////////////////////////
    //////////////globals///////////////
    ////////////////////////////////////

    const radius = 5
    const group = data_map.color
    
    ////////////////////////////////////
    //////////////scales////////////////
    ////////////////////////////////////

    const xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0,1])
        
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0,1])

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d[group]))
        .range(d3.schemeTableau10)

    ////////////////////////////////////
    /////////simulation setup///////////
    ////////////////////////////////////   

    data.forEach(d => {
        d.y = yScale(0.5)
        d.x = xScale(0.5)
    })

    function tick() {
        d3.selectAll('.balls')
            .attr("cx", function (d) { return d.x })
            .attr("cy", function (d) { return d.y });
    }


    let balls = svg.selectAll('.balls')
        .data(data)
        .join('circle')
        .attr('r', radius)
        .attr('fill', d => colorScale(d[group]))
        .attr('cy', d => yScale(d[step]))
        .attr('cx', d => xScale(d[step]))
        .attr('class', 'balls')


    var simulation = d3.forceSimulation(data)
        .force('y', d3.forceY(d =>
                yScale(d[step].y)
            ).strength(0.5)
        )
        .force('x', d3.forceX(d => 
                xScale(d[step].x)
            ).strength(0.5)
        )
        .force('collide', d3.forceCollide(radius * 1.1))
        .alphaDecay(0.01)
        .alpha(0.15)
        .on('tick', tick)

    // optional time out
    var init_decay;
    init_decay = setTimeout(function () {
        simulation.alphaDecay(0.1);
    }, 8000);

    function update(val) {

        step = val;

        simulation.force('x', d3.forceX(function (d) {
            return xScale(d[step].x)
        }))

        simulation.force('y', d3.forceY(function (d) {
            return yScale(d[step].y)
        }))


        simulation
            .alphaDecay(0.01)
            .alpha(0.5)
            .restart()

        //optional time out
        clearTimeout(init_decay);
        init_decay = setTimeout(function () {
            console.log('init alpha decay');
            simulation.alphaDecay(0.1);
        }, 8000);

        return step
    }

    return {
        update: update,
    }

})