"""One-time M1 fixture migration. Input stays external; no legacy runtime dependency."""
import json,hashlib,sys,shutil
from pathlib import Path
source=Path(sys.argv[1]);root=Path(__file__).resolve().parents[1]
rows=json.loads(source.read_text())['teacherData']
# Legacy portrait/record mismatches must not be presented as factual identity photos.
# Only inspected matching demo assets are reused; other records use neutral initials.
matching={2,3,4,5,6,8,9,10,19,20,21,22,23,26,27,28,29}
mapping=[];fixtures=[]
for t in rows:
 stable='tch-m1-'+hashlib.sha256(('v662:teacher:'+str(t['id'])).encode()).hexdigest()[:12]
 mapping.append({'id':stable,'legacyId':str(t['id'])})
 image=None
 if t['id'] in matching:
  asset=source.parent/t['img'];image='/marketplace/teachers/'+stable+asset.suffix
  shutil.copy2(asset,root/'apps/maarej-web/public'/image.lstrip('/'))
 fixtures.append({k:t.get(k) for k in ['id','name','subject','subjectKey','subjects','subjectKeys','area','teachingAreas','system','systems','stage','rating','reviews','lessonPrices']}|{'image':image,'source':'V6.62 simulated prototype teacher dataset'})
base=root/'apps/maarej-web/src/marketplace/data'
(base/'legacy-teachers.json').write_text(json.dumps(fixtures,ensure_ascii=False,indent=2)+'\n')
(base/'teacher-id-map.json').write_text(json.dumps(mapping,indent=2)+'\n')
print('Migrated',len(fixtures),'demo records; IDs are explicit aliases, unrelated to names or array positions.')
