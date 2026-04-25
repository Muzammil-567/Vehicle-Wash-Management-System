document.addEventListener('DOMContentLoaded', () => {
    // Basic Components
    loadComponent('navbar-placeholder', '/website/html/website_components/navbar.html', () => {
        initNavbar();
        initSmoothScrolling();
        initActiveLinkTracking();
    });
    loadComponent('footer-placeholder', '/website/html/website_components/footer.html');

    // Section Components
    loadComponent('hero-placeholder', '/website/html/website_components/hero-section.html');
    loadComponent('services-placeholder', '/website/html/website_components/services-section.html');
    loadComponent('pricing-placeholder', '/website/html/website_components/pricing-section.html');
    loadComponent('about-stats-placeholder', '/website/html/website_components/about-stats-section.html');
    loadComponent('testimonials-placeholder', '/website/html/website_components/testimonials-gallery.html');
    loadComponent('contact-placeholder', '/website/html/website_components/contact-section.html', initScrollAnimations);
});

/**
 * Fetches and injects HTML component into a placeholder
 * @param {string} placeholderId - ID of the div to inject into
 * @param {string} componentPath - Path to the .html snippet
 * @param {function} callback - Optional function to run after injection
 */
async function loadComponent(placeholderId, componentPath, callback) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        placeholder.innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.error(`Failed to load component: ${componentPath}`, error);
    }
}

/**
 * Initializes navbar event listeners after injection
 */
function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

/**
 * Implements smooth scrolling for all anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const urlParts = href.split('#');
            const targetId = urlParts[urlParts.length - 1];
            const targetElement = document.getElementById(targetId);

            // Only smooth scroll if the target is on the current page
            if (targetElement) {
                e.preventDefault();
                const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jump
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

/**
 * Highlights the active section in the navbar based on scroll position
 */
function initActiveLinkTracking() {
    const sections = [
        'hero-placeholder',
        'services-placeholder',
        'pricing-placeholder',
        'about-stats-placeholder',
        'contact-placeholder'
    ];

    const options = {
        threshold: 0.5,
        rootMargin: "-80px 0px 0px 0px" // Offset for navbar height
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                updateActiveLink(id);
            }
        });
    }, options);

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

function updateActiveLink(activeId) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.endsWith(`#${activeId}`)) {
            link.classList.add('active');
        }
    });
}

/**
 * Initializes scroll-triggered animations using IntersectionObserver
 */
function initScrollAnimations() {
    const options = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, options);

    // Small delay to ensure all components are injected before selection
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    }, 100);
}
