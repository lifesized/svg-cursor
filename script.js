const container = document.getElementById('patternContainer');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

// Set initial SVG attributes
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');
container.appendChild(svg);

function updatePattern() {
  // Clear previous pattern
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  // Get aspect ratio
  const aspectRatioSelect = document.getElementById('aspectRatio');
  const customAspectRatio = document.getElementById('customAspectRatio');
  let aspectRatio = 1;

  if (aspectRatioSelect.value === 'custom') {
    aspectRatio = parseFloat(customAspectRatio.value);
  } else {
    const [width, height] = aspectRatioSelect.value.split(':');
    aspectRatio = parseFloat(width) / parseFloat(height);
  }

  // Set container height based on aspect ratio
  const containerWidth = 800; // Fixed width
  const containerHeight = containerWidth * (1 / aspectRatio);
  
  container.style.width = `${containerWidth}px`;
  container.style.height = `${containerHeight}px`;

  // Set SVG viewBox
  svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const patternType = document.getElementById('patternType').value;
  const sizeGradient = document.getElementById('sizeGradient').value;
  const size = parseFloat(document.getElementById('size').value);
  const spacing = parseFloat(document.getElementById('spacing').value);
  const rotation = parseFloat(document.getElementById('rotation').value);
  const backgroundColor = document.getElementById('backgroundColor').value;
  const shapeColor = document.getElementById('shapeColor').value;
  const opacity = parseFloat(document.getElementById('opacity').value);

  // Update background rect to match new dimensions
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', containerWidth);
  background.setAttribute('height', containerHeight);
  background.setAttribute('fill', backgroundColor);
  svg.appendChild(background);

  // Adjust pattern calculations for new dimensions
  const numColumns = Math.floor(containerWidth / (size + spacing));
  const numRows = Math.floor(containerHeight / (size + spacing));

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numColumns; col++) {
      const x = col * (size + spacing) + size / 2;
      const y = row * (size + spacing) + size / 2;

      // Calculate size based on gradient
      let sizeMultiplier = 1;
      switch (sizeGradient) {
        case 'radial':
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - containerWidth / 2, 2) + Math.pow(y - containerHeight / 2, 2)
          );
          const maxDistance = Math.sqrt(Math.pow(containerWidth / 2, 2) + Math.pow(containerHeight / 2, 2));
          sizeMultiplier = 1 - distanceFromCenter / maxDistance;
          break;
        case 'angular':
          const angle = Math.atan2(y - containerHeight / 2, x - containerWidth / 2);
          sizeMultiplier = (Math.sin(angle) + 1) / 2;
          break;
        case 'wave':
          sizeMultiplier = Math.sin((x + y) / 50) * 0.5 + 0.5;
          break;
        case 'linear':
          sizeMultiplier = 1 - y / containerHeight;
          break;
      }

      const adjustedSize = size * sizeMultiplier;

      let shape;
      switch (patternType) {
        case 'circles':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          shape.setAttribute('cx', x);
          shape.setAttribute('cy', y);
          shape.setAttribute('r', adjustedSize / 2);
          break;
        case 'squares':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shape.setAttribute('x', x - adjustedSize / 2);
          shape.setAttribute('y', y - adjustedSize / 2);
          shape.setAttribute('width', adjustedSize);
          shape.setAttribute('height', adjustedSize);
          break;
        case 'triangles':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          const points = `${x},${y - adjustedSize / 2} ${x - adjustedSize / 2},${
            y + adjustedSize / 2
          } ${x + adjustedSize / 2},${y + adjustedSize / 2}`;
          shape.setAttribute('points', points);
          break;
        case 'lines':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          shape.setAttribute('x1', x - adjustedSize / 2);
          shape.setAttribute('y1', y);
          shape.setAttribute('x2', x + adjustedSize / 2);
          shape.setAttribute('y2', y);
          shape.setAttribute('stroke', shapeColor);
          shape.setAttribute('stroke-width', adjustedSize / 10);
          break;
        case 'plus':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = `M${x},${y - adjustedSize / 2} V${y + adjustedSize / 2} M${
            x - adjustedSize / 2
          },${y} H${x + adjustedSize / 2}`;
          shape.setAttribute('d', d);
          shape.setAttribute('stroke', shapeColor);
          shape.setAttribute('stroke-width', adjustedSize / 10);
          break;
        case 'corner':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const corner = `M${x},${y - adjustedSize / 2} V${y} H${x + adjustedSize / 2}`;
          shape.setAttribute('d', corner);
          shape.setAttribute('stroke', shapeColor);
          shape.setAttribute('stroke-width', adjustedSize / 10);
          shape.setAttribute('fill', 'none');
          break;
        case 'dots':
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          shape.setAttribute('cx', x);
          shape.setAttribute('cy', y);
          shape.setAttribute('r', adjustedSize / 10);
          break;
      }

      shape.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
      if (patternType !== 'lines' && patternType !== 'plus' && patternType !== 'corner') {
        shape.setAttribute('fill', shapeColor);
      }
      shape.setAttribute('fill-opacity', opacity);

      svg.appendChild(shape);
    }
  }

  updateDownloadButton();
}

function updateDownloadButton() {
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadButton = document.getElementById('downloadButton');
  downloadButton.href = svgUrl;
}

// Add event listeners to all controls
document.querySelectorAll('#controls input, #controls select').forEach(control => {
  control.addEventListener('input', updatePattern);
});

// Special handler for aspect ratio
document.getElementById('aspectRatio').addEventListener('change', function () {
  const customAspectRatioContainer = document.getElementById('customAspectRatioContainer');

  if (this.value === 'custom') {
    customAspectRatioContainer.style.display = 'block';
  } else {
    customAspectRatioContainer.style.display = 'none';
  }

  updatePattern();
});

// Initial pattern generation
updatePattern();

// Resize handler
window.addEventListener('resize', updatePattern);
