document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const loginInput = document.getElementById('login_hash');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const successModal = document.getElementById('successModal');

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

        // Validação do login
        if (!loginInput.value.trim()) {
            showError(loginInput, 'Por favor, insira seu login');
            isValid = false;
        }

        // Validação de senha
        if (!passwordInput.value) {
            showError(passwordInput, 'Por favor, insira sua senha');
            isValid = false;
        }

        if (isValid) {
            performLogin();
        }
    });

    // Limpar erros ao digitar
    loginInput.addEventListener('input', function () {
        clearError(this);
    });

    passwordInput.addEventListener('input', function () {
        clearError(this);
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function (e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Funções auxiliares
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

    function performLogin() {
        // Adicionar efeito de carregamento
        const submitButton = loginForm.querySelector('.submit-button');
        const originalText = submitButton.querySelector('.button-text').textContent;
        const originalIcon = submitButton.querySelector('.button-icon').className;

        submitButton.querySelector('.button-text').textContent = 'Entrando...';
        submitButton.querySelector('.button-icon').className = 'fas fa-spinner fa-spin button-icon';
        submitButton.disabled = true;

        // Dados do formulário
        const formData = {
            login_hash: loginInput.value.trim(),
            password: passwordInput.value
        };

        // Fazer requisição AJAX para o servidor
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Mostrar modal de sucesso
                    successModal.style.display = 'flex';

                    // Redirecionar após 2 segundos
                    setTimeout(() => {
                        if (data.redirect_url) {
                            window.location.href = data.redirect_url;
                        } else {
                            window.location.href = '/admin/';
                        }
                    }, 2000);
                } else {
                    showNotification(data.message || 'Erro ao fazer login', 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showNotification('Erro de conexão. Tente novamente.', 'error');
            })
            .finally(() => {
                // Restaurar botão
                submitButton.querySelector('.button-text').textContent = originalText;
                submitButton.querySelector('.button-icon').className = originalIcon;
                submitButton.disabled = false;
            });
    }

    function showNotification(message, type = 'error') {
        // Criar um toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remover após 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);
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

        const flashContainer = document.getElementById('flash-messages');
        if (flashContainer) {
            const messages = flashContainer.querySelectorAll('.flash-message');
            messages.forEach(msg => {
                const category = msg.dataset.category || 'info';
                const text = msg.textContent || '';
                showMessage(text, category);
            });
        }

        function showMessage(message, type = 'info') {
            const toast = document.createElement('div');

            // Definir cor de fundo de acordo com o tipo
            let bgColor = '';
            switch (type) {
                case 'success':
                    bgColor = 'bg-green-600'; // verde
                    break;
                case 'error':
                    bgColor = 'bg-red-600';   // vermelho
                    break;
                case 'warning':
                    bgColor = 'bg-yellow-500'; // amarelo/dourado
                    break;
                default:
                    bgColor = 'bg-gray-800';  // info ou padrão
            }

            toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${bgColor} text-white`;
            toast.textContent = message;

            document.body.appendChild(toast);

            // Animação de entrada opcional
            toast.classList.add('fade-in');

            // Remover após 3 segundos
            setTimeout(() => {
                toast.remove();
            }, 3000);
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