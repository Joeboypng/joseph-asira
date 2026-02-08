// Initialize EmailJS
(function(){
  emailjs.init("uxeMogUBIt8BBaDwW"); // <-- Replace with your EmailJS Public Key
})();

// Contact form submission with EmailJS
document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();

  emailjs.sendForm(
    "4848tech",   // e.g. service_xxxxxx
    "4848tech",  // e.g. template_xxxxxx
    this
  ).then(function(){
      alert("Message sent successfully! Joseph will reply soon 😊");
      document.getElementById("contactForm").reset();
  }, function(error){
      alert("Failed to send message 😢 Please try again.");
      console.log("EmailJS Error:", error);
  });
});


// ===== Particle Background =====
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 120; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5),
    dy: (Math.random() - 0.5)
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animate);
}

animate();
