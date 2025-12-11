// Metro Map JavaScript

let stations = [];
let routes = [];

document.addEventListener('DOMContentLoaded', function() {
    // Static image only view; do nothing
});

function loadMapData() {
    // Load stations
    fetch('api/get_stations.php')
        .then(response => response.json())
        .then(data => {
            stations = data;
            loadRoutes();
        })
        .catch(error => {
            console.error('Error loading stations:', error);
        });
}

function loadRoutes() {
    fetch('api/get_routes.php')
        .then(response => response.json())
        .then(data => {
            routes = data;
            drawMap();
        })
        .catch(error => {
            console.error('Error loading routes:', error);
        });
}

function drawMap() {
    const svg = document.getElementById('mapSvg');
    if (!svg) return;
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Add background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#f5f5f5');
    svg.appendChild(bg);
    
    // Set viewBox to fit all stations
    const padding = 80;
    const minX = Math.min(...stations.map(s => s.position_x)) - padding;
    const maxX = Math.max(...stations.map(s => s.position_x)) + padding;
    const minY = Math.min(...stations.map(s => s.position_y)) - padding;
    const maxY = Math.max(...stations.map(s => s.position_y)) + padding;
    
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Hyderabad Metro color scheme
    const lineColors = {
        'Blue': '#0066cc',
        'Red': '#cc0000',
        'Green': '#00cc00',
        'Yellow': '#ffcc00',
        'Purple': '#cc00cc'
    };
    
    // Group routes by line to draw them together
    const routesByLine = {};
    routes.forEach(route => {
        const lineColor = route.line_color || 'Blue';
        if (!routesByLine[lineColor]) {
            routesByLine[lineColor] = [];
        }
        routesByLine[lineColor].push(route);
    });
    
    // Draw routes (lines) grouped by color
    Object.keys(routesByLine).forEach(color => {
        routesByLine[color].forEach(route => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', route.from_x);
            line.setAttribute('y1', route.from_y);
            line.setAttribute('x2', route.to_x);
            line.setAttribute('y2', route.to_y);
            line.setAttribute('stroke', lineColors[color] || '#666');
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.8');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
        });
    });
    
    // Identify interchange stations (stations that appear on multiple lines)
    const stationCounts = {};
    stations.forEach(s => {
        if (!stationCounts[s.station_name]) {
            stationCounts[s.station_name] = [];
        }
        stationCounts[s.station_name].push(s.line_color);
    });
    
    // Draw stations
    stations.forEach(station => {
        const color = lineColors[station.line_color] || '#666';
        const isInterchange = stationCounts[station.station_name] && stationCounts[station.station_name].length > 1;
        
        // Station circle (outer ring) - larger for interchange stations
        const radius = isInterchange ? 15 : 12;
        const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerCircle.setAttribute('cx', station.position_x);
        outerCircle.setAttribute('cy', station.position_y);
        outerCircle.setAttribute('r', radius);
        outerCircle.setAttribute('fill', '#fff');
        outerCircle.setAttribute('stroke', color);
        outerCircle.setAttribute('stroke-width', isInterchange ? '4' : '3');
        outerCircle.setAttribute('class', 'station');
        outerCircle.setAttribute('title', `${station.station_name} (${station.station_code})${isInterchange ? ' - Interchange' : ''}`);
        svg.appendChild(outerCircle);
        
        // Station circle (inner) - different style for interchange
        const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerCircle.setAttribute('cx', station.position_x);
        innerCircle.setAttribute('cy', station.position_y);
        innerCircle.setAttribute('r', isInterchange ? '8' : '6');
        innerCircle.setAttribute('fill', color);
        svg.appendChild(innerCircle);
        
        // Add interchange indicator (ring)
        if (isInterchange) {
            const interchangeRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            interchangeRing.setAttribute('cx', station.position_x);
            interchangeRing.setAttribute('cy', station.position_y);
            interchangeRing.setAttribute('r', '18');
            interchangeRing.setAttribute('fill', 'none');
            interchangeRing.setAttribute('stroke', '#333');
            interchangeRing.setAttribute('stroke-width', '2');
            interchangeRing.setAttribute('stroke-dasharray', '3,3');
            svg.appendChild(interchangeRing);
        }
        
        // Station label background
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', station.position_x - 40);
        labelBg.setAttribute('y', station.position_y - 35);
        labelBg.setAttribute('width', '80');
        labelBg.setAttribute('height', '20');
        labelBg.setAttribute('fill', '#fff');
        labelBg.setAttribute('stroke', color);
        labelBg.setAttribute('stroke-width', '1');
        labelBg.setAttribute('rx', '3');
        svg.appendChild(labelBg);
        
        // Station name
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', station.position_x);
        text.setAttribute('y', station.position_y - 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333');
        text.textContent = station.station_name;
        svg.appendChild(text);
        
        // Station code
        const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        codeText.setAttribute('x', station.position_x);
        codeText.setAttribute('y', station.position_y + 30);
        codeText.setAttribute('text-anchor', 'middle');
        codeText.setAttribute('font-size', '10');
        codeText.setAttribute('fill', '#666');
        codeText.textContent = `(${station.station_code})`;
        svg.appendChild(codeText);
    });
    
    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', (minX + maxX) / 2);
    title.setAttribute('y', minY + 30);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#333');
    title.textContent = 'Hyderabad Metro Network';
    svg.appendChild(title);
}

