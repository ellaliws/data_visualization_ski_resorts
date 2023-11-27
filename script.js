//geometric distribution of ski resorts in USA
//preprocess data
d3.csv("./ski_resort_stats.csv").then(function (csvData) {
    console.log(csvData);
    let width = 820;
    let height = 600;

    const svg = d3.select("#map-container")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

    const projection1 = d3.geoAlbersUsa()
    .scale(880) 
    .translate([width/2, height/2]); 

    const pathgeo1 = d3.geoPath().projection(projection1);

    const map = d3.json("./usa.json");

    map.then(function (map) {
        //create rollup
        const ByState = d3.rollup(csvData, v => v.length, d=>d.state);
        
        //correctly count the #resorts per state
        let colorScale = d3.scaleSequentialLog()
                .interpolator(d3.interpolateBlues)
                .domain(d3.extent(Array.from(ByState.values())))
        
                
        svg.selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("d", pathgeo1)
        .attr("fill", function(d) {
            if (ByState.get(d.properties.NAME) != null) {
                return colorScale(ByState.get(d.properties.NAME));
            } 
            else {
                return "#B5B5B5";
            }
            
        })
        .attr("stroke", "#D1D1D1")
        .attr("stroke-width", 1);
        
        
        //Process and add resort_projected from the CSV data
        csvData.forEach(function (d) {
            // parse the attributes that are used for tooltips
            var resort_name = d["resort_name"];
            var summit = d["summit"];
            var acre = d["acres"];
            var runs = d["runs"];
            

            //Create projection on map
            var location = [parseFloat(d.lon), parseFloat(d.lat)];
            var resort_projected = projection1(location);

            var Tooltip = d3.select("#map-container")
            .append("div")
            .style("opacity", 1)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "7px")
            .style("border-radius", "5px")
            .style("padding", "6px")
            .style("position", "absolute");
            

            svg
            .append("circle")
            .attr("class", "myCircles")
            .attr("cx", function() {
                if (resort_projected != null){
                    return resort_projected[0]
                }
                return 1000;
                })
            .attr("cy", function() {
                if (resort_projected != null){
                    return resort_projected[1]
                }
                return 1000;
                })
            .attr("r", 3)
            .style("fill", "#64BC6F")
            .attr("stroke", "yellow")
            .attr("stroke-width", 0.5)
            .attr("fill-opacity", .9)
            .on("mouseover", function (event, d) {

                Tooltip
                .style("opacity", 1)
                .style("border", "solid")
                .html(resort_name + "</br>" 
                + "summit: "+ summit + "</br>" +
                "acres: " + acre + "</br>" +
                "number of runs: " + runs) 
                //  show the resort name
                .style("font-size", "10px") 
                .style("left", (event.pageX+5) + "px")
                .style("top", (event.pageY+5) + "px")
            
                d3.select(this)
                .attr("r", 5)
                .style("fill", "coral");
            })
            .on("mouseout", function (event, d) {
                Tooltip
                .style("opacity", 0);

                d3.select(this)
                    .attr("r", 3)
                    .style("fill", "#64BC6F");
            });
        });


        //Create Color scale for legend
        const colorScale2 = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, 1]);
        
        const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

        // Add color stops to the gradient
        const numStops = 20;
        for (let i = 0; i < numStops; i++) {
            gradient.append("stop")
            .attr("offset", `${i * (100 / (numStops - 1))}%`)
            .style("stop-color", colorScale2(i / (numStops - 1)));
        }

       svg.append("rect")
       .attr("x", width/2 - 100)
       .attr("y", 540)
       .attr("width", 200)
       .attr("height", 20)
       .style("fill", "url(#legendGradient)");

    // Append text labels for the legend

    svg.append("text")
       .attr("x", 200)
       .attr("y", 50)
       .attr("font-size", 25)
       .text("Geometric Distribution of Ski Resorts in USA")
       .style("fill","#0C6C62");

    //legend title
    svg.append("text")
       .attr("x", 310)
       .attr("y", 530)
       .text("number of ski-resorts per state");
    
    svg.append("text")
    .attr("x", 300)
    .attr("y", 580)
    .text(d3.min(Array.from(ByState.values()))+"");

    svg.append("text")
       .attr("x", 500)
       .attr("y", 580)
       .text(d3.max(Array.from(ByState.values()))+"");
    
    svg.append("text")
    .attr("x", 390)
    .attr("y", 580)
    .text(
        parseInt((d3.max(Array.from(ByState.values())) 
        - d3.min(Array.from(ByState.values()))) / 2) + ""
    )
    });
});

