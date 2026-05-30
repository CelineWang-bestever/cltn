import pandas as pd
import json

xls = pd.ExcelFile(r'c:\Users\celine.wang\Documents\trae_projects\cltn\开单收银模块优化需求清单.xlsx')
print('Sheets:', xls.sheet_names)

for s in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=s)
    print(f'\n=== Sheet: {s} ===')
    print(f'Shape: {df.shape}')
    print(f'Columns: {list(df.columns)}')
    print(df.to_string(max_rows=100))
