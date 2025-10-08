// Enhanced Evolution Engine Module
class EvolutionEngine {
    constructor(interactionTracker) {
        this.tracker = interactionTracker;
        this.evolutionHistory = this.loadEvolutionHistory();
        this.evolutionRules = this.setupEvolutionRules();
        this.currentEvolutions = new Set();
        this.init();
    }

    init() {
        this.checkEvolutionRules();
        // Check rules every 10 seconds for more responsive evolution
        setInterval(() => this.checkEvolutionRules(), 10000);
        
        // Also check on specific events
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
                cooldown: 30000 // 30 seconds
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
            },
            {
                name: 'engagement_reward',
                condition: (data) => this.tracker.getEngagementScore() > 50,
                action: () => this.showEngagementReward(),
                cooldown: 60000
            },
            {
                name: 'personalized_greeting',
                condition: (data) => data.visitCount > 2,
                action: () => this.personalizeGreeting(),
                cooldown: 0 // No cooldown
            },
            {
                name: 'interactive_boost',
                condition: (data) => data.clicks.projects > 15,
                action: () => this.enhanceInteractivity(),
                cooldown: 40000
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
        const lastApplied = this.lastAppliedTimes?.get(rule.name) || 0;
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
            
            // Add animation class
            projectsSection.style.opacity = '0';
            aboutSection.style.opacity = '0';
            
            setTimeout(() => {
                container.insertBefore(projectsSection, aboutSection);
                
                // Animate back in
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
        // Change primary color to success green
        document.documentElement.style.setProperty('--primary', '#10b981');
        document.documentElement.style.setProperty('--primary-dark', '#059669');
        
        // Update CTA buttons
        const contactMeBtn = document.getElementById('contactHero');
        const exploreBtn = document.getElementById('exploreProjects');
        const submitContactBtn = document.querySelector('#submitContact') || 
                                document.querySelector('.contact-form .btn-primary');
        
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
            
            // Update theme preference in tracker
            this.tracker.trackThemePreference('dark');
            
            this.logEvolution("Dark theme set as default based on user preference!");
            this.showEvolutionNotice("🌙 Dark theme activated as your default preference.");
        }
    }

    highlightPopularProject() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            // Add staggered animation
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
                card.style.border = '2px solid var(--primary)';
                
                // Add glow effect
                card.style.animation = 'project-glow 2s ease-in-out infinite';
            }, index * 200);
        });
        
        // Add custom animation
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
        // Create and show additional content
        const additionalContent = document.createElement('div');
        additionalContent.className = 'evolution-content glass-card';
        additionalContent.innerHTML = `
            <h3>🎉 Special Content Unlocked!</h3>
            <p>Your deep engagement has revealed additional insights about my work process and methodology.</p>
            <div class="evolution-features">
                <div class="evolution-feature">
                    <i class="fas fa-brain"></i>
                    <span>AI-Powered Development</span>
                </div>
                <div class="evolution-feature">
                    <i class="fas fa-chart-line"></i>
                    <span>Performance Analytics</span>
                </div>
                <div class="evolution-feature">
                    <i class="fas fa-users"></i>
                    <span>User Behavior Analysis</span>
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

    showEngagementReward() {
        // Create a special badge or reward
        const engagementBadge = document.createElement('div');
        engagementBadge.className = 'engagement-badge';
        engagementBadge.innerHTML = `
            <div class="badge-content">
                <i class="fas fa-trophy"></i>
                <span>High Engager</span>
            </div>
        `;
        
        engagementBadge.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--gradient);
            color: white;
            padding: 12px 16px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 1000;
            animation: bounceIn 0.6s ease;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(engagementBadge);
        
        // Remove after 5 seconds
        setTimeout(() => {
            engagementBadge.style.animation = 'bounceOut 0.6s ease';
            setTimeout(() => {
                if (engagementBadge.parentNode) {
                    engagementBadge.parentNode.removeChild(engagementBadge);
                }
            }, 600);
        }, 5000);
        
        this.logEvolution("Engagement reward shown to user!");
        this.showEvolutionNotice("🏆 High engagement detected! Thanks for exploring my portfolio.");
    }

    personalizeGreeting() {
        const visitCount = this.tracker.getData().visitCount;
        const heroTitle = document.querySelector('.hero-title');
        
        if (heroTitle && visitCount > 2) {
            const titleLines = heroTitle.querySelectorAll('.title-line');
            if (titleLines.length >= 2) {
                titleLines[1].textContent = 'Welcome Back!';
                titleLines[1].classList.add('gradient-text');
                
                this.logEvolution("Personalized greeting shown to returning visitor!");
            }
        }
    }

    enhanceInteractivity() {
        // Add micro-interactions to project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('mouseenter', this.enhancedCardHover);
            card.addEventListener('mouseleave', this.enhancedCardLeave);
        });
        
        // Add CSS for enhanced interactions
        const style = document.createElement('style');
        style.textContent = `
            .project-card.enhanced-hover {
                transform: translateY(-10px) scale(1.02) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes bounceOut {
                0% { transform: scale(1); opacity: 1; }
                20% { transform: scale(1.05); opacity: 0.7; }
                100% { transform: scale(0.3); opacity: 0; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        this.logEvolution("Enhanced interactivity added to project cards!");
        this.showEvolutionNotice("🎮 Enhanced interactivity! Hover over projects for new effects.");
    }

    // Enhanced hover effects
    enhancedCardHover(e) {
        const card = e.currentTarget;
        card.classList.add('enhanced-hover');
        
        // Add particle effect on hover
        const rect = card.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createHoverParticle(rect);
            }, i * 100);
        }
    }

    enhancedCardLeave(e) {
        const card = e.currentTarget;
        card.classList.remove('enhanced-hover');
    }

    createHoverParticle(rect) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 100;
        `;
        
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.body.appendChild(particle);
        
        // Animate particle
        particle.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    showEvolutionNotice(message) {
        const notice = document.getElementById('evolutionNotice');
        if (notice) {
            const noticeText = notice.querySelector('.notice-text span');
            if (noticeText) {
                noticeText.textContent = message;
            }
            
            notice.classList.add('show');
            
            // Auto-hide after 5 seconds
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
        
        // Keep only last 100 evolution events
        if (this.evolutionHistory.length > 100) {
            this.evolutionHistory = this.evolutionHistory.slice(-100);
        }
        
        this.saveEvolutionHistory();
        
        // Debug log
        console.log('Evolution:', description, evolutionEvent);
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

    getEvolutionHistory() {
        return this.evolutionHistory;
    }

    // Analytics method to get evolution insights
    getEvolutionInsights() {
        const popularEvolutions = {};
        this.evolutionHistory.forEach(event => {
            popularEvolutions[event.description] = (popularEvolutions[event.description] || 0) + 1;
        });
        
        return {
            totalEvolutions: this.evolutionHistory.length,
            popularEvolutions: popularEvolutions,
            averageEngagementScore: this.evolutionHistory.reduce((sum, event) => 
                sum + event.engagementScore, 0) / this.evolutionHistory.length
        };
    }
}

// Initialize lastAppliedTimes map
EvolutionEngine.prototype.lastAppliedTimes = new Map();
EvolutionEngine.prototype.currentEvolutions = new Set();