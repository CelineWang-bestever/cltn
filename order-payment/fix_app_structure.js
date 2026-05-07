const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', 'utf8');

// Remove the incorrectly placed validateRobotAmount function from the head section
content = content.replace(
    /<script src="https:\/\/modao\.cc\/agent-py\/static\/source\/js\/tailwindcss\.3\.4\.3\.js">\s+function validateRobotAmount[\s\S]*?<\/script>\s+<script src="https:\/\/modao\.cc\/agent-py\/static\/source\/js\/iconify-icon\.min\.1\.0\.7\.js">/,
    '<script src="https://modao.cc/agent-py/static/source/js/tailwindcss.3.4.3.js"></script>\n    <script src="https://modao.cc/agent-py/static/source/js/iconify-icon.min.1.0.7.js">'
);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', content, 'utf8');

console.log('Fixed app_payment_robot.html structure');
