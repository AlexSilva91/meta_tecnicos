// metrics.js

// Variáveis globais
let currentMonth, currentYear;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar filtro de data para o mês atual
    const now = new Date();
    currentMonth = now.getMonth() + 1; // +1 porque no backend os meses são 1-12
    currentYear = now.getFullYear();
    
    document.getElementById('monthFilter').value = currentMonth - 1; // -1 porque no frontend são 0-11
    
    // Carregar anos disponíveis do backend
    loadAvailableYears(currentYear);
    
    // Adicionar event listeners para os filtros
    document.getElementById('monthFilter').addEventListener('change', updateDashboard);
    document.getElementById('yearFilter').addEventListener('change', updateDashboard);
});

// Carregar anos disponíveis
async function loadAvailableYears(currentYear) {
    try {
        console.log('Carregando anos disponíveis...');
        const response = await fetch('/api/available-months');
        const data = await response.json();
        
        if (data.success) {
            console.log('Anos disponíveis carregados:', data.data);
            const yearSelect = document.getElementById('yearFilter');
            yearSelect.innerHTML = '';
            
            // Extrair anos únicos e ordenar
            const uniqueYears = [...new Set(data.data.map(item => item.year))].sort((a, b) => b - a);
            
            uniqueYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
            
            // Definir ano atual como padrão
            yearSelect.value = currentYear;
            
            // Carregar dados iniciais
            console.log('Carregando dados iniciais para:', currentMonth, currentYear);
            loadDashboardData(currentMonth, currentYear);
        } else {
            console.error('Erro ao carregar anos disponíveis:', data.error);
            loadDashboardData(currentMonth, currentYear);
        }
    } catch (error) {
        console.error('Erro ao carregar anos:', error);
        loadDashboardData(currentMonth, currentYear);
    }
}

// Atualizar dashboard quando os filtros mudarem
function updateDashboard() {
    const month = parseInt(document.getElementById('monthFilter').value) + 1; // +1 para converter para 1-12
    const year = parseInt(document.getElementById('yearFilter').value);
    console.log('Atualizando dashboard para:', month, year);
    loadDashboardData(month, year);
}

// Carregar dados do dashboard
async function loadDashboardData(month, year) {
    try {
        console.log('Iniciando carregamento de dados para:', month, year);
        showLoadingState();
        
        const response = await fetch(`/api/data?month=${month}&year=${year}`);
        const result = await response.json();
        
        console.log('Dados recebidos:', result);
        
        if (result.success) {
            const dashboardData = result.data;
            
            // Atualizar métricas
            updateMetrics(dashboardData);
            
            // Atualizar gráficos
            updateCharts(dashboardData);
            
            // Atualizar tabela de serviços repetidos
            updateRepeatedServicesTable(dashboardData.repeatedServicesList);
            
            // Atualizar footer com informações do filtro
            updateFooter(result.filters);
            
            console.log('Dashboard atualizado com sucesso!');
            
        } else {
            console.error('Erro ao carregar dados:', result.error);
            showError('Erro ao carregar dados do dashboard');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro de conexão com o servidor');
    } finally {
        hideLoadingState();
    }
}

// Atualizar métricas principais
function updateMetrics(data) {
    console.log('Atualizando métricas:', data);
    document.getElementById('totalServices').textContent = data.totalServices || 0;
    document.getElementById('totalExperts').textContent = data.totalExperts || 0;
    document.getElementById('servicesWithAssist').textContent = data.servicesWithAssist || 0;
    document.getElementById('repeatedServices').textContent = data.repeatedServices || 0;
}

// Atualizar gráficos
function updateCharts(data) {
    console.log('Atualizando gráficos com dados:', data);
    
    // Destruir gráficos existentes para evitar sobreposição
    destroyExistingCharts();
    
    // Gráfico de serviços por técnico
    if (data.servicesByExpert && data.servicesByExpert.labels && data.servicesByExpert.labels.length > 0) {
        console.log('Criando gráfico de serviços por técnico');
        const servicesByExpertCtx = document.getElementById('servicesByExpertChart').getContext('2d');
        new Chart(servicesByExpertCtx, {
            type: 'bar',
            data: {
                labels: data.servicesByExpert.labels,
                datasets: [{
                    label: 'Serviços Realizados',
                    data: data.servicesByExpert.data,
                    backgroundColor: 'rgba(0, 150, 255, 0.7)',
                    borderColor: 'rgba(0, 150, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    } else {
        console.log('Sem dados para gráfico de serviços por técnico');
        showNoDataMessage('servicesByExpertChart', 'Nenhum dado disponível para serviços por técnico');
    }
    
    // Gráfico de serviços por categoria
    if (data.servicesByCategory && data.servicesByCategory.labels && data.servicesByCategory.labels.length > 0) {
        console.log('Criando gráfico de serviços por categoria');
        const servicesByCategoryCtx = document.getElementById('servicesByCategoryChart').getContext('2d');
        new Chart(servicesByCategoryCtx, {
            type: 'doughnut',
            data: {
                labels: data.servicesByCategory.labels,
                datasets: [{
                    data: data.servicesByCategory.data,
                    backgroundColor: [
                        'rgba(0, 150, 255, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(13, 202, 240, 0.7)',
                        'rgba(102, 16, 242, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)',
                        'rgba(83, 102, 255, 0.7)',
                        'rgba(40, 159, 64, 0.7)',
                        'rgba(210, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(0, 150, 255, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(13, 202, 240, 1)',
                        'rgba(102, 16, 242, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)',
                        'rgba(40, 159, 64, 1)',
                        'rgba(210, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.log('Sem dados para gráfico de serviços por categoria');
        showNoDataMessage('servicesByCategoryChart', 'Nenhum dado disponível para serviços por categoria');
    }
    
    // Gráfico de serviços com auxílio
    if (data.servicesWithAssistChart && data.servicesWithAssistChart.labels && data.servicesWithAssistChart.labels.length > 0) {
        console.log('Criando gráfico de serviços com auxílio');
        const servicesWithAssistCtx = document.getElementById('servicesWithAssistChart').getContext('2d');
        new Chart(servicesWithAssistCtx, {
            type: 'pie',
            data: {
                labels: data.servicesWithAssistChart.labels,
                datasets: [{
                    data: data.servicesWithAssistChart.data,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',  // Sem Auxílio - Vermelho
                        'rgba(34, 197, 94, 0.7)'   // Com Auxílio - Verde
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.log('Sem dados para gráfico de serviços com auxílio');
        showNoDataMessage('servicesWithAssistChart', 'Nenhum dado disponível para serviços com auxílio');
    }
    
    // Gráfico de quem ajudou quem
    if (data.assistanceNetwork && data.assistanceNetwork.labels && data.assistanceNetwork.labels.length > 0) {
        console.log('Criando gráfico de rede de assistência');
        const assistanceNetworkCtx = document.getElementById('assistanceNetworkChart').getContext('2d');
        new Chart(assistanceNetworkCtx, {
            type: 'bar',
            data: {
                labels: data.assistanceNetwork.labels,
                datasets: data.assistanceNetwork.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    } else {
        console.log('Sem dados para gráfico de rede de assistência');
        showNoDataMessage('assistanceNetworkChart', 'Nenhum dado disponível para rede de assistência');
    }
}

// Atualizar tabela de serviços repetidos
function updateRepeatedServicesTable(data) {
    const tableBody = document.querySelector('#repeatedServicesTable tbody');
    tableBody.innerHTML = '';
    
    if (data && data.length > 0) {
        // Limitar a exibição para os primeiros 50 registros para performance
        const displayData = data.slice(0, 50);
        
        displayData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.contract || 'N/A'}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${item.experts ? item.experts.join(', ') : 'N/A'}</td>
                <td>${item.firstServiceDate || 'N/A'}</td>
                <td>${item.secondServiceDate || 'N/A'}</td>
                <td><span class="status-badge ${getDaysBadgeClass(item.daysBetween)}">${item.daysBetween || 0} dias</span></td>
            `;
            tableBody.appendChild(row);
        });

        // Adicionar mensagem se houver mais registros
        if (data.length > 50) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; color: #94a3b8; padding: 1rem; background: rgba(30, 41, 59, 0.5);">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    Mostrando 50 de ${data.length} serviços repetidos. Use filtros para refinar a busca.
                </td>
            `;
            tableBody.appendChild(row);
        }
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">
                <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                Nenhum serviço repetido encontrado para o período selecionado
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Função auxiliar para definir a classe do badge baseado nos dias
function getDaysBadgeClass(days) {
    if (days <= 7) return 'status-pending';
    if (days <= 15) return 'status-in-progress';
    return 'status-completed';
}

// Atualizar footer com informações do filtro
function updateFooter(filters) {
    const footer = document.querySelector('.footer p');
    if (filters && filters.month_name) {
        footer.textContent = `Dashboard atualizado - Dados referentes a ${filters.month_name}/${filters.year}`;
    }
}

// Destruir gráficos existentes
function destroyExistingCharts() {
    const chartCanvases = [
        'servicesByExpertChart',
        'servicesByCategoryChart',
        'servicesWithAssistChart',
        'assistanceNetworkChart'
    ];
    
    chartCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const chart = Chart.getChart(canvas);
            if (chart) {
                chart.destroy();
            }
        }
    });
}

// Mostrar mensagem de "sem dados"
function showNoDataMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    const container = canvas.parentElement;
    
    // Remover mensagens anteriores
    const existingNoData = container.querySelector('.chart-no-data');
    if (existingNoData) {
        existingNoData.remove();
    }
    
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'chart-no-data';
    noDataDiv.innerHTML = `
        <i class="fas fa-chart-bar" style="font-size: 3rem; color: #94a3b8; margin-bottom: 1rem;"></i>
        <p style="color: #94a3b8; text-align: center;">${message}</p>
    `;
    noDataDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
    `;
    
    container.appendChild(noDataDiv);
}

// Mostrar estado de carregamento
function showLoadingState() {
    // Remover loading anterior se existir
    hideLoadingState();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando dados...</p>
        </div>
    `;
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 14, 23, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        color: white;
    `;
    
    document.body.appendChild(loadingDiv);
}

// Esconder estado de carregamento
function hideLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Mostrar mensagem de erro
function showError(message) {
    // Remover loading primeiro
    hideLoadingState();
    
    // Remover erros anteriores
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.9); color: white; padding: 1rem; border-radius: 8px; margin: 1rem;">
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            ${message}
        </div>
    `;
    
    // Inserir no topo do container
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Adicionar alguns estilos CSS dinamicamente para melhorar a UX
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        text-align: center;
        font-size: 1.2rem;
    }
    
    .loading-spinner i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .chart-no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #94a3b8;
    }
    
    .error-message {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1001;
        max-width: 300px;
    }
    
    .status-badge {
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: inline-block;
        white-space: nowrap;
    }
    
    .status-pending {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
    }
    
    .status-in-progress {
        background: rgba(0, 123, 255, 0.2);
        color: #007bff;
    }
    
    .status-completed {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
    }
`;
document.head.appendChild(style);

// Inicializar tooltips se estiver usando Bootstrap
if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}