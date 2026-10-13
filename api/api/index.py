"""Optional Gemini gateway. No secrets in the browser or repository."""
from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        key = os.getenv('GEMINI_API_KEY')
        if not key:
            self.reply(503, {'error':'AI mode is not configured. Source search and practice still work offline.'}); return
        try:
            size = int(self.headers.get('Content-Length', 0))
            if size > 3_000_000: self.reply(413, {'error':'Request too large. Maximum 3 MB.'}); return
            payload = json.loads(self.rfile.read(size))
            parts = payload.get('parts', [])
            if not isinstance(parts, list) or not 1 <= len(parts) <= 18: raise ValueError('Invalid content')
            body = {'contents':[{'role':'user','parts':parts}], 'generationConfig':{'responseMimeType':'application/json','temperature':0.1,'maxOutputTokens':1800,'thinkingConfig':{'thinkingLevel':'low'}}}
            model = os.getenv('GEMINI_MODEL','gemini-3.8-flash')
            req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent', data=json.dumps(body).encode(), headers={'Content-Type':'application/json','x-goog-api-key':key})
            with urllib.request.urlopen(req, timeout=55) as res: result=json.load(res)
            text = ''.join(p.get('text','') for p in result.get('candidates',[{}])[0].get('content',{}).get('parts',[]))
            self.reply(200, {'result':json.loads(text)})
        except urllib.error.HTTPError as e:
            print('Provider HTTP', e.code, e.read().decode()[:800], flush=True)
            self.reply(429 if e.code == 429 else 502, {'error':'Model quota reached or provider unavailable. Use offline mode; no paid fallback.'})
        except Exception as e:
            print('Gateway failure', type(e).__name__, str(e)[:200], flush=True)
            self.reply(502, {'error':'AI request did not finish. No data was saved on this server.'})
    def reply(self,status,data):
        self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Cache-Control','no-store'); self.end_headers(); self.wfile.write(json.dumps(data).encode())
