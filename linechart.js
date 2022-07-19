'use strict'

let linechart = ((data, data_map = {x:'x_value', y:'y_value', color:'color_value', step:'step_value'}, step = 1, selector = '#linechart') => {

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
    const svgWidth = parseInt(d3.select(selector).style('width'))
    const svgHeight = (svgWidth / 2)

    // helper calculated variables for inner width & height
    const height = svgHeight - margin.top - margin.bottom
    const width = svgWidth - margin.left - margin.right

    // add SVG
    d3.select(".linechart-svg").remove();

    const svg = body.append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .attr('class', 'linechart-svg')
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    
    ////////////////////////////////////
    ////////////// globals /////////////
    ////////////////////////////////////

    const radius = 5
    const stroke_width = 2
    const curve = d3.curveCardinal

    ////////////////////////////////////
    //////////data wrangling////////////
    ////////////////////////////////////

    ////////////////////////////////////
    //////////////scales////////////////
    ////////////////////////////////////

    const xScale = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(data, d => d[data_map.x]))

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(d3.extent(data, d => d[data_map.y]))

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d[data_map.color]))
        .range(d3.schemeTableau10)

    ////////////////////////////////////
    /////////////// DOM ////////////////
    ////////////////////////////////////

    const points = svg.append("g")
        .selectAll("circle")
        .data(data.filter(d => d[data_map.step] == step))
        .join("circle")
        .attr("fill", d => colorScale(d[data_map.color]))
        .attr('cx', d => xScale(d[data_map.x]))
        .attr('cy', d => yScale(d[data_map.y]))
        .attr('r', radius)
        .attr('stroke-width', stroke_width)

    const line = d3.line()
        .x(d => xScale(d[data_map.x]))
        .y(d => yScale(d[data_map.y]))
        .curve(curve)  

    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", stroke_width)
        .attr("d", line(data.filter(d => d[data_map.step] == step)));

    ////////////////////////////////////
    ///////////////axis/////////////////
    ////////////////////////////////////

    const xAxis = d3.axisBottom(xScale)

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis.tickSize(-height))

    const yAxis = d3.axisLeft(yScale)

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "y-axis")
        .call(yAxis)

    function update(val) {

        step = val;

        points
            .data(data.filter(d => d[data_map.step] == step))
            .attr("fill", d => colorScale(d[data_map.color]))
            .attr('cx', d => xScale(d[data_map.x]))
            .attr('cy', d => yScale(d[data_map.y]))

        path.attr("d", line(data.filter(d => d[data_map.step] == step)));

    }

    return {
        update: update,
    }

})
