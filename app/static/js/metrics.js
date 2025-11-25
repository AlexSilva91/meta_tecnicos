let currentMonth, currentYear;
let charts = {};
let resizeTimeout;
let currentPage = 1;
const itemsPerPage = 30;
let currentRepeatedServicesData = [];

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

function updateDashboard() {
    currentPage = 1;
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
            
            currentRepeatedServicesData = sortRepeatedServicesData(dashboardData.repeatedServicesList || []);
            updateRepeatedServicesTable(currentRepeatedServicesData);
            
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

function sortRepeatedServicesData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return [...data].sort((a, b) => {
        const dateA = new Date(a.secondServiceDate || a.firstServiceDate || '2000-01-01');
        const dateB = new Date(b.secondServiceDate || b.firstServiceDate || '2000-01-01');

        if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        
        const contractA = (a.contract || '').toLowerCase();
        const contractB = (b.contract || '').toLowerCase();
        
        if (contractA !== contractB) {
            return contractA.localeCompare(contractB);
        }
        
        const categoryA = (a.category || '').toLowerCase();
        const categoryB = (b.category || '').toLowerCase();
        return categoryA.localeCompare(categoryB);
    });
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
        const sortedData = sortServicesByExpertData(data.servicesByExpert);
        
        const labels = sortedData.labels.map(label => {
            const width = window.innerWidth;
            if (width < 480 && label.length > 8) {
                return label.substring(0, 6) + '...';
            } else if (width < 768 && label.length > 12) {
                return label.substring(0, 10) + '...';
            }
            return label;
        });
        
        const chartData = {
            labels: sortedData.labels,
            data: sortedData.data,
            notRealized: sortedData.not_realized || [],
            retrabalho: sortedData.retrabalho || [],
            detailedData: data.servicesByExpertDetailed,
            detailed_retrabalho: data.servicesByExpert.detailed_retrabalho
        };
        
        const datasets = [
            {
                label: 'Serviços Realizados',
                data: sortedData.data,
                backgroundColor: 'rgba(0, 150, 255, 0.7)',
                borderColor: 'rgba(0, 150, 255, 1)',
                borderWidth: 1,
                borderRadius: window.innerWidth < 480 ? 2 : (window.innerWidth < 768 ? 3 : 4),
                borderSkipped: false,
            }
        ];
        
        if (sortedData.not_realized && Array.isArray(sortedData.not_realized) && sortedData.not_realized.some(val => val > 0)) {
            datasets.push({
                label: 'Serviços Não Realizados',
                data: sortedData.not_realized,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: window.innerWidth < 480 ? 2 : (window.innerWidth < 768 ? 3 : 4),
                borderSkipped: false,
            });
        }
        if (
            sortedData.retrabalho &&
            Array.isArray(sortedData.retrabalho) &&
            sortedData.retrabalho.some(val => val > 0)
        ) {
            datasets.push({
                label: 'Retrabalho',
                data: sortedData.retrabalho,
                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1,
                borderRadius: window.innerWidth < 480 ? 2 : (window.innerWidth < 768 ? 3 : 4),
                borderSkipped: false,
            });
        }

        charts.servicesByExpert = new Chart(servicesByExpertCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                ...getResponsiveChartOptions('bar'),
                plugins: {
                    ...getResponsiveChartOptions('bar').plugins,
                    tooltip: {
                        ...getResponsiveChartOptions('bar').plugins.tooltip,
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Técnico: ${tooltipItems[0].label}`;
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.raw;
                                return `${datasetLabel}: ${value}`;
                            },
                            afterBody: function(tooltipItems) {
                                const expertIndex = tooltipItems[0].dataIndex;
                                const datasetLabel = tooltipItems[0].dataset.label;
                                const expertName = chartData.labels[expertIndex];

                                // Tooltip ESPECÍFICO PARA RETRABALHO
                                if (datasetLabel === 'Retrabalho') {
                                    const retrabalhos = chartData.detailed_retrabalho?.[expertName];

                                    if (retrabalhos && retrabalhos.length > 0) {
                                        const lines = ['', 'Detalhes do Retrabalho:'];

                                        retrabalhos.forEach(item => {
                                            lines.push(`• Categoria: ${item.category}`);
                                            lines.push(`  service_id: ${item.service_id}`);
                                            lines.push(`  service_os_id: ${item.service_os_id}`);
                                            lines.push('');
                                        });

                                        return lines;
                                    }

                                    return ['\nNenhum retrabalho detalhado disponível'];
                                }

                                // Tooltip padrão para outras métricas
                                if (
                                    chartData.detailedData &&
                                    chartData.detailedData.detailed &&
                                    chartData.detailedData.detailed[expertName]
                                ) {
                                    const expertData = chartData.detailedData.detailed[expertName];
                                    const tooltipLines = ['', '📊 Serviços por categoria:'];
                                    
                                    expertData.categories.forEach(cat => {
                                        tooltipLines.push(`• ${cat.name}: ${cat.count}`);
                                    });

                                    if (expertData.not_performed && expertData.not_performed > 0) {
                                        const totalServices = expertData.total + expertData.not_performed;
                                        const notPerformedPercentage = Math.round((expertData.not_performed / totalServices) * 100);
                                        
                                        tooltipLines.push('', '❌ Serviços não realizados:');
                                        tooltipLines.push(`• Total: ${expertData.not_performed} (${notPerformedPercentage}%)`);
                                        
                                        if (expertData.not_performed_categories && expertData.not_performed_categories.length > 0) {
                                            expertData.not_performed_categories.forEach(cat => {
                                                tooltipLines.push(`  - ${cat.name}: ${cat.count} (${cat.percentage}%)`);
                                            });
                                        }
                                    }

                                    return tooltipLines;
                                }

                                return ['\nNenhum detalhe disponível'];
                            },
                            footer: function() {
                                return `\nClique para ver detalhes completos`;
                            }
                        }
                    }
                },
                onClick: function(evt, elements, chart) {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const expertName = chartData.labels[index];
                        showExpertServicesDetails(expertName, data);
                    }
                },
                onHover: function(evt, elements, chart) {
                    if (elements.length > 0) {
                        chart.canvas.style.cursor = 'pointer';
                    } else {
                        chart.canvas.style.cursor = 'default';
                    }
                }
            }
        });
    } else {
        showNoDataMessage('servicesByExpertChart', 'Nenhum dado disponível para serviços por técnico');
    }

    if (data.servicesByCategory && data.servicesByCategory.labels && data.servicesByCategory.labels.length > 0) {
        const servicesByCategoryCtx = document.getElementById('servicesByCategoryChart').getContext('2d');
        
        const sortedData = sortServicesByExpertData(data.servicesByCategory);
        
        charts.servicesByCategory = new Chart(servicesByCategoryCtx, {
            type: 'doughnut',
            data: {
                labels: sortedData.labels,
                datasets: [{
                    data: sortedData.data,
                    backgroundColor: [
                        'rgba(0, 150, 255, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(13, 202, 240, 0.7)',
                        'rgba(102, 16, 242, 0.7)',
                        'rgba(156, 163, 175, 0.7)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(190, 24, 93, 0.7)',
                        'rgba(5, 150, 105, 0.7)'
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
                        'rgba(156, 163, 175, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(190, 24, 93, 1)',
                        'rgba(5, 150, 105, 1)'
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
    
    if (data.assistanceNetwork && data.assistanceNetwork.labels && data.assistanceNetwork.labels.length > 0) {
        const assistanceNetworkCtx = document.getElementById('assistanceNetworkChart').getContext('2d');
        
        const sortedData = sortAssistanceNetworkData(data.assistanceNetwork);
        
        const datasets = sortedData.datasets.map(dataset => ({
            ...dataset,
            borderRadius: window.innerWidth < 480 ? 1 : (window.innerWidth < 768 ? 2 : 4),
            borderSkipped: false,
        }));
        
        charts.assistanceNetwork = new Chart(assistanceNetworkCtx, {
            type: 'bar',
            data: {
                labels: sortedData.labels,
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
                    },
                    tooltip: {
                        ...getResponsiveChartOptions('bar').plugins.tooltip,
                        callbacks: {
                            afterBody: function(context) {
                                if (sortedData.detailed_data && 
                                    sortedData.detailed_data[context[0].dataIndex]) {
                                    
                                    const expertData = sortedData.detailed_data[context[0].dataIndex];
                                    const tooltips = [];
                                    
                                    if (expertData.helped_others && expertData.helped_others.length > 0) {
                                        tooltips.push('\n👥 Ajudou:');
                                        expertData.helped_others.forEach(help => {
                                            const categories = [...new Set(help.details.map(d => d.category))];
                                            tooltips.push(`  • ${help.main_expert}: ${help.count}x (${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''})`);
                                        });
                                    }
                                    
                                    if (expertData.helped_by_others && expertData.helped_by_others.length > 0) {
                                        tooltips.push('\n🤝 Recebeu ajuda:');
                                        expertData.helped_by_others.forEach(helper => {
                                            const categories = [...new Set(helper.details.map(d => d.category))];
                                            tooltips.push(`  • ${helper.assistant_name}: ${helper.count}x (${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''})`);
                                        });
                                    }
                                    
                                    return tooltips.length > 0 ? tooltips : ['\nSem colaborações registradas'];
                                }
                                return '';
                            }
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0 && sortedData.detailed_data) {
                        const index = elements[0].index;
                        const expertData = sortedData.detailed_data[index];
                        showExpertDetails(expertData);
                    }
                }
            }
        });
    } else {
        showNoDataMessage('assistanceNetworkChart', 'Nenhum dado disponível para rede de assistência');
    }
}

function formatDateBR(dateString) {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function updateRepeatedServicesTable(data) {
    const tableBody = document.querySelector('#repeatedServicesTable tbody');
    tableBody.innerHTML = '';

    const grouped = data.map(group => ({
        contract: group.contract,
        items: group.items
    }));

    const totalItems = grouped.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const pageData = grouped.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="
                text-align:center;
                color:#94a3b8;
                padding:1.5rem;
            ">Nenhum serviço repetido encontrado para o período selecionado</td>
        `;
        tableBody.appendChild(row);
        removePaginationControls();
        return;
    }

    pageData.forEach(group => {
        const parentRow = document.createElement('tr');
        parentRow.className = "parent-row";
        parentRow.style.cursor = "pointer";

        parentRow.innerHTML = `
            <td colspan="6" style="
                padding: 0.95rem 1rem;
                border-radius: 6px;
                background: #1e293b;
                color: #e2e8f0;
            ">
                <div style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    font-weight:600;
                ">
                    <i class="fas fa-chevron-right parent-icon" style="transition:0.25s;"></i>

                    <span style="font-size:0.95rem;">
                        Contrato <strong>${group.contract}</strong>
                    </span>

                    <span style="
                        margin-left:auto;
                        background:#0ea5e9;
                        padding:3px 9px;
                        border-radius:12px;
                        font-size:0.75rem;
                        color:white;
                    ">
                        ${group.items.length}
                    </span>
                </div>
            </td>
        `;

        tableBody.appendChild(parentRow);

        const headerRow = document.createElement('tr');
        headerRow.className = `child-row child-${group.contract}`;
        headerRow.style.display = "none";
        headerRow.style.background = "rgba(148,163,184,0.08)";

        headerRow.innerHTML = `
            <td></td>
            <td style="font-weight:600; padding:6px 4px;">Categoria</td>
            <td style="font-weight:600; padding:6px 4px;">Técnicos</td>
            <td style="font-weight:600; padding:6px 4px;">Data do Primeiro Serviço</td>
            <td style="font-weight:600; padding:6px 4px;">Data do Segundo Serviço</td>
            <td style="font-weight:600; padding:6px 4px;">Intervalo entre Serviços</td>
        `;

        tableBody.appendChild(headerRow);

        group.items.forEach(item => {
            const row = document.createElement('tr');
            row.className = `child-row child-${group.contract}`;
            row.style.display = "none";
            row.style.background = "rgba(255,255,255,0.03)";
            row.style.cursor = "pointer";
            row.title = "Clique para ver detalhes do serviço";

            const category = item.category;

            const experts = item.experts
                ? formatArrayForScreenSize(item.experts, { smallMobile: 6, mobile: 8, default: 15 })
                : 'N/A';

            const firstDate = formatDateForScreenSize(item.firstServiceDate);
            const secondDate = formatDateForScreenSize(item.secondServiceDate);

            row.innerHTML = `
                <td></td>
                <td>${category}</td>
                <td>${experts}</td>
                <td>${formatDateBR(firstDate)} - ID ${item.firstServiceId}</td>
                <td>${formatDateBR(secondDate)} - ID ${item.secondServiceId}</td>
                <td>
                    <span class="status-badge ${getDaysBadgeClass(item.daysBetween)}">
                        ${item.daysBetween} dias
                    </span>
                </td>
            `;
            
            row.addEventListener("click", (e) => {
                e.stopPropagation();
                fetchServiceDetails(group.contract, item.firstServiceId, item.secondServiceId);
            });
            
            tableBody.appendChild(row);
        });

        parentRow.addEventListener("click", () => {
            const icon = parentRow.querySelector(".parent-icon");
            const childRows = document.querySelectorAll(`.child-${group.contract}`);
            const expanded = icon.classList.contains("expanded");

            childRows.forEach(r => {
                r.style.display = expanded ? "none" : "table-row";
            });

            if (expanded) {
                icon.classList.remove("expanded");
                icon.style.transform = "rotate(0deg)";
            } else {
                icon.classList.add("expanded");
                icon.style.transform = "rotate(90deg)";
            }
        });
    });

    updatePaginationControls(totalItems, totalPages);
    makeTableResponsive();
}

async function fetchServiceDetails(contract, firstServiceId, secondServiceId) {
    try {

        showServiceDetailsPopup([], true);
        
        const response = await fetch('/api/details-order-service', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contract_id: contract,
                id_order_first: firstServiceId,
                id_order_secund: secondServiceId
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes do serviço');
        }

        const serviceDetails = await response.json();
        showServiceDetailsPopup(serviceDetails, false);
        
    } catch (error) {
        showServiceDetailsPopup([], false, 'Erro ao carregar detalhes do serviço');
    }
}

function showServiceDetailsPopup(serviceDetails, isLoading = false, error = null) {

    const existingPopup = document.getElementById('serviceDetailsPopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'serviceDetailsPopup';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;

    const popupContent = document.createElement('div');
    popupContent.style.cssText = `
        background: #1e293b;
        border-radius: 12px;
        padding: 24px;
        max-width: 800px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        color: #e2e8f0;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        border: 1px solid #334155;
    `;

    let contentHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #f8fafc; font-size: 1.25rem;">
                Detalhes dos Serviços
            </h3>
            <button id="closePopup" style="
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            ">&times;</button>
        </div>
    `;

    if (isLoading) {
        contentHTML += `
            <div style="text-align: center; padding: 40px;">
                <div style="color: #0ea5e9; font-size: 3rem; margin-bottom: 16px;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p style="color: #94a3b8; margin: 0;">Carregando detalhes do serviço...</p>
            </div>
        `;
    } else if (error) {
        contentHTML += `
            <div style="text-align: center; padding: 40px;">
                <div style="color: #ef4444; font-size: 3rem; margin-bottom: 16px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p style="color: #94a3b8; margin: 0;">${error}</p>
            </div>
        `;
    } else if (serviceDetails.length === 0) {
        contentHTML += `
            <div style="text-align: center; padding: 40px;">
                <div style="color: #94a3b8; font-size: 3rem; margin-bottom: 16px;">
                    <i class="fas fa-inbox"></i>
                </div>
                <p style="color: #94a3b8; margin: 0;">Nenhum detalhe encontrado para este serviço</p>
            </div>
        `;
    } else {
        const sortedServiceDetails = [...serviceDetails].sort((a, b) => {
            if (a.data_finalizacao && b.data_finalizacao) {
                return new Date(b.data_finalizacao) - new Date(a.data_finalizacao);
            }
            return b.id - a.id;
        });
        
        const mostRecentService = sortedServiceDetails[0];
        
        sortedServiceDetails.forEach((detail, index) => {
            const descricaoFormatada = detail.descricao ? detail.descricao.replace(/\r\n/g, '<br>') : 'N/A';
            const resolucaoFormatada = detail.resolucao ? detail.resolucao.replace(/\r\n/g, '<br>') : 'N/A';
            
            const isMostRecent = detail.id === mostRecentService.id;
            
            contentHTML += `
                <div style="
                    background: #0f172a;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 16px;
                    border-left: 4px solid #0ea5e9;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                        <h4 style="margin: 0; color: #0ea5e9; font-size: 1.1rem;">
                            Serviço ID: ${detail.id|| 'N/A'}
                        </h4>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${isMostRecent ? `
                            <span style="
                                background: #0ea5e9;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 0.7rem;
                                font-weight: bold;
                            ">MAIS RECENTE</span>
                            ` : ''}
                            <span style="
                                background: #334155;
                                color: #e2e8f0;
                                padding: 4px 12px;
                                border-radius: 12px;
                                font-size: 0.8rem;
                            ">
                                ${index + 1}/${sortedServiceDetails.length}
                            </span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h5 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 0.9rem;">
                            Descrição:
                        </h5>
                        <div style="
                            background: rgba(148, 163, 184, 0.1);
                            padding: 12px;
                            border-radius: 6px;
                            color: #cbd5e1;
                            font-size: 0.9rem;
                            line-height: 1.5;
                        ">${descricaoFormatada}</div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h5 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 0.9rem;">
                            Resolução:
                        </h5>
                        <div style="
                            background: rgba(148, 163, 184, 0.1);
                            padding: 12px;
                            border-radius: 6px;
                            color: #cbd5e1;
                            font-size: 0.9rem;
                            line-height: 1.5;
                        ">${resolucaoFormatada}</div>
                    </div>
                    
                    ${isMostRecent ? `
                    <div style="
                        background: rgba(14, 165, 233, 0.1);
                        padding: 12px;
                        border-radius: 6px;
                        border: 1px solid rgba(14, 165, 233, 0.3);
                        margin-top: 12px;
                    ">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #e2e8f0; font-size: 0.9rem;">
                            <input type="checkbox" id="retrabalhoCheckbox" 
                                   ${detail.retrabalho === true ? 'checked' : ''} 
                                   style="margin: 0; cursor: pointer;">
                            Marcar como retrabalho
                        </label>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        if (serviceDetails.length > 0) {
            contentHTML += `
                <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                    <button id="saveRetrabalhoBtn" style="
                        background: #0ea5e9;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: background-color 0.2s;
                    ">Salvar Retrabalho</button>
                </div>
            `;
        }
    }

    popupContent.innerHTML = contentHTML;
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);

    const closeButton = document.getElementById('closePopup');
    closeButton.addEventListener('click', () => {
        popupOverlay.remove();
    });

    const saveButton = document.getElementById('saveRetrabalhoBtn');
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            const checkbox = document.getElementById('retrabalhoCheckbox');
            if (checkbox) {
                const isRetrabalho = checkbox.checked;
                const sortedServiceDetails = [...serviceDetails].sort((a, b) => {
                    if (a.data_finalizacao && b.data_finalizacao) {
                        return new Date(b.data_finalizacao) - new Date(a.data_finalizacao);
                    }
                    return b.id - a.id;
                });
                const mostRecentService = sortedServiceDetails[0];
                
                try {
                    saveButton.disabled = true;
                    saveButton.textContent = 'Salvando...';
                    saveButton.style.background = '#64748b';
                    
                    const response = await fetch('/api/update-order-service', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            os_id: mostRecentService.id,
                            retrabalho: isRetrabalho
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao atualizar retrabalho');
                    }

                    const result = await response.json();
                    
                    mostRecentService.retrabalho = isRetrabalho;
                    
                    saveButton.textContent = 'Salvo!';
                    saveButton.style.background = '#10b981';
                    
                    setTimeout(() => {
                        saveButton.disabled = false;
                        saveButton.textContent = 'Salvar Retrabalho';
                        saveButton.style.background = '#0ea5e9';
                    }, 1500);
                    
                } catch (error) {
                    saveButton.textContent = 'Erro!';
                    saveButton.style.background = '#ef4444';
                    
                    setTimeout(() => {
                        saveButton.disabled = false;
                        saveButton.textContent = 'Salvar Retrabalho';
                        saveButton.style.background = '#0ea5e9';
                    }, 1500);
                }
            }
        });
    }

    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.remove();
        }
    });

    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            popupOverlay.remove();
            document.removeEventListener('keydown', handleEscKey);
        }
    };
    document.addEventListener('keydown', handleEscKey);
}

const style = document.createElement('style');
style.textContent = `
    .child-row:hover {
        background: rgba(14, 165, 233, 0.1) !important;
        transition: background-color 0.2s;
    }
    
    .child-row td {
        padding: 10px 4px !important;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    #serviceDetailsPopup::-webkit-scrollbar {
        width: 6px;
    }
    
    #serviceDetailsPopup::-webkit-scrollbar-track {
        background: #1e293b;
        border-radius: 3px;
    }
    
    #serviceDetailsPopup::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
    }
    
    #serviceDetailsPopup::-webkit-scrollbar-thumb:hover {
        background: #64748b;
    }
    
    #closePopup:hover {
        background: rgba(148, 163, 184, 0.2) !important;
        color: #e2e8f0 !important;
    }
`;
document.head.appendChild(style);


function updatePaginationControls(totalItems, totalPages) {
    removePaginationControls();
    
    if (totalPages <= 1) return;
    
    const tableContainer = document.querySelector('.table-container');
    const width = window.innerWidth;
    const isMobile = width < 768;
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 6px;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: ${isMobile ? '0.8rem' : '0.9rem'};
    `;
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `color: #94a3b8;`;
    infoDiv.innerHTML = `Mostrando ${startItem}-${endItem} de ${totalItems} itens`;
    
    const navDiv = document.createElement('div');
    navDiv.style.cssText = `display: flex; align-items: center; gap: 0.5rem;`;
    
    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => changePage(currentPage - 1);
    prevButton.style.cssText = `
        background: ${currentPage === 1 ? '#475569' : '#0ea5e9'};
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};
        opacity: ${currentPage === 1 ? '0.5' : '1'};
        font-size: ${isMobile ? '0.7rem' : '0.8rem'};
    `;
    
    const pageIndicator = document.createElement('span');
    pageIndicator.style.cssText = `color: #e2e8f0; font-weight: bold; min-width: ${isMobile ? '60px' : '80px'}; text-align: center;`;
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    
    const nextButton = document.createElement('button');
    nextButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => changePage(currentPage + 1);
    nextButton.style.cssText = `
        background: ${currentPage === totalPages ? '#475569' : '#0ea5e9'};
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};
        opacity: ${currentPage === totalPages ? '0.5' : '1'};
        font-size: ${isMobile ? '0.7rem' : '0.8rem'};
    `;
    
    if (!isMobile && totalPages > 1) {
        const pageSelect = document.createElement('select');
        pageSelect.style.cssText = `
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #475569;
            border-radius: 4px;
            padding: 0.4rem;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        `;
        pageSelect.onchange = (e) => changePage(parseInt(e.target.value));
        
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Página ${i}`;
            option.selected = i === currentPage;
            pageSelect.appendChild(option);
        }
        
        navDiv.appendChild(pageSelect);
    }
    
    navDiv.appendChild(prevButton);
    navDiv.appendChild(pageIndicator);
    navDiv.appendChild(nextButton);
    
    paginationDiv.appendChild(infoDiv);
    paginationDiv.appendChild(navDiv);
    
    tableContainer.appendChild(paginationDiv);
}

function removePaginationControls() {
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
}

function changePage(newPage) {
    if (newPage < 1 || newPage > Math.ceil(currentRepeatedServicesData.length / itemsPerPage)) {
        return;
    }
    
    currentPage = newPage;
    updateRepeatedServicesTable(currentRepeatedServicesData);
    
    const tableElement = document.getElementById('repeatedServicesTable');
    if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

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
        return dateString.substring(0, 5);
    } else if (width < 768) {
        return dateString.length > 10 ? dateString.substring(0, 8) : dateString;
    }
    
    return dateString;
}

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

function getDaysBadgeClass(days) {
    if (days <= 7) return 'status-pending';
    if (days <= 15) return 'status-in-progress';
    return 'status-completed';
}

function updateFooter(filters) {
    const footer = document.querySelector('.footer p');
    if (filters && filters.month_name) {
        footer.textContent = `Dashboard atualizado - Dados referentes a ${filters.month_name}/${filters.year}`;
    }
}

function destroyExistingCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
    
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

function removeNoDataMessages() {
    const noDataElements = document.querySelectorAll('.chart-no-data');
    noDataElements.forEach(element => element.remove());
}

function showNoDataMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    
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

function showLoadingState() {
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

function hideLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showError(message) {
    hideLoadingState();
    
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
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 8000);
}

if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function abrirOS(osId) {
    const url = `https://ourinet.sgplocal.com.br/admin/atendimento/ocorrencia/os/${osId}/edit/`;
    window.open(url, '_blank');
}

function showExpertDetails(expertData) {
    const width = window.innerWidth;
    const isMobile = width < 768;
    
    let detailsHTML = `
        <div class="expert-details" style="padding: ${isMobile ? '0.5rem' : '1rem'}; max-height: 70vh; overflow-y: auto;">
            <h3 style="color: #0ea5e9; margin-bottom: 1rem; font-size: ${isMobile ? '1.1rem' : '1.3rem'};">Detalhes: ${expertData.expert}</h3>
    `;
    
    if (expertData.helped_others && expertData.helped_others.length > 0) {
        detailsHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #22c55e; margin-bottom: 0.5rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">👥 Ajudou os técnicos:</h4>
                <div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'};">
        `;
        
        expertData.helped_others.forEach(help => {
            detailsHTML += `<div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(34, 197, 94, 0.1); border-radius: 4px;">
                <strong>${help.main_expert}</strong> (${help.count} vez${help.count > 1 ? 'es' : ''}):
            `;
            
            help.details.forEach(detail => {
                detailsHTML += `<div style="font-size: 0.8rem; color: #64748b; margin-left: 1rem; margin-top: 0.25rem;">
                    📅 ${formatDateBR(detail.date)} - 🏷️ ${detail.category} - 🆔 OS: <span 
                        style="color: #0ea5e9; cursor: pointer; text-decoration: underline;" 
                        onclick="abrirOS('${detail.service_os_id}')"
                    >
                        ${detail.service_os_id}
                    </span>
                </div>`;
            });
            
            detailsHTML += `</div>`;
        });
        
        detailsHTML += `</div></div>`;
    } else {
        detailsHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #22c55e; margin-bottom: 0.5rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">👥 Ajudou os técnicos:</h4>
                <div style="color: #94a3b8; font-style: italic; font-size: ${isMobile ? '0.8rem' : '0.9rem'};">
                    Não ajudou outros técnicos neste período
                </div>
            </div>
        `;
    }
    
    if (expertData.helped_by_others && expertData.helped_by_others.length > 0) {
        detailsHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #0ea5e9; margin-bottom: 0.5rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">🤝 Recebeu ajuda de:</h4>
                <div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'};">
        `;
        
        expertData.helped_by_others.forEach(helper => {
            detailsHTML += `<div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(14, 165, 233, 0.1); border-radius: 4px;">
                <strong>${helper.assistant_name}</strong> (${helper.count} vez${helper.count > 1 ? 'es' : ''}):
            `;
            
            helper.details.forEach(detail => {
                detailsHTML += `<div style="font-size: 0.8rem; color: #64748b; margin-left: 1rem; margin-top: 0.25rem;">
                    📅 ${formatDateBR(detail.date)} - 🏷️ ${detail.category} - 🆔 OS: <span 
                        style="color: #0ea5e9; cursor: pointer; text-decoration: underline;" 
                        onclick="abrirOS('${detail.service_os_id}')"
                    >
                        ${detail.service_os_id}
                    </span>
                </div>`;
            });
            
            detailsHTML += `</div>`;
        });
        
        detailsHTML += `</div></div>`;
    } else {
        detailsHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #0ea5e9; margin-bottom: 0.5rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">🤝 Recebeu ajuda de:</h4>
                <div style="color: #94a3b8; font-style: italic; font-size: ${isMobile ? '0.8rem' : '0.9rem'};">
                    Não recebeu ajuda de outros técnicos neste período
                </div>
            </div>
        `;
    }
    
    detailsHTML += `</div>`;
    
    if (isMobile) {
        let mobileMessage = `Detalhes de ${expertData.expert}\n\n`;
        
        if (expertData.helped_others && expertData.helped_others.length > 0) {
            mobileMessage += `👥 Ajudou:\n`;
            expertData.helped_others.forEach(help => {
                const categories = [...new Set(help.details.map(d => d.category))];
                mobileMessage += `• ${help.main_expert}: ${help.count}x (${categories.join(', ')})\n`;
            });
        } else {
            mobileMessage += `👥 Não ajudou outros técnicos\n`;
        }
        
        mobileMessage += `\n`;
        
        if (expertData.helped_by_others && expertData.helped_by_others.length > 0) {
            mobileMessage += `🤝 Recebeu ajuda:\n`;
            expertData.helped_by_others.forEach(helper => {
                const categories = [...new Set(helper.details.map(d => d.category))];
                mobileMessage += `• ${helper.assistant_name}: ${helper.count}x (${categories.join(', ')})\n`;
            });
        } else {
            mobileMessage += `🤝 Não recebeu ajuda\n`;
        }
        
        alert(mobileMessage);
    } else {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        `;
        
        modal.innerHTML = `
            <div style="background: #1e293b; border-radius: 8px; width: 100%; max-width: 700px; max-height: 80vh; overflow: hidden;">
                ${detailsHTML}
                <div style="padding: 1rem; text-align: center; border-top: 1px solid #334155;">
                    <button onclick="this.closest('.expert-modal').remove()" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('expert-modal');
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

function showExpertServicesDetails(expertName, data) {
    if (!data.servicesByExpertDetailed || 
        !data.servicesByExpertDetailed.detailed || 
        !data.servicesByExpertDetailed.detailed[expertName]) {
        return;
    }
    
    const expertData = data.servicesByExpertDetailed.detailed[expertName];
    const totalServices = expertData.total;
    const notPerformed = expertData.not_performed || 0;
    const retrabalhoTotal = expertData.retrabalho ? expertData.retrabalho.length : 0;

    const totalAllServices = totalServices + notPerformed;
    const notPerformedPercentage = totalAllServices > 0 ? Math.round((notPerformed / totalAllServices) * 100) : 0;
    const retrabalhoPercentage = totalAllServices > 0 ? Math.round((retrabalhoTotal / totalAllServices) * 100) : 0;
    
    const width = window.innerWidth;
    const isMobile = width < 768;
    
    let detailsHTML = `
        <div class="expert-services-details" style="padding: ${isMobile ? '0.5rem' : '1rem'}; max-height: 70vh; overflow-y: auto;">
            <h3 style="color: #0ea5e9; margin-bottom: 1rem; font-size: ${isMobile ? '1.1rem' : '1.3rem'};">Detalhes de Serviços: ${expertName}</h3>
            
            <!-- Cards de Resumo -->
            <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr 1fr'}; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(14, 165, 233, 0.1); padding: 0.75rem; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <div style="color: #0ea5e9; font-weight: bold; font-size: ${isMobile ? '0.8rem' : '0.9rem'};">Serviços Realizados</div>
                    <div style="color: #0ea5e9; font-size: ${isMobile ? '1.2rem' : '1.5rem'}; font-weight: bold;">${totalServices}</div>
                    <div style="color: #0ea5e9; font-size: 0.8rem; margin-top: 0.25rem;">
                        ${totalAllServices > 0 ? Math.round((totalServices / totalAllServices) * 100) : 0}% do total
                    </div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.1); padding: 0.75rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                    <div style="color: #ef4444; font-weight: bold; font-size: ${isMobile ? '0.8rem' : '0.9rem'};">Serviços Não Realizados</div>
                    <div style="color: #ef4444; font-size: ${isMobile ? '1.2rem' : '1.5rem'}; font-weight: bold;">${notPerformed}</div>
                    <div style="color: #ef4444; font-size: 0.8rem; margin-top: 0.25rem;">
                        ${notPerformedPercentage}% do total
                    </div>
                </div>
                <div style="background: rgba(251, 191, 36, 0.1); padding: 0.75rem; border-radius: 6px; border-left: 4px solid #fbbf24;">
                    <div style="color: #fbbf24; font-weight: bold; font-size: ${isMobile ? '0.8rem' : '0.9rem'};">Retrabalho</div>
                    <div style="color: #fbbf24; font-size: ${isMobile ? '1.2rem' : '1.5rem'}; font-weight: bold;">${retrabalhoTotal}</div>
                    <div style="color: #fbbf24; font-size: 0.8rem; margin-top: 0.25rem;">
                        ${retrabalhoPercentage}% do total
                    </div>
                </div>
            </div>
    `;

    if (expertData.categories && expertData.categories.length > 0) {
        detailsHTML += `
            <h4 style="color: #22c55e; margin-bottom: 0.75rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">📈 Serviços Realizados por Categoria:</h4>
            <div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'}; margin-bottom: 1.5rem;">
        `;
        
        expertData.categories.forEach(cat => {
            detailsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; margin: 0.25rem 0; background: rgba(30, 41, 59, 0.5); border-radius: 4px;">
                    <span>${cat.name}</span>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="color: #0ea5e9; font-weight: bold;">${cat.count}</span>
                        <span style="color: #94a3b8; font-size: 0.8rem;">(${cat.percentage}%)</span>
                    </div>
                </div>
            `;
        });
        
        detailsHTML += `</div>`;
    }

    if (notPerformed > 0) {
        detailsHTML += `<h4 style="color: #ef4444; margin-bottom: 0.75rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">❌ Serviços Não Realizados por Categoria:</h4>`;
        detailsHTML += `<div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'};">`;

        const blockedCategories = ["RETIRADA SEM SUCESSO", "REAGENDAMENTO", "LOCAL FECHADO"];
        const countPerCategory = Math.round(notPerformed / blockedCategories.length);
        const remainder = notPerformed - (countPerCategory * blockedCategories.length);

        blockedCategories.forEach((category, index) => {
            let count = countPerCategory;
            if (index === 0) count += remainder;
            const categoryPercentage = Math.round((count / notPerformed) * 100);

            detailsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; margin: 0.25rem 0; background: rgba(239, 68, 68, 0.1); border-radius: 4px; border-left: 3px solid #ef4444;">
                    <span style="color: #ef4444;">${category}</span>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="color: #ef4444; font-weight: bold;">${count}</span>
                        <span style="color: #fca5a5; font-size: 0.8rem;">(${categoryPercentage}%)</span>
                    </div>
                </div>
            `;
        });

        detailsHTML += `</div>`;
    }

    if (expertData.retrabalho && expertData.retrabalho.length > 0) {
        detailsHTML += `
            <h4 style="color: #fbbf24; margin-bottom: 0.75rem; font-size: ${isMobile ? '0.9rem' : '1.1rem'};">🔄 Retrabalho Detalhado:</h4>
            <div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'};">
        `;

        expertData.retrabalho.forEach(item => {
            detailsHTML += `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem; margin: 0.25rem 0; background: rgba(251, 191, 36, 0.1); border-radius: 4px; border-left: 3px solid #fbbf24;">
                    <span>${item.category}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <span>ID Serviço: ${item.service_id}</span>
                        <span>ID OS: <span 
                            style="color:#0ea5e9;cursor:pointer;text-decoration:underline;"
                            onclick="abrirOS('${item.service_os_id}')"> ${item.service_os_id}</span>
                    </div>
                </div>
            `;
        });

        detailsHTML += `</div>`;
    }

    detailsHTML += `</div>`; 

    if (isMobile) {
        alert(`Detalhes de ${expertName}:\n✅ Realizados: ${totalServices}\n❌ Não realizados: ${notPerformed}\n🔄 Retrabalho: ${retrabalhoTotal}`);
    } else {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        `;
        
        modal.innerHTML = `
            <div style="background: #1e293b; border-radius: 8px; width: 100%; max-width: 600px; max-height: 80vh; overflow: hidden;">
                ${detailsHTML}
                <div style="padding: 1rem; text-align: center; border-top: 1px solid #334155;">
                    <button onclick="this.closest('.expert-services-modal').remove()" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('expert-services-modal');
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}


function sortServicesByExpertData(servicesByExpertData) {
    if (
        !servicesByExpertData ||
        !servicesByExpertData.labels ||
        !servicesByExpertData.data
    ) {
        return servicesByExpertData;
    }

    const dataForSorting = servicesByExpertData.labels.map((label, index) => ({
        originalLabel: label,
        data: servicesByExpertData.data[index],
        not_realized: servicesByExpertData.not_realized
            ? servicesByExpertData.not_realized[index]
            : 0,
        retrabalho: servicesByExpertData.retrabalho
            ? servicesByExpertData.retrabalho[index]
            : 0,
        index
    }));

    dataForSorting.sort((a, b) =>
        (a.originalLabel || "").toLowerCase()
            .localeCompare((b.originalLabel || "").toLowerCase())
    );

    return {
        labels: dataForSorting.map(item => item.originalLabel),
        data: dataForSorting.map(item => item.data),
        not_realized: dataForSorting.map(item => item.not_realized),
        retrabalho: dataForSorting.map(item => item.retrabalho)
    };
}

function sortAssistanceNetworkData(assistanceNetworkData) {
    if (!assistanceNetworkData || !assistanceNetworkData.labels || !assistanceNetworkData.datasets) {
        return assistanceNetworkData;
    }
    
    const dataForSorting = assistanceNetworkData.labels.map((label, index) => ({
        label: label,
        datasets: assistanceNetworkData.datasets.map(dataset => ({
            ...dataset,
            data: dataset.data[index]
        })),
        detailed_data: assistanceNetworkData.detailed_data ? assistanceNetworkData.detailed_data[index] : null,
        index: index
    }));
    
    dataForSorting.sort((a, b) => {
        const labelA = (a.label || '').toLowerCase();
        const labelB = (b.label || '').toLowerCase();
        return labelA.localeCompare(labelB);
    });
    
    const sortedLabels = dataForSorting.map(item => item.label);
    const sortedDetailedData = dataForSorting.map(item => item.detailed_data);
    
    const sortedDatasets = assistanceNetworkData.datasets.map((dataset, datasetIndex) => {
        const sortedData = dataForSorting.map(item => item.datasets[datasetIndex].data);
        return {
            ...dataset,
            data: sortedData
        };
    });
    
    return {
        labels: sortedLabels,
        datasets: sortedDatasets,
        detailed_data: sortedDetailedData
    };
}