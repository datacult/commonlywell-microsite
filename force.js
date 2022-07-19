'use strict'

let force = ((data, select = 'provider', color = 'rci_30', selector = '#force') => {

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
    const svgHeight = svgWidth / 2

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

    const layouts = [
        [{x: 0.5, y: 0.5}],
        [{x: 0.2, y: 0.5}, {x: 0.8, y: 0.5}],
        [{x: 0.2, y: 0.2}, {x: 0.8, y: 0.2}, {x: 0.5, y: 0.8}],
        [{x: 0.2, y: 0.2}, {x: 0.8, y: 0.2}, {x: 0.2, y: 0.8}, {x: 0.8, y: 0.8}],
        [{x: 0.2, y: 0.2}, {x: 0.8, y: 0.2}, {x: 0.2, y: 0.8}, {x: 0.8, y: 0.8}, {x: 0.5, y: 0.5}]
    ]

    const options = ['provider','location','gender','race']

    data.forEach(d => {
        d.coords = {}
    });

    let label_coords = []

    for(let option of options){

        const values = Array.from(new Set(data.map(d => d[option])))

        values.forEach(d => {
            label_coords.push([option, d, layouts[values.length-1][values.indexOf(d)]])
        })

        data.forEach(d => {
            d.coords[option] = layouts[values.length-1][values.indexOf(d[option])]
        });

    }

    console.log(label_coords)

    ////////////////////////////////////
    //////////////globals///////////////
    ////////////////////////////////////

    const radius = 5
    
    ////////////////////////////////////
    //////////////scales////////////////
    ////////////////////////////////////

    const xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0,1])
        
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0,1])

    const colorScale = d3.scaleSequential()
        .domain([0,100])
        .interpolator(d3.interpolateViridis)

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
        .attr('fill', d => colorScale(d[color]))
        .attr('cy', d => yScale(d.coords[select]))
        .attr('cx', d => xScale(d.coords[select]))
        .attr('class', 'balls')

    let labels = svg.selectAll('.labels')
        .data(label_coords.filter(d => d[0] == select))
        .join('text')
        .text(d => d[1])
        .attr('text-anchor', "middle")
        .attr('y', d => yScale(d[2].y) - 20)
        .attr('x', d => xScale(d[2].x))
        .attr('class', 'labels')


    var simulation = d3.forceSimulation(data)
        .force('y', d3.forceY(d =>
                yScale(d.coords[select].y)
            ).strength(0.5)
        )
        .force('x', d3.forceX(d => 
                xScale(d.coords[select].x)
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

    function update(val, val2) {

        select = val;
        color = val2;

        labels
        .data(label_coords.filter(d => d[0] == select))
        .join()
        .text(d => d[1])
        .attr('y', d => yScale(d[2].y) - 20)
        .attr('x', d => xScale(d[2].x))

        balls.attr('fill', d => colorScale(d[color]))

        simulation.force('x', d3.forceX(function (d) {
            return xScale(d.coords[select].x)
        }))

        simulation.force('y', d3.forceY(function (d) {
            return yScale(d.coords[select].y)
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

        return select
    }

    return {
        update: update,
    }

})