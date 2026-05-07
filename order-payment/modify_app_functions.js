const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', 'utf8');

// Remove the 60 yuan validation from updateAllocationAmount function
content = content.replace(
    /\/\/ 当本单含机器人项目时，线上支付的金额不允许低于机器人项目金额60元[\s\S]*?if \(STATE\.hasRobotProject \&\& id === 'online' \&\& other\.id === 'online' \&\& other\.amount < STATE\.robotAmount\) \{[\s\S]*?\}/,
    ''
);

// Remove the 60 yuan validation at the beginning of the function
content = content.replace(
    /\/\/ 当本单含机器人项目时，线上支付的金额不允许低于机器人项目金额60元[\s\S]*?if \(STATE\.hasRobotProject \&\& id === 'online'\) \{[\s\S]*?\}/,
    ''
);

// Add the validateRobotAmount function after updateAllocationAmount
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
                    document.getElementById('actual-paid').value = STATE.selectedMethods.reduce((sum, m) => sum + m.amount, 0).toFixed(2);
                }
            }
        }
`;

// Insert the validate function after updateAllocationAmount
content = content.replace(
    /(\s+function updateAllocationAmount\(id, value\) \{[\s\S]*?updateAllocationAmount\(first\.id, first\.amount\);\s+\})/,
    '$1\n' + validateFunction
);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', content, 'utf8');

console.log('Modified updateAllocationAmount and added validateRobotAmount to app_payment_robot.html');
