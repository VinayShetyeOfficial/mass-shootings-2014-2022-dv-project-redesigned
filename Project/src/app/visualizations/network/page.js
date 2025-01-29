"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import VisualizationMenu from "../../components/VisualizationMenu";
import ToggleButton from "../../components/ToggleButton";
import Legend from "./Legend";
import { states, stateNeighbors } from "../../../../public/data/states";
import { FaNetworkWired } from "react-icons/fa";
import "./style.css";
import { HashLoader } from "react-spinners";

// Add this console.log right after the imports to debug
console.log("Imported stateNeighbors:", stateNeighbors);
console.log("Imported states:", states);

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
  const [dateRange, setDateRange] = useState({
    start: new Date("2014-01-01T00:00:00.000Z"),
    end: new Date("2022-12-31T23:59:59.999Z"),
  });

  const handleDateRangeChange = (start, end) => {
    // Ensure consistent UTC dates
    const utcStart = new Date(
      Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0
      )
    );

    const utcEnd = new Date(
      Date.UTC(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        23,
        59,
        59,
        999
      )
    );

    setDateRange({ start: utcStart, end: utcEnd });
  };

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
    const colorScale = d3.scaleOrdinal().range([
      // Fatal
      // "#EF4444",
      // Non-Fatal
      // "#3B82F6",
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
      .range([6, 18]);

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
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(255, 255, 255, 0.3)" // Lighter color for state to child links
      )
      .attr("stroke-opacity", (d) => (d.type === "state-state" ? 0.7 : 0.5)) // Lighter opacity for state to child links
      .attr("stroke-width", (d) => (d.type === "state-state" ? 2 : 1.5)) // Adjust thickness if needed
      .attr("fill", "none")
      .style("filter", (d) =>
        d.type === "state-state"
          ? "none"
          : "drop-shadow(0 0 0.5px rgba(255,255,255,0.8))"
      ) // Subtle light shadow for contrast
      .attr("marker-end", (d) =>
        d.type === "state-state" ? null : "url(#city-marker)"
      );

    // Create container for nodes
    const nodeGroup = mainGroup.append("g").attr("transform", "translate(0,0)");

    // Drag event handlers
    const dragstarted = (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    // Enhanced nodes with inner ring for states
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
        d.type === "state" ? 25 : scaleRadius(nodeDegree[d.id] || 0)
      )
      .attr("fill", (d) =>
        d.type === "state" ? "#000000" : colorScale(d.parent)
      )
      .attr("stroke", (d) => (d.type === "state" ? "none" : "#000000"))
      .attr("stroke-width", (d) => (d.type === "state" ? 0 : 1.5))
      .attr("stroke-opacity", 1);

    // Add white inner ring for state nodes
    nodeElements
      .filter((d) => d.type === "state")
      .append("circle")
      .attr("r", 22) // Slightly smaller than the main circle
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8);

    // Add hover effects
    nodeElements
      .selectAll("circle")
      .on("mouseover", function (event, d) {
        const node = d3.select(this.parentNode);
        node
          .select("circle:first-child")
          .transition()
          .duration(200)
          .attr(
            "r",
            d.type === "state" ? 28 : scaleRadius(nodeDegree[d.id] || 0) + 3
          );
        if (d.type === "state") {
          node
            .select("circle:nth-child(2)")
            .transition()
            .duration(200)
            .attr("r", 25);
        }
      })
      .on("mouseout", function (event, d) {
        const node = d3.select(this.parentNode);
        node
          .select("circle:first-child")
          .transition()
          .duration(200)
          .attr(
            "r",
            d.type === "state" ? 25 : scaleRadius(nodeDegree[d.id] || 0)
          );
        if (d.type === "state") {
          node
            .select("circle:nth-child(2)")
            .transition()
            .duration(200)
            .attr("r", 22);
        }
      });

    // Add a subtle glow effect for city nodes
    nodeElements
      .filter((d) => d.type === "city")
      .append("circle")
      .attr("r", (d) => scaleRadius(nodeDegree[d.id] || 0) + 3)
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
        // Update tooltip position and content
        const [x, y] = d3.pointer(event, document.body);

        // If hovering over a state node, hide other nodes and links
        if (d.type === "state") {
          // Fade out all nodes
          nodeElements
            .transition()
            .duration(300)
            .style("opacity", (node) =>
              node.id === d.id || node.parent === d.id ? 1 : 0.1
            );

          // Fade out all links
          linkElements
            .transition()
            .duration(300)
            .style("opacity", (link) =>
              link.source.id === d.id || link.target.id === d.id ? 1 : 0.1
            );
        }

        let content;
        if (d.type === "state") {
          const cityCount = nodes.filter((n) => n.parent === d.id).length;
          const totalCount = nodes
            .filter((n) => n.parent === d.id)
            .reduce(
              (sum, n) =>
                sum +
                (viewType === "fatal" ? n.fatalValue : n.injuredValue || 0),
              0
            );

          content = `
            <div class="font-bold text-lg mb-1">${d.id}</div>
            <div class="text-sm">
              <span class="text-gray-200">Cities/Counties:</span> ${cityCount}<br/>
              <span class="text-gray-200">Total ${
                viewType === "fatal" ? "Fatalities" : "Injuries"
              }:</span> ${totalCount}
            </div>
          `;
        } else {
          const cityName = d.id.split("-")[1];
          const stateName = d.id.split("-")[0];
          const value = viewType === "fatal" ? d.fatalValue : d.injuredValue;

          content = `
            <div class="font-bold text-lg mb-1">${cityName}</div>
            <div class="text-sm">
              <span class="text-gray-200">State:</span> ${stateName}<br/>
              <span class="text-gray-200">${
                viewType === "fatal" ? "Fatalities" : "Injuries"
              }:</span> ${value}
            </div>
          `;
        }

        setTooltipContent(content);
        setTooltipPosition({ x: x, y: y - 20 });
      })
      .on("mouseout", (event, d) => {
        // Reset all nodes and links to full opacity
        nodeElements.transition().duration(300).style("opacity", 1);

        linkElements
          .transition()
          .duration(300)
          .style("opacity", (d) => (d.type === "state-state" ? 0.7 : 0.5)); // Reset to original opacity values

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
          .distance((d) => (d.type === "state-state" ? 250 : 40))
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => (d.type === "state" ? -2000 : -150)) // Even stronger repulsion
      )
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => (d.type === "state" ? 120 : 20)) // Larger collision radius
          .strength(1)
          .iterations(2) // Added iterations for better collision detection
      )
      .force(
        "radial",
        d3
          .forceRadial((d) => (d.type === "state" ? 0 : 70), 0, 0) // Increased spread radius
          .strength((d) => (d.type === "state" ? 0.1 : 0.15)) // Further reduced to let repulsion dominate
      );

    // Enhanced forces to separate nodes with the same parent
    simulation.force(
      "x",
      d3
        .forceX((d) => {
          return d.type === "city" ? (Math.random() - 0.5) * 80 : 0; // Increased random spread
        })
        .strength(0.2)
    ); // Increased strength

    simulation.force(
      "y",
      d3
        .forceY((d) => {
          return d.type === "city" ? (Math.random() - 0.5) * 80 : 0; // Increased random spread
        })
        .strength(0.2)
    ); // Increased strength

    // Custom force for city positioning with fixed link lengths
    simulation.force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => (d.type === "state-state" ? 250 : 40))
    );

    // Tick function with fixed link lengths
    simulation.on("tick", () => {
      linkElements.attr("d", (d) => {
        // For state-state links
        if (d.type === "state-state") {
          return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        }

        // For state-city/county links
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;

        // Calculate the direction vector
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return "M0,0L0,0";

        // Normalize the direction vector
        const unitDx = dx / length;
        const unitDy = dy / length;

        // State node radius is 25, city node radius varies but is small
        const sourceRadius = 25;
        const targetRadius = 8;

        // Start from the edge of the source node and end at the edge of the target node
        const startX = sourceX + unitDx * sourceRadius;
        const startY = sourceY + unitDy * sourceRadius;
        const endX = targetX - unitDx * targetRadius;
        const endY = targetY - unitDy * targetRadius;

        return `M${startX},${startY}L${endX},${endY}`;
      });

      nodeElements.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    setSimulation(simulation);
  };

  const resetNetworkView = useCallback(() => {
    console.log("resetNetworkView called"); // Debug log
    if (svgRef.current) {
      console.log("svg ref exists"); // Debug log
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Reset zoom and position with smooth transition
      svg
        .transition()
        .duration(750)
        .call(
          d3.zoom().transform,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
        );

      // Reset simulation if it exists
      if (simulation) {
        console.log("simulation exists, resetting"); // Debug log
        // Reset node positions to center
        simulation.force("center", d3.forceCenter(0, 0));
        simulation.force("x", d3.forceX(0).strength(0.1));
        simulation.force("y", d3.forceY(0).strength(0.1));

        // Restart simulation with high alpha to reorganize nodes
        simulation.alpha(1).restart();
      }
    }
  }, [simulation]); // Add simulation as dependency

  useEffect(() => {
    d3.csv("/data/mass_shootings_geocoded_cleaned.csv")
      .then((data) => {
        console.log("Raw data length:", data.length);

        const incidents = data
          .map((d) => {
            // Parse date in "Month DD, YYYY" format
            const date = new Date(d["Incident Date"]);
            const utcDate = new Date(
              Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0,
                0,
                0,
                0
              )
            );

            return {
              ...d,
              date: utcDate,
              cityOrCounty: d["City Or County"]
                ? d["City Or County"].trim()
                : "Unknown",
              state: d["State"],
              fatalValue: parseInt(d["Victims Killed"]) || 0,
              injuredValue: parseInt(d["Victims Injured"]) || 0,
            };
          })
          .filter((d) => {
            const isInRange =
              d.date >= dateRange.start && d.date <= dateRange.end;
            console.log("Date:", d.date.toISOString(), "In range:", isInRange);
            return isInRange;
          });

        console.log("Filtered data length:", incidents.length);

        if (incidents.length === 0) {
          console.warn("No incidents found in the selected date range");
          return;
        }

        const dataByState = d3.group(incidents, (d) => d.state);
        const nodes = [];
        const links = [];

        // Create state nodes and city-state links
        dataByState.forEach((incidents, state) => {
          const stateNode = { id: state, type: "state" };
          nodes.push(stateNode);

          const cities = d3.group(incidents, (d) => d.cityOrCounty);
          cities.forEach((cityIncidents, city) => {
            const fatalValue = d3.sum(cityIncidents, (d) => d.fatalValue);
            const injuredValue = d3.sum(cityIncidents, (d) => d.injuredValue);
            const cityNode = {
              id: `${state}-${city}`,
              type: "city",
              parent: state,
              fatalValue,
              injuredValue,
            };
            nodes.push(cityNode);
            links.push({ source: stateNode.id, target: cityNode.id });
          });
        });

        // Add links between neighboring states
        if (stateNeighbors) {
          Object.entries(stateNeighbors).forEach(([state, neighbors]) => {
            neighbors.forEach((neighbor) => {
              // Only add the link if both states exist in our dataset
              if (dataByState.has(state) && dataByState.has(neighbor)) {
                links.push({
                  source: state,
                  target: neighbor,
                  type: "state-state",
                });
              }
            });
          });
        }

        renderVisualization(nodes, links);

        // Add random timeout between 1-7 seconds
        const randomTimeout = Math.floor(Math.random() * 6000) + 1000; // Random between 1000-7000ms
        setTimeout(() => {
          setIsLoaded(true);
        }, randomTimeout);
      })
      .catch((error) => {
        console.error("Error loading the CSV:", error);
      });
  }, [viewType, dateRange]);

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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
          <HashLoader
            color="#1e40af"
            size={60}
            speedMultiplier={1.2}
            aria-label="Loading Network Visualization"
          />
          <span className="font-semibold text-blue-800 font-lg loading-text">
            Building Network&nbsp;
          </span>
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
            <Legend
              viewType={viewType}
              setViewType={setViewType}
              onDateRangeChange={handleDateRangeChange}
            />
          )}
          <VisualizationMenu
            redirectTo="/"
            title="Network"
            isVisible={menuVisible}
          />
          <ToggleButton toggleVisibility={() => setMenuVisible(!menuVisible)} />
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
