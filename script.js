const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const yearElement = document.getElementById('year');

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!isExpanded));
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute('rel', 'noopener noreferrer');
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate').forEach((element) => {
    observer.observe(element);
});

const progressBars = document.querySelectorAll('.progress');
const animateProgress = () => {
    progressBars.forEach((bar) => {
        const width = bar.getAttribute('data-width');
        if (width) {
            bar.style.width = width;
        }
    });
};

const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateProgress();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    skillsObserver.observe(skillsSection);
}

document.querySelectorAll('.gallery-item a.view-btn').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
    });
});

/* Contact form / EmailJS integration */
// Configuration (easy to find/change)
const EMAILJS_SERVICE_ID = '4848tech';
const EMAILJS_NOTIFY_TEMPLATE_ID = '4848tech';
const EMAILJS_AUTOREPLY_TEMPLATE_ID = 'template_6n6h4gr';
const EMAILJS_PUBLIC_KEY = 'uxeMogUBIt8BBaDwW'; // change this variable to update the public key

document.addEventListener('DOMContentLoaded', () => {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('contact-submit');
    const statusEl = document.getElementById('form-status');

    if (!form) return;

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            statusEl.textContent = 'Please complete all fields.';
            statusEl.style.color = '#ffd166';
            return;
        }

        if (!isValidEmail(email)) {
            statusEl.textContent = 'Please enter a valid email address.';
            statusEl.style.color = '#ffd166';
            return;
        }

        // Disable submit button to prevent multiple clicks
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        statusEl.textContent = 'Sending…';
        statusEl.style.color = '';

        // Match template variables to the form field names so templates can use these keys
        const notifyParams = {
            name: name,
            email: email,
            textarea: message
        };

        const autoreplyParams = {
            user_name: name,
            user_email: email,
            message: message
        };

        // Send both emails; handle individual outcomes with Promise.allSettled so we can report partial success
        Promise.allSettled([
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NOTIFY_TEMPLATE_ID, notifyParams, EMAILJS_PUBLIC_KEY),
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE_ID, autoreplyParams, EMAILJS_PUBLIC_KEY)
        ]).then((results) => {
            // results is an array of { status: 'fulfilled'|'rejected', value?, reason? }
            const [notifyRes, autoRes] = results;
            console.log('Notify email result', notifyRes);
            console.log('Autoreply email result', autoRes);

            const notifyOK = notifyRes.status === 'fulfilled';
            const autoOK = autoRes.status === 'fulfilled';

            if (notifyOK && autoOK) {
                statusEl.textContent = 'Message sent — thank you! I will reply soon.';
                statusEl.style.color = '#a7f3d0';
                form.reset();
            } else if (notifyOK || autoOK) {
                // Partial success
                let parts = [];
                if (notifyOK) parts.push('notification to owner');
                if (autoOK) parts.push('auto-reply to you');
                statusEl.textContent = `Message sent (${parts.join(' and ')} succeeded).`;
                statusEl.style.color = '#ffd166';
                form.reset();

                // Log rejection details for whichever failed
                if (!notifyOK) console.error('Notify send failed:', notifyRes.reason);
                if (!autoOK) console.error('Autoreply send failed:', autoRes.reason);
            } else {
                // Both failed
                console.error('Both EmailJS sends failed:', { notify: notifyRes.reason, autoreply: autoRes.reason });
                statusEl.textContent = 'Sorry — something went wrong sending your message. Please try again later.';
                statusEl.style.color = '#ff7b7b';
            }
        }).catch((err) => {
            // This catch is unlikely because allSettled never rejects, but keep it to be safe
            console.error('Unexpected EmailJS error:', err);
            statusEl.textContent = 'Sorry — something went wrong sending your message. Please try again later.';
            statusEl.style.color = '#ff7b7b';
        }).finally(() => {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
        });
    });

        /* CV Request Modal (Web3Forms) */
        const requestCvBtn = document.getElementById('request-cv-btn');
        const cvModalOverlay = document.getElementById('cv-modal');
        const cvForm = document.getElementById('cv-request-form');
        const cvStatus = document.getElementById('cv-form-status');

        let previousFocus = null;

        const openCvModal = () => {
            if (!cvModalOverlay) return;
            previousFocus = document.activeElement;
            cvModalOverlay.hidden = false;
            cvModalOverlay.setAttribute('aria-hidden', 'false');
            const firstInput = document.getElementById('cv-name');
            if (firstInput) firstInput.focus();
            document.addEventListener('keydown', handleEscape);
        };

        const closeCvModal = () => {
            if (!cvModalOverlay) return;
            cvModalOverlay.hidden = true;
            cvModalOverlay.setAttribute('aria-hidden', 'true');
            cvStatus.textContent = '';
            if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
            document.removeEventListener('keydown', handleEscape);
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') closeCvModal();
        };

        if (requestCvBtn && cvModalOverlay) {
            requestCvBtn.addEventListener('click', openCvModal);

            // close button
            const closeBtn = cvModalOverlay.querySelector('.modal-close');
            if (closeBtn) closeBtn.addEventListener('click', closeCvModal);

            // cancel button
            const cancelBtn = cvModalOverlay.querySelector('.modal-cancel');
            if (cancelBtn) cancelBtn.addEventListener('click', closeCvModal);

            // click outside to close
            cvModalOverlay.addEventListener('click', (ev) => {
                if (ev.target === cvModalOverlay) closeCvModal();
            });
        }

        if (cvForm) {
            cvForm.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                const name = document.getElementById('cv-name').value.trim();
                const email = document.getElementById('cv-email').value.trim();
                const company = document.getElementById('cv-company').value.trim();
                const reason = document.getElementById('cv-reason').value.trim();
                const submitBtnCv = document.getElementById('cv-submit');

                const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

                if (!name || !email) {
                    cvStatus.textContent = 'Please provide your name and a valid email address.';
                    cvStatus.style.color = '#ffd166';
                    return;
                }

                if (!isValidEmail(email)) {
                    cvStatus.textContent = 'Please enter a valid email address.';
                    cvStatus.style.color = '#ffd166';
                    return;
                }

                // honeypot check
                const botcheck = cvForm.querySelector('input[name="botcheck"]');
                if (botcheck && botcheck.checked) {
                    // silently drop
                    console.warn('Botcheck triggered - aborting CV request');
                    return;
                }

                // disable button
                if (submitBtnCv) {
                    submitBtnCv.disabled = true;
                    submitBtnCv.setAttribute('aria-busy', 'true');
                }
                cvStatus.textContent = 'Sending…';
                cvStatus.style.color = '';

                const message = `Company: ${company || 'Not provided'}\nReason: ${reason || 'Not provided'}`;

                const payload = {
                    access_key: '7c194dd6-1b39-4d40-9dd0-03b4cbbca225',
                    subject: 'New CV Request from Portfolio',
                    name: name,
                    email: email,
                    message: message
                };

                try {
                    const res = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        cvStatus.textContent = "Thanks! Your request has been received — I'll follow up by email shortly.";
                        cvStatus.style.color = '#a7f3d0';
                        cvForm.reset();
                        // leave modal open but clear inputs; alternatively close after short delay
                        setTimeout(closeCvModal, 1800);
                    } else {
                        console.error('Web3Forms error response:', data);
                        cvStatus.textContent = 'Sorry — something went wrong sending your request. Please try again later.';
                        cvStatus.style.color = '#ff7b7b';
                    }
                } catch (err) {
                    console.error('Web3Forms submission error:', err);
                    cvStatus.textContent = 'Sorry — something went wrong sending your request. Please try again later.';
                    cvStatus.style.color = '#ff7b7b';
                } finally {
                    if (submitBtnCv) {
                        submitBtnCv.disabled = false;
                        submitBtnCv.removeAttribute('aria-busy');
                    }
                }
            });
        }
});
