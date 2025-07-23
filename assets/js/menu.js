$(document).ready(function() {
    console.log('Menu.js loaded');
    
    // 햄버거 버튼 클릭 이벤트
    $('#side-menu-toggle').on('click', function() {
        console.log('Hamburger button clicked');
        toggleSideMenu();
    });
    
    // 오버레이 클릭시 메뉴 닫기
    $('#menu-overlay').on('click', function() {
        closeSideMenu();
    });
    
    function toggleSideMenu() {
        const sideMenu = $('#side-menu');
        const overlay = $('#menu-overlay');
        
        if (sideMenu.hasClass('active')) {
            closeSideMenu();
        } else {
            openSideMenu();
        }
    }
    
    function openSideMenu() {
        $('#side-menu').addClass('active');
        $('#menu-overlay').addClass('active');
        $('body').css('overflow', 'hidden'); // 스크롤 방지
    }
    
    function closeSideMenu() {
        $('#side-menu').removeClass('active');
        $('#menu-overlay').removeClass('active');
        $('body').css('overflow', ''); // 스크롤 복원
    }
}); 