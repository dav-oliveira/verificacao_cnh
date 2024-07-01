document.getElementById('filterSelect').addEventListener('change', function () {
    const monthInput = document.getElementById('monthInput');
    if (this.value === 'specificMonth') {
        monthInput.style.display = 'block';
    } else {
        monthInput.style.display = 'none';
    }
});

function processFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    const filterSelect = document.getElementById('filterSelect').value;
    const monthInput = document.getElementById('monthInput').value;

    if (!fileInput) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        const utf8Data = new TextEncoder().encode(csvData);
        const blob = new Blob([utf8Data], { type: 'text/csv;charset=utf-8' });
        const utf8File = new File([blob], fileInput.name, { type: 'text/csv;charset=utf-8' });

        Papa.parse(utf8File, {
            header: true,
            complete: function (results) {
                const data = results.data;
                const resultTableBody = document.getElementById('resultTable').querySelector('tbody');
                resultTableBody.innerHTML = '';

                const today = new Date();

                data.forEach(row => {
                    const dadosExtras = row['Dados extras'];
                    const nome = row['Nome'];
                    const cnhMatch = dadosExtras.match(/CNH (\d{2}\/\d{2}\/\d{4})/);

                    if (cnhMatch) {
                        const cnhDateStr = cnhMatch[1];
                        const [day, month, year] = cnhDateStr.split('/');
                        const cnhDate = new Date(`${year}-${month}-${day}`);

                        const cnhDatePlus30Days = new Date(cnhDate);
                        cnhDatePlus30Days.setDate(cnhDate.getDate() + 30);

                        let status;
                        if (cnhDatePlus30Days < today) {
                            status = 'Vencida';
                        } else {
                            status = 'Válida';
                        }

                        const cnhMonthPlus30Days = `${cnhDatePlus30Days.getFullYear()}-${String(cnhDatePlus30Days.getMonth() + 1).padStart(2, '0')}`;

                        if ((filterSelect === 'vencida' && status === 'Vencida') ||
                            (filterSelect === 'all') ||
                            (filterSelect === 'specificMonth' && cnhMonthPlus30Days === monthInput)) {

                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${nome || 'N/A'}</td>
                                <td>${status}</td>
                                <td>${cnhDatePlus30Days.toLocaleDateString('pt-BR')}</td>
                            `;
                            resultTableBody.appendChild(tr);
                        }
                    }
                });
            },
            error: function (error) {
                console.error('Erro ao processar o arquivo:', error);
            }
        });
    };
    reader.readAsText(fileInput, 'ISO-8859-1');
}