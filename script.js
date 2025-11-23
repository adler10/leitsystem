document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            const isExpanded = !navLinks.classList.contains('hidden');
            mobileBtn.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Initialize Lucide icons (Global)
    const initIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 100);
        }
    };

    initIcons();
});
