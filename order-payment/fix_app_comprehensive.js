const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', 'utf8');

// Remove the 60 yuan validation from the two-payment-methods section
content = content.replace(
    /\/\/ 当本单含机器人项目时，确保线上支付的金额不允许低于机器人项目金额60元[\s\S]*?if \(STATE\.hasRobotProject \&\& other\.id === 'online' \&\& other\.amount < STATE\.robotAmount\) \{[\s\S]*?\n\s+\}/,
    ''
);

// Remove the 60 yuan validation from the single-payment-method section
content = content.replace(
    /\/\/ 当本单含机器人项目时，线上支付的金额不允许低于机器人项目金额60元[\s\S]*?if \(STATE\.hasRobotProject \&\& id === 'online'\) \{[\s\S]*?\n\s+\}/,
    ''
);

// Find the allocation inputs rendering section and add onblur
content = content.replace(
    /<input\s+type="number"\s+step="0\.01"\s+value="\$\{method\.amount === 0 \&\& index === 1 \? '' : method\.amount\.toFixed\(2\)\}"\s+placeholder="0\.00"\s+\$\{isReadOnly \? 'readonly' : ''\}\s+oninput="updateAllocationAmount\('\$\{method\.id\}', this\.value\)">/g,
    '<input type="number" step="0.01" value="${method.amount === 0 && index === 1 ? \'\' : method.amount.toFixed(2)}" placeholder="0.00" ${isReadOnly ? \'readonly\' : \'\'} oninput="updateAllocationAmount(\'${method.id}\', this.value)" onblur="validateRobotAmount(this, \'${method.id}\')">'
);

// Add the validateRobotAmount function at the end of the script section
const validateFunction = `
        function validateRobotAmount(input, id) {
            if (STATE.hasRobotProject && id === 'online') {
                const amount = parseFloat(input.value) || 0;
                if (amount < STATE.robotAmount && amount > 0) {
                    input.value = STATE.robotAmount.toFixed(2);
                    
                    // Update the amount in STATE
                    const target = STATE.selectedMethods.find(m => m.id === id);
                    if (target) target.amount = STATE.robotAmount;
                    
                    // Recalculate total
                    let sum = 0;
                    STATE.selectedMethods.forEach(m => {
                        sum += m.amount;
                    });
                    
                    // Check if total exceeds payable amount
                    if (sum > STATE.totalPayable) {
                        // Adjust the amount if needed
                        const otherSum = sum - STATE.robotAmount;
                        const allowed = Math.max(STATE.robotAmount, STATE.totalPayable - otherSum);
                        input.value = allowed.toFixed(2);
                        if (target) target.amount = allowed;
                    }
                    
                    // If there are two payment methods, update the other one
                    if (STATE.selectedMethods.length === 2) {
                        const other = STATE.selectedMethods.find(m => m.id !== id);
                        other.amount = Math.max(0, STATE.totalPayable - (STATE.selectedMethods.find(m => m.id === id).amount));
                        
                        // Update the other input field
                        const inputs = allocationInputs.querySelectorAll('input');
                        const otherIndex = STATE.selectedMethods.findIndex(m => m.id === other.id);
                        if (inputs[otherIndex]) {
                            inputs[otherIndex].value = other.amount === 0 ? '' : other.amount.toFixed(2);
                        }
                    }
                    
                    // Update total payment display
                    const actualPaidInput = document.getElementById('actual-paid');
                    if (actualPaidInput) {
                        actualPaidInput.value = STATE.selectedMethods.reduce((sum, m) => sum + m.amount, 0).toFixed(2);
                    }
                }
            }
        }
`;

// Insert the validate function before the closing </script> tag
content = content.replace(
    /<\/script>/,
    validateFunction + '\n    </script>'
);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', content, 'utf8');

console.log('Successfully modified app_payment_robot.html');
