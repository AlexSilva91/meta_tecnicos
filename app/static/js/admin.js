// Admin Panel JavaScript - Versão com API
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = '/admin/api';

    // Modal Management
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

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    let itemToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const type = this.closest('table') ? 'table-row' : 'card';
            const endpoint = getEndpointFromContext(this);

            itemToDelete = { id, name, type, endpoint };

            // Update modal message
            const message = deleteModal.querySelector('.modal-message');
            message.textContent = `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`;

            showModal(deleteModal);
        });
    });

    // Helper function to determine endpoint from context
    function getEndpointFromContext(element) {
        if (element.closest('#customersTable') || element.closest('#customerModal')) {
            return 'customers';
        } else if (element.closest('#expertsTable') || element.closest('#expertModal')) {
            return 'experts';
        } else if (element.closest('#typeservicesGrid') || element.closest('#typeServiceModal')) {
            return 'typeservices';
        } else if (element.closest('#serviceordersTable') || element.closest('#serviceOrderModal')) {
            return 'serviceorders';
        }
        return 'customers'; // fallback
    }

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
                    // Remove element from DOM
                    const element = document.querySelector(`[data-id="${itemToDelete.id}"]`).closest('tr, .bg-gradient');
                    if (element) {
                        element.remove();
                    }

                    // Show success message
                    document.getElementById('successMessage').textContent = 'Item excluído com sucesso!';
                    showModal(successModal);
                } else {
                    alert('Erro ao excluir item: ' + result.error);
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
        // Recarregar a página após sucesso (opcional)
        // window.location.reload();
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
                form.querySelector('input[type="hidden"]').value = '';

                const title = modal.querySelector('.modal-title');
                title.textContent = modalId.replace('Modal', '').replace(/([A-Z])/g, ' $1').trim();
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

                        // Recarregar a página após um breve delay
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        alert('Erro: ' + result.error);
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
                    const modalId = endpoint + 'Modal';
                    const modal = document.getElementById(modalId);
                    const form = modal.querySelector('form');

                    // Preencher o formulário com os dados
                    Object.keys(item).forEach(key => {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input) {
                            input.value = item[key];
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

                    // Atualizar a UI
                    const row = this.closest('tr');
                    const statusCell = row.querySelector('td:nth-child(6)');
                    statusCell.innerHTML = '<span class="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">Concluído</span>';
                    this.remove();
                } else {
                    alert('Erro: ' + result.error);
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
});