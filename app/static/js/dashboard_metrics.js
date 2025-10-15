document.addEventListener('DOMContentLoaded', function () {
    // ===== ServiceOrders por Técnico =====
    const servicesByExpertCtx = document.getElementById('servicesByExpertChart').getContext('2d');
    new Chart(servicesByExpertCtx, {
        type: 'bar',
        data: {
            labels: servicesByExpert.labels, // array de nomes de técnicos
            datasets: [{
                label: 'Total de Serviços',
                data: servicesByExpert.data, // array de quantidades
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

    // ===== Serviços com Auxílio =====
    const servicesWithAssistCtx = document.getElementById('servicesWithAssistChart').getContext('2d');
    new Chart(servicesWithAssistCtx, {
        type: 'pie',
        data: {
            labels: servicesWithAssist.labels, // ["Sem Auxílio", "Com Auxílio"]
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

    // ===== Serviços por Categoria e Técnico =====
    const servicesByCategoryCtx = document.getElementById('servicesByCategoryChart').getContext('2d');
    new Chart(servicesByCategoryCtx, {
        type: 'bar',
        data: {
            labels: servicesByCategory.labels, // categorias
            datasets: servicesByCategory.datasets // cada técnico como dataset
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
});
