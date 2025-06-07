const form = document.getElementById('form');
const descInput = document.getElementById('descricao');
const valueInput = document.querySelector('#montante');
const balance = document.getElementById('balanco');
const revenue = document.querySelector('#din-positivo');
const expenses = document.querySelector('#din-negativo');
const transactionsList = document.getElementById('transacoes');

let transactionId = 1;
let transactionRecord = [];

try {
    transactionRecord = JSON.parse(localStorage.getItem('transactions')) || [];
    if (transactionRecord.length > 0) {
        // Define o próximo ID com base no maior ID existente
        transactionId = Math.max(...transactionRecord.map(t => t.id)) + 1;
    }
} catch (error) {
    transactionRecord = [];
}

transactionRecord.forEach(transaction => {
    sumToBalance(transaction);
    sumRevenueExpenses(transaction);
    addTransactionToList(transaction);
});

document.querySelector('.btn-receita').addEventListener('click', () => {
    handleTransactionEntry('receita');
});

document.querySelector('.btn-despesa').addEventListener('click', () => {
    handleTransactionEntry('despesa');
});

function handleTransactionEntry(type) {
    event.preventDefault();

    const descTransaction = descInput.value.trim();
    const valueTransaction = parseFloat(valueInput.value.trim());

    if (descTransaction === '') {
        alert("Informe a descrição da transação!");
        descInput.focus();
        return;
    }

    if (isNaN(valueTransaction)) {
        alert("Informe o valor da transação!");
        valueInput.focus();
        return;
    }

    const transaction = {
        id: transactionId++,
        desc: descTransaction,
        value: type === 'receita' ? Math.abs(valueTransaction) : -Math.abs(valueTransaction),
    };

    sumToBalance(transaction);
    sumRevenueExpenses(transaction);
    addTransactionToList(transaction);

    transactionRecord.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactionRecord));

    descInput.value = '';
    valueInput.value = '';
}

function sumToBalance(transaction) {
    let balanceValue = parseFloat(balance.innerHTML.replace('R$', '').trim());
    balanceValue += transaction.value;
    balance.innerHTML = `R$${balanceValue.toFixed(2)}`;
}

function sumRevenueExpenses(transaction) {
    const element = transaction.value > 0 ? revenue : expenses;
    const prefix = transaction.value > 0 ? '+ R$' : '- R$';

    let value = parseFloat(element.innerHTML.replace(prefix, '').trim());
    value += Math.abs(transaction.value);

    element.innerHTML = `${prefix}${value.toFixed(2)}`;
}

function addTransactionToList(transaction) {
    const cssClass = transaction.value > 0 ? 'positivo' : 'negativo';
    const currency = transaction.value > 0 ? 'R$' : '-R$';
    const formattedId = `#${String(transaction.id).padStart(4, '0')}`;

    const liElement = document.createElement('li');
    liElement.classList.add(cssClass);
    liElement.innerHTML = `
        <strong>${formattedId}</strong> ${transaction.desc} 
        <span>${currency}${Math.abs(transaction.value).toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
    `;

    transactionsList.appendChild(liElement);
}

function calculateAndUpdateBalance() {
    balance.innerHTML = 'R$0.00';
    revenue.innerHTML = '+ R$0.00';
    expenses.innerHTML = '- R$0.00';

    transactionRecord.forEach(transaction => {
        sumToBalance(transaction);
        sumRevenueExpenses(transaction);
    });
}

function deleteTransaction(id) {
    const transactionIndex = transactionRecord.findIndex(transaction => transaction.id === id);

    if (transactionIndex !== -1) {
        transactionRecord.splice(transactionIndex, 1);
        localStorage.setItem('transactions', JSON.stringify(transactionRecord));

        // Limpa e recarrega a lista inteira (sem recarregar a página)
        transactionsList.innerHTML = '';
        calculateAndUpdateBalance();
        transactionRecord.forEach(addTransactionToList);
    }
}