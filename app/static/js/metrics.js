let currentMonth, currentYear;
let charts = {};
let resizeTimeout;

document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    currentMonth = now.getMonth() + 1;
    currentYear = now.getFullYear();
    
    document.getElementById('monthFilter').value = currentMonth - 1;
    
    loadAvailableYears(currentYear);
    
    document.getElementById('monthFilter').addEventListener('change', updateDashboard);
    document.getElementById('yearFilter').addEventListener('change', updateDashboard);
    
    initResponsiveBehavior();
    
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            const month = parseInt(document.getElementById('monthFilter').value) + 1;
            const year = parseInt(document.getElementById('yearFilter').value);
            loadDashboardData(month, year);
        }, 300);
    });

    adjustLayoutForScreenSize();
});

function initResponsiveBehavior() {
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            adjustLayoutForScreenSize();
          
            const month = parseInt(document.getElementById('monthFilter').value) + 1;
            const year = parseInt(document.getElementById('yearFilter').value);
            loadDashboardData(month, year);
        }, 250);
    });
}

function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isSmallMobile = width < 480;
    const isLandscape = width > height && height < 500;
    
    if (isSmallMobile) {
        document.body.style.padding = '0.25rem';
    } else if (isMobile) {
        document.body.style.padding = '0.5rem';
    } else {
        document.body.style.padding = '1rem';
    }
    
    // Ajustar alturas dos gráficos
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        if (isLandscape) {
            container.style.minHeight = '180px';
        } else if (isSmallMobile) {
            container.style.minHeight = '220px';
        } else if (isMobile) {
            container.style.minHeight = '250px';
        } else if (isTablet) {
            container.style.minHeight = '300px';
        } else {
            container.style.minHeight = '350px';
        }
    });
    
    const metricsGrid = document.querySelector('.metrics-grid');
    if (isSmallMobile) {
        metricsGrid.style.gridTemplateColumns = '1fr';
    }
    
    makeTableResponsive();
}


async function loadAvailableYears(currentYear) {
    try {
        const response = await fetch('/api/available-months');
        const data = await response.json();
        
        if (data.success) {
            const yearSelect = document.getElementById('yearFilter');
            yearSelect.innerHTML = '';
            
            const uniqueYears = [...new Set(data.data.map(item => item.year))].sort((a, b) => b - a);
            
            uniqueYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
         
            yearSelect.value = currentYear;
            
            loadDashboardData(currentMonth, currentYear);
        } else {
            loadDashboardData(currentMonth, currentYear);
        }
    } catch (error) {
        loadDashboardData(currentMonth, currentYear);
    }
}

// Atualizar dashboard quando os filtros mudarem
function updateDashboard() {
    const month = parseInt(document.getElementById('monthFilter').value) + 1;
    const year = parseInt(document.getElementById('yearFilter').value);
    loadDashboardData(month, year);
}

async function loadDashboardData(month, year) {
    try {
        showLoadingState();
        
        const response = await fetch(`/api/data?month=${month}&year=${year}`);
        const result = await response.json();
        
        if (result.success) {
            const dashboardData = result.data;
            updateMetrics(dashboardData);
            updateCharts(dashboardData);
            updateRepeatedServicesTable(dashboardData.repeatedServicesList);
            updateFooter(result.filters);
        } else {
            showError('Erro ao carregar dados do dashboard');
        }
    } catch (error) {
        showError('Erro de conexão com o servidor');
    } finally {
        hideLoadingState();
    }
}

function updateMetrics(data) {
    document.getElementById('totalServices').textContent = data.totalServices || 0;
    document.getElementById('totalExperts').textContent = data.totalExperts || 0;
    document.getElementById('servicesWithAssist').textContent = data.servicesWithAssist || 0;
    document.getElementById('repeatedServices').textContent = data.repeatedServices || 0;
}


function getResponsiveChartOptions(chartType) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isSmallMobile = width < 480;
    const isLandscape = width > height && height < 500;
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 50,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: isSmallMobile ? 8 : (isMobile ? 9 : (isTablet ? 10 : 11))
                    },
                    padding: isSmallMobile ? 8 : (isMobile ? 10 : 12),
                    boxWidth: isSmallMobile ? 10 : (isMobile ? 12 : 14)
                }
            },
            tooltip: {
                enabled: !isSmallMobile,
                titleFont: {
                    size: isSmallMobile ? 9 : (isMobile ? 10 : 11)
                },
                bodyFont: {
                    size: isSmallMobile ? 8 : (isMobile ? 9 : 10)
                },
                padding: isSmallMobile ? 6 : (isMobile ? 8 : 10)
            }
        }
    };

    if (chartType === 'bar') {
        return {
            ...baseOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(100, 116, 139, 0.2)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 1,
                        font: {
                            size: isSmallMobile ? 7 : (isMobile ? 8 : (isTablet ? 9 : 10))
                        },
                        padding: 3,
                        maxTicksLimit: isLandscape ? 5 : (isSmallMobile ? 4 : 6)
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: isSmallMobile ? 7 : (isMobile ? 8 : (isTablet ? 9 : 10))
                        },
                        maxRotation: isSmallMobile ? 90 : (isMobile ? 45 : (isTablet ? 30 : 0)),
                        minRotation: isSmallMobile ? 90 : (isMobile ? 45 : 0),
                        padding: 2
                    }
                }
            },
            layout: {
                padding: {
                    left: isSmallMobile ? 2 : (isMobile ? 5 : 8),
                    right: isSmallMobile ? 2 : (isMobile ? 5 : 8),
                    top: isSmallMobile ? 2 : (isMobile ? 5 : 8),
                    bottom: isSmallMobile ? 2 : (isMobile ? 5 : 8)
                }
            },
            barPercentage: isSmallMobile ? 0.6 : (isMobile ? 0.7 : 0.8),
            categoryPercentage: isSmallMobile ? 0.6 : (isMobile ? 0.7 : 0.8)
        };
    }

    if (chartType === 'doughnut' || chartType === 'pie') {
        const legendPosition = isSmallMobile ? 'bottom' : (isMobile ? 'bottom' : 'right');
        
        return {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                legend: {
                    ...baseOptions.plugins.legend,
                    position: legendPosition,
                    labels: {
                        ...baseOptions.plugins.legend.labels,
                        boxWidth: isSmallMobile ? 8 : (isMobile ? 10 : 12)
                    }
                }
            },
            cutout: isSmallMobile ? '40%' : (isMobile ? '50%' : '60%'),
            layout: {
                padding: isSmallMobile ? 5 : (isMobile ? 10 : 15)
            }
        };
    }

    return baseOptions;
}


function updateCharts(data) {
    destroyExistingCharts();
    removeNoDataMessages();
    adjustLayoutForScreenSize();
    if (data.servicesByExpert && data.servicesByExpert.labels && data.servicesByExpert.labels.length > 0) {
        const servicesByExpertCtx = document.getElementById('servicesByExpertChart').getContext('2d');
        
        const labels = data.servicesByExpert.labels.map(label => {
            const width = window.innerWidth;
            if (width < 480 && label.length > 8) {
                return label.substring(0, 6) + '...';
            } else if (width < 768 && label.length > 12) {
                return label.substring(0, 10) + '...';
            }
            return label;
        });
        
        charts.servicesByExpert = new Chart(servicesByExpertCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Serviços Realizados',
                    data: data.servicesByExpert.data,
                    backgroundColor: 'rgba(0, 150, 255, 0.7)',
                    borderColor: 'rgba(0, 150, 255, 1)',
                    borderWidth: 1,
                    borderRadius: window.innerWidth < 480 ? 2 : (window.innerWidth < 768 ? 3 : 4),
                    borderSkipped: false,
                }]
            },
            options: getResponsiveChartOptions('bar')
        });
    } else {
        showNoDataMessage('servicesByExpertChart', 'Nenhum dado disponível para serviços por técnico');
    }
    
    // Gráfico de serviços por categoria
    if (data.servicesByCategory && data.servicesByCategory.labels && data.servicesByCategory.labels.length > 0) {
        const servicesByCategoryCtx = document.getElementById('servicesByCategoryChart').getContext('2d');
        
        charts.servicesByCategory = new Chart(servicesByCategoryCtx, {
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
                        'rgba(102, 16, 242, 0.7)'
                    ],
                    borderColor: [
                        'rgba(0, 150, 255, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(13, 202, 240, 1)',
                        'rgba(102, 16, 242, 1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: window.innerWidth < 480 ? 4 : (window.innerWidth < 768 ? 6 : 8)
                }]
            },
            options: {
                ...getResponsiveChartOptions('doughnut'),
                plugins: {
                    ...getResponsiveChartOptions('doughnut').plugins,
                    tooltip: {
                        ...getResponsiveChartOptions('doughnut').plugins.tooltip,
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
        showNoDataMessage('servicesByCategoryChart', 'Nenhum dado disponível para serviços por categoria');
    }
    
    // Gráfico de serviços com auxílio
    if (data.servicesWithAssistChart && data.servicesWithAssistChart.labels && data.servicesWithAssistChart.labels.length > 0) {
        const servicesWithAssistCtx = document.getElementById('servicesWithAssistChart').getContext('2d');
        
        charts.servicesWithAssist = new Chart(servicesWithAssistCtx, {
            type: 'pie',
            data: {
                labels: data.servicesWithAssistChart.labels,
                datasets: [{
                    data: data.servicesWithAssistChart.data,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: window.innerWidth < 480 ? 4 : (window.innerWidth < 768 ? 6 : 8)
                }]
            },
            options: {
                ...getResponsiveChartOptions('pie'),
                plugins: {
                    ...getResponsiveChartOptions('pie').plugins,
                    tooltip: {
                        ...getResponsiveChartOptions('pie').plugins.tooltip,
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
        showNoDataMessage('servicesWithAssistChart', 'Nenhum dado disponível para serviços com auxílio');
    }
    
    // Gráfico de quem ajudou quem
    if (data.assistanceNetwork && data.assistanceNetwork.labels && data.assistanceNetwork.labels.length > 0) {
        const assistanceNetworkCtx = document.getElementById('assistanceNetworkChart').getContext('2d');
        
        const datasets = data.assistanceNetwork.datasets.map(dataset => ({
            ...dataset,
            borderRadius: window.innerWidth < 480 ? 1 : (window.innerWidth < 768 ? 2 : 4),
            borderSkipped: false,
        }));
        
        charts.assistanceNetwork = new Chart(assistanceNetworkCtx, {
            type: 'bar',
            data: {
                labels: data.assistanceNetwork.labels,
                datasets: datasets
            },
            options: {
                ...getResponsiveChartOptions('bar'),
                plugins: {
                    ...getResponsiveChartOptions('bar').plugins,
                    legend: {
                        position: window.innerWidth < 480 ? 'bottom' : (window.innerWidth < 768 ? 'bottom' : 'top'),
                        labels: {
                            ...getResponsiveChartOptions('bar').plugins.legend.labels,
                            boxWidth: window.innerWidth < 480 ? 8 : (window.innerWidth < 768 ? 10 : 12)
                        }
                    }
                }
            }
        });
    } else {
        showNoDataMessage('assistanceNetworkChart', 'Nenhum dado disponível para rede de assistência');
    }
}

// Atualizar tabela de serviços repetidos
function updateRepeatedServicesTable(data) {
    const tableBody = document.querySelector('#repeatedServicesTable tbody');
    tableBody.innerHTML = '';
    
    if (data && data.length > 0) {
        // Limitar a exibição para performance baseado no tamanho da tela
        const width = window.innerWidth;
        const displayLimit = width < 480 ? 10 : (width < 768 ? 15 : (width < 1024 ? 25 : 50));
        const displayData = data.slice(0, displayLimit);
        
        displayData.forEach(item => {
            const row = document.createElement('tr');
            
            // Formatar dados para diferentes tamanhos de tela
            const contract = formatForScreenSize(item.contract, { 
                smallMobile: 6, 
                mobile: 8, 
                default: 12 
            });
            
            const category = formatForScreenSize(item.category, { 
                smallMobile: 10, 
                mobile: 12, 
                default: 20 
            });
            
            const experts = item.experts ? 
                formatArrayForScreenSize(item.experts, {
                    smallMobile: 6,
                    mobile: 8,
                    default: 15
                })
                : 'N/A';
            
            const firstDate = formatDateForScreenSize(item.firstServiceDate);
            const secondDate = formatDateForScreenSize(item.secondServiceDate);
            
            row.innerHTML = `
                <td data-label="Contrato">${contract || 'N/A'}</td>
                <td data-label="Categoria">${category || 'N/A'}</td>
                <td data-label="Técnicos">${experts}</td>
                <td data-label="Primeiro Serviço">${firstDate || 'N/A'}</td>
                <td data-label="Segundo Serviço">${secondDate || 'N/A'}</td>
                <td data-label="Dias Entre"><span class="status-badge ${getDaysBadgeClass(item.daysBetween)}">${item.daysBetween || 0} dias</span></td>
            `;
            tableBody.appendChild(row);
        });

        // Adicionar mensagem se houver mais registros
        if (data.length > displayLimit) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; color: #94a3b8; padding: 0.75rem; background: rgba(30, 41, 59, 0.5); font-size: ${width < 480 ? '0.7rem' : '0.8rem'};">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    Mostrando ${displayLimit} de ${data.length} serviços repetidos
                </td>
            `;
            tableBody.appendChild(row);
        }
        
        // Adicionar classes responsivas à tabela
        makeTableResponsive();
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; color: #94a3b8; padding: 1.5rem; font-size: ${window.innerWidth < 480 ? '0.8rem' : '0.9rem'};">
                <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                Nenhum serviço repetido encontrado para o período selecionado
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Funções auxiliares para formatação responsiva
function formatForScreenSize(text, limits) {
    if (!text) return 'N/A';
    
    const width = window.innerWidth;
    let limit;
    
    if (width < 480) {
        limit = limits.smallMobile;
    } else if (width < 768) {
        limit = limits.mobile;
    } else {
        limit = limits.default;
    }
    
    return text.length > limit ? text.substring(0, limit) + '...' : text;
}

function formatArrayForScreenSize(array, limits) {
    if (!array || !Array.isArray(array)) return 'N/A';
    
    const width = window.innerWidth;
    let limit;
    
    if (width < 480) {
        limit = limits.smallMobile;
    } else if (width < 768) {
        limit = limits.mobile;
    } else {
        limit = limits.default;
    }
    
    return array.map(item => 
        item.length > limit ? item.substring(0, limit) + '...' : item
    ).join(', ');
}

function formatDateForScreenSize(dateString) {
    if (!dateString) return 'N/A';
    
    const width = window.innerWidth;
    if (width < 480) {
        // Formato curto para mobile muito pequeno: DD/MM
        return dateString.substring(0, 5);
    } else if (width < 768) {
        // Formato médio para mobile: DD/MM/YY
        return dateString.length > 10 ? dateString.substring(0, 8) : dateString;
    }
    
    // Formato completo para tablet/desktop
    return dateString;
}

// Função para tornar a tabela responsiva
function makeTableResponsive() {
    const table = document.getElementById('repeatedServicesTable');
    const width = window.innerWidth;
    
    if (width < 768) {
        table.classList.add('responsive-table');
        if (width < 480) {
            table.classList.add('small-mobile-table');
        } else {
            table.classList.remove('small-mobile-table');
        }
    } else {
        table.classList.remove('responsive-table', 'small-mobile-table');
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
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
    
    // Também destruir qualquer gráfico não gerenciado pelo objeto charts
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

// Nova função para remover mensagens de "sem dados"
function removeNoDataMessages() {
    const noDataElements = document.querySelectorAll('.chart-no-data');
    noDataElements.forEach(element => element.remove());
}

// Mostrar mensagem de "sem dados"
function showNoDataMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    
    // Remover mensagens anteriores
    const existingNoData = container.querySelector('.chart-no-data');
    if (existingNoData) {
        existingNoData.remove();
    }
    
    const width = window.innerWidth;
    const fontSize = width < 480 ? '0.75rem' : (width < 768 ? '0.8rem' : '0.9rem');
    const iconSize = width < 480 ? '1.5rem' : (width < 768 ? '2rem' : '2.5rem');
    const padding = width < 480 ? '1rem' : '1.5rem';
    
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'chart-no-data';
    noDataDiv.innerHTML = `
        <i class="fas fa-chart-bar" style="font-size: ${iconSize}; color: #94a3b8; margin-bottom: 0.5rem;"></i>
        <p style="color: #94a3b8; text-align: center; font-size: ${fontSize}; margin: 0;">${message}</p>
    `;
    noDataDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: ${padding};
        min-height: 150px;
    `;
    
    container.appendChild(noDataDiv);
}

// Mostrar estado de carregamento
function showLoadingState() {
    // Remover loading anterior se existir
    hideLoadingState();
    
    const width = window.innerWidth;
    const fontSize = width < 480 ? '0.9rem' : (width < 768 ? '1rem' : '1.1rem');
    const iconSize = width < 480 ? '1.5rem' : (width < 768 ? '1.75rem' : '2rem');
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin" style="font-size: ${iconSize};"></i>
            <p style="font-size: ${fontSize}; margin-top: 0.5rem;">Carregando dados...</p>
        </div>
    `;
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 14, 23, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        color: white;
        backdrop-filter: blur(5px);
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
    
    const width = window.innerWidth;
    const fontSize = width < 480 ? '0.75rem' : (width < 768 ? '0.8rem' : '0.9rem');
    const maxWidth = width < 480 ? '85vw' : (width < 768 ? '300px' : '400px');
    const padding = width < 480 ? '0.6rem' : '0.8rem';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.95); color: white; padding: ${padding}; border-radius: 8px; margin: 0.5rem; max-width: ${maxWidth}; font-size: ${fontSize};">
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            ${message}
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; float: right; cursor: pointer; margin-left: 0.5rem; padding: 0;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Inserir no topo do container
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remover automaticamente após 8 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 8000);
}

// Inicializar tooltips se estiver usando Bootstrap
if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}
