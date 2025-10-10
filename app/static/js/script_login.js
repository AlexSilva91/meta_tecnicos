// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');
    const socialButtons = document.querySelectorAll('.social-button');

    // Alternar visibilidade da senha
    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Alterar ícone
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Validação do formulário
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Limpar erros anteriores
        clearAllErrors();

        let isValid = true;

        // Validação de email
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Por favor, insira um e-mail válido');
            isValid = false;
        }

        // Validação de senha
        if (passwordInput.value.length < 6) {
            showError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        if (isValid) {
            simulateLogin();
        }
    });

    // Limpar erros ao digitar
    emailInput.addEventListener('input', function () {
        clearError(this);
    });

    passwordInput.addEventListener('input', function () {
        clearError(this);
    });

    // Botões de login social
    socialButtons.forEach(button => {
        button.addEventListener('click', function () {
            const provider = this.classList.contains('google') ? 'Google' : 'GitHub';
            showMessage(`Login com ${provider} selecionado`);
        });
    });

    // Fechar modal
    closeModalBtn.addEventListener('click', function () {
        successModal.style.display = 'none';
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function (e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Funções auxiliares
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        input.parentNode.parentNode.appendChild(errorDiv);
        input.classList.add('error');
    }

    function clearError(input) {
        const parent = input.parentNode.parentNode;
        const errorDiv = parent.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('error');
    }

    function clearAllErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());

        const errorInputs = document.querySelectorAll('.input-field.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }

    function simulateLogin() {
        // Adicionar efeito de carregamento
        const submitButton = loginForm.querySelector('.submit-button');
        const originalText = submitButton.querySelector('.button-text').textContent;
        const originalIcon = submitButton.querySelector('.button-icon').className;

        submitButton.querySelector('.button-text').textContent = 'Entrando...';
        submitButton.querySelector('.button-icon').className = 'fas fa-spinner fa-spin button-icon';
        submitButton.disabled = true;

        // Simular atraso de rede
        setTimeout(() => {
            // Restaurar botão
            submitButton.querySelector('.button-text').textContent = originalText;
            submitButton.querySelector('.button-icon').className = originalIcon;
            submitButton.disabled = false;

            // Mostrar modal de sucesso
            successModal.style.display = 'flex';

            // Simular redirecionamento após 2 segundos
            setTimeout(() => {
                // Em uma aplicação real, você faria: window.location.href = '/dashboard';
                showMessage('Redirecionando para o painel...');
            }, 2000);
        }, 1500);
    }

    function showMessage(message) {
        // Criar um toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remover após 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Efeito de partículas no background (opcional)
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: #00ccff;
                border-radius: 50%;
                animation: float 15s infinite linear;
                opacity: ${Math.random() * 0.5 + 0.1};
            `;

            // Posição aleatória
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;

            // Animação personalizada
            particle.style.animationDelay = `${Math.random() * 15}s`;

            particlesContainer.appendChild(particle);
        }

        // Adicionar keyframes para animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0.1;
                }
                25% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
                    opacity: 0.6;
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                    opacity: 0.1;
                }
                75% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
                    opacity: 0.6;
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                    opacity: 0.1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Iniciar partículas
    createParticles();
});