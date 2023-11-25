const tableBody = document.querySelector('tbody');
const searchButton = document.querySelector('[data-search]');
const inputSearchValue = document.querySelector('[data-input]');
const inputPrice = document.querySelector('[data-input-price]');
const form = document.querySelector('form');
const inputTitle = document.querySelector('[data-input-name]');
const selected = document.querySelector('select');
const addButton = document.querySelector('[data-add-button]');
const modalArea = document.querySelector('.add-modal-area');
const closeModalButton = document.querySelector('[data-close]');
const inputBox = document.querySelector('[data-price-input]');
const outputBox = document.querySelector('[data-price-output]');
const totalPriceBox = document.querySelector('[data-price-total]');
const pageArea = document.querySelector('[data-page-area]');

const initialValueList = JSON.parse(localStorage.getItem('@transaction-list')) || [];
let pageNumber = 1;
let pageSize = 10;

function convertCurrency(price) {
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function convertCurrencyToNumber(price) {
    return parseFloat(price.replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, ''));
}

function listTransactionsToTable(transactionsList) {
    tableBody.innerHTML = '';

    for (let i in transactionsList) {
        createTableRow(transactionsList, i);
    }
}

function createTableRow(transactionsList, index) {
    const isInput = transactionsList[index].type === 'input';
    const tableRow = document.createElement('tr');

    const tableDataName = document.createElement('td');
    tableDataName.textContent = transactionsList[index].name;

    const tableDataType = document.createElement('td');
    tableDataType.textContent = isInput ? 'Entrada' : 'Saída';

    const tableDataValue = document.createElement('td');
    tableDataValue.textContent =
        `${isInput ? '+' : '-'} ${convertCurrency(transactionsList[index].value)}`;

    const tableDataActions = document.createElement('td');
    const imgDelete = document.createElement('img');
    imgDelete.src = './src/images/bin-icon.svg';

    tableDataActions.appendChild(imgDelete);

    if (isInput) {
        tableDataName.classList.add('input');
        tableDataType.classList.add('input');
        tableDataValue.classList.add('input');
    } else {
        tableDataName.classList.add('output');
        tableDataType.classList.add('output');
        tableDataValue.classList.add('output');
    }

    tableRow.setAttribute('data-row-id', `${transactionsList[index].id}`);
    tableRow.append(tableDataName, tableDataType, tableDataValue, tableDataActions);
    tableBody.appendChild(tableRow);
    imgDelete.addEventListener('click', () => handleDeletePress(tableRow));
}

function handleDeletePress(tableRow) {
    const valueList = JSON.parse(localStorage.getItem('@transaction-list')) || [];
    const rowId = Number(tableRow.getAttribute('data-row-id'));
    const removeRow = valueList.filter((listItem) => listItem.id !== rowId);

    tableRow.style.opacity = 0;

    setTimeout(() => {
        tableRow.remove();
        localStorage.setItem('@transaction-list', JSON.stringify(removeRow));
        init(removeRow);
        inputSearchValue.value = '';
    }, 200);
}   

function searchTxt() {
    const valueList = JSON.parse(localStorage.getItem('@transaction-list')) || [];

    if (inputSearchValue.value) {
        const getSearchListByName = valueList.filter((transaction) => {
            return transaction.name.toUpperCase().indexOf(inputSearchValue.value.toUpperCase()) !== -1;
        });
        pageNumber = 1;
        init(getSearchListByName);
    } else {
        init(valueList);
    }
}

function formatInputCurrency() {
    let value = inputPrice.value.replace(/[^\d]+/g, '');

    const wholePart = value.slice(0, -2);
    const decimalPart = value.slice(-2);
    let formattedValue = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    formattedValue += `,${decimalPart}`; 

    if (decimalPart) {
        inputPrice.value = `R$${formattedValue}`;
    } else {
        inputPrice.value = '';
    }
}

function handleFormChange(e) {
    e.preventDefault();
    const valueList = JSON.parse(localStorage.getItem('@transaction-list')) || [];

    const bodyList = {
        id: valueList.length + 1,
        name: inputTitle.value,
        type: selected.value,
        value: convertCurrencyToNumber(inputPrice.value),
    };

    localStorage.setItem('@transaction-list', JSON.stringify([...valueList, bodyList]));

    inputTitle.value = '';
    inputPrice.value = '';
    selected.value = 'input';

    init([...valueList, bodyList])
}

function handleAddPress() {
    modalArea.style.opacity = '0';
    modalArea.style.display = 'flex';

    setTimeout(() => {
        modalArea.style.opacity = '1';
    }, 200);
}

function closeModal() {
    modalArea.style.opacity = '0';

    setTimeout(() => {
        modalArea.style.display = 'none';
    }, 200);
}

function calcListValueToCards(transactionsList) {
    let calcInputPrice = 0;
    let calcOutputPrice = 0;

    for (let i in transactionsList) {
        if (transactionsList[i].type === 'input') {
            calcInputPrice += transactionsList[i].value;
        } else {
            calcOutputPrice += transactionsList[i].value;
        }
    }

    inputBox.textContent = convertCurrency(calcInputPrice);
    outputBox.textContent = convertCurrency(calcOutputPrice);
    totalPriceBox.textContent = convertCurrency(calcInputPrice - calcOutputPrice);
}

function createBottomPagination(totalPages, list) {
    pageArea.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const createPageArea = document.createElement('div');
        createPageArea.classList.add('pagination-table');

        if (i + 1 === pageNumber) {
            createPageArea.classList.add('selected-pagination');
        }

        createPageArea.textContent = i + 1;
        createPageArea.addEventListener('click', () => {
            pageNumber = i + 1;
            init(list);
            window.scrollTo(0, 0);
        });
        pageArea.appendChild(createPageArea);
    }
}

function init(list) {
    const offset = pageSize * (pageNumber - 1);
    const totalPages = Math.ceil(list.length / pageSize);
    const paginatedItems = list.slice(offset, pageSize * pageNumber);

    createBottomPagination(totalPages, list);
    calcListValueToCards(list);
    listTransactionsToTable(paginatedItems);
}

init(initialValueList);

inputPrice.addEventListener('input', formatInputCurrency);
searchButton.addEventListener('click', searchTxt);
form.addEventListener('submit', handleFormChange);
addButton.addEventListener('click', handleAddPress);
closeModalButton.addEventListener('click', closeModal);
