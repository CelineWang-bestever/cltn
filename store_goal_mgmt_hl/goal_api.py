from flask import Flask, request, jsonify, g
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': '127.0.0.1', 'port': 3306,
    'user': 'celine_wang', 'password': 'celine@1995admin',
    'database': 'cltn_goal_mgmt', 'charset': 'utf8mb4'
}

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(**DB_CONFIG)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None: db.close()

@app.route('/api/health')
def health():
    try:
        get_db().cursor().execute('SELECT 1')
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/goal-types')
def get_goal_types():
    try:
        db = get_db()
        c = db.cursor(dictionary=True)
        c.execute('SELECT id, type_key, type_name, unit FROM goal_types ORDER BY sort_order')
        return jsonify({'code': 0, 'data': c.fetchall()})
    except Exception as e:
        return jsonify({'code': -1, 'message': str(e)}), 500

@app.route('/api/goals')
def get_goals():
    try:
        type_id = request.args.get('type_id')
        year = request.args.get('year')
        if not type_id or not year:
            return jsonify({'code': -1, 'message': 'missing params'}), 400
        db = get_db()
        c = db.cursor(dictionary=True)
        c.execute('SELECT goal_month, goal_amount, completed_amount FROM monthly_goals WHERE goal_type_id=%s AND goal_year=%s ORDER BY goal_month', (type_id, year))
        rows = c.fetchall()
        goals = {}
        for r in rows:
            g = float(r['goal_amount'])
            cp = float(r['completed_amount'])
            goals[r['goal_month']] = {'month': r['goal_month'], 'goal': g, 'completed': cp, 'completionRate': round(cp/g*100) if g>0 else 0}
        return jsonify({'code': 0, 'data': goals})
    except Exception as e:
        return jsonify({'code': -1, 'message': str(e)}), 500

@app.route('/api/goals', methods=['POST'])
def save_goal():
    try:
        data = request.get_json()
        type_id = data.get('type_id')
        year = data.get('year')
        month = data.get('month')
        goal_amount = data.get('goal')
        if not all([type_id, year, month]) or goal_amount is None:
            return jsonify({'code': -1, 'message': '参数缺失'}), 400
        if float(goal_amount) <= 0:
            return jsonify({'code': -1, 'message': '目标金额必须大于0'}), 400
        db = get_db()
        c = db.cursor()
        c.execute('INSERT INTO monthly_goals (goal_type_id, goal_year, goal_month, goal_amount) VALUES (%s,%s,%s,%s) ON DUPLICATE KEY UPDATE goal_amount=VALUES(goal_amount)', (type_id, year, month, goal_amount))
        db.commit()
        return jsonify({'code': 0, 'message': '保存成功'})
    except Exception as e:
        return jsonify({'code': -1, 'message': str(e)}), 500

@app.route('/api/goals', methods=['DELETE'])
def delete_goals():
    try:
        data = request.get_json()
        type_id = data.get('type_id')
        year = data.get('year')
        months = data.get('months', [])
        if not type_id or not year or not months:
            return jsonify({'code': -1, 'message': '参数缺失'}), 400
        db = get_db()
        c = db.cursor()
        ph = ','.join(['%s']*len(months))
        c.execute(f'DELETE FROM monthly_goals WHERE goal_type_id=%s AND goal_year=%s AND goal_month IN ({ph})', (type_id, year, *months))
        db.commit()
        return jsonify({'code': 0, 'message': f'已删除{c.rowcount}条'})
    except Exception as e:
        return jsonify({'code': -1, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
