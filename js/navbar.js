// 네비게이션 바 생성 및 관리

function createNavbar(activePage) {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
        <div class="navbar-container">
            <a href="index.html" class="navbar-brand">
                <span>🏥</span>
                <span>원장 스타일 진단</span>
            </a>

            <button class="navbar-toggle" onclick="toggleMenu()">
                ☰
            </button>

            <ul class="navbar-menu" id="navbarMenu">
                <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">홈</a></li>
                <li><a href="index.html#start" class="${activePage === 'start' ? 'active' : ''}">진단 시작</a></li>
                <li><a href="test-demo.html" class="${activePage === 'demo' ? 'active' : ''}">시연 보기</a></li>
            </ul>
        </div>
    `;

    // body의 맨 앞에 추가
    document.body.insertBefore(navbar, document.body.firstChild);
}

function toggleMenu() {
    const menu = document.getElementById('navbarMenu');
    menu.classList.toggle('active');
}

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const menu = document.getElementById('navbarMenu');
    const toggle = document.querySelector('.navbar-toggle');

    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// 메뉴 링크 클릭 시 모바일 메뉴 닫기
document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.navbar-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            const menu = document.getElementById('navbarMenu');
            if (menu) {
                menu.classList.remove('active');
            }
        });
    });
});
