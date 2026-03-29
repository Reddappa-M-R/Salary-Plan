let dataEntries = JSON.parse(localStorage.getItem('wealthData')) || [];
const presets = {
    Need: ["Rent", "Life Insurance", "Groceries", "Internet", "Transport", "Bills"],
    Desire: ["Dining", "Shopping", "Entertainment", "Travel", "Hobbies"],
    Savings: ["Emergency Fund", "Adhvaga Project", "Mutual Funds", "Stocks"]
};

window.onload = () => {
    document.getElementById('salaryInput').value = localStorage.getItem('userSalary') || "";
    updatePresets();
    updateUI();
};

function updatePresets() {
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc');
    desc.innerHTML = presets[type].map(i => `<option value="${i}">${i}</option>`).join('');
}

document.getElementById('addBtn').addEventListener('click', () => {
    const desc = document.getElementById('desc').value;
    const amt = parseFloat(document.getElementById('amt').value);
    const type = document.getElementById('type').value;
    if (!amt) return;

    dataEntries.push({ desc, amt, type });
    saveAndRefresh();
    document.getElementById('amt').value = '';
});

function updateUI() {
    const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
    localStorage.setItem('userSalary', salary);
    
    const table = document.getElementById('ledgerTableBody');
    const list = document.getElementById('ledgerListBody');
    table.innerHTML = '';
    list.innerHTML = '';

    let totals = { Need: 0, Desire: 0, Savings: 0 };

    dataEntries.forEach((item, i) => {
        // Update Desktop Table
        table.innerHTML += `<tr><td>${item.desc}</td><td>${item.type}</td><td>${item.amt}</td><td><button onclick="deleteItem(${i})">✕</button></td></tr>`;
        
        // Update Mobile List
        list.innerHTML += `<div class="list-item" onclick="deleteItem(${i})">
            <div class="list-info"><span class="list-name">${item.desc}</span><span class="list-cat">${item.type}</span></div>
            <span class="list-amt">${item.amt.toLocaleString()}</span>
        </div>`;

        totals[item.type] += item.amt;
    });

    const grand = totals.Need + totals.Desire + totals.Savings;
    const p = (v) => salary > 0 ? ((v/salary)*100).toFixed(1) + "%" : "0%";

    document.getElementById('sumNeeds').innerText = totals.Need.toLocaleString();
    document.getElementById('perNeeds').innerText = p(totals.Need);
    document.getElementById('sumDesires').innerText = totals.Desire.toLocaleString();
    document.getElementById('perDesires').innerText = p(totals.Desire);
    document.getElementById('sumSavings').innerText = totals.Savings.toLocaleString();
    document.getElementById('perSavings').innerText = p(totals.Savings);
    document.getElementById('sumTotal').innerText = grand.toLocaleString();
    document.getElementById('perTotal').innerText = p(grand) + " used";
}

function deleteItem(i) {
    if(confirm("Delete item?")) {
        dataEntries.splice(i, 1);
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('wealthData', JSON.stringify(dataEntries));
    updateUI();
}

document.getElementById('salaryInput').addEventListener('input', updateUI);
document.getElementById('resetBtn').addEventListener('click', () => { localStorage.clear(); location.reload(); });
document.getElementById('exportBtn').addEventListener('click', () => {
    let csv = "Description,Type,Amount\n" + dataEntries.map(e => `"${e.desc}",${e.type},${e.amt}`).join("\n");
    let blob = new Blob([csv], {type: 'text/csv'});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Ledger.csv';
    a.click();
});