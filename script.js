let allData = JSON.parse(localStorage.getItem('annualWealthData')) || {};

const presets = {
    Need: ["Rent", "Life Insurance", "Health Insurance", "Groceries", "Internet", "Transport", "Electricity Bill", "KSRTC/Transport"],
    Desire: ["Dining Out", "OTT/Netflix", "Filmmaking Gear", "Movies", "Shopping", "Gifts"],
    Savings: ["Emergency Fund", "Project Fund (Adhvaga)", "Mutual Funds", "Stocks", "Gold"]
};

window.onload = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('monthSelect').value = months[new Date().getMonth()];
    document.getElementById('salaryInput').value = localStorage.getItem('userSalary') || "";
    updatePresets();
    updateUI();
};

function updatePresets() {
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc');
    desc.innerHTML = (presets[type] || []).map(i => `<option value="${i}">${i}</option>`).join('');
}

document.getElementById('addBtn').addEventListener('click', () => {
    const month = document.getElementById('monthSelect').value;
    const desc = document.getElementById('desc').value;
    const amt = parseFloat(document.getElementById('amt').value);
    const type = document.getElementById('type').value;

    if (!amt || amt <= 0) return alert("Please enter a valid amount");

    if (!allData[month]) allData[month] = [];
    allData[month].push({ desc, amt, type });

    localStorage.setItem('annualWealthData', JSON.stringify(allData));
    updateUI();
    document.getElementById('amt').value = '';
});

function updateUI() {
    const month = document.getElementById('monthSelect').value;
    const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
    localStorage.setItem('userSalary', salary);

    const entries = allData[month] || [];
    const tableBody = document.getElementById('ledgerTableBody');
    const listBody = document.getElementById('ledgerListBody');
    
    tableBody.innerHTML = '';
    listBody.innerHTML = '';

    let mTotals = { Need: 0, Desire: 0, Savings: 0 };
    let yTotals = { Need: 0, Desire: 0, Savings: 0 };

    // Process Current Month
    entries.forEach((item, index) => {
        mTotals[item.type] = (mTotals[item.type] || 0) + item.amt;
        tableBody.innerHTML += `<tr><td>${item.desc}</td><td>${item.type}</td><td>₹${item.amt.toLocaleString()}</td><td><button onclick="deleteItem(${index})" style="color:red; border:none; background:none; cursor:pointer;">✕</button></td></tr>`;
        listBody.innerHTML += `<div class="list-item" onclick="deleteItem(${index})">
            <div><span class="list-name">${item.desc}</span><span class="list-cat">${item.type}</span></div>
            <strong>₹${item.amt.toLocaleString()}</strong>
        </div>`;
    });

    // Process Yearly Aggregate (Fixing Undefined/Ghost Data)
    Object.keys(allData).forEach(m => {
        if (Array.isArray(allData[m])) {
            allData[m].forEach(e => {
                const category = e.type === "Need" ? "Need" : (e.type === "Desire" ? "Desire" : "Savings");
                yTotals[category] = (yTotals[category] || 0) + e.amt;
            });
        }
    });

    const grand = mTotals.Need + mTotals.Desire + mTotals.Savings;
    const getPVal = (v) => salary > 0 ? (v / salary) * 100 : 0;
    const getPStr = (v) => getPVal(v).toFixed(1) + "%";

    // Update Dashboard UI
    document.getElementById('sumNeeds').innerText = "₹" + (mTotals.Need || 0).toLocaleString();
    document.getElementById('perNeeds').innerText = getPStr(mTotals.Need);
    document.getElementById('sumDesires').innerText = "₹" + (mTotals.Desire || 0).toLocaleString();
    document.getElementById('perDesires').innerText = getPStr(mTotals.Desire);
    document.getElementById('sumSavings').innerText = "₹" + (mTotals.Savings || 0).toLocaleString();
    document.getElementById('perSavings').innerText = getPStr(mTotals.Savings);
    document.getElementById('sumTotal').innerText = "₹" + grand.toLocaleString();
    document.getElementById('perTotal').innerText = getPStr(grand) + " used";

    // --- 50/30/20 Rule Logic ---
    const insightBox = document.getElementById('budgetInsight');
    const insightText = document.getElementById('insightText');
    const insightIcon = document.getElementById('insightIcon');
    const pNeed = getPVal(mTotals.Need);
    const pDesire = getPVal(mTotals.Desire);
    const pSave = getPVal(mTotals.Savings);

    insightBox.className = "insight-box";
    document.querySelectorAll('.card').forEach(c => c.classList.remove('over-limit'));

    if (salary === 0) {
        insightText.innerText = "Please enter your salary to see budget warnings.";
        insightIcon.innerText = "💰";
    } else if (pNeed > 50) {
        insightBox.classList.add('status-danger');
        insightText.innerText = `Needs are at ${pNeed.toFixed(1)}%. This is over the 50% target. Try to reduce bills!`;
        insightIcon.innerText = "⚠️";
        document.querySelector('.needs').classList.add('over-limit');
    } else if (pDesire > 30) {
        insightBox.classList.add('status-warn');
        insightText.innerText = `Desires are at ${pDesire.toFixed(1)}%. Target is 30%. Save more for filmmaking!`;
        insightIcon.innerText = "🛒";
        document.querySelector('.desires').classList.add('over-limit');
    } else if (pSave < 20 && grand > 0) {
        insightBox.classList.add('status-warn');
        insightText.innerText = `Savings are only ${pSave.toFixed(1)}%. Aim for 20% to build your Adhvaga brand.`;
        insightIcon.innerText = "📉";
    } else if (grand > 0) {
        insightBox.classList.add('status-good');
        insightText.innerText = "Budget Balanced! Your spending matches the 50/30/20 rule perfectly.";
        insightIcon.innerText = "✅";
    }

    // Update Yearly Summary UI
    document.getElementById('yearlySavings').innerText = "₹" + (yTotals.Savings || 0).toLocaleString();
    document.getElementById('yearlyNeeds').innerText = "₹" + (yTotals.Need || 0).toLocaleString();
    document.getElementById('yearlyDesires').innerText = "₹" + (yTotals.Desire || 0).toLocaleString();
}

function deleteItem(index) {
    const month = document.getElementById('monthSelect').value;
    allData[month].splice(index, 1);
    localStorage.setItem('annualWealthData', JSON.stringify(allData));
    updateUI();
}

document.getElementById('forceResetBtn').addEventListener('click', () => {
    if(confirm("DANGER: Delete ALL data from all months? This will fix errors.")) {
        allData = {};
        localStorage.clear();
        location.reload();
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    const month = document.getElementById('monthSelect').value;
    if(confirm(`Clear month: ${month}?`)) {
        allData[month] = [];
        localStorage.setItem('annualWealthData', JSON.stringify(allData));
        updateUI();
    }
});

document.getElementById('salaryInput').addEventListener('input', updateUI);

document.getElementById('exportBtn').addEventListener('click', () => {
    const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
    let csv = "Month,Description,Category,Amount,Percentage\n";
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach(m => {
        if (allData[m]) {
            allData[m].forEach(e => {
                const p = salary > 0 ? ((e.amt / salary) * 100).toFixed(2) + "%" : "0%";
                csv += `${m},${e.desc},${e.type},${e.amt},${p}\n`;
            });
        }
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'Adhvaga_2026_Ledger.csv';
    a.click();
});