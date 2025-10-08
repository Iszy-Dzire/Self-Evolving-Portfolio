// Enhanced Interaction Tracking Module
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
            
            // Track scroll interactions
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

        // Save data when leaving the page
        window.addEventListener('beforeunload', () => {
            this.updateSectionTime();
            this.saveData();
        });

        // Auto-save every 30 seconds
        setInterval(() => this.saveData(), 30000);
    }

    setupInteractionTracking() {
        // Track all clicks for heatmap-like data
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
            
            // Keep only last 1000 interactions
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
        
        // Keep interactions manageable
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
        const time = Object.values(this.data.timeOnSections).reduce((a, b) => a + b, 0) / 1000; // Convert to seconds
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

    // Analytics methods
    getClickHeatmap() {
        return this.data.interactions
            .filter(i => i.type === 'click')
            .map(i => i.position);
    }

    getPopularInteractionTimes() {
        const interactionsByHour = {};
        this.data.interactions.forEach(interaction => {
            const hour = new Date(interaction.timestamp).getHours();
            interactionsByHour[hour] = (interactionsByHour[hour] || 0) + 1;
        });
        return interactionsByHour;
    }
}

// Create global instance
const interactionTracker = new InteractionTracker();