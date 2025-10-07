// js/app.js - Combined version to avoid dependency issues

// ===== INTERACTION TRACKER =====
class InteractionTracker {
    constructor() {
        this.data = this.loadData() || {
            clicks: {
                projects: 0,
                contact: 0,
                about: 0,
                themeToggle: 0,
                social: 0,
                cta: 0,
                navigation: 0
            },
            scrollDepth: 0,
            timeOnSections: {
                home: 0,
                about: 0,
                projects: 0,
                contact: 0
            },
            themePreference: 'light',
            lastVisit: null,
            visitCount: 0,
            sectionViews: {
                home: 0,
                about: 0,
                projects: 0,
                contact: 0
            },
            interactions: []
        };
        
        this.currentSection = 'home';
        this.sectionStartTime = Date.now();
        this.maxScrollDepth = 0;
        this.init();
    }

    init() {
        this.setupScrollTracking();
        this.setupSectionTracking();
        this.incrementVisitCount();
        this.setupInteractionTracking();
    }

    setupScrollTracking() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            const scrollDepth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
            if (scrollDepth > this.maxScrollDepth) {
                this.maxScrollDepth = scrollDepth;
                this.data.scrollDepth = Math.round(this.maxScrollDepth * 100);
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackInteraction('scroll', { depth: this.data.scrollDepth });
            }, 500);
        });
    }

    setupSectionTracking() {
        const sections = document.querySelectorAll('section[data-section]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateSectionTime();
                    this.currentSection = entry.target.id;
                    this.sectionStartTime = Date.now();
                    this.trackSectionView(this.currentSection);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => {
            observer.observe(section);
        });

        window.addEventListener('beforeunload', () => {
            this.updateSectionTime();
            this.saveData();
        });

        setInterval(() => this.saveData(), 30000);
    }

    setupInteractionTracking() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const elementData = {
                tag: target.tagName.toLowerCase(),
                class: target.className,
                id: target.id,
                text: target.textContent?.slice(0, 50),
                position: {
                    x: e.clientX,
                    y: e.clientY
                },
                timestamp: Date.now()
            };
            
            this.data.interactions.push({
                type: 'click',
                ...elementData
            });
            
            if (this.data.interactions.length > 1000) {
                this.data.interactions = this.data.interactions.slice(-1000);
            }
        });
    }

    updateSectionTime() {
        const now = Date.now();
        const timeSpent = now - this.sectionStartTime;
        this.data.timeOnSections[this.currentSection] += timeSpent;
        this.sectionStartTime = now;
    }

    trackSectionView(section) {
        if (this.data.sectionViews[section] !== undefined) {
            this.data.sectionViews[section]++;
        }
        this.trackInteraction('section_view', { section });
    }

    trackClick(type, target = null, metadata = {}) {
        if (this.data.clicks[type] !== undefined) {
            this.data.clicks[type]++;
        }
        
        if (target && this.data.clicks[target] !== undefined) {
            this.data.clicks[target]++;
        }
        
        this.trackInteraction('click', { type, target, ...metadata });
        this.saveData();
    }

    trackInteraction(type, data = {}) {
        this.data.interactions.push({
            type,
            timestamp: Date.now(),
            ...data
        });
        
        if (this.data.interactions.length > 1000) {
            this.data.interactions = this.data.interactions.slice(-1000);
        }
    }

    trackThemePreference(preference) {
        this.data.themePreference = preference;
        this.trackInteraction('theme_change', { preference });
        this.saveData();
    }

    incrementVisitCount() {
        const today = new Date().toDateString();
        if (this.data.lastVisit !== today) {
            this.data.visitCount++;
            this.data.lastVisit = today;
            this.trackInteraction('visit');
            this.saveData();
        }
    }

    getEngagementScore() {
        const clicks = Object.values(this.data.clicks).reduce((a, b) => a + b, 0);
        const time = Object.values(this.data.timeOnSections).reduce((a, b) => a + b, 0) / 1000;
        const scroll = this.data.scrollDepth;
        
        return (clicks * 0.3) + (time * 0.4) + (scroll * 0.3);
    }

    getPopularSection() {
        const sections = Object.entries(this.data.timeOnSections);
        return sections.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    saveData() {
        try {
            localStorage.setItem('portfolioInteractionData', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save interaction data:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('portfolioInteractionData');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Could not load interaction data:', e);
            return null;
        }
    }

    getData() {
        return this.data;
    }

    resetData() {
        this.data = {
            clicks: {
                projects: 0,
                contact: 0,
                about: 0,
                themeToggle: 0,
                social: 0,
                cta: 0,
                navigation: 0
            },
            scrollDepth: 0,
            timeOnSections: {
                home: 0,
                about: 0,
                projects: 0,
                contact: 0
            },
            sectionViews: {
                home: 0,
                about: 0,
                projects: 0,
                contact: 0
            },
            themePreference: 'light',
            lastVisit: new Date().toDateString(),
            visitCount: 1,
            interactions: []
        };
        this.saveData();
        return this.data;
    }
}

// ===== EVOLUTION ENGINE =====
class EvolutionEngine {
    constructor(interactionTracker) {
        this.tracker = interactionTracker;
        this.evolutionHistory = this.loadEvolutionHistory();
        this.evolutionRules = this.setupEvolutionRules();
        this.lastAppliedTimes = new Map();
        this.currentEvolutions = new Set();
        this.init();
    }

    init() {
        this.checkEvolutionRules();
        setInterval(() => this.checkEvolutionRules(), 10000);
        
        document.addEventListener('click', () => {
            setTimeout(() => this.checkEvolutionRules(), 1000);
        });
    }

    setupEvolutionRules() {
        return [
            {
                name: 'projects_priority',
                condition: (data) => 
                    data.clicks.projects > data.clicks.about + 2 && 
                    data.timeOnSections.projects > data.timeOnSections.about,
                action: () => this.moveProjectsUp(),
                cooldown: 30000
            },
            {
                name: 'cta_optimization',
                condition: (data) => data.clicks.cta > 3 || data.clicks.contact > 5,
                action: () => this.optimizeCTA(),
                cooldown: 45000
            },
            {
                name: 'dark_theme_default',
                condition: (data) => data.clicks.themeToggle > 1 && data.themePreference === 'dark',
                action: () => this.setDarkThemeDefault(),
                cooldown: 60000
            },
            {
                name: 'project_highlight',
                condition: (data) => data.clicks.projects > 8,
                action: () => this.highlightPopularProject(),
                cooldown: 25000
            },
            {
                name: 'content_reveal',
                condition: (data) => data.scrollDepth > 70,
                action: () => this.revealAdditionalContent(),
                cooldown: 30000
            }
        ];
    }

    checkEvolutionRules() {
        const data = this.tracker.getData();
        
        this.evolutionRules.forEach(rule => {
            if (this.shouldApplyRule(rule, data)) {
                rule.action();
                this.currentEvolutions.add(rule.name);
                this.lastAppliedTimes.set(rule.name, Date.now());
            }
        });
    }

    shouldApplyRule(rule, data) {
        const lastApplied = this.lastAppliedTimes.get(rule.name) || 0;
        const cooldownPassed = Date.now() - lastApplied > rule.cooldown;
        const notCurrentlyActive = !this.currentEvolutions.has(rule.name);
        
        return rule.condition(data) && cooldownPassed && notCurrentlyActive;
    }

    moveProjectsUp() {
        const aboutSection = document.getElementById('about');
        const projectsSection = document.getElementById('projects');
        const container = aboutSection?.parentNode;

        if (aboutSection && projectsSection && container && 
            projectsSection.nextElementSibling !== aboutSection) {
            
            projectsSection.style.opacity = '0';
            aboutSection.style.opacity = '0';
            
            setTimeout(() => {
                container.insertBefore(projectsSection, aboutSection);
                
                setTimeout(() => {
                    projectsSection.style.opacity = '1';
                    aboutSection.style.opacity = '1';
                }, 100);
            }, 300);
            
            this.logEvolution("Projects section moved up based on your interest!");
            this.showEvolutionNotice("🎯 Projects prioritized! Moved to top based on your interest.");
        }
    }

    optimizeCTA() {
        document.documentElement.style.setProperty('--primary', '#10b981');
        document.documentElement.style.setProperty('--primary-dark', '#059669');
        
        const contactMeBtn = document.getElementById('contactHero');
        const exploreBtn = document.getElementById('exploreProjects');
        const submitContactBtn = document.querySelector('.contact-form .btn-primary');
        
        if (contactMeBtn) {
            const span = contactMeBtn.querySelector('span');
            if (span) span.textContent = "Let's Build Together!";
        }
        
        if (exploreBtn) {
            const span = exploreBtn.querySelector('span');
            if (span) span.textContent = "See My Work →";
        }
        
        if (submitContactBtn) {
            const span = submitContactBtn.querySelector('span');
            if (span) span.textContent = "Send Message Now!";
        }
        
        this.logEvolution("CTA buttons optimized based on engagement!");
        this.showEvolutionNotice("✨ CTAs enhanced! Buttons optimized for better conversion.");
    }

    setDarkThemeDefault() {
        if (!document.body.classList.contains('dark-theme')) {
            document.body.classList.add('dark-theme');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            
            this.tracker.trackThemePreference('dark');
            this.logEvolution("Dark theme set as default based on user preference!");
            this.showEvolutionNotice("🌙 Dark theme activated as your default preference.");
        }
    }

    highlightPopularProject() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
                card.style.border = '2px solid var(--primary)';
                card.style.animation = 'project-glow 2s ease-in-out infinite';
            }, index * 200);
        });
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes project-glow {
                0%, 100% { box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); }
                50% { box-shadow: 0 25px 50px rgba(99, 102, 241, 0.5); }
            }
        `;
        document.head.appendChild(style);
        
        this.logEvolution("Projects highlighted based on user interest!");
        this.showEvolutionNotice("💎 Projects highlighted! Your interest in my work is noted.");
    }

    revealAdditionalContent() {
        const additionalContent = document.createElement('div');
        additionalContent.className = 'evolution-content glass-card';
        additionalContent.innerHTML = `
            <h3>🎉 Special Content Unlocked!</h3>
            <p>Your deep engagement has revealed additional insights about my work process.</p>
            <div class="evolution-features">
                <div class="evolution-feature">
                    <i class="fas fa-brain"></i>
                    <span>AI-Powered Development</span>
                </div>
                <div class="evolution-feature">
                    <i class="fas fa-chart-line"></i>
                    <span>Performance Analytics</span>
                </div>
            </div>
        `;
        
        additionalContent.style.cssText = `
            margin: 40px auto;
            max-width: 600px;
            text-align: center;
            animation: slideUp 0.6s ease;
        `;
        
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.appendChild(additionalContent);
        }
        
        this.logEvolution("Additional content revealed due to deep engagement!");
        this.showEvolutionNotice("🔓 Exclusive content unlocked! Scroll to see more.");
    }

    showEvolutionNotice(message) {
        const notice = document.getElementById('evolutionNotice');
        if (notice) {
            const noticeText = notice.querySelector('.notice-text span');
            if (noticeText) {
                noticeText.textContent = message;
            }
            
            notice.classList.add('show');
            
            setTimeout(() => {
                this.hideEvolutionNotice();
            }, 5000);
        }
    }

    hideEvolutionNotice() {
        const notice = document.getElementById('evolutionNotice');
        if (notice) {
            notice.classList.remove('show');
        }
    }

    logEvolution(description) {
        const evolutionEvent = {
            timestamp: new Date().toISOString(),
            description: description,
            data: JSON.parse(JSON.stringify(this.tracker.getData())),
            engagementScore: this.tracker.getEngagementScore()
        };
        
        this.evolutionHistory.push(evolutionEvent);
        
        if (this.evolutionHistory.length > 100) {
            this.evolutionHistory = this.evolutionHistory.slice(-100);
        }
        
        this.saveEvolutionHistory();
    }

    saveEvolutionHistory() {
        try {
            localStorage.setItem('evolutionHistory', JSON.stringify(this.evolutionHistory));
        } catch (e) {
            console.warn('Could not save evolution history:', e);
        }
    }

    loadEvolutionHistory() {
        try {
            const saved = localStorage.getItem('evolutionHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Could not load evolution history:', e);
            return [];
        }
    }
}

// ===== MAIN APPLICATION =====
class PortfolioApp {
    constructor() {
        // Create instances after classes are defined
        this.tracker = new InteractionTracker();
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
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    const section = entry.target.id;
                    this.tracker.trackSectionView(section);
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            section.classList.add('loading');
            observer.observe(section);
        });
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
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
        
        if (data.themePreference === 'dark') {
            document.body.classList.add('dark-theme');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
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

        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

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

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

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
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    hideEvolutionNotice() {
        const notice = document.getElementById('evolutionNotice');
        if (notice) {
            notice.classList.remove('show');
        }
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification-success { border-left: 4px solid #10b981; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-info { border-left: 4px solid #3b82f6; }
        
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
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});