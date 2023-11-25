const downloadButton = document.querySelector('[data-download-xls]');
const table = document.querySelector('[data-table]');

function handleDownloadPress() {
    if (table.querySelector('tbody tr')) {
        const wb = XLSX.utils.table_to_book(table, { sheet: "sheet1" });
        XLSX.writeFile(wb, 'document.xlsx');
    }
}

downloadButton.addEventListener('click', handleDownloadPress);
