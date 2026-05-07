const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', 'utf8');

// Add onblur event handler using a more robust pattern
content = content.replace(
    /oninput="updateAllocationAmount\('(\$\{method\.id\})', this\.value\)"/g,
    'oninput="updateAllocationAmount(\'$1\', this.value)" onblur="validateRobotAmount(this, \'$1\')"'
);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', content, 'utf8');

console.log('Added onblur event handler to app_payment_robot.html');
