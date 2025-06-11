document.querySelector('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        alert('Login realizado com sucesso!');
        window.location.href = 'index.html'; // Redirecionar para a página principal
    } else {
        alert('Email ou senha inválidos!');
    }
});