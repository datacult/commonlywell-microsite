'use strict'

let linechart = ((data, data_map = {x:'x_value', y:'y_value', y1:'y_value', y2:'y_value', y3:'y_value', group:'step_value'}, selector = '#linechart') => {

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
    const svgWidth = parseInt(d3.select(selector).style('width'), 10)*2
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
        .domain([0,100])

        const indicatorColorScale = d3.scaleOrdinal()
        .domain([data_map.y1,data_map.y2,data_map.y3])
        .range(["#1268B3","#63C2A1","#C69530"])

    ////////////////////////////////////
    ///////////////axis/////////////////
    ////////////////////////////////////

    const xAxis = d3.axisBottom(xScale).ticks(3)

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis.tickSize(-height))

    const yAxis = d3.axisLeft(yScale).tickSize(0).ticks(5)

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "y-axis")
        .call(yAxis)

    ////////////////////////////////////
    /////////////// DOM ////////////////
    ////////////////////////////////////
    var sumstat = d3.group(data, d => d[data_map.group]);

    [ ...sumstat.keys() ].forEach(id => {

    const line_group = svg.append("g").attr('class','line_group').attr('id','line_group'+id)

    const line = d3.line()
        .x(d => xScale(d[data_map.x]))
        .y(d => yScale(d[data_map.y]))
        .curve(curve)  

    line_group.append("path")
        .attr("fill", "none")
        .attr("stroke", "#334857")
        .attr("stroke-width", stroke_width)
        .attr("d", line(sumstat.get(id)));

    line_group.append("g")
        .selectAll("."+data_map.y+"_circle")
        .data(sumstat.get(id))
        .join("circle")
        .attr('class',data_map.y+"_circle")
        .attr("fill", 'white')
        .attr('cx', d => xScale(d[data_map.x]))
        .attr('cy', d => yScale(d[data_map.y]))
        .attr('r', radius)
        .attr('stroke-width', stroke_width)
        .attr('stroke','#334857')

    line_group
        .style('pointer-events','all')
        .on("mouseover", function() {
            var hover_lines = '#indicator_group'+id

            svg.select(hover_lines).attr('display',1);
            // .transition()
            // .duration(200);
            svg.selectAll('.line_group').attr('display','none');
            // .transition()
            // .duration(200);
        })
        .on("mouseout", function() {
            var hover_lines = '#indicator_group'+id

            svg.select(hover_lines).attr('display','none');
            // .transition()
            // .duration(200);
            svg.selectAll('.line_group').attr('display',1);
            // .transition()
            // .duration(200);
        }); 

    var indicators = ['y1','y2','y3']

        const indicator_group = svg.append("g")
            .attr('class','indicator_group')
            .attr('id','indicator_group'+id)
            .attr('display','none')
    
    indicators.forEach(indicator => {

        var line_ind = d3.line()
            .x(d => xScale(d[data_map.x]))
            .y(d => yScale(d[data_map[indicator]]))
            .curve(curve)  

        indicator_group.append("path")
            .attr("fill", "none")
            .attr("stroke", indicatorColorScale(data_map[indicator]))
            .attr("stroke-width", stroke_width)
            .attr("d", line_ind(sumstat.get(id)));

        indicator_group.append("g")
            .selectAll("."+data_map[indicator]+"_circle")
            .data(sumstat.get(id))
            .join("circle")
            .attr('class',data_map[indicator]+"_circle")
            .attr("fill", 'white')
            .attr('cx', d => xScale(d[data_map.x]))
            .attr('cy', d => yScale(d[data_map[indicator]]))
            .attr('r', radius)
            .attr('stroke-width', stroke_width)
            .attr("stroke", indicatorColorScale(data_map[indicator]))

        
    })
        
    });

})
