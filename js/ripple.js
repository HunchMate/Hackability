document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('ripple-bg-grid');
  if (!container) return;

  const cellSize = 56;
  const containerWidth = container.parentElement.offsetWidth || window.innerWidth;
  const containerHeight = container.parentElement.offsetHeight || 1200;
  
  const cols = Math.ceil(containerWidth / cellSize);
  const rows = Math.ceil(containerHeight / cellSize);
  const totalCells = rows * cols;
  
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  container.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
  container.style.width = `${cols * cellSize}px`;
  container.style.height = `${rows * cellSize}px`;
  container.style.marginInline = 'auto';
  
  for (let i = 0; i < totalCells; i++) {
    const rowIdx = Math.floor(i / cols);
    const colIdx = i % cols;

    const cell = document.createElement('div');
    cell.className = 'ripple-cell relative border-[0.5px] border-[#3f3f46] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 shadow-[0px_0px_40px_1px_#27272a_inset] cursor-pointer';
    cell.style.backgroundColor = 'rgba(14, 165, 233, 0.3)';
    cell.dataset.row = rowIdx;
    cell.dataset.col = colIdx;

    cell.addEventListener('click', () => {
      triggerRipple(rowIdx, colIdx);
    });

    container.appendChild(cell);
  }

  function triggerRipple(clickedRow, clickedCol) {
    const cells = container.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const distance = Math.hypot(clickedRow - r, clickedCol - c);
      const delay = Math.max(0, distance * 55);
      const duration = 200 + distance * 80;

      cell.style.setProperty('--delay', `${delay}ms`);
      cell.style.setProperty('--duration', `${duration}ms`);
      
      // trigger animation restart
      cell.classList.remove('animate-cell-ripple');
      void cell.offsetWidth; // trigger reflow
      cell.classList.add('animate-cell-ripple');
    }
  }
});
