const fs = require('fs');

// Read the file
let content = fs.readFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', 'utf8');

// Fix the corrupted forEach loop
const forEachPattern = /STATE\.selectedMethods\.forEach\(\(method, index\) => \{\s+const isReadOnly = STATE\.selectedMethods\.length === 1;\s+\s+\}\)/;
const forEachReplacement = `STATE.selectedMethods.forEach((method, index) => {
                const isReadOnly = STATE.selectedMethods.length === 1;

                const div = document.createElement('div');
                div.className = 'flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm mb-2';
                
                div.innerHTML = \`
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-gray-600">\${method.name}</span>
                    </div>
                    <div class="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 focus-within:border-pink-200 transition-all">
                        <span class="text-xs text-gray-400">￥</span>
                        <input type="number" step="0.01" value="\${method.amount === 0 && index === 1 ? '' : method.amount.toFixed(2)}" placeholder="0.00" \${isReadOnly ? 'readonly' : ''} oninput="updateAllocationAmount('\${method.id}', this.value)" onblur="validateRobotAmount(this, '\${method.id}')" class="bg-transparent text-sm font-bold text-gray-800 w-24 outline-none text-right">
                    </div>
                \`;
                
                allocationInputs.appendChild(div);
            });`;

content = content.replace(forEachPattern, forEachReplacement);

// Write the file back
fs.writeFileSync('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/app_payment_robot.html', content, 'utf8');

console.log('Fixed app_payment_robot.html forEach loop');
