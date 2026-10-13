"""Custom deterministic metrics hosted in DeepEval. Not LLM-judged metrics."""
import os
os.environ['DEEPEVAL_TELEMETRY_OPT_OUT']='YES'
os.environ['CONFIDENT_API_KEY']=''
from deepeval.metrics import BaseMetric
from deepeval.test_case import LLMTestCase
import json
class GroundingMetric(BaseMetric):
    def __init__(self,field):
        self.field=field;self.threshold=.5;self.async_mode=False;self.strict_mode=False;self.include_reason=True
    def measure(self,test_case):
        data=test_case.additional_metadata;self.score=float(data[self.field]);self.success=self.score>=self.threshold;self.reason='Deterministic source-ID '+self.field+' on hand-labeled retrieval set.';return self.score
    async def a_measure(self,test_case):return self.measure(test_case)
    def is_successful(self):return self.success
    @property
    def __name__(self):return 'Custom '+self.field
if __name__=='__main__':
    raw=json.load(open('evaluation/baseline.json'));rows=[]
    for row in raw['retrieval']:
        case=LLMTestCase(input=row['question'],actual_output=';'.join(row['retrieved']),expected_output=';'.join(row['expected']),additional_metadata=row)
        metrics=[GroundingMetric('precision'),GroundingMetric('recall')]
        rows.append({'question':row['question'],'metrics':{m.__name__:m.measure(case) for m in metrics}})
    result={'framework':'DeepEval BaseMetric / LLMTestCase','metrics':'Custom deterministic source-ID precision and recall, not built-in semantic metrics','results':rows,'faithfulness':'Not semantically evaluated','answer_relevancy':'Not semantically evaluated','telemetry':'Disabled','limitations':'Seven hand-built cases; no claims of real learning gains'}
    json.dump(result,open('evaluation/deepeval-custom.json','w'),indent=2);print('DeepEval custom metric harness ran on',len(rows),'cases')
