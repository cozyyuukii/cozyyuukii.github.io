document.addEventListener('DOMContentLoaded', () => {

    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {"value": 50, "density": {"enable": true, "value_area": 800}},
                "color": {"value": ["#8A2BE2", "#00ffff", "#444444"]},
                "shape": {"type": "circle"},
                "opacity": {"value": 0.5,"random": true,"anim": {"enable": true,"speed": 0.5,"opacity_min": 0.1,"sync": false}},
                "size": {"value": 2,"random": true,"anim": {"enable": false}},
                "line_linked": {"enable": true,"distance": 130,"color": "#303030","opacity": 0.2,"width": 1},
                "move": {"enable": true,"speed": 1,"direction": "none","random": true,"straight": false,"out_mode": "out","bounce": false}
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {"onhover": {"enable": true,"mode": "grab"},"onclick": {"enable": false},"resize": true},
                "modes": {"grab": {"distance": 120,"line_linked": {"opacity": 0.5}}}
            },
            "retina_detect": true
        });
    } else {
        console.error("particles.js not loaded");
    }

    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const sections = document.querySelectorAll('.section-block');
    const revealOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, revealOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    window.smoothScroll = function(targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            const headerOffset = document.getElementById('main-header')?.offsetHeight || 70;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
            const nav = document.querySelector('#main-header nav');
             if (nav && nav.classList.contains('active')) {
                 mobileNavToggle.setAttribute('aria-expanded', 'false');
                 nav.classList.remove('active');
            }
        } else {
            console.warn(`Element with selector "${targetSelector}" not found for smooth scroll.`);
        }
    }

    const navLinks = document.querySelectorAll('#main-header nav a');
    const headerHeight = header?.offsetHeight || 70;

    const highlightNav = () => {
        let fromTop = window.scrollY + headerHeight + 50;
        let currentSectionId = null;
        let maxVisibleRatio = 0; // Track the section most visible

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const visibleTop = Math.max(headerHeight, sectionTop - window.scrollY);
            const visibleBottom = Math.min(window.innerHeight, sectionTop + sectionHeight - window.scrollY);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleRatio = visibleHeight / sectionHeight; // Ratio of section height visible

            // Check if section is within the detection zone
            if (sectionTop <= fromTop && (sectionTop + sectionHeight) > fromTop) {
                 // Prioritize the section with the largest visible ratio
                 if (visibleRatio > maxVisibleRatio) {
                     maxVisibleRatio = visibleRatio;
                     currentSectionId = section.getAttribute('id');
                 }
            }
        });

        // Fallbacks
        if (!currentSectionId && window.scrollY < sections[0]?.offsetTop - headerHeight) {
             currentSectionId = 'home';
        }
        else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && maxVisibleRatio < 0.1) { // If near bottom and no section is significantly visible
             const lastSection = sections[sections.length - 1];
             currentSectionId = lastSection?.getAttribute('id') || 'contact';
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    };


    window.addEventListener('scroll', highlightNav);
    highlightNav();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                smoothScroll(targetId);
            }
        });
    });

    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('#main-header nav');

    if (mobileNavToggle && nav) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
        });
    }

    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        backToTopButton.addEventListener('click', () => smoothScroll('#home'));
    }

    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const terminalWindow = document.getElementById('terminal-window');
    const terminalActualOutputArea = document.getElementById('terminal-output');

    const commandHistory = [];
    let historyIndex = -1;

    const appendOutput = (htmlContent, isHelp = false) => {
         const outputLine = document.createElement('div');
         if (isHelp) {
             outputLine.classList.add('help-line'); // Add class for flex alignment
         }
         // Be cautious with innerHTML - ensure content is controlled or sanitized
         outputLine.innerHTML = htmlContent;
         terminalActualOutputArea.appendChild(outputLine);
         terminalActualOutputArea.scrollTop = terminalActualOutputArea.scrollHeight;
     };


    const formatHelpLine = (command, description) => {
         const paddedCommand = command.padEnd(16, ' '); // Adjust padding
         // Wrap each part in spans for flexbox control in CSS
         return `<span class="help-command">${paddedCommand}</span><span class="help-description">${description}</span>`;
     };

    const executeCommand = (cmd) => {
        const trimmedCmd = cmd.trim();
        const lowerCmd = trimmedCmd.toLowerCase();

        if (trimmedCmd) {
            const echoedCmd = trimmedCmd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            appendOutput(`<span class="terminal-prompt">yuukii@portfolio:~$</span> ${echoedCmd}`);
        } else {
             appendOutput('');
             return;
        }

         if (trimmedCmd && (commandHistory.length === 0 || trimmedCmd !== commandHistory[commandHistory.length - 1])) {
            commandHistory.push(trimmedCmd);
        }
        historyIndex = commandHistory.length;

        let result = '';
        let isHelpOutput = false; // Flag for help command output

        switch (lowerCmd) {
            case 'help':
                 isHelpOutput = true;
                 result = `Available commands:\n` +
                           `${formatHelpLine('help', 'Display this help message')}\n` +
                           `${formatHelpLine('whoami', 'Reveal secret identity')}\n` +
                           `${formatHelpLine('skills', 'List digital powers')}\n` +
                           `${formatHelpLine('passion', 'What fuels the engine?')}\n` +
                           `${formatHelpLine('contact', 'How to send a signal')}\n` +
                           `${formatHelpLine('portfolio', 'View classified projects (maybe)')}\n` +
                           `${formatHelpLine('joke', 'Attempt at humor')}\n` +
                           `${formatHelpLine('date', 'Check system time')}\n` +
                           `${formatHelpLine('coffee', 'Check caffeine levels')}\n` +
                           `${formatHelpLine('motivate', 'Request motivation')}\n` +
                           `${formatHelpLine('dance', 'Initiate cringe protocol')}\n` +
                           `${formatHelpLine('life --meaning', 'Ponder existence')}\n` +
                           `${formatHelpLine('clear', 'Clear the terminal screen')}\n` +
                           `${formatHelpLine('sudo', 'Elevate privileges?')}`;
                 break;
             case 'whoami':
                 result = `User: Yuukii\nAffiliation: Freelance Code Conjurer & Rhythm Renegade\nStatus: <span class="status-critical">Probably needs more coffee</span>`;
                 break;
             case 'skills':
                 result = `Scanning Skill Matrix v3.14...\n` +
                            `<span class="output-info">Frontend</span>: HTML, CSS, JavaScript (Fluent in Web)\n` +
                            `<span class="output-info">Backend</span>: Python, Java, MySQL (Server-side spells)\n` +
                            `<span class="output-info">Workflow</span>: Git, VS Code (47 tabs), CLI (\`sudo make sandwich\`)\n` +
                            `<span class="output-warning">Secret Skill</span>: Untangling headphone cables (Level: Expert)`;
                 break;
              case 'passion':
                 result = `Core Directive: Rhythm & Code Fusion.\nAnalogy: Drum solos ≈ Code comments (loud, chaotic, 80% unnecessary).\nFun fact: Drumsticks = Binary Converters (<code>01001000 01101001</code>).`;
                 break;
             case 'contact':
                  result = `Communication Protocols:\n- Primary: Contact form below (ETA: Maybe)\n- Secondary: Social media (Footer)\n- Tertiary: Shouting (Effectiveness: Low)`;
                  break;
             case 'portfolio':
                 result = `Accessing Project Database... Querying...\n- LDTF: <span class="status-warning">[90% Complete, 300% Over Deadline]</span>\n- Invisibility API: <span class="status-info">[Status: Operational?]</span> Object not found.\n<span class="output-warning">Warning: May contain existential dread.</span>`;
                 break;
             case 'joke':
                 const jokes = [
                     "Why don't scientists trust atoms? Because they make up everything!",
                     "Why did the programmer quit his job? He didn't get arrays.",
                     "What's the object-oriented way to become wealthy? Inheritance.",
                     "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
                     "Debugging: Removing the needles from the haystack.",
                     "There are 10 types of people in the world: those who understand binary, and those who don't.",
                     "Why do programmers prefer dark mode? Because light attracts bugs."
                 ];
                 result = jokes[Math.floor(Math.random() * jokes.length)];
                 break;
             case 'date':
                 result = `Current System Time: ${new Date().toLocaleString()}`;
                 break;
             case 'coffee':
                 result = `<span class="output-warning">System Alert: CRITICAL levels detected. Initiate emergency brew protocol! ☕</span>`;
                 break;
              case 'motivate':
                 result = `<span class="output-error">Error 418: Teapot detected. Motivation module offline. Try chocolate? 🍫</span>`;
                  break;
             case 'dance':
                  result = `Executing <span class="output-info">/usr/bin/cringe.sh</span>... 💃🕺✨`;
                  break;
             case 'life --meaning':
                  result = `<span class="output-success">Calculating... Answer: 42.</span> (But have you tried 'reboot'?)`;
                  break;
             case 'clear':
                 terminalActualOutputArea.innerHTML = `<div>Terminal cleared. Type 'help' to start again.</div><div>------------------------------------------------------</div>`;
                 return;
              case 'sudo':
                  result = `<span class="output-error">Permission Denied. This incident will be reported. (Just kidding... maybe).</span>`;
                   break;
              case '':
                  return;
             default:
                  const unknownCmd = lowerCmd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                 result = `Command not found: <span class="output-error">${unknownCmd}</span>. Try 'help'.`;
        }

        // Handle multi-line output (like help) by splitting and appending each line
        const lines = result.split('\n');
        lines.forEach(line => {
            // Pass the isHelpOutput flag to appendOutput for help lines
            appendOutput(line, isHelpOutput);
        });
    };


    if (terminalInput && terminalOutput && terminalWindow && terminalActualOutputArea) {
        terminalWindow.addEventListener('click', (e) => {
            if (e.target !== terminalActualOutputArea || e.offsetX < terminalActualOutputArea.clientWidth) {
                 terminalInput.focus();
            }
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = terminalInput.value;
                executeCommand(command);
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                 e.preventDefault();
                if (commandHistory.length > 0) {
                    historyIndex = Math.max(0, historyIndex - 1);
                    terminalInput.value = commandHistory[historyIndex];
                    setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
                }
            } else if (e.key === 'ArrowDown') {
                 e.preventDefault();
                 if (commandHistory.length > 0) {
                    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
                    if (historyIndex === commandHistory.length) {
                        terminalInput.value = '';
                    } else {
                        terminalInput.value = commandHistory[historyIndex];
                       setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
                    }
                }
            } else if (e.key === 'Tab') {
                 e.preventDefault();
            }
        });

    } else {
        console.error("Terminal elements not found. Command execution unavailable.");
    }

    console.log("Yuukii's v4 portfolio loaded. Alignment protocols engaged.");
});
