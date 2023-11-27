//"Network of Ski Athletes’ Countries"

//create svg
const width4 = 820, height4 = 600;
const svg4 = d3
.select("#graph-container")
.append("svg")
.attr("width", width4)
.attr("height", height4);

//preprocess data
d3.csv("podiums.csv").then(function(data) {
  
  var links = [];
  var hostNationCount = {};
  var linkAppearanceCount = {};

  numPodiumsByNation = d3.rollup(data, v => v.length, d => d.athlete_nation);
  console.log(numPodiumsByNation)

  // Iterate through the data to create the links
  data.forEach(function(d) {
    var source = d.athlete_nation;
    var target = d.Nation;
    
    // Add a link only if both source and target exist to build connections
    if (source && target) {
      var linkId = source + "-" + target;
      if (links.findIndex(function(l) { 
        return l.id === linkId; }) === -1) {
        links.push({ id: linkId, source: source, target: target });
      }
      
      // Increment the appearance count for the link
      // count is used for thickness of links
      if (linkAppearanceCount[linkId]) {
        linkAppearanceCount[linkId]++;
      } else {
        linkAppearanceCount[linkId] = 1;
      }
    }
    //count only the host nations
    if (target) {
      if (hostNationCount[target]) {
        hostNationCount[target]++;
      } else {
        hostNationCount[target] = 1;
      }
    }


  });
  
  // keep only unique links
  var keepLinks = Array.from(new Set(links.map(JSON.stringify)), JSON.parse);

  // the nodes array 
  var nodes = Array.from(new Set(keepLinks.flatMap(
    link => [link.source, link.target]))).map(function(d) {
        grp = "";
        if (hostNationCount[d]) { // group the nodes
            grp = "host";
          } else {
            grp = "ath";
          }
    return { id: d, group: grp }; //add the nodes with id and group
  });

  
// ----- force center -----

var radius_arr = {"host":40, "ath":170}
var force3 = d3.forceSimulation(nodes)
  .force("x", d3.forceX().strength(0.8).x( function(n, i){
      return (n.x + radius_arr[n.group] * Math.cos(2 * Math.PI * i / 20));
  } ))
  .force("y", d3.forceY().strength(0.5).y( function(n, i){
    return (n.y + radius_arr[n.group] * Math.sin(2 * Math.PI * i / 20)); 
} ))
  .force("link", d3.forceLink(keepLinks).id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(-80))
  .force("center", d3.forceCenter(width4 / 2, height4 / 2));


  //create links
  var link = svg4.selectAll(".link")
    .data(keepLinks)
    .enter()
    .append("line")
    .style("stroke", "grey")
    .attr("class", "link")
    .attr("stroke-width", function(d) {
      var linkId = d.id;
      return linkAppearanceCount[linkId] || 1;
    });
    ;
  // Create the nodes
  var node = svg4.selectAll(".node")
    .data(nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", function(d) {
        var nation = d.id;
        if (hostNationCount[nation]) {
          return 10;
        } else {
          return 5;
        }
      })
    .attr("id", d => d.id)
    .attr("fill", function(d) {
      var nation = d.id;
      if (hostNationCount[nation]) {
        return "#F4AD38";
      } else {
        return "#01C3C4";
      }
    })
    ;

  const label = svg4.append("g")
  .attr("class", "labels")
  .selectAll("text")
  .data(nodes)
  .join("text")
  .attr("class", "label")
  .text(d => d.id);

  const radius = 6;
  //  the tick function for the force
  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    // node location on the vis
    node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width4 - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height4 - radius, d.y)); });

    // the label location
    label.attr("x", (d) => d.x + 5)
    .attr("y", (d) => d.y + 5)
    .style("font-size", "10px");
  }

  // force on
  force3.on("tick", ticked);

    var Tooltip = d3.select("#graph-container")
            .append("div")
            .style("opacity", 1)
            .attr("class", "tooltip")
            .style("background-color", "skyblue")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "6px")
            .style("position", "absolute");

    // mouse events
    function mouseOver(event, d) {
      
      var hoveredNode = d3.select(this)
      var nationID = hoveredNode.attr('id');
      var numPodiums = numPodiumsByNation.get(nationID) || 0;
      
      node.style('fill', "#B8B8B8");
      
      //highlight and size up the node if it is hovered on
      d3.select(this)
      .attr("r", function(d) {
        var nation = d.id;
        if (hostNationCount[nation]) {
          return 9;
        } else {
          return 7;
        }
      })
      .style("fill", function(d) {
        var nation = d.id;
        if (hostNationCount[nation]) {
          return "#F4AD38";
        } else {
          return "#01C3C4";
        }
      })
      
      //add tootips
      Tooltip
      .style("opacity", 0.8)
      .style("border", "solid")
      .html(function() {
        if (numPodiums > 0) {
            return "Number of Olympic Podiums:" + numPodiums;
        }
        else {
            return "Winter Olympic Game"
        }
      }
      ) 
      .style("font-size", "20px") 
      .style("left", (event.pageX+5) + "px")
      .style("top", (event.pageY+5) + "px")

    }
    
    // ----- mouse events -----
    function mouseLeave() {
      
      node.style("fill", function(d) {
        var nation = d.id;
        if (hostNationCount[nation]) {
          return "#F4AD38";
        } else {
          return "#01C3C4";
        }
      });
      node.attr("r", function(d) {
        var nation = d.id;
        if (hostNationCount[nation]) {
          return 7;
        } else {
          return 5;
        }
      });
      link.style("stroke", "gray");
      Tooltip.style("opacity", 0);
    }
    //activate node mouse events
    node.on("mouseover", mouseOver)
    .on("mouseout", mouseLeave);

    let zoom = d3.zoom()
    .scaleExtent([0.9, 5])
    .on('zoom', function(event) {
        svg4.selectAll("g")
        .attr('transform', event.transform);
        svg4.selectAll("line")
        .attr('transform', event.transform);
        svg4.selectAll(".node")
        .attr('transform', event.transform);
        svg4.selectAll("tooltip")
        .attr('transform', event.transform);
    });
    svg4.call(zoom);


    //append the title, legends, labels
    svg4.append("text")
    .attr("x", 230)
    .attr("y", 30)
    .attr("font-size", 25)
    .text("Nations in Olympic Winter Game")
    .style("fill","#0C6C62");

    svg4.append("circle")
    .attr("class", "legends")
    .attr("cx", 560)
    .attr("cy", 100)
    .attr("r", 8)
    .attr("fill", "#F4AD38");

    svg4.append("circle")
    .attr("class", "legends")
    .attr("cx", 560)
    .attr("cy", 130)
    .attr("r", 8)
    .attr("fill", "#01C3C4");

    svg4.append("text")
    .attr("x", 580)
    .attr("y", 105)
    .attr("font-size", 16)
    .text("Game Host Countries");

    svg4.append("text")
    .attr("x", 580)
    .attr("y", 135)
    .attr("font-size", 16)
    .text("Medalists’ Nations");
    });

