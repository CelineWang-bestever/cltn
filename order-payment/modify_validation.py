import re

# Read the file
with open('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add onblur event handler
content = content.replace('oninput="handleMethodAmountInput(this)"', 'oninput="handleMethodAmountInput(this)" onblur="handleMethodAmountBlur(this)"')

# Write the file back
with open('c:/Users/celine.wang/Documents/trae_projects/cltn/order-payment/pcstore_payment_debt&robot.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added onblur event handler to pcstore_payment_debt&robot.html')
