'use strict'

let linechart = ((data, data_map = {x:'x_value', y:'y_value', y1:'y_value', y2:'y_value', y3:'y_value', group:'step_value'}, selector = '#linechart') => {

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
    d3.select(".linechart-svg").remove();

    const svg = body.append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .attr('class', 'linechart-svg')
        .append('g')
        .attr('id','line-group')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    
    ////////////////////////////////////
    ////////////// globals /////////////
    ////////////////////////////////////

    // const radius = 4
    // const stroke_width = 2
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
    /////////// Annotations ////////////
    ////////////////////////////////////
    var bracket = [55,80], increase = 15;

    svg.append('rect')
        .attr('class','annotation')
        .attr('id','annotation_rect')
        .attr('x',0)
        .attr('y',0)
        .attr('height',height)
        .attr('width',xScale(63))
        .attr('fill','#F1F2F3')
        .attr('display','none');

    // svg.append('rect')
    //     .attr('class','annotation')
    //     .attr('id','base_rect')
    //     .attr('x',-1*xScale(10))
    //     .attr('y',yScale(bracket[1]))
    //     .attr('height',yScale(bracket[0])-yScale(bracket[1]))
    //     .attr('width',xScale(20))
    //     .attr('fill','#F1F2F3')
    //     .attr('display','none');
    
    // svg.append('rect')
    //     .attr('class','annotation')
    //     .attr('id','increase_rect')
    //     .attr('x',xScale(80))
    //     .attr('y',yScale(bracket[1]+increase))
    //     .attr('height',yScale(bracket[0]+increase)-yScale(bracket[1]+increase))
    //     .attr('width',xScale(20))
    //     .attr('fill','#F1F2F3')
    //     .attr('display','none');

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
    var rect_width = xScale(50), rect_height = 30;
    svg.select('#annotation_rect').attr('display',1)

    // svg.append('rect')
    //     .attr('class','annotation')
    //     .attr('x',xScale(30)-rect_width/2)
    //     .attr('y',yScale(90)-rect_height/2-4)
    //     .attr('height',rect_height)
    //     .attr('width',rect_width)
    //     .style('fill','#F5F6F7');

    let treatment = svg.append('text')
        .attr('class','annotation')
        .attr('id','treatment_annotation')
        .attr('x',xScale(30))
        .attr('y',yScale(90))
        .attr('text-anchor','middle')
        .attr('font-size','1vw')

    treatment
        .append('tspan')
        .text('Most individuals spend their first')
    
    treatment
        .append('tspan')
        .attr('font-weight', 700)
        .text(' 9 weeks in active treatment');

    var rect_size = document.getElementById('treatment_annotation').getBBox(), padding = 10;
    
    svg.append('rect')
        .attr('class','annotation')
        .attr('id','treatment_rect')
        .attr('x',rect_size.x-padding)
        .attr('y',rect_size.y-padding)
        .attr('height',rect_size.height+padding*2)
        .attr('width',rect_size.width+padding*2)
        .style('fill','#F5F6F7');

    document.getElementById('line-group').insertBefore(document.getElementById('treatment_rect'), document.getElementById('treatment_annotation'));
    

    var bracket_width = 10;

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-bottom-base')
        .attr('x1',-40-bracket_width)
        .attr('x2',-40)
        .attr('y1',yScale(bracket[0]))
        .attr('y2',yScale(bracket[0]))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-top-base')
        .attr('x1',-40-bracket_width)
        .attr('x2',-40)
        .attr('y1',yScale(bracket[1]))
        .attr('y2',yScale(bracket[1]))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-middle-base')
        .attr('x1',-40-bracket_width*2)
        .attr('x2',-40-bracket_width)
        .attr('y1',yScale((bracket[1]-bracket[0])/2+bracket[0]))
        .attr('y2',yScale((bracket[1]-bracket[0])/2+bracket[0]))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-vertical-base')
        .attr('x1',-40-bracket_width)
        .attr('x2',-40-bracket_width)
        .attr('y1',yScale(bracket[0]))
        .attr('y2',yScale(bracket[1]))
        .attr('stroke','#2A353C');


    //increase bracket
    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-bottom-increase')
        .attr('x1',width+20+bracket_width)
        .attr('x2',width+20)
        .attr('y1',yScale(bracket[0]+increase))
        .attr('y2',yScale(bracket[0]+increase))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-top-increase')
        .attr('x1',width+20+bracket_width)
        .attr('x2',width+20)
        .attr('y1',yScale(bracket[1]+increase))
        .attr('y2',yScale(bracket[1]+increase))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-middle-increase')
        .attr('x1',width+20+bracket_width*2)
        .attr('x2',width+20+bracket_width)
        .attr('y1',yScale((bracket[1]-bracket[0])/2+bracket[0]+increase))
        .attr('y2',yScale((bracket[1]-bracket[0])/2+bracket[0]+increase))
        .attr('stroke','#2A353C');

    svg.append('line')
        .attr('class','annotation')
        .attr('id','bracket-vertical-increase')
        .attr('x1',width+20+bracket_width)
        .attr('x2',width+20+bracket_width)
        .attr('y1',yScale(bracket[0]+increase))
        .attr('y2',yScale(bracket[1]+increase))
        .attr('stroke','#2A353C');

    var ba_x = -70, ba_y = yScale((bracket[1]-bracket[0])/2+bracket[0]+6), line_height = '1.1vw';

    var base_annotation = svg.append('text')
        .attr('class','annotation')
        .attr('x',ba_x)
        .attr('y',ba_y)
        .attr('text-anchor','end')
        .attr('font-size','.9vw');

    base_annotation.append('tspan')
        .attr('x',ba_x)
        .attr('dy',line_height)
        .text('90% of baseline')
        .attr('font-weight', 700);

    base_annotation.append('tspan')
        .attr('x',ba_x)
        .attr('dy',line_height)
        .text('readings')
        .append('tspan')
        .text(' fall in')
        .attr('font-weight', 300);

    base_annotation.append('tspan')
        .attr('x',ba_x)
        .attr('dy',line_height)
        .attr('text-anchor','end')
        .text('this range');

    var ia_x = width+50, ia_y = yScale((bracket[1]-bracket[0])/2+bracket[0]+increase+8);

    var increase_annotation = svg.append('text')
        .attr('class','annotation')
        .attr('x',ia_x)
        .attr('y',ia_y)
        .attr('font-size','.9vw');

    increase_annotation.append('tspan')
        .attr('x',ia_x)
        .attr('dy',line_height)
        .text(`On average, an`);

    increase_annotation.append('tspan')
        .attr('x',ia_x)
        .attr('dy',line_height)
        .text(`individual's RCI`);

    increase_annotation.append('tspan')
        .attr('x',ia_x)
        .attr('dy',line_height)
        .text('index increases');

    increase_annotation.append('tspan')
        .attr('x',ia_x)
        .attr('dy',line_height)
        .text('by '+increase+'%')
        .attr('font-weight', 700);

    var la_x = xScale(7), la_center = 95;

    var legend_annotation = svg.append('text')
        .attr('class','annotation_hover')
        .attr('x',la_x)
        .attr('dy',yScale(la_center))
        .attr('font-size','.9vw');

    legend_annotation.append('tspan')
        .attr('x',la_x)
        .attr('dy',line_height)
        .text('Each RCI Score is calculated');

    legend_annotation.append('tspan')
        .attr('x',la_x)
        .attr('dy',line_height)
        .text(`based on the`)
        .append('tspan')
        .text(' personal')
        .attr('font-weight', 700)
        .attr('fill',indicatorColorScale('personal'))
        .append('tspan')
        .text(',')
        .attr('font-weight', 300)
        .attr('fill','black');

    legend_annotation.append('tspan')
        .attr('x',la_x)
        .attr('dy',line_height)
        .text('social')
        .attr('font-weight', 700)
        .attr('fill',indicatorColorScale('social'))
        .append('tspan')
        .text(', and')
        .attr('font-weight', 300)
        .attr('fill','black')
        .append('tspan')
        .text(' cultural')
        .attr('font-weight', 700)
        .attr('fill',indicatorColorScale('cultural'))
        .append('tspan')
        .text(' scores')
        .attr('font-weight', 300)
        .attr('fill','black');

    legend_annotation.append('tspan')
        .attr('x',la_x)
        .attr('dy',line_height)
        .text('an individual receives');

    var da_x = xScale(62), da_center = 37;

    var domain_annotation = svg.append('text')
        .attr('class','annotation_hover')
        .attr('x',da_x)
        .attr('y',yScale(da_center))
        .attr('font-size','.9vw');

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`The three separate domain scores`)

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('provide more clarity ')
        .attr('font-weight', 700)
        .append('tspan')
        .text('for both the ')
        .attr('font-weight', 300);

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`individual and the provider. These scores,`)

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text(`paired with more specific indicators,`)

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('enable targeted improvements')
        .attr('font-weight', 700);

    domain_annotation.append('tspan')
        .attr('x',da_x)
        .attr('dy',line_height)
        .text('throughout the recovery journey.')
        .attr('font-weight', 700);

    svg.selectAll('.annotation_hover').attr('opacity',0);
    } else {
        //mobile annotations
        var x_annotation = xScale(0), y_annotation = -60, font_size = '4.5vw', line_height = '4.7vw';

        // //step 1
        // var annote = 'ann1';
        // var ann1 = svg.append('text')
        //     .attr('class',annote)
        //     .attr('font-size',font_size)
        //     .attr('x',x_annotation)
        //     .attr('y',y_annotation)

        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('Most individuals spend')


        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('their first')
        //     .append('tspan')
        //     .text(' 9 weeks in')
        //     .attr('font-weight', 700)

        // ann1
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('active treatment')
        //     .attr('font-weight', 700);

        // svg.select('#annotation_rect').attr('display',1)

        // // //step 2
        // var annote = 'ann2';
        // var ann2 = svg.append('text')
        //     .attr('class',annote)
        //     .attr('x',x_annotation)
        //     .attr('y',y_annotation)
        //     .attr('font-size',font_size)

        // ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('90% of baseline readings')
        //     .attr('font-weight', 700)

        // ann2
        //     .append('tspan')
        //     .attr('x',x_annotation)
        //     .attr('dy',line_height)
        //     .text('fall in this range');

        // svg.select('#base_rect').attr('display',1)

        //step 3
        // var annote = 'ann3', x_annotation_right = xScale(90);
        // var ann3 = svg.append('text')
        //     .attr('class',annote)
        //     .attr('x',x_annotation_right)
        //     .attr('y',y_annotation)
        //     .attr('font-size',font_size)
        //     .attr('text-anchor','end')

        // ann3
        //     .append('tspan')
        //     .attr('x',x_annotation_right)
        //     .attr('dy',line_height)
        //     .text(`On average, an individual's`)

        // ann3
        //     .append('tspan')
        //     .attr('x',x_annotation_right)
        //     .attr('dy',line_height)
        //     .text('RCI index increases by ')
        //     .append('tspan')
        //     .text(increase+'%')
        //     .attr('font-weight', 700);

        // svg.select('#increase_rect').attr('display',1)

        //step 4
        var annote = 'ann4', x_annotation_middle = xScale(45);
        var ann4 = svg.append('text')
            .attr('class',annote)
            .attr('x',x_annotation_middle)
            .attr('y',y_annotation)
            .attr('font-size',font_size)
            .attr('text-anchor','middle');

        ann4
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`Each RCI Score is calculated based on`)

        ann4
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text('the')
            .append('tspan')
            .text(' personal')
            .attr('font-weight', 700)
            .attr('fill',indicatorColorScale('personal'))
            .append('tspan')
            .text(',')
            .attr('font-weight', 300)
            .attr('fill','black').append('tspan')
            .text(' social')
            .attr('font-weight', 700)
            .attr('fill',indicatorColorScale('social'))
            .append('tspan')
            .text(', and')
            .attr('font-weight', 300)
            .attr('fill','black')
            .append('tspan')
            .text(' cultural')
            .attr('font-weight', 700)
            .attr('fill',indicatorColorScale('cultural'))

        ann4
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`scores an individual receives`);

        var y_annotation_bottom = height+50, multiplier = 20;

        var ann4b = svg.append('text')
            .attr('class',annote)
            .attr('x',x_annotation_middle)
            .attr('y',y_annotation_bottom)
            .attr('font-size',font_size)
            .attr('text-anchor','middle')

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`The three separate domain scores`);

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text('provide more clarity')
            .attr('font-weight', 700)
            .append('tspan')
            .text(' for both the')
            .attr('font-weight', 300)

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .text(`individual and the provider. These`);

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`scores, paired with more specific`)

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`indicators, `)
            .append('tspan')
            .text('enable targeted')

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`improvements throughtout the`)
            .attr('font-weight', 700)

        ann4b
            .append('tspan')
            .attr('x',x_annotation_middle)
            .attr('dy',line_height)
            .text(`recovery journey.`)
            .attr('font-weight', 700);

            
    }


    ////////////////////////////////////
    /////////////// DOM ////////////////
    ////////////////////////////////////F1F2F3
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

    if (window.outerWidth > 900){
    line_group
        .style('pointer-events','all')
        .on("mouseover", function() {
            var hover_lines = '#indicator_group'+id

            // line_group.style('pointer-events','none')
            svg.select(hover_lines).attr('opacity',1)
            .transition()
            .duration(2000);;
            svg.selectAll('.annotation_hover').attr('opacity',1)
            .transition()
            .duration(2000);
            svg.selectAll('.line_group').attr('opacity',0)
            .transition()
            .duration(2000);;
            svg.selectAll('.annotation').attr('opacity',0)
            .transition()
            .duration(2000);
        })
        .on("mouseout", function() {
            var hover_lines = '#indicator_group'+id

            svg.select(hover_lines).attr('opacity',0)
            .transition()
            .duration(2000);;
            svg.selectAll('.annotation_hover').attr('opacity',0)
            .transition()
            .duration(2000);
            svg.selectAll('.line_group').attr('opacity',1)
            .transition()
            .duration(2000);;
            svg.selectAll('.annotation').attr('opacity',1)
            .transition()
            .duration(2000);
            // line_group.style('pointer-events','all')
        }); 

    var indicators = ['y1','y2','y3']

        const indicator_group = svg.append("g")
            .attr('class','indicator_group')
            .attr('id','indicator_group'+id)
            .attr('opacity',0)
    
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
    } 
    });

    //step 4
    if (window.outerWidth <= 900){

        var indicators = ['y1','y2','y3']

        const indicator_group = svg.append("g")
            .attr('class','indicator_group')
            .attr('id','indicator_group_mobile')
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
            .attr("d", line_ind(sumstat.get(1)));

        indicator_group.append("g")
            .selectAll("."+data_map[indicator]+"_circle")
            .data(sumstat.get(1))
            .join("circle")
            .attr('class',data_map[indicator]+"_circle")
            .attr("fill", 'white')
            .attr('cx', d => xScale(d[data_map.x]))
            .attr('cy', d => yScale(d[data_map[indicator]]))
            .attr('r', radius)
            .attr('stroke-width', stroke_width)
            .attr("stroke", indicatorColorScale(data_map[indicator]))
    });

    
    svg.selectAll('.indicator_group').attr('display',1);
    svg.selectAll('.line_group').attr('display','none');
    }

})
