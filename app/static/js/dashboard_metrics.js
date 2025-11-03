document.addEventListener('DOMContentLoaded', () => {
    const route = window.USER_ROLE === 'admin'
        ? '/admin/dashboard-metrics-data'
        : '/user/dashboard-metrics-data';

    fetch(route)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar dados do dashboard');
            return response.json();
        })
        .then(data => {
            renderCharts(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
});

function renderCharts(data) {
    const { servicesByExpert, servicesWithAssist, servicesByCategory } = data;

    // ===== Gráfico: Serviços por Técnico =====
    const expertCtx = document.getElementById('servicesByExpertChart');
    if (expertCtx) {
        new Chart(expertCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: servicesByExpert.labels,
                datasets: [{
                    label: 'Total de Serviços',
                    data: servicesByExpert.data,
                    backgroundColor: 'rgba(0, 204, 255, 0.7)',
                    borderColor: '#00ccff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Serviços realizados por técnico',
                        color: '#00ccff',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#f1f5f9' } },
                    x: { ticks: { color: '#f1f5f9' } }
                }
            }
        });
    }

    // ===== Gráfico: Serviços com Auxílio =====
    const assistCtx = document.getElementById('servicesWithAssistChart');
    if (assistCtx) {
        new Chart(assistCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: servicesWithAssist.labels,
                datasets: [{
                    label: 'Serviços',
                    data: servicesWithAssist.data,
                    backgroundColor: ['rgba(0, 102, 255, 0.7)', 'rgba(0, 217, 255, 0.7)'],
                    borderColor: '#0a0e17',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#f1f5f9' } },
                    title: {
                        display: true,
                        text: 'Distribuição de serviços com auxílio',
                        color: '#00ccff',
                        font: { size: 16 }
                    }
                }
            }
        });
    }

    // ===== Gráfico: Serviços por Categoria e Técnico =====
    const categoryCtx = document.getElementById('servicesByCategoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: servicesByCategory.labels,
                datasets: servicesByCategory.datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#f1f5f9' } },
                    title: {
                        display: true,
                        text: 'Serviços por categoria e técnico',
                        color: '#00ccff',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#f1f5f9' } },
                    x: { ticks: { color: '#f1f5f9' } }
                }
            }
        });
    }
}
