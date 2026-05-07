const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', 'utf8');

// Add onblur event handler
content = content.replace(/oninput="handleMethodAmountInput\(this\)"/g, 'oninput="handleMethodAmountInput(this)" onblur="handleMethodAmountBlur(this)"');

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', content, 'utf8');

console.log('Added onblur event handler to pcstore_payment_debt&robot.html');
