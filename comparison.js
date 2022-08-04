'use strict'

let comparison = ((data, data_map = {x:'x_value', y:'y_value', group:'step_value'}, selector = '#comparison', recover = 'XX',peak = 20) => {

    let step = 1;
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
        top: 200,
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
    const curve = d3.curveCardinal

    ////////////////////////////////////
    //////////scroll observers//////////
    ////////////////////////////////////

    const binary = document.querySelector('#binary');

    const binaryObserver = new IntersectionObserver((entry, observer) => {

        if (entry[0].isIntersecting == true) {
            step = 1
            update()
        }
    });

    binaryObserver.observe(binary);

    const both = document.querySelector('#both');

    const bothObserver = new IntersectionObserver((entry, observer) => {

        if (entry[0].isIntersecting == true) {
            step = 2
            update()
        }
    });

    bothObserver.observe(both);

    const highlight = document.querySelector('#highlight');

    const highlightObserver = new IntersectionObserver((entry, observer) => {

        if (entry[0].isIntersecting == true) {
            step = 3
            update()
        }
    });

    highlightObserver.observe(highlight);

    const lateHighlight = document.querySelector('#late-highlight');

    const lateHighlightObserver = new IntersectionObserver((entry, observer) => {

        if (entry[0].isIntersecting == true) {
            step = 4
            update()
        }
    });

    lateHighlightObserver.observe(lateHighlight);

    ////////////////////////////////////
    //////////////scales////////////////
    ////////////////////////////////////
    const xScale = d3.scaleLinear();  

    // const xScale = d3.scaleLinear()
    // .range([0, width])
    // .domain(d3.extent(data, d => d[data_map.x]))

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0,100])

    ////////////////////////////////////
    ///////////////axis/////////////////
    ////////////////////////////////////
    const xAxis = d3.axisBottom(xScale);
    
    const g = svg.append("g");

    let tickLabels, tickVal;

    tickLabels = ['Baseline','30-day','60-day','90-day'], tickVal = [0,30,60,90];

    draw(tickVal,tickLabels);

    // tickLabels = ['120-day','150-day','180-day','210-day'], tickVal = [120,150,180,210];

    function draw(ticks,labels){

        xScale
        .domain([ticks[0], ticks[3]])
        .range([0, width]);

        xAxis
        .ticks(3).tickValues(ticks).tickFormat((d,i) => labels[i]);

        g
        .attr("class", 'axis')
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height+10})`)
        .transition().duration(2000)
        .call(xAxis.tickSize(-height-10));

        svg.select('.domain')
        .attr('stroke','none');



    svg.selectAll("#x-axis line")
    .attr('stroke','#2A353C')
    .style("stroke-dasharray", ("1.5, 1.5"));


    svg.selectAll('.axis').style('font-family','Montserrat')
    } 

    // const xAxis = d3.axisBottom(xScale).ticks(3).tickValues([0,30,60,90]).tickFormat((d,i) => tickLabels[i])

    svg.select('.domain')
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

    // var annotation, da_x, da_center;
    var line_height = '2%';
    var annotation;
    var da_x = 0, da_center = 0;

    // //step 1
    let txt1 = svg.append('text')
        .attr('id','annotation1')
        .attr('alignment-baseline','middle')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','1vw')
        .style('opacity',0)

        txt1
        .append('tspan')
        .attr('x',da_x)
        .text('Traditionally, measuring')

        txt1
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('recovery as binary has meant')

        txt1
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`that a setback causes a reset to`)

        txt1
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`an individual's progress.`);

    //step 2
    let txt2 = svg.append('text')
        .attr('id','annotation2')
        .attr('alignment-baseline','middle')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','1vw')
        .style('opacity',0)

        txt2
        .append('tspan')
        .attr('x',da_x)
        .text('Unlike binary tracking, the RCI')

        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('offers a more supportive, holistic')

        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`view of setbacks.`)

        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(` `)

        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`Here, a setback isn't the whole`)
        
        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`picture, and doesn't necessarily`)
        
        txt2
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`result in a decline in score.`);

    //step 3
    let txt3 = svg.append('text')
        .attr('id','annotation3')
        .attr('alignment-baseline','middle')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','1vw')
        .style('opacity',0)

        txt3
        .append('tspan')
        .attr('x',da_x)
        .text('Individuals experiencing a low on')

        txt3
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('an assessment see their score')

        txt3
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`recover to ${recover}% it's original value`)
        .attr('font-weight',700)

        txt3
        .append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`by their next evaluation.`);

    //step 4
    // var da_x = xScale(182), da_center = 25, line_height = '2%';

    let txt = svg.append('text')
        .attr('id','annotation4')
        .attr('alignment-baseline','middle')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','1vw')
        .style('opacity',0)

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
        
    var bg_rect = svg.append('rect')
        .attr('id','annotation_rect')
        .style('fill','white')
        .style('opacity',.5);

    
    } else {
        //mobile annotations
        var x_annotation = xScale(0), y_annotation = -120, font_size = '4.5vw', line_height = '4%';

        //step 1
        var ann1 = svg.append('text')
            .attr('id','annotation1')
            .attr('font-size',font_size)
            .attr('x',x_annotation)
            .attr('y',y_annotation)
            .style('opacity',0)

        ann1
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('Traditionally, measuring recovery')


        ann1
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('as binary has meant that a')

        ann1
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('setback causes a reset to an');

        ann1
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`individual's progress`);

        //step 2
        let ann2 = svg.append('text')
            .attr('id','annotation2')
            .attr('alignment-baseline','middle')
            .attr('x',x_annotation)
            .attr('y',y_annotation-20)
            .attr('font-size',font_size)
            .style('opacity',0)

            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .text('Unlike binary tracking, the RCI')

            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('offers a more supportive, holistic')

            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`view of setbacks.`)

            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`Here, a setback isn't the whole`)
            
            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`picture, and doesn't necessarily`)
            
            ann2
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`result in a decline in score.`);

        svg.select('#base_rect').style('opacity',1)

        //step 3

        let ann3 = svg.append('text')
            .attr('id','annotation3')
            .attr('alignment-baseline','middle')
            .attr('x',x_annotation)
            .attr('y',y_annotation)
            .attr('font-size',font_size)
            .style('opacity',0)

            ann3
            .append('tspan')
            .attr('x',x_annotation)
            .text('Individuals experiencing a low on')

            ann3
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('an assessment see their score')

            ann3
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`recover to ${recover}% it's original value`)
            .attr('font-weight',700)

            ann3
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`by their next evaluation.`);

        //step 4
        let ann4 = svg.append('text')
            .attr('id','annotation4')
            .attr('alignment-baseline','middle')
            .attr('x',x_annotation)
            .attr('y',y_annotation)
            .attr('font-size',font_size)
            .style('opacity',0)

            ann4
            .append('tspan')
            .attr('x',x_annotation)
            .text('Lows experienced further along in')

            ann4
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text('the process are less of an')

            ann4
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`interruption and are reflected in a`)

            ann4
            .append('tspan')
            .attr('x',x_annotation)
            .attr('dy',line_height)
            .text(`smaller decline in RCI score`)

    // var bg_size = document.getElementById(annote).getBBox(), padding = 10;
        
    var bg_rect = svg.append('rect')
        .attr('id','annotation_rect')
        // .attr('x',bg_size.x-padding)
        // .attr('y',bg_size.y-padding)
        // .attr('height',bg_size.height+padding*2)
        // .attr('width',bg_size.width+padding*2)
        .style('fill','white')
        .style('opacity',.5);

    // document.getElementById('comparison-group').insertBefore(document.getElementById('annotation_rect'), document.getElementById(annote));

            
    }


    ////////////////////////////////////
    /////////////// DOM ////////////////
    ////////////////////////////////////
    var img_width = xScale(30), img_height = img_width/(332/229)
    var comp_image = svg.append('image')
        .attr('id','binary-comparison')
        .attr('href','assets/binary.svg')
        .style('opacity',0);

    //draw highlights
    var dipstat = d3.group(data, d => d[data_map.group]);
    var dip_ids = [1,2]

    dip_ids.forEach((dip_id) => {
        var area = [...dipstat.get(dip_id)];
        if (dip_id == 1){
            area.pop();
        } else {
            area.shift()
        }

        const dip_group = svg.append("g").attr('id','dip_group'+dip_id)

        const dip_fill_group = svg.append("g").attr('id','dip_fill_group'+dip_id)

        const dip = d3.line()
            .x(d => xScale(d[data_map.x]))
            .y(d => yScale(d[data_map.y]))
            .curve(curve) 

        const dip_area = d3.area()
            .x(d => xScale(d[data_map.x]))
            .y0(height)
            .y1(d => yScale(d[data_map.y]))
            .curve(curve)
            
        const dip_fill = d3.line()
            .x(d => xScale(d[data_map.x]))
            .y(d => yScale(d[data_map.y]))
            .curve(curve) 

            dip_fill_group.append("path")
            .attr('class','line_fill')
            .attr('id','line_fill'+dip_id)
            .style('opacity',0)
            // .attr("id", "dip_fill")
            .attr("fill", "white")
            .attr("d", dip_fill(area));

            dip_fill_group.append("path")
            .attr('class','line_fill')
            .attr('id','line_fill'+dip_id)
            .style('opacity',0)
            // .attr("id", "dip_area")
            .attr("fill","#F1F2F2")
            .attr("d", dip_area(dipstat.get(dip_id)));

        document.getElementById('comparison-group').insertBefore(document.getElementById('dip_fill_group'+dip_id), document.getElementById('x-line'));
        
        dipstat.forEach(d => {
            dip_fill_group
            .append('g')
            .selectAll('.tick-line')
            .data(dipstat.get(dip_id))
            .join("line")
            .attr('class','tick-line')
            .attr('id','tick-line'+dip_id)
            .style('opacity',0)
            .attr('y1',d => yScale(d[data_map.y])+radius)
            .attr('y2',height)
            .attr('x1',d => xScale(d[data_map.x]))
            .attr('x2',d => xScale(d[data_map.x]))
            .attr('stroke','#2A353C')
            .style("stroke-dasharray", ("1.5, 1.5"));
        })

        dip_group.append("path")
            // .attr('class','line')
            .attr('class','line_group')
            .attr('id','line_group'+dip_id)
            .style('opacity',0)
            // .attr('id','line'+dip_id)
            .attr("fill", "none")
            .attr("stroke", "#334857")
            .attr("stroke-width", stroke_width)
            .attr("d", dip(dipstat.get(dip_id)));

        dip_group.append("g")
            .selectAll(".circle")
            .data(dipstat.get(dip_id))
            .join("circle")
            .attr('class',"circle")
            .attr('id',"circle"+dip_id)
            .style('opacity',0)
            .attr("fill", 'white')
            .attr('cx', d => xScale(d[data_map.x]))
            .attr('cy', d => yScale(d[data_map.y]))
            .attr('r', radius)
            .attr('stroke-width', stroke_width)
            .attr('stroke','#334857')

    })


    //annotation function
    function draw_annotation(annotation,x,center){
        svg.select('#'+annotation)
        .style('opacity',1)
        .transition()
        .duration(2000);

        if (window.outerWidth > 900){
            svg.select('#'+annotation)
                .attr('x',xScale(x))
                .attr('y',yScale(center))

            svg.selectAll('tspan')
                .attr('x',xScale(x))
        }
        
        var bg_size = document.getElementById(annotation).getBBox(), padding = 10;
            
        bg_rect.attr('x',bg_size.x-padding)
            .attr('y',bg_size.y-padding)
            .attr('height',bg_size.height+padding*2)
            .attr('width',bg_size.width+padding*2);

        document.getElementById('comparison-group').insertBefore(document.getElementById('annotation_rect'), document.getElementById(annotation));

    }

    //scroll update function
    function update(val){

        // if (val) step = val.target.value;
        console.log(step)

        if (step == 1) {

            tickLabels = ['Baseline','30-day','60-day','90-day'], tickVal = [0,30,60,90];

            draw(tickVal,tickLabels);

            annotation = 'annotation1';
            da_x = 3.5;
            da_center = 85;

            comp_image
            .attr('x',xScale(0))
            .attr('width',img_width)
            .attr('height',img_height);

            svg.selectAll('.line_group').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.line_fill').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.circle').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.tick-line').style('opacity',0)
            .transition()
            .duration(2000);

            svg.select('#binary-comparison').style('opacity',1)
            .transition()
            .duration(2000);

            comp_image.attr('y',yScale(0)-document.getElementById('binary-comparison').getBBox().height);

            draw_annotation(annotation,da_x,da_center)
            svg.select('#annotation2').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation3').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation4').style('opacity',0)
            .transition()
            .duration(2000);

        } else if (step == 2){

            tickLabels = ['Baseline','30-day','60-day','90-day'], tickVal = [0,30,60,90];

            draw(tickVal,tickLabels);

            annotation = 'annotation2';
            da_x = 33.5;
            da_center = 85;
            
            svg.selectAll('.line_group').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.line_fill').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.circle').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.tick-line').style('opacity',0)
            .transition()
            .duration(2000);

            svg.select('#binary-comparison').style('opacity',.5)
            .transition()
            .duration(2000);
            svg.select('#line_group'+dip_ids[0]).style('opacity',.5)
            .transition()
            .duration(2000);
            svg.selectAll('#circle'+dip_ids[0]).style('opacity',.5)
            .transition()
            .duration(2000);

            draw_annotation(annotation,da_x,da_center)
            svg.select('#annotation1').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation3').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation4').style('opacity',0)
            .transition()
            .duration(2000);

        } else if (step == 3){

            tickLabels = ['Baseline','30-day','60-day','90-day'], tickVal = [0,30,60,90];

            draw(tickVal,tickLabels);

            annotation = 'annotation3';
            da_x = 33.5;
            da_center = 85;

            svg.select('#binary-comparison').style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#line_group'+dip_ids[0]).style('opacity',1)
            .transition()
            .duration(2000);
            svg.selectAll('#line_fill'+dip_ids[0]).style('opacity',1)
            .transition()
            .duration(2000);
            svg.selectAll('#circle'+dip_ids[0]).style('opacity',1)
            .transition()
            .duration(2000);
            svg.selectAll('#tick-line'+dip_ids[0]).style('opacity',1)
            .transition()
            .duration(10000);
            svg.selectAll('#line_group'+dip_ids[1]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#line_fill'+dip_ids[1]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#circle'+dip_ids[1]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#tick-line'+dip_ids[1]).style('opacity',0)

            draw_annotation(annotation,da_x,da_center)
            svg.select('#annotation1').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation2').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation4').style('opacity',0)
            .transition()
            .duration(2000);

        } else {

            tickLabels = ['120-day','150-day','180-day','210-day'], tickVal = [120,150,180,210];

            draw(tickVal,tickLabels);

            annotation = 'annotation4';
            da_x = 182;
            da_center = 25;
            
            svg.select('#binary-comparison').style('opacity',0)
            .transition()
            .duration(2000);

            svg.selectAll('#line_group'+dip_ids[1]).style('opacity',1).attr('transform','translate('+xScale(0)+' 0)')
            .transition()
            .duration(2000);
            svg.selectAll('#line_fill'+dip_ids[1]).style('opacity',1).attr('transform','translate('+xScale(0)+' 0)')
            .transition()
            .duration(2000);
            svg.selectAll('#circle'+dip_ids[1]).style('opacity',1).attr('transform','translate('+xScale(0)+' 0)')
            .transition()
            .duration(2000);
            svg.selectAll('#tick-line'+dip_ids[1]).style('opacity',1).attr('transform','translate('+xScale(0)+' 0)')
            .transition()
            .duration(10000);
            svg.selectAll('#line_group'+dip_ids[0]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#line_fill'+dip_ids[0]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#circle'+dip_ids[0]).style('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('#tick-line'+dip_ids[0]).style('opacity',0)

            draw_annotation(annotation,da_x,da_center)
            svg.select('#annotation1').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation2').style('opacity',0)
            .transition()
            .duration(2000);
            svg.select('#annotation3').style('opacity',0)
            .transition()
            .duration(2000);
        }

        

    }

})
