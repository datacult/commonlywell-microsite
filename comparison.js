'use strict'

let comparison = ((data, data_map = {x:'x_value', y:'y_value', group:'step_value'}, selector = '#comparison', recover = 'XX',peak = 20) => {

    ////////////////////////////////////
    //////////// svg setup /////////////
    ////////////////////////////////////

    var body = d3.select(selector)
    body.html("")

    if (window.outerWidth > 900){
    
    // margins for SVG
    var margin = {
        left: 200,
        right: 200,
        top: 100,
        bottom: 100
    }

    // responsive width & height
    var svgWidth = parseInt(d3.select(selector).style('width'), 10)*2
    var svgHeight = (svgWidth / 2)

    var radius = 4
    var stroke_width = 2
    } else {
       // margins for SVG
    var margin = {
        left: 40,
        right: 40,
        top: 150,
        bottom: 200
    } 

    // responsive width & height
    var svgWidth = parseInt(d3.select(selector).style('width'), 10)*2
    var svgHeight = (svgWidth*1.4)

    var radius = 2
    var stroke_width = 1.5
    }
    

    // helper calculated variables for inner width & height
    const height = svgHeight - margin.top - margin.bottom
    const width = svgWidth - margin.left - margin.right

    // add SVG
    d3.select(".comparison-svg").remove();

    const svg = body.append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .attr('class', 'comparison-svg')
        .append('g')
        .attr('id','comparison-group')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    
    ////////////////////////////////////
    ////////////// globals /////////////
    ////////////////////////////////////

    // const radius = 4
    // const stroke_width = 2
    const curve = d3.curveMonotoneX

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

    ////////////////////////////////////
    ///////////////axis/////////////////
    ////////////////////////////////////
    let tickLabels = ['Baseline','30-day','60-day','90-day'];

    const xAxis = d3.axisBottom(xScale).ticks(3).tickValues([0,30,60,90]).tickFormat((d,i) => tickLabels[i])

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height+10})`)
        .call(xAxis.tickSize(-height-10));

    svg.select('#x-axis .domain')
        .attr('stroke','none');

    svg
        .append("line")
        .attr('id','x-line')
        .attr('y1',height)
        .attr('y2',height)
        .attr('x1',-10)
        .attr('x2',width+20)
        .attr('stroke','#2A353C');

    svg.selectAll("#x-axis line")
        .attr('stroke','#2A353C')
        .style("stroke-dasharray", ("1.5, 1.5"));


    const yAxis = d3.axisLeft(yScale).tickSize(0).ticks(5)

    svg.append("g")
        .attr("class", 'axis')
        .attr("id", "y-axis")
        .attr("transform", `translate(-10,0)`)
        .call(yAxis)

    svg.select('#y-axis .domain')
        .attr('stroke','none');

    svg
        .append("line")
        .attr('id','y-line')
        .attr('y1',0)
        .attr('y2',height+10)
        .attr('x1',0)
        .attr('x2',0)
        .attr('stroke','#2A353C');

    svg.selectAll('.axis').style('font-family','Montserrat')

    ////////////////////////////////////
    /////////// Annotations ////////////
    ////////////////////////////////////

    if (window.outerWidth > 900){

    // //step 1
    // var annotation = 'annotation1'
    // var da_x = xScale(3.5), da_center = 85, line_height = '1.2vw';

    // let txt = svg.append('text')
    //     .attr('id',annotation)
    //     .attr('alignment-baseline','middle')
    //     .attr('x',da_x)
    //     .attr('y',yScale(da_center))
    //     .attr('font-size','1vw')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .text('Traditionally, measuring')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text('recovery as binary has meant')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`that a setback causes a reset to`)

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`an individual's progress.`);

    // //step 2
    // var annotation = 'annotation2'
    // var da_x = xScale(33.5), da_center = 85, line_height = '1.2vw';

    // let txt = svg.append('text')
    //     .attr('id',annotation)
    //     .attr('alignment-baseline','middle')
    //     .attr('x',da_x)
    //     .attr('y',yScale(da_center))
    //     .attr('font-size','1vw')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .text('Unlike binary tracking, the RCI')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text('offers a more supportive, holistic')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`view of setbacks.`)

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(` `)

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`Here, a setback isn't the whole`)
        
    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`picture, and doesn't necessarily`)
        
    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`result in a decline in score.`);

    // //step 3
    // var annotation = 'annotation3'
    // var da_x = xScale(32), da_center = 85, line_height = '1.2vw';

    // let txt = svg.append('text')
    //     .attr('id',annotation)
    //     .attr('alignment-baseline','middle')
    //     .attr('x',da_x)
    //     .attr('y',yScale(da_center))
    //     .attr('font-size','1vw')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .text('Individuals experiencing a low on')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text('an assessment see their score')

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`recover to ${recover}% it's original value`)
    //     .attr('font-weight',700)

    //     txt
    //     .append('tspan')
    //     .attr('x',da_x)
    //     .attr('dy',line_height)
    //     .text(`by their next evaluation.`);

    //step 4
    var annotation = 'annotation4'
    var da_x = xScale(62), da_center = 25, line_height = '2%';

    let txt = svg.append('text')
        .attr('id',annotation)
        .attr('alignment-baseline','middle')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','1vw')

        txt
        .append('tspan')
        .attr('x',da_x)
        .text('Lows experienced further')

        txt
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('along in the process are')

        txt
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`less of an interruption and`)

        txt
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`are reflected in a smaller`)

        txt
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`decline in RCI score`);

    var bg_size = document.getElementById(annotation).getBBox(), padding = 10;
        
    var bg_rect = svg.append('rect')
        .attr('id','annotation_rect')
        .attr('x',bg_size.x-padding)
        .attr('y',bg_size.y-padding)
        .attr('height',bg_size.height+padding*2)
        .attr('width',bg_size.width+padding*2)
        .style('fill','#F5F6F7');

    document.getElementById('comparison-group').insertBefore(document.getElementById('annotation_rect'), document.getElementById(annotation));

    } else {
        //mobile annotations
        var x_annotation = xScale(0), y_annotation = -80, font_size = '4.5vw', line_height = '3%';

        // //step 1
        // var annote = 'ann1';
        // var ann1 = svg.append('text')
        //     .attr('id',annote)
        //     .attr('font-size',font_size)
        //     .attr('x',x_annotation)
        //     .attr('y',y_annotation)

        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('Traditionally, measuring recovery')


        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('as binary has meant that a')

        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('setback causes a reset to an');

        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`individual's progress`);

        // //step 2
        // var annote = 'ann2';
        // let ann2 = svg.append('text')
        //     .attr('id',annote)
        //     .attr('alignment-baseline','middle')
        //     .attr('x',x_annotation)
        //     .attr('y',y_annotation)
        //     .attr('font-size',font_size)

        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .text('Unlike binary tracking, the RCI')

        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('offers a more supportive, holistic')

        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`view of setbacks.`)

        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`Here, a setback isn't the whole`)
            
        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`picture, and doesn't necessarily`)
            
        //     ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`result in a decline in score.`);

        // svg.select('#base_rect').attr('display',1)

        // //step 3
        // var annote = 'ann3';

        // let txt = svg.append('text')
        //     .attr('id',annote)
        //     .attr('alignment-baseline','middle')
        //     .attr('x',x_annotation)
        //     .attr('y',y_annotation)
        //     .attr('font-size',font_size)

        //     txt
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .text('Individuals experiencing a low on')

        //     txt
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('an assessment see their score')

        //     txt
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`recover to ${recover}% it's original value`)
        //     .attr('font-weight',700)

        //     txt
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text(`by their next evaluation.`);

        // svg.select('#increase_rect').attr('display',1)

        //step 4
        var annote = 'ann4'

        let txt = svg.append('text')
            .attr('id',annote)
            .attr('alignment-baseline','middle')
            .attr('x',x_annotation)
            .attr('y',y_annotation)
            .attr('font-size',font_size)

            txt
            .append('tspan')
            .attr('x',x_annotation)
            .text('Lows experienced further along in')

            txt
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('the process are less of an')

            txt
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`interruption and are reflected in a`)

            txt
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`smaller decline in RCI score`)

    var bg_size = document.getElementById(annote).getBBox(), padding = 10;
        
    var bg_rect = svg.append('rect')
        .attr('id','annotation_rect')
        .attr('x',bg_size.x-padding)
        .attr('y',bg_size.y-padding)
        .attr('height',bg_size.height+padding*2)
        .attr('width',bg_size.width+padding*2)
        .style('fill','#F5F6F7');

    document.getElementById('comparison-group').insertBefore(document.getElementById('annotation_rect'), document.getElementById(annote));

            
    }


    ////////////////////////////////////
    /////////////// DOM ////////////////
    ////////////////////////////////////
    // var img_width = xScale(30), img_height = img_width/(332/229)
    // var comp_image = svg.append('image')
    //     .attr('id','binary-comparison')
    //     .attr('href','assets/binary.svg')
    //     .attr('x',xScale(0))
    //     .attr('width',img_width)
    //     .attr('height',img_height);

    // comp_image.attr('y',yScale(0)-document.getElementById('binary-comparison').getBBox().height);

    var dipstat = d3.group(data, d => d[data_map.group]);


    // step 3
    var dip_id = 1

    //step 4 
    var dip_id = 2


    const dip_group = svg.append("g").attr('class','line_group').attr('id','line_group_low')

    const dip = d3.line()
        .x(d => xScale(d[data_map.x]))
        .y(d => yScale(d[data_map.y]))
        .curve(curve)  

    // // fill dip (needs tweaking)
    var area = [...dipstat.get(dip_id)];
    console.log(area)
    area.shift();

    dip_group.append("path")
        .attr("fill", "red")
        .attr("d", dip(area));

    dip_group.append("path")
        .attr("fill", "none")
        // .attr("fill","red")
        .attr("stroke", "#334857")
        .attr("stroke-width", stroke_width)
        .attr("d", dip(dipstat.get(dip_id)));

    dip_group.append("g")
        .selectAll("."+data_map.y+"_circle")
        .data(dipstat.get(dip_id))
        .join("circle")
        .attr('class',data_map.y+"_circle")
        .attr("fill", 'white')
        .attr('cx', d => xScale(d[data_map.x]))
        .attr('cy', d => yScale(d[data_map.y]))
        .attr('r', radius)
        .attr('stroke-width', stroke_width)
        .attr('stroke','#334857')

})
