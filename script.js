// Tailwind CSS JIT Configuration (Optional, if specific overrides are needed)
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    'montserrat': ['Montserrat', 'sans-serif'],
                    'inter': ['Inter', 'sans-serif'],
                    'source-code': ['Source Code Pro', 'monospace'],
                },
                colors: { // To make custom CSS vars available to Tailwind if needed
                    'primary-accent': 'var(--color-primary-accent)',
                    'secondary-accent': 'var(--color-secondary-accent)',
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const mainHeaderElement = document.getElementById('main-header');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const desktopNavLinks = document.querySelectorAll('#main-header nav a.nav-link');
    const mobileNavLinks = document.querySelectorAll('#mobile-menu nav a.mobile-nav-link');
    const allNavLinks = document.querySelectorAll('#main-header nav a:not(.btn-fp), #mobile-menu nav a.mobile-nav-link');

    if (mainHeaderElement) {
        ScrollTrigger.create({
            start: "top -70",
            end: 99999,
            toggleClass: {className: 'header-blur', targets: mainHeaderElement}
        });
    }

    if (mobileNavToggle && mobileMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.classList.toggle('menu-open');
            document.body.classList.toggle('mobile-menu-open', !isExpanded);
        });
    }

    function performScroll(targetElement, targetId) {
        if (!targetElement) {
            console.error('Scroll target not found for ID:', targetId);
            return;
        }
        // Ensure header height is read after potential layout shifts
        const currentHeaderHeight = mainHeaderElement ? mainHeaderElement.offsetHeight : 80;
        let scrollToYPosition;

        if (targetId === '#home') {
            scrollToYPosition = 0;
        } else {
            scrollToYPosition = targetElement.offsetTop - currentHeaderHeight;
            if (scrollToYPosition < 0) {
                scrollToYPosition = 0;
            }
        }
        
        console.log(`Attempting to scroll to ${targetId} at Y: ${scrollToYPosition} (Header height: ${currentHeaderHeight}, Target offsetTop: ${targetElement.offsetTop})`);

        gsap.to(window, {
            duration: 0.8,
            scrollTo: {
                y: scrollToYPosition,
                autoKill: true // Keep true to allow user to interrupt
            },
            ease: "power2.inOut",
            onComplete: () => console.log(`Scroll to ${targetId} completed.`),
            onInterrupt: () => console.warn(`Scroll to ${targetId} interrupted.`)
        });
    }

    allNavLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) {
                console.error('Target element not found for ID:', targetId, "in allNavLinks handler");
                return;
            }

            if (this.classList.contains('mobile-nav-link') && mobileMenu && mobileMenu.classList.contains('menu-open')) {
                console.log('Mobile nav link clicked:', targetId);
                if (mobileNavToggle) {
                   mobileNavToggle.setAttribute('aria-expanded', 'false');
                }
                mobileMenu.classList.remove('menu-open');
                document.body.classList.remove('mobile-menu-open'); // Re-enable body scroll

                // Enhanced delay for mobile scroll
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        performScroll(targetElement, targetId);
                    }, 50); // Small delay after rAF
                });
            } else {
                 console.log('Desktop nav link or non-open mobile menu link clicked:', targetId);
                performScroll(targetElement, targetId);
            }
        });
    });

    const sections = document.querySelectorAll('main section[id]');
    function updateActiveLink() {
        let currentSectionId = 'home';
        const currentHeaderHeightForActiveLink = mainHeaderElement ? mainHeaderElement.offsetHeight : 80;
        // Add a small buffer to the scrollY to make detection more robust near edges
        const scrollYWithOffset = window.scrollY + currentHeaderHeightForActiveLink + Math.min(50, window.innerHeight * 0.1);


        sections.forEach(section => {
            // Check if the top of the section is above the offset line AND
            // the bottom of the section is below the offset line.
            // This means the section is currently "active" in the viewport.
            if (section.offsetTop <= scrollYWithOffset && (section.offsetTop + section.offsetHeight) > scrollYWithOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // If scrolled to the very bottom, make the last link active
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) { // 2px buffer for precision
            const lastSection = sections[sections.length-1];
            if (lastSection) {
                currentSectionId = lastSection.id;
            }
        }


        desktopNavLinks.forEach(link => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${currentSectionId}`);
        });
         mobileNavLinks.forEach(link => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${currentSectionId}`);
        });
    }
    window.addEventListener('scroll', updateActiveLink, { passive: true }); // Use passive listener for scroll
    updateActiveLink(); // Initial call

    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            gsap.to(window, { duration: 1, scrollTo: { y: '#home', offsetY: 0 }, ease: "power2.inOut" });
        });
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        }, { passive: true });
    }

    // GSAP Animation Helper Function - toggleActions updated
    const createAnimation = (selector, fromVars, toVarsBase, stagger = 0.08) => {
        gsap.utils.toArray(selector).forEach((el, i) => {
            const delay = el.style.animationDelay ? parseFloat(el.style.animationDelay) : 0;
            gsap.fromTo(el, fromVars, {
                ...toVarsBase,
                delay: delay + (i * stagger),
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", // When the top of the element is 90% from the top of the viewport
                    end: "bottom 10%", // When the bottom of the element is 10% from the top of the viewport
                    toggleActions: "play reverse play reverse", // Play on enter, reverse on leave (from both directions)
                    // markers: true, // Uncomment for debugging ScrollTrigger
                }
            });
        });
    };

    gsap.fromTo("#home h1.g-fade-in-up", { opacity: 0, y: 50, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", delay: 0.2 });
    gsap.fromTo("#home #tagline", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 });
    gsap.fromTo("#home .hero-subtext", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.8 });
    gsap.fromTo("#home .btn-fp", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.5)", stagger: 0.15, delay: 1.1 });
    gsap.fromTo("#main-header .g-fade-in-down", {opacity:0, y:-20}, {opacity:1, y:0, duration:0.7, ease:"power2.out", stagger:0.1, delay:1.5});

    createAnimation(".section-title.g-fade-in-up", { opacity: 0, y: 50, scale:0.98 }, { opacity: 1, y: 0, scale:1, duration: 0.8, ease: "expo.out" });
    createAnimation(".section-subtitle.g-fade-in-up", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0);
    createAnimation(".decorative-line.g-draw-in", { opacity:0, scaleX: 0 }, { opacity:1, scaleX: 1, duration: 0.7, ease: "power2.out"}, 0);
    createAnimation(".card-fp.g-scale-in, .card-fp.g-fade-in-up", { opacity: 0, scale: 0.95, y:20 }, { opacity: 1, scale: 1, y:0, duration: 0.7, ease: "back.out(1.1)" }, 0.1);
    createAnimation("#journey .timeline-item.g-fade-in-left", { opacity: 0, x: -50, scale:0.98 }, { opacity: 1, x: 0, scale:1, duration: 0.8, ease: "expo.out" }, 0.15);
    createAnimation("#journey .timeline-item.g-fade-in-right", { opacity: 0, x: 50, scale:0.98 }, { opacity: 1, x: 0, scale:1, duration: 0.8, ease: "expo.out" }, 0.15);
    createAnimation("#passion .g-fade-in-right", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" });
    createAnimation("#terminal-window-fp.g-scale-in", { opacity: 0, scale: 0.9, y:40 }, { opacity: 1, scale: 1, y:0, duration: 0.8, ease: "expo.out" });
    createAnimation("#contact-form.g-fade-in-up", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });

    gsap.utils.toArray('#about .card-fp p, #about .card-fp div[class*="font-mono"]').forEach((el, i) => {
        gsap.fromTo(el, {opacity: 0, y: 20}, {
            opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
            delay: (i * 0.1) + 0.1, // Staggered delay for these specific elements
            scrollTrigger: { 
                trigger: el.closest('.card-fp'), 
                start: "top 85%", 
                toggleActions: "play reverse play reverse" // Consistent toggle actions
            }
        });
    });

    const taglineEl = document.getElementById('tagline');
    if (taglineEl) {
        const dynamicTaglines = ["Master of Ctrl+C, Ctrl+V...", "Professional Bug Creator...", "Fluent in Sarcasm & JavaScript...", "World's Okayest Coder..."];
        let currentTaglineIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 90;
        const deleteSpeed = 60;
        const delayBetweenTaglines = 2000;
        const typedCursor = document.createElement('span');
        typedCursor.className = 'typed-cursor-rm';
        typedCursor.textContent = '|';
        typedCursor.setAttribute('aria-hidden', 'true');
        taglineEl.appendChild(typedCursor);

        function typeDynamicTagline() {
            const currentText = dynamicTaglines[currentTaglineIndex];
            let textToDisplay = '';
            if (isDeleting) {
                textToDisplay = currentText.substring(0, charIndex -1);
                charIndex--;
            } else {
                textToDisplay = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            taglineEl.firstChild.textContent = textToDisplay;

            if(!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(typeDynamicTagline, delayBetweenTaglines);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentTaglineIndex = (currentTaglineIndex + 1) % dynamicTaglines.length;
                setTimeout(typeDynamicTagline, typeSpeed / 1.5);
            } else {
                setTimeout(typeDynamicTagline, isDeleting ? deleteSpeed : typeSpeed);
            }
        }
         if(dynamicTaglines.length > 0) gsap.delayedCall(1.8, typeDynamicTagline);
    }

    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput && terminalOutput) {
        terminalInput.closest('#terminal-window-fp').addEventListener('click', (e) => {
             if (e.target.id !== 'terminal-input' && !terminalInput.contains(e.target)) {
                terminalInput.focus();
             }
        });
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = terminalInput.value.trim();
                const echoedCmd = command.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
                if (command) {
                    appendTerminalOutput(`<span class="terminal-prompt">root@mostly-stable:~$</span> ${echoedCmd}`);
                    executeTerminalCommand(command.toLowerCase());
                } else {
                     appendTerminalOutput(`<span class="terminal-prompt">root@mostly-stable:~$</span>`);
                }
                terminalInput.value = '';
            }
        });

        terminalInput.addEventListener('focus', () => {
            console.log('Terminal input focused. Will refresh ScrollTrigger shortly.');
            setTimeout(() => {
                if (typeof ScrollTrigger !== 'undefined') {
                    console.log('Refreshing ScrollTrigger due to terminal focus.');
                    ScrollTrigger.refresh();
                }
            }, 500);
        });
    }
    function appendTerminalOutput(htmlContent) {
        const outputLine = document.createElement('div');
        outputLine.innerHTML = htmlContent;
        terminalOutput.appendChild(outputLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    function executeTerminalCommand(command) {
        let result = '';
        const sanitizedCommand = command.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
         if (command.startsWith('askgemini ')) {
            const query = command.substring('askgemini '.length).trim();
            const sanitizedQuery = query.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
            if (query) {
                result = `Querying conceptual Gemini with: "<span class="text-yellow-300">${sanitizedQuery}</span>"...<br>`;
                setTimeout(() => {
                    let geminiResponse = `Gemini says: "Ah, '${sanitizedQuery}'? That's a fascinating query! My current simulation suggests the answer might involve more coffee, less existential dread, or perhaps just rebooting the universe. For a real answer, you'd need to connect to my actual API endpoint, which is beyond this humble terminal's capabilities. Keep pondering the big questions!"`;
                    appendTerminalOutput(geminiResponse);
                }, 1000);
            } else {
                result = "Usage: askgemini <your profound question>";
            }
        } else {
            switch (command) {
                case 'help':
                    result = `<span>Available commands (use at your own risk):</span><br>
                                      <span class="text-primary-accent">panic</span> - Initiate existential crisis sequence.<br>
                                      <span class="text-primary-accent">coffee</span> - Query caffeine levels (spoiler: always low).<br>
                                      <span class="text-primary-accent">sudo make me a sandwich</span> - Results may vary.<br>
                                      <span class="text-primary-accent">askgemini <query></span> - Consult the digital oracle (conceptual).<br>
                                      <span class="text-primary-accent">clear</span> - Pretend this never happened.`;
                    break;
                case 'panic':
                    result = "Initiating existential crisis... <span class='text-red-500'>Error: Already in progress. System stability critical.</span>";
                    break;
                case 'coffee':
                    result = "Querying... Result: <span class='text-yellow-400'>Dangerously low. Send reinforcements (and possibly a pastry).</span>";
                    break;
                case 'sudo make me a sandwich':
                    result = "Okay. <span class='text-gray-500'>*poof*</span> You are now a sandwich. Hope you enjoy being delicious and quickly consumed. This was not a good idea for your productivity.";
                    break;
                case 'clear':
                    terminalOutput.innerHTML = `<div>Welcome to PanicOS v0.0.1-alpha-rc-final-final (Now with simulated AI!)</div><div>Type "help" for a list of probably useless commands.</div><div class="mt-2 text-gray-400">> coffee.status() <span class="text-gray-500">=> "Critically low. Send help (and beans)."</span></div><div class="text-gray-400">> motivation.exe <span class="text-gray-500">=> "Segmentation fault (core dumped)"</span></div>`;
                    return;
                default:
                    result = `Command not found: <span class="text-red-500">${sanitizedCommand}</span>. Did you try turning it off and on again? Or perhaps 'help'?`;
            }
        }
        if(result) appendTerminalOutput(result);
    }

    const drumMachineContainer = document.getElementById('drum-machine');
    const drumMachineStatus = document.getElementById('drum-machine-status');

    if (drumMachineContainer && typeof Tone !== 'undefined') {
        const sounds = {
            'A': { name: '404 Brain Not Found', synthName: 'Kick', color: 'var(--color-primary-accent)', glow: 'var(--color-portal-glow)' },
            'S': { name: 'Compiler\'s Fury', synthName: 'Snare', color: 'var(--color-secondary-accent)', glow: 'rgba(var(--color-secondary-accent-rgb),0.7)' },
        };
        let synths = {};

        function initializeSynths() {
            if(Tone.context.state === 'running' && Object.keys(synths).length === 0) {
                synths = {
                    'Kick': new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 7, envelope: { attack: 0.001, decay: 0.25, sustain: 0.01, release: 0.7 }}).toDestination(),
                    'Snare': new Tone.NoiseSynth({ noise: { type: "pink", playbackRate: 1 }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.12 }}).toDestination(),
                };
                console.log("Synths initialized.");
            }
        }

        Object.keys(sounds).forEach(keyChar => {
            const soundInfo = sounds[keyChar];
            const pad = document.createElement('button');
            pad.className = 'drum-pad-fp';
            pad.dataset.keyChar = keyChar;
            pad.setAttribute('aria-label', `Play sound ${soundInfo.name} (Key ${keyChar})`);
            pad.innerHTML = `${keyChar.toUpperCase()}<span>${soundInfo.name}</span>`;
            pad.addEventListener('click', () => playSound(keyChar));
            drumMachineContainer.appendChild(pad);
        });

        function playSound(soundKeyChar) {
            if (Tone.context.state !== 'running') {
                if (drumMachineStatus) {
                    drumMachineStatus.textContent = "Click page or press key to start audio first.";
                    drumMachineStatus.style.color = 'var(--color-primary-accent)';
                }
                // Attempt to start audio if not running
                startAudioContext().then(() => {
                    if (Tone.context.state === 'running') playSound(soundKeyChar); // Retry playing sound
                });
                return;
            }
            initializeSynths(); // Ensure synths are created if audio context is running

            const soundInfo = sounds[soundKeyChar];
            if (!soundInfo || !synths[soundInfo.synthName]) {
                console.warn("Sound info or synth not found for key:", soundKeyChar, soundInfo, synths);
                return;
            }
            const synth = synths[soundInfo.synthName];

            if (['Kick'].includes(soundInfo.synthName)) synth.triggerAttackRelease("C2", "8n", Tone.now());
            else synth.triggerAttackRelease("8n", Tone.now());

            const padElement = document.querySelector(`.drum-pad-fp[data-key-char="${soundKeyChar}"]`);
            if (padElement) {
                padElement.classList.add('playing');
                padElement.style.setProperty('--key-color', soundInfo.color);
                padElement.style.setProperty('--key-color-glow', soundInfo.glow);
                setTimeout(() => padElement.classList.remove('playing'), 100);
            }
        }

        async function startAudioContext() {
            if (Tone.context.state !== 'running') {
                try {
                    await Tone.start();
                    console.log("Audio context started by user interaction.");
                    initializeSynths();
                    if (drumMachineStatus) drumMachineStatus.textContent = "Audio ready! Click pads or press A, S.";
                } catch (e) {
                    console.error("Error starting Tone.js audio context:", e);
                    if (drumMachineStatus) drumMachineStatus.textContent = "Could not start audio. Check browser permissions.";
                }
            } else {
                initializeSynths(); // If already running, ensure synths are initialized
            }
        }
        // Add multiple event listeners to start audio context more reliably
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.body.addEventListener(eventType, startAudioContext, { once: true, passive: true });
        });
        

        window.addEventListener('keydown', (e) => {
            const keyChar = e.key.toUpperCase();
             if (sounds[keyChar] && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                 e.preventDefault();
                 playSound(keyChar); // playSound will handle audio context check
            }
        });
    } else if (drumMachineStatus) {
         drumMachineStatus.textContent = "Drum machine could not load (Tone.js missing or container not found).";
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    if (contactForm && formStatus && emailInput && messageInput) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            let statusMessage = '';

            if (emailInput.value.trim() === '' || !emailInput.checkValidity()) {
                statusMessage = 'Whoops! Email is required and needs to be a valid address. Pigeons need coordinates!';
                isValid = false;
            } else if (messageInput.value.trim() === '') {
                 statusMessage = 'Hold on! Your message is looking a bit sparse. What secrets do you wish to share?';
                 isValid = false;
            }

            if (!isValid) {
                formStatus.textContent = statusMessage;
                formStatus.className = 'mt-6 text-sm text-orange-400';
                if (!emailInput.checkValidity() || emailInput.value.trim() === '') emailInput.focus();
                else if (messageInput.value.trim() === '') messageInput.focus();
                return;
            }

            formStatus.textContent = 'Attempting to launch pigeon... Stand by...';
            formStatus.className = 'mt-6 text-sm text-yellow-400';
            
            setTimeout(() => {
                const isSuccess = Math.random() > 0.3;
                if (isSuccess) {
                    formStatus.textContent = 'Pigeon successfully launched! It might reach its destination. Or get eaten. Good luck!';
                    formStatus.className = 'mt-6 text-sm text-primary-accent';
                    contactForm.reset();
                } else {
                    formStatus.textContent = 'Pigeon deployment failed. It seems to be staging a protest. Try smoke signals?';
                    formStatus.className = 'mt-6 text-sm text-red-400';
                }
            }, 1500);
        });
    }

    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    console.log("Yuukii's Elegantly Chaotic Portfolio v2.3.5 (Animation + Mobile Nav Scroll Fixes) Initialized.");
});