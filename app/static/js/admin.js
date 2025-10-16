// Admin Panel JavaScript - Versão corrigida
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = '/admin/api';

    // ==================== MOBILE MENU ====================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeSidebarBtn = document.querySelector('.close-sidebar-btn');
    const sidebar = document.querySelector('.mobile-sidebar');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    function openMobileMenu() {
        if (sidebar && mobileMenuOverlay) {
            sidebar.classList.add('active');
            mobileMenuOverlay.classList.remove('hidden');
            document.body.classList.add('sidebar-open');
        }
    }

    function closeMobileMenu() {
        if (sidebar && mobileMenuOverlay) {
            sidebar.classList.remove('active');
            mobileMenuOverlay.classList.add('hidden');
            document.body.classList.remove('sidebar-open');
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close menu when clicking on links (mobile)
    if (sidebar) {
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth < 1024) {
                    closeMobileMenu();
                }
            });
        });
    }

    // ==================== MODAL MANAGEMENT ====================
    const modals = document.querySelectorAll('.modal');
    const deleteModal = document.getElementById('deleteModal');
    const successModal = document.getElementById('successModal');

    // Show modal function
    window.showModal = function (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal function
    window.hideModal = function (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Close modals when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Helper function to determine endpoint from context
    function getEndpointFromContext(element) {
        const table = element.closest('table');
        const grid = element.closest('.grid');

        if (table) {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
            if (headers.includes('Cliente') && headers.includes('Contrato')) return 'customers';
            if (headers.includes('Técnico') && headers.includes('Ordens Responsável')) return 'experts';
            if (headers.includes('OS') && headers.includes('Cliente')) return 'serviceorders';
        }

        if (grid && grid.id === 'typeservicesGrid') return 'typeservices';

        if (document.querySelector('[data-endpoint]')) {
            return document.querySelector('[data-endpoint]').getAttribute('data-endpoint');
        }

        return 'customers';
    }

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    let itemToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const endpoint = getEndpointFromContext(this);

            itemToDelete = { id, name, endpoint };

            const message = deleteModal.querySelector('.modal-message');
            message.textContent = `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`;

            showModal(deleteModal);
        });
    });

    // Confirm delete
    document.getElementById('confirmDelete').addEventListener('click', async function () {
        if (itemToDelete) {
            try {
                const response = await fetch(`${API_BASE}/${itemToDelete.endpoint}/${itemToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const result = await response.json();

                if (result.success) {
                    const element = document.querySelector(`[data-id="${itemToDelete.id}"]`);
                    if (element) {
                        const row = element.closest('tr') || element.closest('.bg-gradient');
                        if (row) row.remove();
                    }

                    document.getElementById('successMessage').textContent = 'Item excluído com sucesso!';
                    showModal(successModal);
                } else {
                    alert('Erro ao excluir item: ' + (result.error || 'Erro desconhecido'));
                }

            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Erro ao excluir item');
            }

            hideModal(deleteModal);
            itemToDelete = null;
        }
    });

    // Cancel delete
    document.getElementById('cancelDelete').addEventListener('click', function () {
        hideModal(deleteModal);
        itemToDelete = null;
    });

    // Close success modal
    document.getElementById('closeSuccessModal').addEventListener('click', function () {
        hideModal(successModal);
        window.location.reload();
    });

    // Add new item modals
    const addButtons = {
        'addCustomerBtn': 'customerModal',
        'addExpertBtn': 'expertModal',
        'addTypeServiceBtn': 'typeServiceModal',
        'addServiceOrderBtn': 'serviceOrderModal'
    };

    Object.keys(addButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function () {
                const modalId = addButtons[buttonId];
                const modal = document.getElementById(modalId);
                const form = modal.querySelector('form');
                form.reset();
                const hiddenInput = form.querySelector('input[type="hidden"]');
                if (hiddenInput) hiddenInput.value = '';

                const title = modal.querySelector('.modal-title');
                let modalTitle = modalId.replace('Modal', '');
                modalTitle = modalTitle.replace(/([A-Z])/g, ' $1').trim();
                title.textContent = modalTitle;

                showModal(modal);
            });
        }
    });

    // Cancel buttons for forms
    const cancelButtons = {
        'cancelCustomer': 'customerModal',
        'cancelExpert': 'expertModal',
        'cancelTypeService': 'typeServiceModal',
        'cancelServiceOrder': 'serviceOrderModal'
    };

    Object.keys(cancelButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function () {
                const modalId = cancelButtons[buttonId];
                const modal = document.getElementById(modalId);
                hideModal(modal);
            });
        }
    });

    // Form submissions
    const forms = {
        'customerForm': 'customers',
        'expertForm': 'experts',
        'typeServiceForm': 'typeservices',
        'serviceOrderForm': 'serviceorders'
    };

    Object.keys(forms).forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();

                const endpoint = forms[formId];
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                const id = data.id;

                if (endpoint === 'serviceorders') {
                    const assistantsSelect = document.getElementById('assistants');
                    if (assistantsSelect) {
                        data.assistants = Array.from(assistantsSelect.selectedOptions).map(option => parseInt(option.value));
                    }

                    if (data.os_data_agendamento) {
                        data.os_data_agendamento = new Date(data.os_data_agendamento).toISOString();
                    }
                }

                try {
                    const url = id ? `${API_BASE}/${endpoint}/${id}` : `${API_BASE}/${endpoint}`;
                    const method = id ? 'PUT' : 'POST';

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (result.success) {
                        document.getElementById('successMessage').textContent =
                            id ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!';
                        showModal(successModal);

                        const modalId = formId.replace('Form', 'Modal');
                        const modal = document.getElementById(modalId);
                        hideModal(modal);
                        form.reset();

                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        alert('Erro: ' + (result.error || 'Erro desconhecido'));
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('Erro ao salvar dados');
                }
            });
        }
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            const endpoint = getEndpointFromContext(this);

            try {
                const response = await fetch(`${API_BASE}/${endpoint}/${id}`);
                const item = await response.json();

                if (item) {
                    const modalId = endpoint.slice(0, -1) + 'Modal';
                    const modal = document.getElementById(modalId);

                    if (!modal) {
                        console.error('Modal não encontrado:', modalId);
                        return;
                    }

                    const form = modal.querySelector('form');
                    if (!form) {
                        console.error('Form não encontrado no modal:', modalId);
                        return;
                    }

                    Object.keys(item).forEach(key => {
                        let input = form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);
                        if (input) {
                            if (input.type === 'datetime-local' && item[key]) {
                                const date = new Date(item[key]);
                                input.value = date.toISOString().slice(0, 16);
                            } else if (input.type === 'select-multiple' && Array.isArray(item[key])) {
                                Array.from(input.options).forEach(option => {
                                    option.selected = item[key].includes(parseInt(option.value));
                                });
                            } else {
                                input.value = item[key];
                            }
                        }
                    });

                    const title = modal.querySelector('.modal-title');
                    title.textContent = 'Editar ' + title.textContent;
                    showModal(modal);
                }
            } catch (error) {
                console.error('Error fetching item:', error);
                alert('Erro ao carregar dados');
            }
        });
    });

    // Complete order buttons
    const completeButtons = document.querySelectorAll('.complete-btn');
    completeButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');

            if (!confirm('Deseja marcar esta ordem de serviço como concluída?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/serviceorders/${id}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('successMessage').textContent = 'Ordem de serviço marcada como concluída!';
                    showModal(successModal);

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    alert('Erro: ' + (result.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Error completing order:', error);
                alert('Erro ao marcar como concluída');
            }
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Filter functionality
    const packageFilter = document.getElementById('packageFilter');
    if (packageFilter) {
        packageFilter.addEventListener('change', function () {
            const filterValue = this.value;
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const packageCell = row.querySelector('td:nth-child(3)');
                if (packageCell) {
                    const packageText = packageCell.textContent.trim();
                    if (!filterValue || packageText === filterValue) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }

    // Flash messages
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

        let bgColor = '';
        switch (type) {
            case 'success':
                bgColor = 'bg-green-600';
                break;
            case 'error':
                bgColor = 'bg-red-600';
                break;
            case 'warning':
                bgColor = 'bg-yellow-500';
                break;
            default:
                bgColor = 'bg-gray-800';
        }

        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${bgColor} text-white`;
        toast.textContent = message;

        document.body.appendChild(toast);
        toast.classList.add('fade-in');

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Responsive table wrapper
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth >= 1024) {
                closeMobileMenu();
            }
        }, 250);
    });

});