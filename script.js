const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close'),
      bodyElement = document.body; // Get the body element

// --- Navigation Menu Toggle ---
if (navToggle) {
    navToggle.addEventListener('click', () => {
        if (navMenu) navMenu.classList.add('show-menu');
        navToggle.setAttribute('aria-expanded', 'true');
        bodyElement.classList.add('nav-open'); // Add class to body to prevent scroll
    });
}
if (navClose) {
    navClose.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('show-menu');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        bodyElement.classList.remove('nav-open'); // Remove class from body
    });
}

// --- Close Menu on Link Click ---
const navLinks = document.querySelectorAll('.nav-link');
function linkAction() {
    // Check if the menu exists and is currently shown
    if (navMenu && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        // Ensure navToggle exists before setting attribute
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        bodyElement.classList.remove('nav-open'); // Remove class from body on link click
    }
}
navLinks.forEach(n => n.addEventListener('click', linkAction));

// --- Header Shadow on Scroll ---
function scrollHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    // Use pageYOffset for better cross-browser compatibility
    if (window.pageYOffset >= 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
}
window.addEventListener('scroll', scrollHeader);

// --- Show Scroll Up Button ---
function scrollUp() {
    const scrollUpButton = document.getElementById('scroll-up');
    if (!scrollUpButton) return;
    // Use pageYOffset for better cross-browser compatibility
    if (window.pageYOffset >= 350) scrollUpButton.classList.add('show-scroll'); else scrollUpButton.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

// --- Active Link Highlighting on Scroll ---
const sections = document.querySelectorAll('section[id]');
function scrollActive() {
    const scrollY = window.pageYOffset; // Consistent use of pageYOffset
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight + 10 : 68; // Add buffer
    let foundActive = false;
    let potentialActiveLink = null;

    sections.forEach(current => {
        if (!current) return;
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - headerHeight;
        const sectionId = current.getAttribute('id');
        const correspondingLink = document.querySelector('.nav-menu a[href="#' + sectionId + '"]');

        if (correspondingLink) {
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                 potentialActiveLink = correspondingLink;
                 foundActive = true;
            }
        }
    });

    // Check Hero section if no other section is active
    if (!foundActive) {
        const heroLink = document.querySelector('.nav-menu a[href="#hero"]');
        // Ensure sections[0] exists before accessing offsetTop
        const firstSectionTop = sections.length > 0 ? sections[0].offsetTop - headerHeight : window.innerHeight;
        if (heroLink && scrollY < firstSectionTop) {
             potentialActiveLink = heroLink;
        }
    }

    // Update active classes
    document.querySelectorAll('.nav-menu .active-link').forEach(link => link.classList.remove('active-link'));
    if(potentialActiveLink) {
        potentialActiveLink.classList.add('active-link');
    } else {
        // Fallback: If nothing is active (e.g., scrolled past last section), maybe activate contact or last link? Or none.
         const lastLink = document.querySelector('.nav-menu li:last-child a');
         if (lastLink && scrollY >= (document.documentElement.scrollHeight - window.innerHeight - 10)) { // Check if near bottom
            // lastLink.classList.add('active-link'); // Option: activate last link
         }
    }
}
window.addEventListener('scroll', scrollActive, { passive: true });
// Run on load too
document.addEventListener('DOMContentLoaded', scrollActive);


// --- Intersection Observer for Scroll Animations ---
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
    try {
        const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        elementsToAnimate.forEach(el => scrollObserver.observe(el));
    } catch (e) {
        console.error("Failed to initialize IntersectionObserver:", e);
        // Fallback if observer init fails
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        elementsToAnimate.forEach(el => el.classList.add('is-visible'));
    }
} else {
    // Fallback for browsers without IntersectionObserver
    console.warn('IntersectionObserver not supported. Scroll animations disabled or using fallback.');
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => el.classList.add('is-visible'));
}


// --- Contact Form Validation & Submission ---
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
    // Simple regex, consider a more robust one if needed
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).toLowerCase());
}

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Ensure all elements exist
        if (!nameInput || !emailInput || !messageInput || !formStatus || !hiddenReplyTo) {
             console.error("One or more contact form elements could not be found.");
             if(formStatus) {
                 formStatus.textContent = 'Form error. Please refresh the page.';
                 formStatus.className = 'form-status-message error';
             }
             return; // Stop execution if elements are missing
        }

        // Set the hidden _replyto field value dynamically
        hiddenReplyTo.value = emailInput.value.trim();

        let isValid = true;
        formStatus.textContent = ''; // Clear previous status
        formStatus.className = 'form-status-message'; // Reset status class

        // Clear previous errors
        clearError(nameInput);
        clearError(emailInput);
        clearError(messageInput);

        // --- Validation ---
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name.'); isValid = false;
        }
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email address.'); isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address.'); isValid = false;
        }
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Please enter your message.'); isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showError(messageInput, 'Message should be at least 10 characters long.'); isValid = false;
        }
        // --- End Validation ---

        if (isValid) {
            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');

            // Check if a real action URL is set (not the placeholder)
            if (formAction && formAction !== '#' && formAction !== 'https://formspree.io/f/YOUR_FORM_ID_HERE') {
                // Set status to 'Sending...'
                formStatus.textContent = 'Sending...';
                formStatus.className = 'form-status-message'; // Neutral class

                fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Formspree requirement
                    }
                }).then(response => {
                    if (response.ok) {
                        formStatus.textContent = 'Thank you! Your message has been sent.';
                        formStatus.classList.add('success');
                        contactForm.reset(); // Clear the form
                        // Clear status after 5 seconds
                        setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status-message'; }, 5000);
                    } else {
                        // Try to parse error from Formspree
                        response.json().then(data => {
                            // Use hasOwnProperty for broader compatibility
                            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                                // Format Formspree errors
                                const errorMsg = data["errors"].map(error => `${error["field"] ? error["field"]+': ' : ''}${error["message"]}`).join(", ");
                                formStatus.textContent = `Oops! ${errorMsg}`;
                            } else {
                                // Generic server error
                                formStatus.textContent = 'Oops! There was a problem submitting your form.';
                            }
                            formStatus.classList.add('error');
                        }).catch(() => {
                            // Handle cases where response is not valid JSON
                            formStatus.textContent = 'Oops! Server error. Could not submit form.';
                            formStatus.classList.add('error');
                        });
                    }
                }).catch(error => {
                    // Handle network errors
                    console.error('Form submission network error:', error);
                    formStatus.textContent = 'Network error. Please check your connection.';
                    formStatus.classList.add('error');
                });

            } else { // Handle placeholder action URL
                console.warn('Form action URL is a placeholder. Submission simulated.');
                formStatus.textContent = 'Setup Complete! (Form not sent - update action URL)';
                formStatus.classList.add('success'); // Show success for simulation
                contactForm.reset();
                setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status-message'; }, 5000);
            }
        } else { // Form is invalid
            formStatus.textContent = 'Please correct the errors above.';
            formStatus.classList.add('error');
        }
    });

    // Add real-time clearing of errors on input
    if (nameInput) nameInput.addEventListener('input', () => clearError(nameInput));
    if (emailInput) emailInput.addEventListener('input', () => clearError(emailInput));
    if (messageInput) messageInput.addEventListener('input', () => clearError(messageInput));
} else {
    console.warn("Contact form element not found.");
}


// --- Ripple Effect for Buttons ---
function createRipple(event) {
    const button = event.currentTarget;
    if (!button) return;

    // Create the ripple element
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    // Calculate position relative to the button
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    // Check for existing ripples and remove them before adding a new one
    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
        existingRipple.remove();
    }

    // Add the new ripple
    button.appendChild(circle);

    // Clean up the ripple element after animation using animationend event
    circle.addEventListener('animationend', () => {
        circle.remove();
    }, { once: true }); // Ensure the listener runs only once
}

// Select all elements that should have the ripple effect
const buttonsWithRipple = document.querySelectorAll(".button, .footer-social-link");
buttonsWithRipple.forEach(button => {
    // Add event listener only once using a data attribute flag
    if (!button.dataset.rippleAttached) {
        button.addEventListener("click", createRipple);
        button.dataset.rippleAttached = "true";
    }
});

// --- Update Footer Year ---
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    try {
        currentYearSpan.textContent = new Date().getFullYear();
    } catch (e) {
        console.error("Failed to set current year:", e);
        currentYearSpan.textContent = "2024"; // Fallback
    }
}

// --- Handle Resize for Mobile Menu ---
// Optional: Close mobile menu if window is resized to desktop width
window.addEventListener('resize', () => {
    const desktopBreakpoint = 768; // Match your CSS breakpoint
    if (window.innerWidth >= desktopBreakpoint) {
        // Check if mobile menu is open
        if (navMenu && navMenu.classList.contains('show-menu')) {
            navMenu.classList.remove('show-menu');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
            bodyElement.classList.remove('nav-open');
        }
    }
});
