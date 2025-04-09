const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let bullets = [];
let debris = [];
let stars = [];
let letters = [];
let score = 0;
let legendHidden = false;
const linkRanges = []; // clickable link areas

const shipImage = new Image();
shipImage.src = "assets/ship.png";

const ship = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 48,
  height: 48,
  speed: 6
};

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 1.5 + 0.5
    });
  }
}

function createLetters(lines) {
  letters = [];
  const spacing = 26;
  const lineHeight = 36;
  const startX = 40;
  const startY = 60;
  linkRanges.length = 0;

  for (let l = 0; l < lines.length; l++) {
    const y = startY + l * lineHeight;
    for (let i = 0; i < lines[l].text.length; i++) {
      const x = startX + i * spacing;
      letters.push({
        char: lines[l].text[i],
        x,
        y,
        hit: false,
        url: lines[l].url ? lines[l].url : null,
        linkIndex: lines[l].url ? linkRanges.length : null
      });
      if (lines[l].url) {
        if (!linkRanges[lines[l].url]) linkRanges.push({ url: lines[l].url, range: [] });
        linkRanges[linkRanges.length - 1].range.push({ x, y, char: lines[l].text[i] });
      }
    }
  }
}

function drawStars() {
  for (let s of stars) {
    ctx.fillStyle = "white";
    ctx.fillRect(s.x, s.y, s.size, s.size);
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }
}

function drawShip() {
  if (shipImage.complete) {
    ctx.drawImage(shipImage, ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);
  }
}

function drawBullets() {
  ctx.fillStyle = "white";
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    ctx.fillRect(b.x, b.y, 2, 10);
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  }
}

function drawLetters() {
  ctx.font = "24px monospace";
  ctx.textAlign = "left";
  for (let l of letters) {
    if (!l.hit) {
      ctx.fillStyle = l.url ? "#55f" : "white";
      ctx.fillText(l.char, l.x, l.y);
    }
  }
}

function drawDebris() {
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i];
    ctx.fillStyle = d.color;
    ctx.fillRect(d.x, d.y, 2, 2);
    d.x += d.dx;
    d.y += d.dy;
    d.life--;
    if (d.life <= 0) debris.splice(i, 1);
  }
}

function shoot() {
  bullets.push({ x: ship.x, y: ship.y, speed: 6 });
}

function handleInput() {
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) ship.x -= ship.speed;
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) ship.x += ship.speed;
  if (ship.x < 20) ship.x = 20;
  if (ship.x > canvas.width - 20) ship.x = canvas.width - 20;
}

function detectHits() {
  for (let b = bullets.length - 1; b >= 0; b--) {
    for (let l of letters) {
      if (!l.hit && Math.abs(bullets[b].x - l.x) < 20 && Math.abs(bullets[b].y - l.y) < 30) {
        l.hit = true;
        bullets.splice(b, 1);
        for (let i = 0; i < 8; i++) {
          debris.push({
            x: l.x,
            y: l.y,
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 4 - 2,
            life: 30,
            color: ["white", "gray"][Math.floor(Math.random() * 2)]
          });
        }
        score++;
        break;
      }
    }
  }
}

function drawScore() {
  if (score > 0) {
    ctx.font = "20px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 30);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();
  drawShip();
  drawBullets();
  drawLetters();
  drawDebris();
  drawScore();
  handleInput();
  detectHits();
  requestAnimationFrame(animate);
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const link of linkRanges) {
    for (const box of link.range) {
      if (x > box.x && x < box.x + 20 && y > box.y - 20 && y < box.y) {
        window.open(link.url, "_blank");
        return;
      }
    }
  }
});

window.addEventListener("keydown", e => {
  keys[e.key] = true;
  if ((e.key === " " || e.key === "ArrowUp") && !keys[e.key + "_held"]) {
    shoot();
    keys[e.key + "_held"] = true;
  }
  if (e.key === "r" || e.key === "R") {
    bullets = [];
    debris = [];
    createLetters(letterData);
  }
  if (!legendHidden && ["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " ", "ArrowUp"].includes(e.key)) {
    document.getElementById("legend").style.display = "none";
    legendHidden = true;
  }
});

window.addEventListener("keyup", e => {
  keys[e.key] = false;
  keys[e.key + "_held"] = false;
});

createStars(100);
const letterData = [
  { text: "Ryan Gillespie" },
  { text: "Systems & DevOps Engineer" },
  { text: "" },
  { text: "Engineer by trade, hacker at heart." },
  { text: "I like clean systems and weird problems." },
  { text: "" },
  { text: "ryan@agffa.ca", url: "mailto:ryan@agffa.ca" },
  { text: "github.com/ItsRyanG", url: "https://github.com/ItsRyanG" },
  { text: "LinkedIn", url: "https://www.linkedin.com/in/ryan-g-3b97a1152/" }
];
createLetters(letterData);

if (shipImage.complete) {
  animate();
} else {
  shipImage.onload = () => animate();
}
