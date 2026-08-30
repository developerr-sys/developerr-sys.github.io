// Global error handler to surface runtime JS errors into the quiz page placeholder
window.addEventListener('error', (event) => {
    try {
        const ph = document.getElementById('quiz-static-placeholder');
        if (ph) {
            ph.innerText = `Error loading quiz: ${event.message}`;
            ph.classList.remove('text-secondary');
            ph.classList.add('text-danger');
        }
    } catch (err) {
        // swallow secondary errors
    }
});

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       UNIFIED THEME SYSTEM (MODE + COLOR PALETTE)
       ========================================================================== */
    const themePickerFab = document.getElementById('theme-picker-fab');
    const themePickerPanel = document.getElementById('theme-picker-panel');
    const themeSwatches = document.querySelectorAll('.theme-swatch');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // 1. Initial State Restoration
    const currentMode = 'dark';
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';

    // Apply Mode Class to Body
    applyMode('dark');

    // Apply Accent Color Theme Class to Body
    if (savedColorTheme !== 'default') {
        document.body.classList.add(`theme-${savedColorTheme}`);
    }

    // 2. Panel Open/Close Toggle
    if (themePickerFab && themePickerPanel) {
        themePickerFab.addEventListener('click', (e) => {
            e.stopPropagation();
            themePickerPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!themePickerPanel.contains(e.target) && !themePickerFab.contains(e.target)) {
                themePickerPanel.classList.remove('active');
            }
        });
    }

    // 3. Enforce Dark Mode
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    const currentColorTheme = localStorage.getItem('colorTheme') || 'default';
    if (currentColorTheme !== 'default') {
        document.body.classList.add(`theme-${currentColorTheme}`);
    }

    // 4. Handle Color Theme Swatches
    if (themeSwatches.length > 0) {
        // Highlight saved swatch on load
        themeSwatches.forEach(sw => {
            sw.classList.toggle('active-swatch', sw.dataset.theme === savedColorTheme);
            sw.addEventListener('click', () => {
                const selectedTheme = sw.dataset.theme;

                // Clear all theme-* classes from body
                const themeClasses = [...document.body.classList].filter(c => c.startsWith('theme-'));
                themeClasses.forEach(c => document.body.classList.remove(c));

                if (selectedTheme !== 'default') {
                    document.body.classList.add(`theme-${selectedTheme}`);
                }

                themeSwatches.forEach(s => s.classList.remove('active-swatch'));
                sw.classList.add('active-swatch');

                localStorage.setItem('colorTheme', selectedTheme);
            });
        });
    }

    /* ==========================================================================
       NAVBAR SCROLL STYLING & SCROLL PROGRESS
       ========================================================================== */
    const navbar = document.getElementById('navbar-main');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Sticky Navbar state
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Scroll Progress indicator width
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;

        // Back to Top button visibility
        if (scrollTop > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    // Back to top action
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Auto-close Bootstrap Navbar Collapse on link click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1200 && navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }

    /* ==========================================================================
       TYPING ANIMATION (Hero Section)
       ========================================================================== */
    if (document.getElementById('typed-strings')) {
        new Typed('#typed-strings', {
            strings: [
                'Full Stack Developer.',
                'Web Developer.',
                'Python Developer.',
                'MS Office Expert.'
            ],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            loop: true,
            showCursor: false
        });
    }

    /* ==========================================================================
       AOS (ANIMATE ON SCROLL) INITIALIZATION
       ========================================================================== */
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    /* ==========================================================================
       INTERSECTION OBSERVER (Counters & Skills Animation)
       ========================================================================== */

    // Numerical stats counter animation
    const counterElements = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const limit = parseInt(target.getAttribute('data-target'), 10);
                let current = 0;
                const increment = Math.ceil(limit / 50); // animate in roughly 50 steps
                const duration = 1500; // ms
                const intervalTime = duration / (limit / increment);

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= limit) {
                        target.innerText = limit + '+';
                        clearInterval(timer);
                    } else {
                        target.innerText = current;
                    }
                }, intervalTime);

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(el => counterObserver.observe(el));

    // Progress Bar & Percentage Counter Animation (Skills Section)
    const progressFillElements = document.querySelectorAll('.progress-bar-fill');
    const progressObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetWidth = target.getAttribute('data-progress');
                target.style.width = targetWidth;

                // Animate corresponding percentage text counter if present
                const parentWrapper = target.closest('.skill-progress-wrapper');
                if (parentWrapper) {
                    const percentEl = parentWrapper.querySelector('.skill-percent-counter');
                    if (percentEl && !percentEl.classList.contains('counted')) {
                        percentEl.classList.add('counted');
                        const targetVal = parseInt(percentEl.getAttribute('data-target'), 10);
                        let currentVal = 0;
                        const duration = 1400;
                        const steps = 40;
                        const increment = targetVal / steps;
                        const stepTime = duration / steps;

                        const counterTimer = setInterval(() => {
                            currentVal += increment;
                            if (currentVal >= targetVal) {
                                percentEl.innerText = targetVal + '%';
                                clearInterval(counterTimer);
                            } else {
                                percentEl.innerText = Math.round(currentVal) + '%';
                            }
                        }, stepTime);
                    }
                }

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.1 });

    progressFillElements.forEach(el => progressObserver.observe(el));

    // Interactive Skill Category Tabs Filtering
    const skillTabBtns = document.querySelectorAll('.skill-tab-btn');
    const skillCardItems = document.querySelectorAll('.skill-card-item');

    skillTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            skillTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            skillCardItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    /* ==========================================================================
       FILTERABLE PROJECTS GALLERY
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from buttons and set current
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    /* ==========================================================================
       CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formSubmitBtn = document.getElementById('form-submit-btn');
        const submitSpinner = document.getElementById('submit-spinner');
        const submitText = document.getElementById('submit-text');
        const contactAlert = document.getElementById('contact-alert');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Reset classes
            contactForm.classList.remove('was-validated');

            // Extract inputs
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const subjectInput = document.getElementById('form-subject');
            const messageInput = document.getElementById('form-message');

            // Simple custom regex validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let isValid = true;

            if (nameInput.value.trim() === '') {
                nameInput.classList.add('is-invalid');
                isValid = false;
            } else {
                nameInput.classList.remove('is-invalid');
            }

            if (!emailRegex.test(emailInput.value.trim())) {
                emailInput.classList.add('is-invalid');
                isValid = false;
            } else {
                emailInput.classList.remove('is-invalid');
            }

            if (subjectInput.value.trim() === '') {
                subjectInput.classList.add('is-invalid');
                isValid = false;
            } else {
                subjectInput.classList.remove('is-invalid');
            }

            if (messageInput.value.trim() === '') {
                messageInput.classList.add('is-invalid');
                isValid = false;
            } else {
                messageInput.classList.remove('is-invalid');
            }

            if (!isValid) {
                contactForm.classList.add('was-validated');
                return;
            }

            // Mock Submission Loading state
            formSubmitBtn.disabled = true;
            submitSpinner.classList.remove('d-none');
            submitText.innerHTML = 'Sending...';

            setTimeout(() => {
                // Success State Reset
                formSubmitBtn.disabled = false;
                submitSpinner.classList.add('d-none');
                submitText.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send Message';

                contactAlert.classList.remove('d-none');
                contactForm.reset();

                // Fade alert out after 5s
                setTimeout(() => {
                    contactAlert.classList.add('d-none');
                }, 5000);

            }, 1500);
        });
    }

    /* ==========================================================================
       BLOG MODAL DATA LOADER
       ========================================================================== */
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    const blogModalElement = document.getElementById('blogModal');
    if (blogModalElement && readMoreBtns.length > 0) {
        const blogModal = new bootstrap.Modal(blogModalElement);
        const modalTitle = document.getElementById('blogModalLabel');
        const modalDate = document.getElementById('modal-blog-date');
        const modalContent = document.getElementById('modal-blog-content');

        const blogsData = {
            '1': {
                title: 'How I Started Web Development',
                date: 'July 25, 2026',
                content: `
                    <p>My journey into web development began during the early years of my Computer Science Degree. I was always fascinated by how lines of code could transform into visually stunning interfaces loaded with interactive features. I started with the basics: building simple HTML templates, adding vanilla CSS, and making elements move with Javascript.</p>
                    <p>As I advanced, I discovered Bootstrap for styling layouts quickly, and developed an interest in creating highly responsive websites. Designing components that render beautifully on mobile phones, tablets, and desktop systems became my primary goal. Through hands-on development of multiple full-stack web and design projects, I gained practical experience debugging real-world layouts, building custom forms, and crafting production frontends.</p>
                    <p>For any aspiring developer, the key is consistency. Code every day, build small utilities (like to-do applications or calculator cards), and slowly stack up tools like Git and database configurations. The journey is challenging, but building solutions that users enjoy is incredibly rewarding.</p>
                `
            },
            '2': {
                title: 'Importance of Responsive Design',
                date: 'July 18, 2026',
                content: `
                    <p>In today's mobile-first ecosystem, responsive design is no longer an optional feature—it is an absolute necessity. Over 55% of global web traffic originates from mobile devices, meaning that if your website looks broken on a smartphone screen, you immediately lose half of your potential visitors.</p>
                    <p>Responsive design is about fluid layout grids, flexible image modules, and smart CSS Media Queries. Rather than building separate versions of a site for desktop and phone layouts, developers use CSS flexbox and grid properties to dynamically adapt content alignment based on viewport size. This results in faster loading speeds, lower bounce rates, and better search engine rankings (SEO).</p>
                    <p>A great responsive design preserves accessibility. Interactive buttons must have adequate click targets, text sizes should scale gracefully for legibility, and images should resize automatically without stretching. Prioritizing layout responsiveness ensures a seamless user experience on all viewport scales.</p>
                `
            },
            '3': {
                title: 'Learning JavaScript Effectively',
                date: 'July 10, 2026',
                content: `
                    <p>JavaScript is the programming engine that runs the modern web. However, for many students, transitioning from styling pages with HTML/CSS to writing functional JavaScript code can be intimidating. The secret to learning Javascript effectively is focusing on execution models and logic patterns rather than memorizing syntaxes.</p>
                    <p>Start by mastering ES6 fundamentals: variables (let/const), arrow functions, template literals, array map/filter loops, and object destructuring. Once you understand the basics, dive deep into DOM Manipulation—learning how to listen to click events, inject HTML elements, and toggle styling classes dynamically.</p>
                    <p>The next major hurdle is asynchronous JavaScript. Take the time to understand callbacks, Promises, and the modern async/await syntax. Creating small interactive applications (like local storage lists, weather forecasts with fetch APIs, or countdown timers) is the fastest way to turn abstract logic into practical coding experience.</p>
                `
            },
            '4': {
                title: 'Modern UI Design Tips',
                date: 'June 28, 2026',
                content: `
                    <p>Creating a premium web interface is about clean layouts, consistent visual hierarchies, and details that guide the user's focus. A premium website is simple yet visual. Here are some of the key techniques modern designers use to make their websites stand out:</p>
                    <p><strong>1. Glassmorphism:</strong> Using semi-transparent background colors combined with backdrop blur properties (frosting effect) creates elegant depth. It is essential to style these cards with very thin, subtle white borders to make them stand out from the backgrounds.</p>
                    <p><strong>2. Curated Color Palettes:</strong> Avoid stark colors like solid primary blue or solid red. Utilize refined color scales (like HSL colors or tailwind-like shades) and specify a vibrant accent color to highlight essential click targets.</p>
                    <p><strong>3. Micro-animations:</strong> Small transitions, such as hover elevations, sliding lines on navigation links, and zoom effects on card backgrounds, make the website feel alive and encourage user interaction.</p>
                    <p><strong>4. Typography Contrast:</strong> Use contrasting fonts (e.g., Poppins for readable body text and Montserrat for striking headers). Maintain consistent line-heights and spacing scales to ensure text scanning is fast and effortless.</p>
                `
            }
        };

        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const blogId = btn.getAttribute('data-blog-id');
                const data = blogsData[blogId];

                if (data) {
                    modalTitle.innerText = data.title;
                    modalDate.innerHTML = `<i class="fa-solid fa-calendar-days me-2"></i>Published: ${data.date}`;
                    modalContent.innerHTML = data.content;
                    blogModal.show();
                }
            });
        });
    }

    /* ==========================================================================
       HERO BACKGROUND PARTICLES CANVAS
       ========================================================================== */
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = 40;

        // Resize Canvas dynamically
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle Blueprint class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; // 1px to 4px size
                this.speedX = Math.random() * 0.4 - 0.2; // slow drift
                this.speedY = Math.random() * 0.4 - 0.2;
                this.color = localStorage.getItem('theme') === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(10, 102, 194, 0.15)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off canvas boundaries
                if (this.x > canvas.width || this.x < 0) {
                    this.speedX = -this.speedX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.speedY = -this.speedY;
                }
            }

            draw() {
                // Color dynamically matches active dark theme
                this.color = 'rgba(96, 165, 250, 0.25)';

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles array
        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }
        initParticles();

        // Loop animation
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // Re-init particles on resize to fit new canvas scale
        window.addEventListener('resize', () => {
            initParticles();
        });
    }

    /* ==========================================================================
       CV PREVIEW MODAL & DYNAMIC LOADER WITH TOP DOWNLOAD BUTTON
       ========================================================================== */
    let currentCvZoomLevel = 1;

    function applyCvZoom(zoomVal) {
        const cvImageFrame = document.getElementById('cvImageFrame');
        if (!cvImageFrame) return;
        currentCvZoomLevel = Math.min(Math.max(0.5, Math.round(zoomVal * 100) / 100), 2.5);
        cvImageFrame.style.transform = `scale(${currentCvZoomLevel})`;
        cvImageFrame.style.transformOrigin = 'top center';
    }

    function ensureCvModalExists() {
        if (document.getElementById('cvModal')) return;

        const isInsidePages = window.location.pathname.includes('/pages/');
        const cvImagePath = isInsidePages ? '../Anmol CV.jpg' : 'Anmol CV.jpg';

        const modalHtml = `
        <div class="modal fade" id="cvModal" tabindex="-1" aria-labelledby="cvModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0">
                    <!-- Top Toolbar above CV -->
                    <div class="cv-modal-header d-flex align-items-center justify-content-between">
                        <div class="cv-modal-title">
                            <i class="fa-solid fa-file-pdf text-accent fs-5"></i>
                            <span>Anmol Akber - Curriculum Vitae</span>
                        </div>
                        <div class="cv-top-actions">
                            <div class="cv-zoom-controls me-2 d-none d-sm-inline-flex">
                                <button type="button" class="cv-zoom-btn" id="cvZoomOut" title="Zoom Out"><i class="fa-solid fa-minus"></i></button>
                                <button type="button" class="cv-zoom-btn" id="cvZoomReset" title="Reset Zoom"><i class="fa-solid fa-rotate-left"></i></button>
                                <button type="button" class="cv-zoom-btn" id="cvZoomIn" title="Zoom In"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <a href="${cvImagePath}" download="Anmol_Akber_CV.jpg" class="btn-cv-download-top" id="cvTopDownloadBtn">
                                <i class="fa-solid fa-download"></i> Download CV
                            </a>
                            <a href="${cvImagePath}" target="_blank" class="btn btn-outline-light btn-sm rounded-circle p-2 ms-1" id="cvOpenOriginalBtn" title="Open Original Image">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                            <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    </div>
                    <!-- CV Image Viewport -->
                    <div class="cv-modal-body" id="cvModalBody">
                        <div class="cv-image-frame" id="cvImageFrame">
                            <img src="${cvImagePath}" alt="Anmol Akber CV Preview" id="cvImage">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Global Delegated Click Handler for Zoom Buttons and CV Triggers
    document.addEventListener('click', (e) => {
        // Zoom In Button
        const zoomInBtn = e.target.closest('#cvZoomIn, .cv-zoom-in');
        if (zoomInBtn) {
            e.preventDefault();
            e.stopPropagation();
            applyCvZoom(currentCvZoomLevel + 0.2);
            return;
        }

        // Zoom Out Button
        const zoomOutBtn = e.target.closest('#cvZoomOut, .cv-zoom-out');
        if (zoomOutBtn) {
            e.preventDefault();
            e.stopPropagation();
            applyCvZoom(currentCvZoomLevel - 0.2);
            return;
        }

        // Zoom Reset Button
        const zoomResetBtn = e.target.closest('#cvZoomReset, .cv-zoom-reset');
        if (zoomResetBtn) {
            e.preventDefault();
            e.stopPropagation();
            applyCvZoom(1);
            return;
        }

        // Intercept clicks on Download CV links/buttons across all pages (Exclude modal top bar actions)
        const cvTrigger = e.target.closest('a[href*="Anmol CV.jpg"], [data-cv-trigger], .btn-download-cv');
        if (cvTrigger && !e.target.closest('#cvTopDownloadBtn, #cvOpenOriginalBtn, .cv-modal-header')) {
            e.preventDefault();
            ensureCvModalExists();
            const cvModalEl = document.getElementById('cvModal');
            if (cvModalEl) {
                applyCvZoom(1); // Reset zoom level when opening modal
                const bsModal = bootstrap.Modal.getOrCreateInstance(cvModalEl);
                bsModal.show();
            }
        }
    });

});
