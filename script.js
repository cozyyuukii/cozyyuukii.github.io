document.addEventListener('DOMContentLoaded', () => {

    const docEl = document.documentElement;
    const body = document.body;
    const header = document.querySelector('.site-header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
    const navLinks = navMenuWrapper?.querySelectorAll('a[data-scroll-to]');
    const backToTopButton = document.getElementById('back-to-top');
    const contactForm = document.getElementById('contact-form');
    const allScrollLinks = document.querySelectorAll('a[data-scroll-to]');

    // --- Smooth Scrolling ---
    function smoothScrollToTarget(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = header ? header.offsetHeight : 0;
            const offsetTop = targetElement.offsetTop - headerHeight + 1;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            if (navMenuWrapper && navMenuWrapper.classList.contains('active') && this.closest('.nav-menu-wrapper')) {
                closeMobileMenu();
            }
        }
    }

    allScrollLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToTarget);
    });

    // --- Mobile Navigation ---
    function openMobileMenu() {
        if (hamburger && navMenuWrapper) {
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            navMenuWrapper.classList.add('active');
            body.classList.add('no-scroll');
        }
    }

    function closeMobileMenu() {
         if (hamburger && navMenuWrapper) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            navMenuWrapper.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    }

    if (hamburger && navMenuWrapper) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navMenuWrapper.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        document.addEventListener('click', (e) => {
            if (navMenuWrapper.classList.contains('active') && !navMenuWrapper.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        });

         document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenuWrapper.classList.contains('active')) {
                closeMobileMenu();
            }
         });
    }


    // --- Header Scroll Effects ---
    let lastScrollY = window.scrollY;
    const scrollThreshold = 50;
    const headerHideThreshold = 200;

    function handleHeaderScroll() {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

        if (currentScrollY > scrollThreshold) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        if (header && Math.abs(currentScrollY - lastScrollY) > 10) {
            if (scrollDirection === 'down' && currentScrollY > headerHideThreshold) {
                header.classList.add('hidden');
            } else if (scrollDirection === 'up') {
                header.classList.remove('hidden');
            }
        }

        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;

        if (backToTopButton) {
            if (currentScrollY > window.innerHeight * 0.7) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
    }
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();


    // --- Back to Top Button ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- Active Navigation Link Highlighting ---
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        let currentSectionId = '';
        const headerHeight = header ? header.offsetHeight : 0;
        const triggerOffset = headerHeight + Math.min(100, window.innerHeight * 0.3);

        sections.forEach(section => {
            const sectionTop = section.offsetTop - triggerOffset;
            if (window.scrollY >= sectionTop) {
                 const nextSection = section.nextElementSibling;
                 const nextSectionTop = nextSection?.offsetTop ?? Infinity;
                 if (window.scrollY < nextSectionTop - triggerOffset) {
                     currentSectionId = '#' + section.getAttribute('id');
                 }
                 if (!section.nextElementSibling?.matches('section[id]') && window.scrollY >= sectionTop) {
                     currentSectionId = '#' + section.getAttribute('id');
                 }
            }
        });

         if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
             const socialSection = document.getElementById('social-links-section');
             const contactSection = document.getElementById('contact');
             if (socialSection) currentSectionId = '#social-links-section';
             else if (contactSection) currentSectionId = '#contact';
         }
        const socialSection = document.getElementById('social-links-section');
         if (socialSection && window.scrollY >= socialSection.offsetTop - triggerOffset) {
              currentSectionId = '#social-links-section';
         }


        navLinks?.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === currentSectionId || (linkHref === '#contact' && currentSectionId === '#social-links-section')) {
                 link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();


    // --- Intersection Observer for Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const parentStagger = target.closest('.stagger-children');
                if (parentStagger) {
                    const siblings = Array.from(parentStagger.querySelectorAll('.animate-on-scroll'));
                    const staggerIndex = siblings.indexOf(target);
                    const delay = (staggerIndex >= 0 ? staggerIndex : index) * 100;
                    target.style.transitionDelay = `${delay}ms`;
                }
                target.classList.add('is-visible');
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // Initial animation for elements meant to animate on load
    document.querySelectorAll('.animate-on-load').forEach(el => {
        const delay = parseFloat(getComputedStyle(el).transitionDelay) * 1000 || 100;
        setTimeout(() => {
             el.style.opacity = '1';
             el.style.transform = 'translateY(0)';
        }, delay);
    });


    // --- Ripple Effect for Buttons/Links ---
    function createRipple(event) {
        const target = event.currentTarget;
        if (getComputedStyle(target).position === 'static') { target.style.position = 'relative'; }
        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        const rect = target.getBoundingClientRect();
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-element');
        const oldRipple = target.querySelector('.ripple-element');
        if (oldRipple) { oldRipple.remove(); }
        target.appendChild(circle);
        circle.addEventListener('animationend', () => { circle.remove(); });
    }

    const rippleElements = document.querySelectorAll('.ripple');
    rippleElements.forEach(el => { el.addEventListener('click', createRipple); });


    // --- Contact Form Handling ---
    if (contactForm) {
        const formStatus = contactForm.querySelector('.form-status');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');

         inputs.forEach(input => {
             const label = contactForm.querySelector(`label[for="${input.id}"]`);
             if (!label) return;
             const checkInputHasValue = () => {
                  if (input.value.trim() !== '') { label.classList.add('visible'); }
                  else { label.classList.remove('visible'); }
             };
             input.addEventListener('input', checkInputHasValue);
             input.addEventListener('blur', checkInputHasValue);
             checkInputHasValue();
         });

        function validateInput(input) {
            const errorSpan = input.parentElement.querySelector('.form-error');
            let isValid = true;
            input.classList.remove('invalid');
            if (errorSpan) errorSpan.textContent = '';
            if (input.required && input.value.trim() === '') {
                isValid = false;
                if (errorSpan) errorSpan.textContent = 'This field is required.';
            }
            else if (input.type === 'email') {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value.trim())) {
                    isValid = false;
                    if (errorSpan) errorSpan.textContent = 'Please enter a valid email address.';
                }
            }
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
            inputs.forEach(input => { if (!validateInput(input)) { isFormValid = false; } });
            if (!isFormValid) {
                formStatus.textContent = 'Please fix the errors above.';
                formStatus.className = 'form-status error';
                contactForm.querySelector('.invalid')?.focus();
                return;
            }
            setLoading(true);
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            try {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
                formStatus.textContent = 'Thank you! Your message has been sent.';
                formStatus.className = 'form-status success';
                contactForm.reset();
                inputs.forEach(input => {
                     const label = contactForm.querySelector(`label[for="${input.id}"]`);
                     if(label) label.classList.remove('visible');
                     input.classList.remove('invalid');
                     const errorSpan = input.parentElement.querySelector('.form-error');
                     if(errorSpan) { errorSpan.textContent = ''; errorSpan.setAttribute('aria-hidden', 'true'); }
                });
            } catch (error) {
                console.error("Form submission error:", error);
                formStatus.textContent = 'Sorry, there was an error sending your message. Please try again later.';
                formStatus.className = 'form-status error';
            } finally {
                setLoading(false);
            }
        });

        inputs.forEach(input => {
            input.addEventListener('input', () => validateInput(input));
            input.addEventListener('blur', () => validateInput(input));
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
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    console.log("BlueWhisper Reflections theme initialized (v5 - Adjusted About visual).");

}); // End DOMContentLoaded
