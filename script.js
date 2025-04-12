document.addEventListener('DOMContentLoaded', () => {

    const docEl = document.documentElement;
    const body = document.body;
    const header = document.querySelector('.site-header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    // Target the wrapper for mobile menu logic
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
    // Still need navLinks inside the wrapper
    const navLinks = navMenuWrapper?.querySelectorAll('a[data-scroll-to]');
    const backToTopButton = document.getElementById('back-to-top');
    const contactForm = document.getElementById('contact-form');
    const allScrollLinks = document.querySelectorAll('a[data-scroll-to]'); // All scroll links

    // --- Smooth Scrolling ---
    function smoothScrollToTarget(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Recalculate header height dynamically in case it changes
            const headerHeight = header ? header.offsetHeight : 0;
            const offsetTop = targetElement.offsetTop - headerHeight + 1; // Offset + 1px buffer

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu if open and the click came from within it
            if (navMenuWrapper && navMenuWrapper.classList.contains('active') && this.closest('.nav-menu-wrapper')) {
                closeMobileMenu();
            }
        }
    }

    // Attach smooth scroll to ALL links with data-scroll-to
    allScrollLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToTarget);
    });


    // --- Mobile Navigation ---
    function openMobileMenu() {
        if (hamburger && navMenuWrapper) {
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            navMenuWrapper.classList.add('active'); // Toggle wrapper class
            body.classList.add('no-scroll'); // Prevent background scroll
        }
    }

    function closeMobileMenu() {
         if (hamburger && navMenuWrapper) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            navMenuWrapper.classList.remove('active'); // Toggle wrapper class
            body.classList.remove('no-scroll');
        }
    }

    if (hamburger && navMenuWrapper) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering document click listener
            if (navMenuWrapper.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu if clicking outside of it (on the body)
        document.addEventListener('click', (e) => {
             // Close only if menu is active and click is outside the menu wrapper AND outside the hamburger
            if (navMenuWrapper.classList.contains('active') && !navMenuWrapper.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        });

         // Optional: Close on Escape key press
         document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenuWrapper.classList.contains('active')) {
                closeMobileMenu();
            }
         });
    }


    // --- Header Scroll Effects ---
    let lastScrollY = window.scrollY;
    const scrollThreshold = 50; // Pixels scrolled before adding 'scrolled' class
    const headerHideThreshold = 200; // Pixels scrolled down before hiding header

    function handleHeaderScroll() {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

        // Add 'scrolled' class for background/shadow changes
        if (currentScrollY > scrollThreshold) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        // Hide header on scroll down (below threshold), show on scroll up
        if (header && Math.abs(currentScrollY - lastScrollY) > 10) { // Check for significant scroll change
            if (scrollDirection === 'down' && currentScrollY > headerHideThreshold) {
                header.classList.add('hidden');
            } else if (scrollDirection === 'up') {
                header.classList.remove('hidden');
            }
        }

        // Update lastScrollY, considering potential bouncing at top/bottom
        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;

        // Back to top button visibility
        if (backToTopButton) {
            // Show after scrolling down 70% of the viewport height
            if (currentScrollY > window.innerHeight * 0.7) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
    }
    // Use passive listener for scroll performance
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll(); // Initial check on load


    // --- Back to Top Button ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- Active Navigation Link Highlighting ---
    const sections = document.querySelectorAll('section[id]'); // Get all sections with an ID

    function updateActiveNavLink() {
        let currentSectionId = '';
        const headerHeight = header ? header.offsetHeight : 0;
        // Adjust the offset to trigger highlighting slightly before the section top
        const triggerOffset = headerHeight + Math.min(100, window.innerHeight * 0.3); // 30% of viewport or 100px

        sections.forEach(section => {
            const sectionTop = section.offsetTop - triggerOffset;
            // Check if the current scroll position is within this section's bounds
            if (window.scrollY >= sectionTop) {
                 // Check if it's the last section or if the next section hasn't been reached yet
                 const nextSection = section.nextElementSibling;
                 if (!nextSection || (nextSection && nextSection.offsetTop > window.scrollY + triggerOffset)) {
                    currentSectionId = '#' + section.getAttribute('id');
                 }
            }
        });

         // Special case: If near the bottom of the page, force highlight the last link ("Contact" or "Social")
         if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
             // Prioritize social links if it exists, otherwise contact
             const socialSection = document.getElementById('social-links-section');
             const contactSection = document.getElementById('contact');
             if (socialSection) currentSectionId = '#social-links-section';
             else if (contactSection) currentSectionId = '#contact';

         }

        // Also check if the target is the social links section directly
        const socialSection = document.getElementById('social-links-section');
        if (socialSection && window.scrollY >= socialSection.offsetTop - triggerOffset) {
             currentSectionId = '#social-links-section';
        }


        // Update links in the mobile menu
        navLinks?.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === currentSectionId || (linkHref === '#contact' && currentSectionId === '#social-links-section')) { // Special case: highlight Contact if Social is active
                 link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    // Debounce or throttle updateActiveNavLink if performance issues arise
    // let scrollTimeout;
    // window.addEventListener('scroll', () => {
    //     clearTimeout(scrollTimeout);
    //     scrollTimeout = setTimeout(updateActiveNavLink, 100); // Example debounce
    // }, { passive: true });

    updateActiveNavLink(); // Initial check on load


    // --- Intersection Observer for Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px 0px -10% 0px', // Trigger when 10% from bottom enters viewport
        threshold: 0.1 // Element needs to be at least 10% visible
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const target = entry.target;
                // Apply stagger delay if the parent has 'stagger-children' class
                const parentStagger = target.closest('.stagger-children');
                if (parentStagger) {
                    // Find index amongst siblings with the same class for stagger calculation
                    const siblings = Array.from(parentStagger.querySelectorAll('.animate-on-scroll'));
                    const staggerIndex = siblings.indexOf(target);
                    const delay = (staggerIndex >= 0 ? staggerIndex : index) * 100; // Use sibling index or entry index, delay in ms
                    target.style.transitionDelay = `${delay}ms`;
                }

                target.classList.add('is-visible');
                observer.unobserve(target); // Stop observing once animated
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // Initial animation for elements meant to animate on load
    // Ensure these elements are visible without scrolling
    document.querySelectorAll('.animate-on-load').forEach(el => {
        // Remove potential initial animation styles if needed, then trigger
        // Using a timeout ensures the transition is applied after initial render
        setTimeout(() => {
             el.style.opacity = '1';
             el.style.transform = 'translateY(0)';
             el.classList.add('is-visible'); // Add is-visible for consistency if needed
        }, 100); // Small delay
    });


    // --- Ripple Effect for Buttons/Links ---
    function createRipple(event) {
        const target = event.currentTarget;

        // Ensure target has position relative or absolute if needed for absolute positioning of ripple
        if (getComputedStyle(target).position === 'static') {
            target.style.position = 'relative';
        }

        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;

        // Set ripple styles
        circle.style.width = circle.style.height = `${diameter}px`;
        const rect = target.getBoundingClientRect();
        // Calculate position relative to the target element
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-element'); // Add class for CSS animation

        // Remove any existing ripple element first
        const oldRipple = target.querySelector('.ripple-element');
        if (oldRipple) {
            oldRipple.remove();
        }

        target.appendChild(circle);

        // Clean up the ripple element after animation completes
        circle.addEventListener('animationend', () => {
            circle.remove();
        });
    }

    const rippleElements = document.querySelectorAll('.ripple');
    rippleElements.forEach(el => {
        el.addEventListener('click', createRipple);
    });


    // --- Contact Form Handling ---
    if (contactForm) {
        const formStatus = contactForm.querySelector('.form-status');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');

        // Floating Label Logic (CSS handles visibility now, JS adds class for non-empty)
         inputs.forEach(input => {
             const label = contactForm.querySelector(`label[for="${input.id}"]`);
             if (!label) return;

             const checkInputHasValue = () => {
                  if (input.value.trim() !== '') {
                      label.classList.add('visible'); // Add class if value exists
                  } else {
                      label.classList.remove('visible'); // Remove if empty (CSS :focus/:placeholder-shown handles the rest)
                  }
             };

             input.addEventListener('input', checkInputHasValue);
             // Check on blur as well in case of autocomplete
             input.addEventListener('blur', checkInputHasValue);
             checkInputHasValue(); // Initial check on load
         });


        // Basic Frontend Validation
        function validateInput(input) {
            const errorSpan = input.parentElement.querySelector('.form-error'); // Find error span within parent group
            let isValid = true;
            input.classList.remove('invalid');
            if (errorSpan) errorSpan.textContent = '';

            // Check required
            if (input.required && input.value.trim() === '') {
                isValid = false;
                if (errorSpan) errorSpan.textContent = 'This field is required.';
            }
            // Check email format
            else if (input.type === 'email') {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value.trim())) {
                    isValid = false;
                    if (errorSpan) errorSpan.textContent = 'Please enter a valid email address.';
                }
            }
            // Add more specific validation rules if needed (e.g., minlength)

            if (!isValid) {
                input.classList.add('invalid');
                 if (errorSpan) errorSpan.setAttribute('aria-hidden', 'false');
            } else {
                 if (errorSpan) errorSpan.setAttribute('aria-hidden', 'true');
            }
            return isValid;
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isFormValid = true;

            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                formStatus.textContent = 'Please fix the errors above.';
                formStatus.className = 'form-status error';
                // Focus the first invalid input
                contactForm.querySelector('.invalid')?.focus();
                return;
            }

            // --- Simulate Form Submission ---
            setLoading(true);
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            try {
                // Placeholder: Replace with actual fetch request
                await new Promise(resolve => setTimeout(resolve, 1500));

                // --- Handle SUCCESS ---
                formStatus.textContent = 'Thank you! Your message has been sent.';
                formStatus.className = 'form-status success';
                contactForm.reset();
                // Reset labels visibility after reset
                inputs.forEach(input => {
                     const label = contactForm.querySelector(`label[for="${input.id}"]`);
                     if(label) label.classList.remove('visible');
                     input.classList.remove('invalid'); // Clear validation state
                     const errorSpan = input.parentElement.querySelector('.form-error');
                     if(errorSpan) {
                        errorSpan.textContent = '';
                        errorSpan.setAttribute('aria-hidden', 'true');
                     }
                });

            } catch (error) {
                // --- Handle ERROR ---
                console.error("Form submission error:", error);
                formStatus.textContent = 'Sorry, there was an error sending your message. Please try again later.';
                formStatus.className = 'form-status error';
            } finally {
                setLoading(false);
            }
        });

        // Add real-time validation feedback on input/blur
        inputs.forEach(input => {
            input.addEventListener('input', () => validateInput(input)); // Validate as user types (optional)
            input.addEventListener('blur', () => validateInput(input)); // Validate when leaving field
        });

        function setLoading(isLoading) {
            if (submitButton) {
                submitButton.disabled = isLoading;
                submitButton.classList.toggle('loading', isLoading);
            }
        }
    }


    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Log Initialization ---
    console.log("BlueWhisper Reflections theme initialized (v2).");

}); // End DOMContentLoaded