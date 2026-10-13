"""Built-in DeepEval metrics with a schema-aware free Gemini judge.
Requires GEMINI_API_KEY. No fallback, retry or telemetry. Small evaluation only.
"""
import os,json,urllib.request,datetime
os.environ['DEEPEVAL_TELEMETRY_OPT_OUT']='YES'
os.environ['CONFIDENT_API_KEY']=''
from deepeval.models import DeepEvalBaseLLM
from deepeval.metrics import FaithfulnessMetric,AnswerRelevancyMetric,ContextualPrecisionMetric,ContextualRecallMetric
from deepeval.test_case import LLMTestCase
class FreeGeminiJudge(DeepEvalBaseLLM):
    def load_model(self):return os.environ.get('GEMINI_MODEL','gemini-3.8-flash')
    def get_model_name(self):return 'Gemini free-tier '+self.model
    def generate(self,prompt,schema=None):
        if schema:prompt+='\nReturn JSON matching this schema: '+json.dumps(schema.model_json_schema())
        body={'contents':[{'parts':[{'text':prompt}]}],'generationConfig':{'temperature':0,'responseMimeType':'application/json','maxOutputTokens':3000,'thinkingConfig':{'thinkingLevel':'low'}}}
        req=urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/'+self.model+':generateContent',data=json.dumps(body).encode(),headers={'Content-Type':'application/json','x-goog-api-key':os.environ['GEMINI_API_KEY']})
        with urllib.request.urlopen(req,timeout=45) as r:out=json.load(r)
        text=''.join(p.get('text','') for p in out['candidates'][0]['content']['parts'])
        return schema.model_validate_json(text) if schema else text
    async def a_generate(self,prompt,schema=None):return self.generate(prompt,schema)
if __name__=='__main__':
    judge=FreeGeminiJudge();data=json.load(open('evaluation/semantic-cases.json'));rows=[]
    for raw in data:
        case=LLMTestCase(input=raw['input'],actual_output=raw['actual_output'],expected_output=raw['expected_output'],retrieval_context=raw['retrieval_context'])
        row={'input':raw['input'],'output_mode':raw['output_mode'],'metrics':{}}
        for cls in [FaithfulnessMetric,AnswerRelevancyMetric,ContextualPrecisionMetric,ContextualRecallMetric]:
            metric=cls(model=judge,async_mode=False,include_reason=True)
            try:
                metric.measure(case);row['metrics'][cls.__name__]={'score':metric.score,'reason':metric.reason}
            except Exception as e:
                row['metrics'][cls.__name__]={'status':'unavailable','error_type':type(e).__name__};print(cls.__name__,'failed',type(e).__name__,flush=True)
                rows.append(row);json.dump({'status':'incomplete','results':rows,'limitations':'Small sample; free judge; no paid fallback; not measured learning gains'},open('evaluation/deepeval-semantic.json','w'),indent=2);raise SystemExit(2)
            print(cls.__name__,metric.score,flush=True)
        rows.append(row)
    json.dump({'status':'completed','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'judge':judge.get_model_name(),'results':rows,'limitations':'Small hand-built sample. Semantic judge scores, not learning gains or proof of correctness.'},open('evaluation/deepeval-semantic.json','w'),indent=2)
