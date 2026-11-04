"""Regenerates centers.json, spaces.json and teacher-profiles.json from the Sites V6.62 data.json.
Usage: python3 scripts/build-places-data.py /path/to/v6/data.json
All records are labelled by V6 as "Maarej simulated prototype data" (demo only)."""
import json,sys,pathlib
d=json.load(open(sys.argv[1]));out=pathlib.Path(__file__).resolve().parents[1]/'apps/maarej-web/src/marketplace/data'
src='Maarej simulated prototype data (Sites V6.62 data.json)'
centers=[{'id':f"ctr-{c['id']:02d}",'legacyId':str(c['id']),'name':c['name'],'type':c.get('type') or 'سنتر تعليمي','area':c['area'],'address':c['address'],
 'rating':c['rating'],'reviews':c['reviews'],'note':c.get('managerNote',''),'branches':[b for b in c.get('branches',[]) if b!=c['area']],
 'features':c['features'],'rooms':[{'name':r['name'],'seats':r['seats'],'price':r['price'],'features':r['features']} for r in c['rooms']],
 'featuredTeachers':[str(x) for x in c.get('featuredTeachers',[])],
 'reviewsByRole':{k:[{'name':a,'rating':b,'text':t} for a,b,t in v] for k,v in c.get('reviewsByRole',{}).items()},
 'lat':c['lat'],'lng':c['lng'],'source':src} for c in d['centerData']]
spaces=[{'id':f"spc-{s['id']:02d}",'legacyId':str(s['id']),'name':s['name'],'type':s['spaceType'],'area':s['area'],'governorate':s['governorate'],
 'rating':s['rating'],'reviews':s['reviews'],'capacity':s['capacity'],'units':s.get('spaceCount',1),'features':s['features'],
 'price':{'min':min(s['prices']),'max':max(s['prices'])},'lat':s['lat'],'lng':s['lng'],'source':src} for s in d['spaceData']]
profiles={str(t['id']):{'bio':t['bio'],'experience':t['experience'],'lessons':t['lessons'],'verified':bool(t.get('verified')),'mode':t['availability'],'lessonPrices':t['lessonPrices']} for t in d['teacherData']}
for name,data in [('centers.json',centers),('spaces.json',spaces),('teacher-profiles.json',profiles)]:json.dump(data,open(out/name,'w'),ensure_ascii=False,indent=1)
print(len(centers),len(spaces),len(profiles))
