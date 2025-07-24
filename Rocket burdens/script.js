//Script for rocket burdened 

let selectedBurdenGroup = null;
let svg = document.getElementById('rocket-svg');
let form = document.getElementById('burden-form');

let baseX = 300;
let baseY = 330;
let selectedPosition = null;
let previewGroup = null;

const chainImage = 'Chain.svg';
const burdenImage = 'burden.svg';
const chainSpacing = 15;
const chainSize = 50;
let currentSize = 50;

// 🖱️ Click to preview position
svg.addEventListener('click', function (e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
  selectedPosition = { x: svgPoint.x, y: svgPoint.y };
  updatePreview();
});

// 🎯 Live preview of burden
function updatePreview() {
  if (!selectedPosition) return;
  if (previewGroup) svg.removeChild(previewGroup);

  const text = document.getElementById('burden-text').value || "Preview";
  const sizeLevel = parseInt(document.getElementById('burden-size').value) || 1;
  currentSize = sizeLevel * 50;
  const x = selectedPosition.x;
  const y = selectedPosition.y;

  previewGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const previewImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
  previewImg.setAttribute("href", burdenImage);
  previewImg.setAttribute("width", currentSize);
  previewImg.setAttribute("height", currentSize);
  previewImg.setAttribute("x", x - currentSize / 2);
  previewImg.setAttribute("y", y - currentSize / 2);
  previewImg.setAttribute("opacity", "0.5");
  previewGroup.appendChild(previewImg);

  const previewText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  previewText.setAttribute("x", x);
  previewText.setAttribute("y", y + 5);
  previewText.setAttribute("text-anchor", "middle");
  previewText.setAttribute("fill", "gray");
  previewText.setAttribute("font-size", Math.min(16, currentSize / 8));
  previewText.setAttribute("font-weight", "bold");
  previewText.textContent = text;
  previewGroup.appendChild(previewText);

  svg.appendChild(previewGroup);
}

document.getElementById('burden-text').addEventListener('input', updatePreview);
document.getElementById('burden-size').addEventListener('input', updatePreview);

// ➕ Place burden
form.onsubmit = (e) => {
  e.preventDefault();

  if (!selectedPosition) {
    alert("Please click on the rocket area to place the burden first.");
    return;
  }

  const text = document.getElementById('burden-text').value;
  const sizeLevel = parseInt(document.getElementById('burden-size').value);
  const size = sizeLevel * 50;
  const x = selectedPosition.x;
  const y = selectedPosition.y;

  const burdenGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const burdenId = `burden-${Date.now()}`; // Unique ID
  burdenGroup.setAttribute("id", burdenId);
  burdenGroup.setAttribute("class", "burden");
  burdenGroup.setAttribute("transform", `translate(${x}, ${y})`);
  burdenGroup.dataset.size = size;
  burdenGroup.dataset.text = text;

  // ⛓️ Chain links
  const dx = x - baseX;
  const dy = y - baseY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.floor(distance / chainSpacing);
  const angleRad = Math.atan2(dy, dx);

  for (let i = 1; i < steps; i++) {
    const cx = baseX + (dx * i / steps);
    const cy = baseY + (dy * i / steps);

    const chainImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
    chainImg.setAttribute("href", chainImage);
    chainImg.setAttribute("width", chainSize);
    chainImg.setAttribute("height", chainSize);
    chainImg.setAttribute("x", cx - chainSize / 2);
    chainImg.setAttribute("y", cy - chainSize / 2);
    const degrees = angleRad * 180 / Math.PI + 90;
    chainImg.setAttribute("transform", `rotate(${degrees}, ${cx}, ${cy})`);
    chainImg.setAttribute("class", "chain-link");
    chainImg.setAttribute("data-burden-id", burdenId);
    svg.appendChild(chainImg);
  }

  // ⚪ Burden image
  const burdenSvg = document.createElementNS("http://www.w3.org/2000/svg", "image");
  burdenSvg.setAttribute("href", burdenImage);
  burdenSvg.setAttribute("width", size);
  burdenSvg.setAttribute("height", size);
  burdenSvg.setAttribute("x", -size / 2);
  burdenSvg.setAttribute("y", -size / 2);
  burdenGroup.appendChild(burdenSvg);

  // 🏷️ Label
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", 0);
  label.setAttribute("y", 5);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("fill", "white");
  label.setAttribute("font-size", Math.min(16, size / 8));
  label.setAttribute("font-weight", "bold");
  label.textContent = text;
  burdenGroup.appendChild(label);

  svg.appendChild(burdenGroup);

  // 🗑️ Click-to-delete handler
  burdenGroup.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent deselect on svg click
  // Deselect others
  svg.querySelectorAll(".burden").forEach(b => b.classList.remove("selected"));
  burdenGroup.classList.add("selected");
  selectedBurdenGroup = burdenGroup;
});

// 🧹 Deselect burden when clicking outside
svg.addEventListener("click", () => {
  svg.querySelectorAll(".burden").forEach(b => b.classList.remove("selected"));
  selectedBurdenGroup = null;
});

window.addEventListener("keydown", (e) => {
  if ((e.key === "Delete" || e.key === "Backspace") && selectedBurdenGroup) {
    const burdenId = selectedBurdenGroup.getAttribute("id");

    // Remove all matching chains
    svg.querySelectorAll(`.chain-link[data-burden-id="${burdenId}"]`).forEach(el => el.remove());

    // Remove the burden
    selectedBurdenGroup.remove();
    selectedBurdenGroup = null;
  }
});


  // 🧼 Cleanup
  if (previewGroup) {
    svg.removeChild(previewGroup);
    previewGroup = null;
  }

  selectedPosition = null;
  document.getElementById("click-instruction").innerText =
    `Click on the rocket area to place your burden.`;
  form.reset();
};
