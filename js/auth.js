(function() {
    // Check if the user is authenticated as a guest
    const isAuth = localStorage.getItem('guest_auth') === 'true';
    const isLoginPage = window.location.pathname.endsWith('guest-login.html');

    if (!isAuth && !isLoginPage) {
        // Not authenticated and not on the login page, redirect to guest-login.html
        window.location.href = 'guest-login.html';
    } else if (isAuth && isLoginPage) {
        // Authenticated but on the login page, redirect to index.html
        window.location.href = 'index.html';
    }
})();
