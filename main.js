// Enhanced Main Application Module
class PortfolioApp {
    constructor() {
        this.tracker = interactionTracker;
        this.evolutionEngine = new EvolutionEngine(this.tracker);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySavedPreferences();
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.createParticles();
        this.animateSkillBars();
        this.animateStats();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                this.scrollToSection(targetSection);
                this.tracker.trackClick('navigation', targetSection);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Project interactions
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                this.tracker.trackClick('projects');
            });
        });

        // CTA buttons
        const exploreBtn = document.getElementById('exploreProjects');
        const contactHeroBtn = document.getElementById('contactHero');
        const projectCtAs = document.querySelectorAll('.project-cta');

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.scrollToSection('projects');
                this.tracker.trackClick('cta');
            });
        }

        if (contactHeroBtn) {
            contactHeroBtn.addEventListener('click', () => {
                this.scrollToSection('contact');
                this.tracker.trackClick('cta');
            });
        }

        projectCtAs.forEach(cta => {
            cta.addEventListener('click', (e) => {
                e.stopPropagation();
                this.tracker.trackClick('projects');
                // In a real app, this would open project details
                this.showProjectModal(e.target.closest('.project-card').dataset.project);
            });
        });

        // Contact form
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit();
                this.tracker.trackClick('contact');
            });
        }

        // Close evolution notice
        const closeNotice = document.getElementById('closeNotice');
        if (closeNotice) {
            closeNotice.addEventListener('click', () => {
                this.hideEvolutionNotice();
            });
        }

        // Menu toggle for mobile
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    
                    // Track section view
                    const section = entry.target.id;
                    this.tracker.trackSectionView(section);
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('loading');
            observer.observe(section);
        });
    }

    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 20;
            const animationDuration = Math.random() * 10 + 15;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}vw`;
            particle.style.animationDelay = `${animationDelay}s`;
            particle.style.animationDuration = `${animationDuration}s`;
            
            container.appendChild(particle);
        }
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const level = skillBar.dataset.level;
                    skillBar.style.width = `${level}%`;
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        this.tracker.trackClick('themeToggle');
        this.tracker.trackThemePreference(isDark ? 'dark' : 'light');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    applySavedPreferences() {
        const data = this.tracker.getData();
        
        // Apply theme preference
        if (data.themePreference === 'dark') {
            document.body.classList.add('dark-theme');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Apply any previous evolutions
        this.evolutionEngine.checkEvolutionRules();
    }

    handleContactSubmit() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !subject || !message) {
            this.showNotification('Please fill in all fields before sending.', 'error');
            return;
        }

        // Simulate form submission
        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        
        // Clear form
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
    }

    showProjectModal(projectId) {
        // In a real app, this would show a detailed project modal
        this.showNotification(`Opening ${projectId} details...`, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    hideEvolutionNotice() {
        const notice = document.getElementById('evolutionNotice');
        if (notice) {
            notice.classList.remove('show');
        }
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    
    // Make app globally available for debugging
    window.portfolioApp = app;
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification-success { border-left: 4px solid #10b981; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-info { border-left: 4px solid #3b82f6; }
        .notification-warning { border-left: 4px solid #f59e0b; }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification-success i { color: #10b981; }
        .notification-error i { color: #ef4444; }
        .notification-info i { color: #3b82f6; }
        .notification-warning i { color: #f59e0b; }
    `;
    document.head.appendChild(style);
});