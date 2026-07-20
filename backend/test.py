import urllib.request, json
base = 'http://localhost:8000/api/v1'

print('Logging in...')
try:
    req = urllib.request.Request(f'{base}/auth/token', data=b'username=test7@test.com&password=password123', method='POST')
    token = json.loads(urllib.request.urlopen(req).read())['access_token']
except Exception as e:
    # sign up first
    req = urllib.request.Request(f'{base}/auth/signup', data=json.dumps({'email': 'test7@test.com', 'password': 'password123', 'full_name': 'Test User'}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    urllib.request.urlopen(req)
    req = urllib.request.Request(f'{base}/auth/token', data=b'username=test7@test.com&password=password123', method='POST')
    token = json.loads(urllib.request.urlopen(req).read())['access_token']

headers = {'Authorization': f'Bearer {token}'}

import sqlite3
conn = sqlite3.connect('careerai.db')
conn.execute("UPDATE user_profiles SET skills_list = '[\"Python\", \"AWS\"]'")
conn.commit()
conn.close()

print('Generating roadmap...')
req = urllib.request.Request(f'{base}/profile/generate-roadmap', method='POST', headers=headers)
try:
    res = urllib.request.urlopen(req).read()
    print('Roadmap Success:', res)
except Exception as e:
    print('Roadmap Error:', e.read() if hasattr(e, 'read') else e)

print('Searching jobs...')
req = urllib.request.Request(f'{base}/profile/search-jobs', method='POST', headers=headers)
try:
    res = urllib.request.urlopen(req).read()
    print('Jobs Success:', res)
except Exception as e:
    print('Jobs Error:', e.read() if hasattr(e, 'read') else e)
