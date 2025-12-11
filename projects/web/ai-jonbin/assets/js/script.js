/**
 * AI Jonbin - Premium Experience JavaScript
 * Advanced animations and interactions
 */

(function() {
    'use strict';

    const CONFIG = {
        scrollOffset: 50,
        particleCount: 60,
        connectionDistance: 150,
        mouseDistance: 200
    };

    const DOM = {
        header: document.querySelector('header'),
        loader: document.getElementById('loader'),
        heroCanvas: document.getElementById('hero-canvas'),
        animatedElements: document.querySelectorAll('[data-animate]'),
    };

    // ==========================================================================
    // Core Initialization
    // ==========================================================================
    function init() {
        if (!DOM.heroCanvas) return; // Guard clause
        
        handleLoader();
        initSmoothScroll();
        initScrollAnimations();
        initHeroCanvas();
        initHeaderEffect();
    }

    // ==========================================================================
    // Loader Exit
    // ==========================================================================
    function handleLoader() {
        if(!DOM.loader) return;
        window.addEventListener('load', () => {
            setTimeout(() => {
                DOM.loader.style.opacity = '0';
                DOM.loader.style.pointerEvents = 'none';
                document.body.classList.add('loaded');
            }, 800);
        });
    }

    // ==========================================================================
    // Header Blur Effect
    // ==========================================================================
    function initHeaderEffect() {
        if (!DOM.header) return;
        const updateHeader = () => {
            if (window.scrollY > CONFIG.scrollOffset) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }

    // ==========================================================================
    // Advanced Neural Network Canvas Animation
    // ==========================================================================
    function initHeroCanvas() {
        const canvas = DOM.heroCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null };

        // Resize
        const resize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            createParticles();
        };

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = `rgba(79, 172, 254, ${Math.random() * 0.5 + 0.2})`; // Light blue
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse influence
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < CONFIG.mouseDistance) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (CONFIG.mouseDistance - distance) / CONFIG.mouseDistance;
                        const directionX = forceDirectionX * force * 0.6;
                        const directionY = forceDirectionY * force * 0.6;
                        this.vx += directionX;
                        this.vy += directionY;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            const count = (width * height) / 15000; 
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx*dx + dy*dy);

                    if (distance < CONFIG.connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / CONFIG.connectionDistance);
                        ctx.strokeStyle = `rgba(79, 172, 254, ${opacity * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animate);
        }

        // Events
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
        
        resize();
        animate();
    }

    // ==========================================================================
    // Intersection Observer for Scroll Animations
    // ==========================================================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        DOM.animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // Smooth Scroll
    // ==========================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80, // header height offset
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
