
var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width2 = 820 - margin.left - margin.right;
var height2 = 700 - margin.top - margin.bottom;
const padding = 60;


// Create the SVG container
var svg2 = d3.select("#barchart-container")
    .append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("resortworldwide.csv").then(function(data) {
    //preprocess data
    data.forEach(d => {
        d.Easy = +d.Easy;
        d.Intermediate = +d.Intermediate;
        d.Difficult = +d.Difficult;
    }); 
    
    resorts_Europe = d3.filter(data, function(d) {
        return (d["Continent"] == "Europe"
        
        )});
    
        // create rollups for 3 categories: easy, intermediate and difficult
    const easySum = d3.rollup(resorts_Europe, v => d3.sum(v, d=>d.Easy), d=>d.Country);
    const intermedSum = d3.rollup(resorts_Europe, v => d3.sum(v, d=>d.Intermediate), d=>d.Country);
    const difficultSum = d3.rollup(resorts_Europe, v => d3.sum(v, d=>d.Difficult), d=>d.Country);
    console.log(easySum)
    const xDomain = Array.from(easySum.keys()).sort();
    const subgroups = Array.from(['Easy','Intermediate','Difficult']);

    //variables for creating interactions
    
    var m = easySum.size;

    var byLevel = [];
    for (let i = 0; i < xDomain.length; i++){
       
        temp = {"Country": xDomain[i],
        "Easy": 0, 
        "Intermediate": 0,
        "Difficult" : 0};
        //add each value to the list
        if(easySum.get(xDomain[i]) != null) {
            temp["Easy"] = easySum.get(xDomain[i]);
        }
        if(intermedSum.get(xDomain[i]) != null) {
            temp["Intermediate"] = intermedSum.get(xDomain[i]);
        }
        if(difficultSum.get(xDomain[i]) != null) {
            temp["Difficult"] = difficultSum.get(xDomain[i]);
        }
        
        byLevel.push(temp)
    }

        // Stack the data
        var stackedData = d3.stack() 
        .keys(subgroups)(byLevel);
        console.log(stackedData[0])
        

        // -------- scales ------------
        var xScale = d3.scaleBand()
            .domain(xDomain)
            .range([padding, width2 - padding])
            .padding(0.1);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(byLevel, function(d) {
                return d.Easy + d.Intermediate + d.Difficult;
            })])
            .range([height2 - padding, padding]);

            
        // Define the ----color scale------- of the categories
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(["#A6D853", "#80B1D3", "#FF7F00"]);

        
        // draw the stacked bars

        var rect = svg2.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("class", "bars")
        .attr("x", (d,i)=> xScale(xDomain[i]))
        .attr("y", (d) => yScale(d[1]))
        .attr("height", function(d) {return yScale(d[0]) - yScale(d[1]);})
        .attr("width",xScale.bandwidth());

     
        function transitionEasy() {
            
            var rect2 = svg2.append("g")
            .selectAll("g")
            .data(stackedData[0])
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .append("rect")
            .attr("class", "bars")
            .attr("x", (d,i)=> xScale(xDomain[i]))
            .attr("y", (d) => yScale(d[1]))
            .attr("height", function(d) {return yScale(d[0]) - yScale(d[1]);})
            .attr("width",xScale.bandwidth())

            rect.transition().duration(500)
            .style("opacity", 0)
            
        }

        //
        function transitionStacked() {
            
            rect.transition().duration(500)
            .style("opacity", 1)
        }
        
        d3.selectAll("input").on("change",change);

        function change() {
            if (this.value === "grouped") transitionEasy();
            else transitionStacked();
        }   

        //add the x,y axis
        var xAxis = d3.axisBottom().scale(xScale);
        var yAxis = d3.axisLeft().scale(yScale);

        svg2.append("g").call(xAxis)
        .attr("transform", `translate(${0}, ${height2 - padding})`)
        .selectAll("text")
        .attr("y", 1)
        .attr("x", -35)
        .attr("transform", "rotate(-60)");

        svg2.append("g").call(yAxis)
        .attr("transform", `translate(${padding}, 0)`);
        
        
        
        // ------title, legend and labels////////////////////
        //////
        ///// /////////////////////////////////////

        svg2.append("text")
        .attr("x", 600)
        .attr("y", 85)
        .attr("font-size", 16)
        .text("Easy");

        svg2.append("text")
        .attr("x", 600)
        .attr("y", 115)
        .attr("font-size", 16)
        .text("Intermediate");

        svg2.append("text")
        .attr("x", 600)
        .attr("y", 145)
        .attr("font-size", 16)
        .text("Difficult");
        
        
        svg2.append("rect")
        .attr("x", 580)
        .attr("y", 73)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill","#A6D853")
        ;

        svg2.append("rect")
        .attr("x", 580)
        .attr("y", 103)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill","#80B1D3")
        ;
        
        svg2.append("rect")
        .attr("x", 580)
        .attr("y", 133)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill","#FF7F00")
        ;

        svg2.append("text")
        .attr("x", 200)
        .attr("y", 20)
        .attr("font-size", 25)
        .text("European Ski Resorts and Difficulties")
        .style("fill","#0C6C62");

        svg2.append("text")
        .attr("x", 690)
        .attr("y", 610)
        .attr("font-size", 16)
        .text("Country");

        svg2.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("font-size", 16)
        .text("Length of runs and slopes(KMS)");
});
