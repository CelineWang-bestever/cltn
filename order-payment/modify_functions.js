const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', 'utf8');

// Remove the 60 yuan validation from handleMethodAmountInput function
content = content.replace(
    /\/\/ 验证线上支付金额不低于60元\s+if \(input\.dataset\.method === 'merchant'\) \{[\s\S]*?\}/,
    ''
);

// Remove the 60 yuan validation from the total payable check
content = content.replace(
    /\/\/ 确保线上支付金额不低于60元\s+if \(input\.dataset\.method === 'merchant'\) \{[\s\S]*?\}\s+else \{[\s\S]*?\}/,
    'input.value = allowed.toFixed(2);'
);

// Add the handleMethodAmountBlur function after handleMethodAmountInput
const blurFunction = `
        function handleMethodAmountBlur(input) {
            if (input.dataset.method === 'merchant') {
                const amount = parseFloat(input.value) || 0;
                if (amount < 60 && amount > 0) {
                    input.value = '60.00';
                    // Recalculate total after updating the value
                    const totalPayable = CONFIG.baseOrderAmount + (document.getElementById('combine-payment').checked ? (parseFloat(document.getElementById('repay-amount').value) || 0) : 0);
                    let sum = 0;
                    const inputs = document.querySelectorAll('#method-inputs-container input');
                    inputs.forEach(inp => {
                        sum += parseFloat(inp.value) || 0;
                    });
                    
                    // Check if total exceeds payable amount
                    if (sum > totalPayable) {
                        document.getElementById('allocation-error').classList.remove('hidden');
                        document.getElementById('allocation-error').innerText = '实付总额不能超过应付总额！';
                        const otherSum = sum - 60;
                        const allowed = Math.max(0, totalPayable - otherSum);
                        input.value = Math.max(60, allowed).toFixed(2);
                    } else {
                        document.getElementById('allocation-error').classList.add('hidden');
                    }
                    
                    // Update main payment amount
                    const actualPaidInput = document.getElementById('actual-paid');
                    actualPaidInput.value = (parseFloat(actualPaidInput.value) - amount + 60).toFixed(2);
                }
            }
        }
`;

// Insert the blur function after handleMethodAmountInput
content = content.replace(
    /(\s+function handleMethodAmountInput\(input\) \{[\s\S]*?updateCalculations\(true\); \/\/ true表示不重置分配输入\s+\})/,
    '$1\n' + blurFunction
);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', content, 'utf8');

console.log('Modified handleMethodAmountInput and added handleMethodAmountBlur to pcstore_payment_debt&robot.html');
