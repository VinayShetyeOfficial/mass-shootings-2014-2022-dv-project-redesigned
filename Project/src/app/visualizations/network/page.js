"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import VisualizationMenu from "../../components/VisualizationMenu";
import ResetZoomButton from "../../components/ResetZoomButton";
import ToggleButton from "../../components/ToggleButton";
import Legend from "./Legend";
import { states } from "../../../../public/data/states";
import { FaNetworkWired } from "react-icons/fa";
import "./style.css";

// Create inverted state abbreviations map at the component level
const STATE_ABBR = Object.entries(states).reduce((acc, [abbr, fullName]) => {
  acc[fullName] = abbr;
  return acc;
}, {});

export default function NetworkPage() {
  const svgRef = useRef();
  const [menuVisible, setMenuVisible] = useState(true);
  const [viewType, setViewType] = useState("fatal");
  const [isLoaded, setIsLoaded] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const renderVisualization = (nodes, links) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Adjust the mainGroup translation with a larger offset to the right
    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(${width / 2 + 200}, ${height / 2})`); // Increased offset from 100 to 200

    // Get the center point of the viewport - update centerX to match the new offset
    const centerX = width / 2 + 200; // Match the offset from above
    const centerY = height / 2;

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        const transform = event.transform;
        mainGroup.attr(
          "transform",
          `translate(${centerX * transform.k + transform.x},${
            centerY * transform.k + transform.y
          }) scale(${transform.k})`
        );
      });

    // Set initial transform
    svg.call(zoom);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(0.8) // Slightly zoomed out to show the whole network
    );

    // Enhanced color scale with unique neon-like colors for each state
    const colorScale = d3
      .scaleOrdinal()
      .range([
        "#00ffff",
        "#ff1493",
        "#7fff00",
        "#ff4500",
        "#9400d3",
        "#00ff7f",
        "#ff69b4",
        "#1e90ff",
        "#ffd700",
        "#ff00ff",
        "#00ced1",
        "#ff6347",
        "#32cd32",
        "#8a2be2",
        "#adff2f",
        "#4682b4",
        "#daa520",
        "#ff00ff",
        "#ff4500",
        "#ff69b4",
      ]);

    // Calculate node degrees and values
    const nodeDegree = {};
    links.forEach((link) => {
      nodeDegree[link.source] = (nodeDegree[link.source] || 0) + 1;
      nodeDegree[link.target] = (nodeDegree[link.target] || 0) + 1;
    });

    const scaleRadius = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(nodeDegree)))
      .range([4, 15]);

    // Create container for links
    const linkGroup = mainGroup.append("g").attr("transform", "translate(0,0)");

    // Create curved links
    const linkElements = linkGroup
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "stroke",
        (d) =>
          d.type === "state-state"
            ? "rgba(255, 255, 255, 0.6)" // White color for state-state links
            : "rgba(50, 50, 50, 0.9)" // Dark gray for city-state links
      )
      .attr("stroke-opacity", (d) => (d.type === "state-state" ? 0.6 : 0.5)) // Reduced opacity for city-state links
      .attr("stroke-width", (d) => (d.type === "state-state" ? 2 : 0.5)) // Thinner lines for city connections
      .attr("fill", "none")
      .style("filter", (d) =>
        d.type === "state-state"
          ? "none"
          : "drop-shadow(0 0 0.5px rgba(255,255,255,0.3))"
      ) // Subtle light shadow for contrast
      .attr("marker-end", (d) =>
        d.type === "state-state" ? null : "url(#city-marker)"
      );

    // Create container for nodes
    const nodeGroup = mainGroup.append("g").attr("transform", "translate(0,0)");

    // Enhanced nodes
    const nodeElements = nodeGroup
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", (d) => `node ${d.type}`)
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Main circles with enhanced styling
    nodeElements
      .append("circle")
      .attr("r", (d) =>
        d.type === "state" ? 18 : scaleRadius(nodeDegree[d.id] || 0)
      )
      .attr("fill", (d) =>
        d.type === "state" ? "#000000" : colorScale(d.parent)
      )
      .attr("stroke", (d) => (d.type === "state" ? "none" : "#ffffff"))
      .attr("stroke-width", (d) => (d.type === "state" ? 0 : 0.5))
      .attr("stroke-opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this).attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 0.5);
      });

    // Add a subtle glow effect for city nodes
    nodeElements
      .filter((d) => d.type === "city")
      .append("circle")
      .attr("r", (d) => scaleRadius(nodeDegree[d.id] || 0) + 2)
      .attr("fill", "none")
      .attr("stroke", (d) => d3.color(colorScale(d.parent)).brighter(0.8))
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3)
      .attr("filter", "url(#glow)");

    // Add glow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // State labels with background
    const stateLabels = nodeElements
      .filter((d) => d.type === "state")
      .append("g")
      .attr("class", "state-label");

    stateLabels
      .append("text")
      .text((d) => {
        // Find the abbreviation by looking up the full name in states object
        const abbr = Object.entries(states).find(
          ([_, stateName]) => stateName === d.id
        )?.[0];
        return abbr || d.id;
      })
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#00ffff")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.4)");

    // Tooltip styling
    nodeElements
      .on("mouseover", (event, d) => {
        const [x, y] = d3.pointer(event, document.body);

        let content;
        if (d.type === "state") {
          const cityCount = nodes.filter((n) => n.parent === d.id).length;
          const totalFatalities = nodes
            .filter((n) => n.parent === d.id)
            .reduce((sum, n) => sum + (n.value || 0), 0);

          content = `
            <div class="font-bold text-lg mb-1">${d.id}</div>
            <div class="text-sm">
              <span class="text-gray-200">Cities/Counties:</span> ${cityCount}<br/>
              <span class="text-gray-200">Total Fatalities:</span> ${totalFatalities}
            </div>
          `;
        } else {
          const cityName = d.id.split("-")[1];
          const stateName = d.id.split("-")[0];
          content = `
            <div class="font-bold text-lg mb-1">${cityName}</div>
            <div class="text-sm">
              <span class="text-gray-200">State:</span> ${stateName}<br/>
              <span class="text-gray-200">Fatalities:</span> ${d.value}
            </div>
          `;
        }

        setTooltipContent(content);
        setTooltipPosition({ x: x, y: y - 20 }); // Adjusted to position above the node
      })
      .on("mouseout", () => {
        setTooltipContent(null);
      });

    // Force Simulation with adjusted parameters for more spacious layout
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => (d.type === "state-state" ? 250 : 10))
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => (d.type === "state" ? -2000 : -100))
      )
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => (d.type === "state" ? 120 : 25))
          .strength(1)
      )
      .force(
        "radial",
        d3
          .forceRadial((d) => (d.type === "state" ? 0 : 150), 0, 0)
          .strength((d) => (d.type === "state" ? 0.2 : 0.7))
      );

    // Custom force for city positioning with more spacious flower pattern
    simulation.force("position", (alpha) => {
      nodes.forEach((node) => {
        if (node.type === "city") {
          const parentState = nodes.find((n) => n.id === node.parent);
          if (parentState) {
            const cities = nodes.filter(
              (n) => n.type === "city" && n.parent === node.parent
            );
            const index = cities.indexOf(node);
            const total = cities.length;

            // Create multiple layers of circles based on index with more spacing
            const layerSize = Math.ceil(Math.sqrt(total * 0.8));
            const layer = Math.floor(index / layerSize);
            const angleOffset = (2 * Math.PI) / layerSize;
            const angle =
              angleOffset * (index % layerSize) + layer * (angleOffset / 2);

            // Increased base radius and layer spacing
            const baseRadius = 100; // Increased from 80 to 100
            const radius = baseRadius + layer * 40; // Increased layer spacing from 30 to 40

            const targetX = parentState.x + radius * Math.cos(angle);
            const targetY = parentState.y + radius * Math.sin(angle);

            node.x += (targetX - node.x) * alpha * 0.4;
            node.y += (targetY - node.y) * alpha * 0.4;
          }
        }
      });
    });

    // Add these drag event handler functions before simulation.on("tick")
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.type !== "state") {
        d.fx = null;
        d.fy = null;
      }
    }

    // Tick function with curved links
    simulation.on("tick", () => {
      linkElements.attr("d", (d) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);

        if (d.type === "state-state") {
          return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        } else {
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        }
      });

      nodeElements.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    setSimulation(simulation);
  };

  const resetNetworkView = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(0, 0).scale(0.8) // Reset to initial transform
      );
    }
  };

  useEffect(() => {
    // Define state neighbors (you can add more as needed)
    const stateNeighbors = {
      California: ["Oregon", "Nevada", "Arizona"],
      Oregon: ["California", "Nevada", "Washington", "Idaho"],
      Washington: ["Oregon", "Idaho"],
      Nevada: ["California", "Oregon", "Idaho", "Arizona", "Utah"],
      Arizona: ["California", "Nevada", "Utah", "New Mexico"],
      Idaho: ["Washington", "Oregon", "Nevada", "Utah", "Wyoming", "Montana"],
      Utah: ["Idaho", "Nevada", "Arizona", "Colorado", "Wyoming"],
      Montana: ["Idaho", "Wyoming", "North Dakota", "South Dakota"],
      Wyoming: [
        "Montana",
        "Idaho",
        "Utah",
        "Colorado",
        "Nebraska",
        "South Dakota",
      ],
      Colorado: [
        "Wyoming",
        "Utah",
        "New Mexico",
        "Oklahoma",
        "Kansas",
        "Nebraska",
      ],
      "New Mexico": ["Arizona", "Colorado", "Oklahoma", "Texas"],
      Texas: ["New Mexico", "Oklahoma", "Arkansas", "Louisiana"],
      Oklahoma: [
        "Colorado",
        "New Mexico",
        "Texas",
        "Arkansas",
        "Missouri",
        "Kansas",
      ],
      Kansas: ["Colorado", "Oklahoma", "Missouri", "Nebraska"],
      Nebraska: [
        "Wyoming",
        "Colorado",
        "Kansas",
        "Missouri",
        "Iowa",
        "South Dakota",
      ],
      "South Dakota": [
        "Montana",
        "Wyoming",
        "Nebraska",
        "Iowa",
        "Minnesota",
        "North Dakota",
      ],
      "North Dakota": ["Montana", "South Dakota", "Minnesota"],
      Minnesota: ["North Dakota", "South Dakota", "Iowa", "Wisconsin"],
      Iowa: [
        "South Dakota",
        "Nebraska",
        "Missouri",
        "Illinois",
        "Wisconsin",
        "Minnesota",
      ],
      Missouri: [
        "Iowa",
        "Nebraska",
        "Kansas",
        "Oklahoma",
        "Arkansas",
        "Illinois",
        "Kentucky",
        "Tennessee",
      ],
      Arkansas: [
        "Missouri",
        "Oklahoma",
        "Texas",
        "Louisiana",
        "Mississippi",
        "Tennessee",
      ],
      Louisiana: ["Texas", "Arkansas", "Mississippi"],
      Wisconsin: ["Minnesota", "Iowa", "Illinois", "Michigan"],
      Illinois: ["Wisconsin", "Iowa", "Missouri", "Kentucky", "Indiana"],
      Michigan: ["Wisconsin", "Indiana", "Ohio"],
      Indiana: ["Michigan", "Illinois", "Kentucky", "Ohio"],
      Ohio: [
        "Michigan",
        "Indiana",
        "Kentucky",
        "West Virginia",
        "Pennsylvania",
      ],
      Kentucky: [
        "Indiana",
        "Illinois",
        "Missouri",
        "Tennessee",
        "Virginia",
        "West Virginia",
        "Ohio",
      ],
      Tennessee: [
        "Kentucky",
        "Missouri",
        "Arkansas",
        "Mississippi",
        "Alabama",
        "Georgia",
        "North Carolina",
        "Virginia",
      ],
      Mississippi: ["Louisiana", "Arkansas", "Tennessee", "Alabama"],
      Alabama: ["Mississippi", "Tennessee", "Georgia", "Florida"],
      Georgia: [
        "Alabama",
        "Tennessee",
        "North Carolina",
        "South Carolina",
        "Florida",
      ],
      Florida: ["Alabama", "Georgia"],
      "South Carolina": ["Georgia", "North Carolina"],
      "North Carolina": ["Tennessee", "Virginia", "South Carolina", "Georgia"],
      Virginia: [
        "Kentucky",
        "Tennessee",
        "North Carolina",
        "West Virginia",
        "Maryland",
        "District of Columbia",
      ],
      "West Virginia": [
        "Ohio",
        "Kentucky",
        "Virginia",
        "Maryland",
        "Pennsylvania",
      ],
      Maryland: ["West Virginia", "Virginia", "Delaware", "Pennsylvania"],
      Delaware: ["Maryland", "Pennsylvania", "New Jersey"],
      Pennsylvania: [
        "New York",
        "New Jersey",
        "Delaware",
        "Maryland",
        "West Virginia",
        "Ohio",
      ],
      "New Jersey": ["Pennsylvania", "Delaware", "New York"],
      "New York": [
        "Vermont",
        "Massachusetts",
        "Connecticut",
        "New Jersey",
        "Pennsylvania",
      ],
      Connecticut: ["New York", "Massachusetts", "Rhode Island"],
      "Rhode Island": ["Connecticut", "Massachusetts"],
      Massachusetts: [
        "Vermont",
        "New Hampshire",
        "Rhode Island",
        "Connecticut",
        "New York",
      ],
      Vermont: ["New York", "New Hampshire", "Massachusetts"],
      "New Hampshire": ["Vermont", "Maine", "Massachusetts"],
      Maine: ["New Hampshire"],
    };

    d3.csv("/data/mass_shootings_geocoded.csv")
      .then((data) => {
        const fatalIncidents = data
          .filter(
            (d) => d["Victims Killed"] && parseInt(d["Victims Killed"]) > 0
          )
          .map((d) => ({
            ...d,
            cityOrCounty: d["City Or County"]
              ? d["City Or County"].trim()
              : "Unknown",
            state: d["State"],
            fatal: d["Victims Killed"],
          }));

        if (fatalIncidents.length === 0) {
          console.warn("No fatal incidents found after filtering.");
          return;
        }

        const dataByState = d3.group(fatalIncidents, (d) => d.state);
        const nodes = [];
        const links = [];

        // Create state nodes and city-state links
        dataByState.forEach((incidents, state) => {
          const stateNode = { id: state, type: "state" };
          nodes.push(stateNode);

          const cities = d3.group(incidents, (d) => d.cityOrCounty);
          cities.forEach((cityIncidents, city) => {
            const fatalities = d3.sum(cityIncidents, (d) => +d.fatal);
            const cityNode = {
              id: `${state}-${city}`,
              type: "city",
              parent: state,
              value: fatalities,
            };
            nodes.push(cityNode);
            links.push({ source: stateNode.id, target: cityNode.id });
          });
        });

        // Add links between neighboring states
        Object.entries(stateNeighbors).forEach(([state, neighbors]) => {
          neighbors.forEach((neighbor) => {
            // Only add the link if both states exist in our dataset
            if (dataByState.has(state) && dataByState.has(neighbor)) {
              links.push({
                source: state,
                target: neighbor,
                type: "state-state", // Add this to differentiate from city-state links
              });
            }
          });
        });

        renderVisualization(nodes, links);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading the CSV:", error);
      });
  }, [viewType]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400">
      {/* Page Title */}
      <h1 className="pt-4 mb-2 text-4xl font-extrabold tracking-wider text-center">
        <div className="inline-flex items-center gap-4 p-4 rounded-lg justify-baseline">
          <FaNetworkWired className="text-5xl text-blue-800" />
          <span className="text-3xl font-bold tracking-widest text-gray-800 drop-shadow-md">
            State-City Network Analysis{" "}
            <span className="text-blue-800">[2014 - 2022]</span>
          </span>
        </div>
      </h1>

      {/* Loading State */}
      {!isLoaded && (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <h1 className="text-3xl font-extrabold text-center text-gray-800">
            Loading Network Visualization...
          </h1>
        </div>
      )}

      {/* Network Visualization */}
      <div className="relative w-full h-[calc(100vh-120px)]">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>

      {/* Controls */}
      {isLoaded && (
        <>
          {menuVisible && (
            <Legend viewType={viewType} setViewType={setViewType} />
          )}
          <VisualizationMenu
            redirectTo="/"
            title="Network"
            isVisible={menuVisible}
          />
          <ToggleButton toggleVisibility={() => setMenuVisible(!menuVisible)} />
          <ResetZoomButton resetNetworkView={resetNetworkView} />
        </>
      )}

      {tooltipContent && (
        <div
          className="absolute z-50 p-3 text-white transform -translate-x-1/2 -translate-y-full bg-black rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: "200px",
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  );
}
