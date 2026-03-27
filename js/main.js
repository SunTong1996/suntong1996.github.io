(function () {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const backToTopButton = document.getElementById('back-to-top');
    const typingElement = document.getElementById('typing-text');

    // 主题初始化
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', function () {
            const theme = this.checked ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    // 返回顶部
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('show', window.scrollY > 280);
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 仅处理本页锚点平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId.length < 2) {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    // 外链安全属性
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // 年份
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = String(new Date().getFullYear());
    }

    // 首页轻量打字效果
    if (typingElement) {
        const text = typingElement.textContent || '';
        let i = 0;
        typingElement.textContent = '';

        const timer = setInterval(() => {
            typingElement.textContent += text.charAt(i);
            i += 1;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, 120);
    }
})();
