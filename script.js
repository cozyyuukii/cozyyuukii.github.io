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
    if (window.scrollY >= 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
}
window.addEventListener('scroll', scrollHeader);

function scrollUp() {
    const scrollUpButton = document.getElementById('scroll-up');
    if (!scrollUpButton) return;
    if (window.scrollY >= 350) scrollUpButton.classList.add('show-scroll'); else scrollUpButton.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

const sections = document.querySelectorAll('section[id]');
function scrollActive() {
    const scrollY = window.pageYOffset;
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

    if (!foundActive) {
        const heroLink = document.querySelector('.nav-menu a[href="#hero"]');
        const firstSection = sections[0];
        const firstSectionTop = firstSection ? firstSection.offsetTop - headerHeight - 10 : window.innerHeight;
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
const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
elementsToAnimate.forEach(el => scrollObserver.observe(el));

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
        if (!nameInput || !emailInput || !messageInput || !formStatus || !hiddenReplyTo) return;

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
            // Prepare data for fetch (if using AJAX submission with Formspree or similar)
            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');

            if (formAction && formAction !== '#' && formAction !== 'https://formspree.io/f/YOUR_FORM_ID_HERE') {
                // Attempt AJAX submission ONLY if a valid action URL is set
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
                         // Handle server errors or issues
                        response.json().then(data => {
                            if (Object.hasOwn(data, 'errors')) {
                                // Show Formspree specific errors, e.g.
                                const errorMsg = data["errors"].map(error => error["message"]).join(", ");
                                formStatus.textContent = `Oops! There was a problem: ${errorMsg}`;
                            } else {
                                formStatus.textContent = 'Oops! There was a problem submitting your form.';
                            }
                            formStatus.classList.add('error');
                        })
                    }
                }).catch(error => {
                    // Handle network errors
                    formStatus.textContent = 'Oops! There was a network problem submitting your form.';
                    formStatus.classList.add('error');
                    console.error('Form submission error:', error);
                });

            } else if (formAction === 'https://formspree.io/f/YOUR_FORM_ID_HERE' || !formAction || formAction === '#') {
                // If using placeholder or no action, just show simulation
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
    const existingRipples = button.querySelectorAll(".ripple");
    existingRipples.forEach(ripple => ripple.remove());
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    const rippleX = event.clientX - rect.left - radius;
    const rippleY = event.clientY - rect.top - radius;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${rippleX}px`;
    circle.style.top = `${rippleY}px`;
    circle.classList.add("ripple");
    button.appendChild(circle);
    setTimeout(() => { circle.remove(); }, 600);
}
const buttonsWithRipple = document.querySelectorAll(".ripple-button, .footer-social-link");
buttonsWithRipple.forEach(button => { button.addEventListener("click", createRipple); });

const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); }

document.addEventListener('DOMContentLoaded', () => {
    scrollActive();
});