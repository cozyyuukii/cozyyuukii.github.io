const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
        navToggle.setAttribute('aria-expanded', 'true');
    });
}
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        navToggle.setAttribute('aria-expanded', 'false');
    });
}

const navLinks = document.querySelectorAll('.nav-link');
function linkAction() {
    if (navMenu && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
}
navLinks.forEach(n => n.addEventListener('click', linkAction));

function scrollHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    // Use pageYOffset for better cross-browser compatibility
    if (window.pageYOffset >= 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
}
window.addEventListener('scroll', scrollHeader);

function scrollUp() {
    const scrollUpButton = document.getElementById('scroll-up');
    if (!scrollUpButton) return;
    // Use pageYOffset for better cross-browser compatibility
    if (window.pageYOffset >= 350) scrollUpButton.classList.add('show-scroll'); else scrollUpButton.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

const sections = document.querySelectorAll('section[id]');
function scrollActive() {
    const scrollY = window.pageYOffset; // Consistent use of pageYOffset
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 58;
    let foundActive = false;

    sections.forEach(current => {
        if (!current) return;
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - headerHeight - 10;
        const sectionId = current.getAttribute('id');
        const correspondingLink = document.querySelector('.nav-menu a[href="#' + sectionId + '"]');

        if (correspondingLink) {
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                if (!correspondingLink.classList.contains('active-link')) {
                     document.querySelectorAll('.nav-menu .active-link').forEach(link => link.classList.remove('active-link'));
                     correspondingLink.classList.add('active-link');
                }
                foundActive = true;
            } else {
                correspondingLink.classList.remove('active-link');
            }
        }
    });

    // Handle active link for Hero section when scrolled to the top
    if (!foundActive) {
        const heroLink = document.querySelector('.nav-menu a[href="#hero"]');
        // Ensure sections[0] exists before accessing offsetTop
        const firstSectionTop = sections.length > 0 ? sections[0].offsetTop - headerHeight - 10 : window.innerHeight;
        if (heroLink && scrollY < firstSectionTop) {
            const currentActive = document.querySelector('.nav-menu .active-link');
            if (!currentActive || currentActive !== heroLink) {
                 document.querySelectorAll('.nav-menu .active-link').forEach(link => link.classList.remove('active-link'));
                 heroLink.classList.add('active-link');
            }
        }
    }
}
window.addEventListener('scroll', scrollActive, { passive: true });


const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
};
// Check if IntersectionObserver is supported before using it
if ('IntersectionObserver' in window) {
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => scrollObserver.observe(el));
} else {
    // Fallback for browsers without IntersectionObserver (e.g., make elements visible immediately)
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => el.classList.add('is-visible'));
    console.warn('IntersectionObserver not supported. Scroll animations disabled or using fallback.');
}


const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const hiddenReplyTo = document.getElementById('hidden-replyto');

function showError(input, message) {
    if (!input) return;
    const formGroup = input.parentElement;
    if (!formGroup) return;
    const errorElement = formGroup.querySelector('.form-error-message');
    input.classList.add('invalid');
    if (errorElement) errorElement.textContent = message;
}
function clearError(input) {
    if (!input) return;
    const formGroup = input.parentElement;
    if (!formGroup) return;
    const errorElement = formGroup.querySelector('.form-error-message');
    input.classList.remove('invalid');
    if (errorElement) errorElement.textContent = '';
}
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!nameInput || !emailInput || !messageInput || !formStatus || !hiddenReplyTo) {
             console.error("One or more form elements not found.");
             return;
        }

        // Set the hidden _replyto field for Formspree
        hiddenReplyTo.value = emailInput.value;

        let isValid = true;
        formStatus.textContent = '';
        formStatus.className = 'form-status-message';

        clearError(nameInput);
        clearError(emailInput);
        clearError(messageInput);

        if (!nameInput.value.trim()) { showError(nameInput, 'Please enter your name.'); isValid = false; }
        if (!emailInput.value.trim()) { showError(emailInput, 'Please enter your email address.'); isValid = false; }
        else if (!isValidEmail(emailInput.value.trim())) { showError(emailInput, 'Please enter a valid email address.'); isValid = false; }
        if (!messageInput.value.trim()) { showError(messageInput, 'Please enter your message.'); isValid = false; }
        else if (messageInput.value.trim().length < 10) { showError(messageInput, 'Message should be at least 10 characters long.'); isValid = false; }

        if (isValid) {
            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');

            if (formAction && formAction !== '#' && formAction !== 'https://formspree.io/f/YOUR_FORM_ID_HERE') {
                fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        formStatus.textContent = 'Thank you! Your message has been sent.';
                        formStatus.classList.add('success');
                        contactForm.reset();
                        setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status-message'; }, 5000);
                    } else {
                        response.json().then(data => {
                             // Use hasOwnProperty for broader compatibility instead of Object.hasOwn
                            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                                const errorMsg = data["errors"].map(error => error["message"]).join(", ");
                                formStatus.textContent = `Oops! There was a problem: ${errorMsg}`;
                            } else {
                                formStatus.textContent = 'Oops! There was a problem submitting your form.';
                            }
                            formStatus.classList.add('error');
                        }).catch(() => {
                            // Handle cases where response is not valid JSON
                            formStatus.textContent = 'Oops! There was a problem submitting your form. (Invalid server response)';
                            formStatus.classList.add('error');
                        });
                    }
                }).catch(error => {
                    formStatus.textContent = 'Oops! There was a network problem submitting your form.';
                    formStatus.classList.add('error');
                    console.error('Form submission error:', error);
                });

            } else if (formAction === 'https://formspree.io/f/YOUR_FORM_ID_HERE' || !formAction || formAction === '#') {
                console.log('Form is valid (simulation only). Replace action URL to send.');
                formStatus.textContent = 'Thank you! (Simulation Successful)';
                formStatus.classList.add('success');
                contactForm.reset();
                setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status-message'; }, 5000);
            }
        } else {
            formStatus.textContent = 'Please correct the errors above.';
            formStatus.classList.add('error');
        }
    });

    if (nameInput) nameInput.addEventListener('input', () => clearError(nameInput));
    if (emailInput) emailInput.addEventListener('input', () => clearError(emailInput));
    if (messageInput) messageInput.addEventListener('input', () => clearError(messageInput));
}

function createRipple(event) {
    const button = event.currentTarget;
    if (!button) return;
    // Clear previous ripples immediately
    const existingRipples = button.querySelectorAll(".ripple");
    existingRipples.forEach(ripple => ripple.remove());

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    // Calculate position relative to the button, not the viewport
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    button.appendChild(circle);

    // Clean up the ripple element after animation
    // Use 'animationend' event for more precise cleanup if needed, but setTimeout is simpler
    setTimeout(() => {
        if (circle.parentNode === button) { // Check if it hasn't been removed already
           circle.remove();
        }
    }, 600); // Match animation duration
}

const buttonsWithRipple = document.querySelectorAll(".button, .footer-social-link"); // Added .button class
buttonsWithRipple.forEach(button => {
    // Ensure ripple effect is only added once if script runs multiple times
    if (!button.dataset.rippleAttached) {
        button.addEventListener("click", createRipple);
        button.dataset.rippleAttached = "true"; // Mark as attached
    }
});

const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// Run scrollActive on load to set initial state
document.addEventListener('DOMContentLoaded', () => {
    scrollActive();
});