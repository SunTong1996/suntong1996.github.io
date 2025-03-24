// 滚动平滑效果
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // 考虑导航栏的高度
                behavior: 'smooth'
            });
        }
    });
});

// 导航栏滚动效果和当前部分高亮
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    // 高亮当前滚动到的部分
    highlightCurrentSection();
    
    // 显示或隐藏返回顶部按钮
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// 高亮当前部分
function highlightCurrentSection() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// 返回顶部按钮功能
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 暗黑模式切换
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 检查本地存储中的主题设置
if (localStorage.getItem('theme') === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', function() {
    if (this.checked) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// 打字效果函数
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 技能进度条动画
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const percent = bar.getAttribute('data-percent') + '%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = percent;
        }, 200);
    });
}

// 检测元素是否在视口中
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
    );
}

// 监听滚动以触发技能进度条动画
let skillsAnimated = false;
window.addEventListener('scroll', () => {
    if (!skillsAnimated) {
        const skillsSection = document.getElementById('skills');
        if (isInViewport(skillsSection)) {
            animateSkillBars();
            skillsAnimated = true;
        }
    }
});

// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前年份
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // 导航平滑滚动
    document.querySelectorAll('nav a, .footer-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // 更新URL但不跳转
                history.pushState(null, null, targetId);
            }
        });
    });

    // 导航栏阴影效果
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 返回顶部按钮
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 暗黑模式切换
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // 从本地存储中获取主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // 高亮当前活动的导航链接
    function highlightCurrentSection() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionTop + sectionHeight - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection(); // 初始化时运行一次

    // 打字效果
    function typeText(element, text, speed) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const originalText = typingElement.textContent;
        typeText(typingElement, originalText, 150);
    }

    // 技能条动画
    function animateSkills() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent');
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = percent + '%';
            }, 200);
        });
    }
    
    // 核心优势悬停效果增强
    const coreValueItems = document.querySelectorAll('.core-value-item');
    coreValueItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover-effect');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover-effect');
        });
    });

    // 添加淡入动画
    function addFadeInAnimation() {
        const elementsToAnimate = document.querySelectorAll('.core-value-item, .timeline-item, .skill-category, .publication-item, .testimonial-item, .honor-item, .impact-item');
        
        elementsToAnimate.forEach(element => {
            element.classList.add('fade-in');
        });
    }
    
    // 检查元素是否在视口中
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // 当元素进入视口时触发动画
    function handleScrollAnimation() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            if (isInViewport(section) && !section.classList.contains('animated')) {
                section.classList.add('animated');
                
                // 为各部分元素添加动画
                const elementsToAnimate = section.querySelectorAll('.core-value-item, .timeline-item, .skill-item, .publication-item, .testimonial-item, .honor-item, .impact-item');
                
                elementsToAnimate.forEach((element, index) => {
                    element.style.animationDelay = `${0.1 * index}s`;
                    element.classList.add('fade-in');
                });
                
                // 如果是技能区域，触发技能条动画
                if (section.id === 'skills') {
                    animateSkills();
                }
            }
        });
    }
    
    // 首次加载时和滚动时都检查动画
    handleScrollAnimation();
    window.addEventListener('scroll', handleScrollAnimation);

    // 卡片翻转效果
    const cardFlips = document.querySelectorAll('.card-flip');
    cardFlips.forEach(card => {
        card.addEventListener('click', function() {
            this.querySelector('.card-inner').classList.toggle('flipped');
        });
    });

    // 简历下载事件跟踪
    const cvDownloadButton = document.querySelector('.cv-download a');
    if (cvDownloadButton) {
        cvDownloadButton.addEventListener('click', function() {
            console.log('简历下载');
            // 这里可以添加分析跟踪代码
        });
    }

    // 平滑显示页面内容
    document.body.classList.add('loaded');

    // 新增功能
    lazyLoadImages();
    handleImageErrors();
    setupArticleCards();
    setupQRCodeHover();
    setupExternalLinks();
    setupImageZoom();
});

// 预加载图像以提高性能
function preloadImages() {
    const imagesToPreload = [
        document.querySelector('.profile-photo')?.src,
        ...Array.from(document.querySelectorAll('.school-logo img')).map(img => img.src),
        ...Array.from(document.querySelectorAll('.work-image img')).map(img => img.src),
        ...Array.from(document.querySelectorAll('.card-image img')).map(img => img.src)
    ].filter(Boolean);
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// 图片懒加载函数
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            observer.observe(img);
        });
    } else {
        // 回退到简单的滚动事件监听方式
        function loadImagesOnScroll() {
            images.forEach(img => {
                if (img.getAttribute('data-src') && isInViewport(img)) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                }
            });
        }
        
        window.addEventListener('scroll', loadImagesOnScroll);
        loadImagesOnScroll(); // 初始检查
    }
}

// 图片加载失败处理
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // 如果图片加载失败，替换为占位图
            if (!this.classList.contains('error-handled')) {
                this.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
                this.classList.add('error-handled');
            }
        });
    });
}

// 文章卡片悬停效果
function setupArticleCards() {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hovered');
        });
    });
}

// 二维码悬停显示
function setupQRCodeHover() {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        const qrCode = item.querySelector('.wechat-qr');
        if (qrCode) {
            item.addEventListener('mouseenter', function() {
                qrCode.style.display = 'block';
            });
            
            item.addEventListener('mouseleave', function() {
                qrCode.style.display = 'none';
            });
        }
    });
}

// 外部链接处理
function setupExternalLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
        // 安全考虑：为外部链接添加rel属性
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
        
        // 为链接添加图标（如果还没有）
        if (!link.querySelector('.fa-external-link-alt') && !link.querySelector('.fa-arrow-right')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-external-link-alt';
            icon.style.marginLeft = '5px';
            icon.style.fontSize = '0.8em';
            link.appendChild(icon);
        }
    });
}

// 图片缩放查看功能
function setupImageZoom() {
    const zoomableImages = document.querySelectorAll('.work-image img, .article-image img');
    
    zoomableImages.forEach(img => {
        img.addEventListener('click', function() {
            const modal = document.createElement('div');
            modal.className = 'image-zoom-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '9999';
            modal.style.cursor = 'zoom-out';
            
            const zoomedImg = document.createElement('img');
            zoomedImg.src = this.src;
            zoomedImg.style.maxWidth = '90%';
            zoomedImg.style.maxHeight = '90%';
            zoomedImg.style.objectFit = 'contain';
            zoomedImg.style.transition = 'transform 0.3s ease';
            
            modal.appendChild(zoomedImg);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function() {
                this.remove();
            });
        });
        
        // 添加指示器表明图片可缩放
        img.style.cursor = 'zoom-in';
    });
}

// 执行预加载
window.onload = function() {
    preloadImages();
}; 