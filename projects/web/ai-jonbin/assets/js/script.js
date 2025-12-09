/**
 * AI Jonbin - Corporate Website JavaScript
 * Handles animations, interactions, and dynamic effects
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration
    // ==========================================================================
    const CONFIG = {
        animationThreshold: 0.15,
        scrollOffset: 100,
        countDuration: 2000,
        particleCount: 80,
        particleSpeed: 0.5
    };

    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const DOM = {
        loader: document.getElementById('loader'),
        header: document.getElementById('header'),
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        heroCanvas: document.getElementById('hero-canvas'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        statNumbers: document.querySelectorAll('.stat-number[data-count]'),
        contactForm: document.getElementById('contact-form')
    };

    // ==========================================================================
    // Loader
    // ==========================================================================
    function initLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                DOM.loader.classList.add('hidden');
                document.body.style.overflow = '';
                initAnimations();
            }, 1500);
        });
    }

    // ==========================================================================
    // Header Scroll Effect
    // ==========================================================================
    function initHeaderScroll() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            if (scrollY > CONFIG.scrollOffset) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Mobile Navigation
    // ==========================================================================
    function initMobileNav() {
        if (!DOM.navToggle || !DOM.navMenu) return;

        DOM.navToggle.addEventListener('click', () => {
            const isExpanded = DOM.navToggle.getAttribute('aria-expanded') === 'true';

            DOM.navToggle.setAttribute('aria-expanded', !isExpanded);
            DOM.navToggle.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link click
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                DOM.navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.navMenu.classList.contains('active')) {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                DOM.navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ==========================================================================
    // Smooth Scroll
    // ==========================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const headerHeight = DOM.header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ==========================================================================
    // Scroll Animations (Intersection Observer)
    // ==========================================================================
    function initAnimations() {
        if (!DOM.animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: CONFIG.animationThreshold
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;

                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, parseInt(delay));

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // ==========================================================================
    // Counter Animation
    // ==========================================================================
    function initCounters() {
        if (!DOM.statNumbers.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.statNumbers.forEach(counter => {
            observer.observe(counter);
        });
    }

    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = CONFIG.countDuration;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // ==========================================================================
    // Hero Canvas - Neural Network Animation
    // ==========================================================================
    function initHeroCanvas() {
        const canvas = DOM.heroCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let mouseX = 0;
        let mouseY = 0;

        // Set canvas size
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        }

        // Particle class
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed;
                this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Boundary check
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.vx -= (dx / dist) * force * 0.02;
                    this.vy -= (dy / dist) * force * 0.02;
                }

                // Speed limit
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 2) {
                    this.vx = (this.vx / speed) * 2;
                    this.vy = (this.vy / speed) * 2;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 179, 237, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Initialize particles
        function initParticles() {
            particles = [];
            const count = Math.min(CONFIG.particleCount, Math.floor((canvas.width * canvas.height) / 15000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Draw connections between particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.3;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 179, 237, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            drawConnections();

            animationId = requestAnimationFrame(animate);
        }

        // Mouse move handler
        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }

        // Touch move handler
        function handleTouchMove(e) {
            if (e.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.touches[0].clientX - rect.left;
                mouseY = e.touches[0].clientY - rect.top;
            }
        }

        // Event listeners
        window.addEventListener('resize', debounce(resizeCanvas, 250));
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Initialize
        resizeCanvas();
        animate();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationId);
        });

        // Pause animation when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }

    // ==========================================================================
    // Contact Form
    // ==========================================================================
    function initContactForm() {
        if (!DOM.contactForm) return;

        DOM.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>送信中...</span>
                <svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </path>
                </svg>
            `;

            // Simulate form submission (replace with actual API call)
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Success
                showNotification('お問い合わせありがとうございます。内容を確認次第、ご連絡いたします。', 'success');
                DOM.contactForm.reset();
            } catch (error) {
                // Error
                showNotification('送信に失敗しました。時間をおいて再度お試しください。', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ==========================================================================
    // Notification System
    // ==========================================================================
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${type === 'success'
                        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>'
                        : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'}
                </svg>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="閉じる">&times;</button>
        `;

        // Add styles
        const styles = `
            .notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                max-width: 400px;
                padding: 16px 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .notification-success { border-left: 4px solid #10b981; }
            .notification-error { border-left: 4px solid #ef4444; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            .notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            .notification-success .notification-icon { color: #10b981; }
            .notification-error .notification-icon { color: #ef4444; }
            .notification-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #94a3b8;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover { color: #64748b; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;

        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // ==========================================================================
    // Active Navigation Link
    // ==========================================================================
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');

        function updateActiveLink() {
            const scrollY = window.scrollY + DOM.header.offsetHeight + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    DOM.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(updateActiveLink, 100), { passive: true });
    }

    // ==========================================================================
    // Utility Functions
    // ==========================================================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ==========================================================================
    // Initialize Everything
    // ==========================================================================
    function init() {
        initLoader();
        initHeaderScroll();
        initMobileNav();
        initSmoothScroll();
        initCounters();
        initHeroCanvas();
        initContactForm();
        initActiveNavLink();
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
