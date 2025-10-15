// users.js - Gerenciamento de Usuários

document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const deleteModal = document.getElementById('deleteModal');
    const userForm = document.getElementById('userForm');
    const cancelUserBtn = document.getElementById('cancelUser');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const userNameToDelete = document.getElementById('userNameToDelete');
    const loginPreview = document.getElementById('loginPreview');
    const generatedLogin = document.getElementById('generatedLogin');

    // Variáveis de estado
    let currentUserId = null;
    let userToDelete = null;

    // Event Listeners
    addUserBtn.addEventListener('click', openAddModal);
    cancelUserBtn.addEventListener('click', closeUserModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    userForm.addEventListener('submit', handleFormSubmit);

    // Event delegation para botões de editar e deletar
    document.addEventListener('click', function (e) {
        if (e.target.closest('.edit-btn')) {
            const userId = e.target.closest('.edit-btn').dataset.id;
            openEditModal(userId);
        }

        if (e.target.closest('.delete-btn')) {
            const userId = e.target.closest('.delete-btn').dataset.id;
            const userName = e.target.closest('.delete-btn').dataset.name;
            openDeleteModal(userId, userName);
        }
    });

    // Gerar preview do login quando os campos de nome mudarem
    document.getElementById('firstName').addEventListener('input', generateLoginPreview);
    document.getElementById('lastName').addEventListener('input', generateLoginPreview);

    // Funções do Modal
    function openAddModal() {
        currentUserId = null;
        document.getElementById('userModalTitle').textContent = 'Adicionar Usuário';
        userForm.reset();
        document.getElementById('password').required = true;
        document.getElementById('password').placeholder = 'Senha do usuário';
        loginPreview.classList.add('hidden');
        userModal.classList.remove('hidden');
    }

    function openEditModal(userId) {
        currentUserId = userId;
        document.getElementById('userModalTitle').textContent = 'Editar Usuário';

        // Buscar dados do usuário
        fetchUserData(userId)
            .then(user => {
                if (user.success) {
                    document.getElementById('userId').value = user.user.id;
                    document.getElementById('firstName').value = user.user.first_name;
                    document.getElementById('lastName').value = user.user.last_name;
                    document.getElementById('password').required = false;
                    document.getElementById('password').placeholder = 'Deixe em branco para manter a senha atual';
                    document.getElementById('password').value = '';

                    // Mostrar login gerado
                    generatedLogin.textContent = user.user.login_hash;
                    loginPreview.classList.remove('hidden');

                    userModal.classList.remove('hidden');
                } else {
                    showNotification('Erro ao carregar dados do usuário', 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados do usuário:', error);
                showNotification('Erro ao carregar dados do usuário', 'error');
            });
    }

    function closeUserModal() {
        userModal.classList.add('hidden');
    }

    function openDeleteModal(userId, userName) {
        userToDelete = userId;
        userNameToDelete.textContent = userName;
        deleteModal.classList.remove('hidden');
    }

    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
        userToDelete = null;
    }

    // Funções de CRUD
    function handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            password: document.getElementById('password').value
        };

        // Validação
        if (!formData.first_name || !formData.last_name) {
            showNotification('Nome e sobrenome são obrigatórios', 'error');
            return;
        }

        if (!currentUserId && !formData.password) {
            showNotification('Senha é obrigatória para novos usuários', 'error');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        // Se estiver editando e a senha estiver vazia, remover do formData
        if (currentUserId && !formData.password) {
            delete formData.password;
        }

        if (currentUserId) {
            // Editar usuário existente
            updateUser(currentUserId, formData);
        } else {
            // Criar novo usuário
            createUser(formData);
        }
    }

    function createUser(userData) {
        fetch('/admin/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification('Usuário criado com sucesso!', 'success');
                    closeUserModal();
                    // Recarregar a página após 1 segundo
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message || 'Erro ao criar usuário', 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showNotification('Erro ao criar usuário: ' + error.message, 'error');
            });
    }

    function updateUser(userId, userData) {
        fetch(`/admin/users/${userId}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification('Usuário atualizado com sucesso!', 'success');
                    closeUserModal();
                    // Recarregar a página após 1 segundo
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message || 'Erro ao atualizar usuário', 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showNotification('Erro ao atualizar usuário: ' + error.message, 'error');
            });
    }

    function confirmDelete() {
        if (!userToDelete) return;

        fetch(`/admin/users/${userToDelete}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification('Usuário excluído com sucesso!', 'success');
                    closeDeleteModal();
                    // Recarregar a página após 1 segundo
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message || 'Erro ao excluir usuário', 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showNotification('Erro ao excluir usuário: ' + error.message, 'error');
            });
    }

    // Funções auxiliares
    function fetchUserData(userId) {
        return fetch(`/admin/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            });
    }

    function generateLoginPreview() {
        const firstName = document.getElementById('firstName').value.trim().toLowerCase();
        const lastName = document.getElementById('lastName').value.trim().toLowerCase();

        if (firstName && lastName) {
            const baseLogin = `${firstName}.${lastName}`;
            generatedLogin.textContent = baseLogin;

            // Verificar se é um novo usuário (não está editando)
            if (!currentUserId) {
                loginPreview.classList.remove('hidden');
            }
        } else {
            loginPreview.classList.add('hidden');
        }
    }

    function showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Fechar modais ao clicar fora
    window.addEventListener('click', function (e) {
        if (e.target === userModal) {
            closeUserModal();
        }
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Fechar modais com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeUserModal();
            closeDeleteModal();
        }
    });
});