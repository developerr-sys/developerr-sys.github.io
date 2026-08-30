document.addEventListener('DOMContentLoaded', () => {
    // Finance Tracker Logic
    const form = document.getElementById('transaction-form');
    const titleInput = document.getElementById('trans-title');
    const amountInput = document.getElementById('trans-amount');
    const typeInput = document.getElementById('trans-type');
    const list = document.getElementById('transaction-list');
    const balanceEl = document.getElementById('total-balance');
    const incomeEl = document.getElementById('total-income');
    const expenseEl = document.getElementById('total-expense');
    const emptyState = document.getElementById('empty-state');

    let transactions = JSON.parse(localStorage.getItem('anmol-finance-records')) || [
        { id: 1, title: "Web Dev Project Stipend", amount: 450.00, type: "income", date: "Aug 02, 2026" },
        { id: 2, title: "Design Tools Subscription", amount: 29.99, type: "expense", date: "Aug 03, 2026" },
        { id: 3, title: "Freelance Client Order", amount: 150.00, type: "income", date: "Aug 04, 2026" }
    ];

    function updateDashboard() {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        balanceEl.textContent = `$${balance.toFixed(2)}`;
        incomeEl.textContent = `+$${totalIncome.toFixed(2)}`;
        expenseEl.textContent = `-$${totalExpense.toFixed(2)}`;
    }

    function renderTransactions() {
        list.innerHTML = '';

        if (transactions.length === 0) {
            emptyState.style.display = 'block';
            updateDashboard();
            return;
        }

        emptyState.style.display = 'none';

        transactions.forEach(t => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.setAttribute('data-id', t.id);

            const isIncome = t.type === 'income';
            const iconClass = isIncome ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            const themeClass = isIncome ? 'income' : 'expense';
            const prefix = isIncome ? '+' : '-';

            li.innerHTML = `
                <div class="item-info">
                    <div class="item-icon icon-${themeClass}">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                        <span class="item-name" style="display: block;">${escapeHtml(t.title)}</span>
                        <span class="item-date">${t.date}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="item-amount amount-${themeClass}">${prefix}$${t.amount.toFixed(2)}</span>
                    <button class="btn-delete-trans" aria-label="Delete record">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            `;

            const deleteBtn = li.querySelector('.btn-delete-trans');
            deleteBtn.addEventListener('click', () => {
                li.style.transform = "translateX(50px)";
                li.style.opacity = "0";
                setTimeout(() => {
                    transactions = transactions.filter(item => item.id !== t.id);
                    localStorage.setItem('anmol-finance-records', JSON.stringify(transactions));
                    renderTransactions();
                }, 300);
            });

            list.appendChild(li);
        });

        updateDashboard();
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>'"]/g, function (m) { return map[m]; });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;

        if (title === '' || isNaN(amount) || amount <= 0) return;

        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);

        const newTrans = {
            id: Date.now(),
            title: title,
            amount: amount,
            type: type,
            date: today
        };

        transactions.unshift(newTrans);
        localStorage.setItem('anmol-finance-records', JSON.stringify(transactions));

        titleInput.value = '';
        amountInput.value = '';

        renderTransactions();
    });

    renderTransactions();
});
