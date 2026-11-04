from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path('apps/maarej-web/out')
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.buttons=0;self.h1=0;self.links=[];self.ids=[];self.teacher_ids=[];self.nav=[];self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='button':assert not self.buttons,'nested buttons';self.buttons+=1
  if tag=='a':
   self.links.append(a.get('href',''))
   if a.get('data-testid','').startswith('nav-'):self.nav.append(a)
  if tag=='article' and a.get('aria-labelledby','').startswith('result-teacher-'):self.teacher_ids.append(a['aria-labelledby'])
 def handle_endtag(self,tag):
  if tag=='button':self.buttons-=1
 def handle_data(self,text):self.text.append(text)
def parse(path):
 html=(root/path).read_text();visible=html.split('<div hidden id="S:0">')[-1];a=Audit();a.feed(visible);return a,visible
aliases=json.loads(Path('apps/maarej-web/src/marketplace/data/teacher-id-map.json').read_text())
for page in ['index.html','teachers.html',f"teachers/{aliases[0]['id']}.html"]:
 a,html=parse(page);assert a.h1==1,(page,a.h1);assert not a.nav,page;assert len(a.ids)==len(set(a.ids)),page
 for href in a.links:
  path=unquote(urlsplit(href).path)
  if path.startswith('/'):
   target=root/('index.html' if path=='/' else path.strip('/')+'.html')
   assert target.exists(),(page,href)
 if page=='teachers.html':
  assert len(a.teacher_ids)==30
  assert 'خريطة تجريبية' in html and 'توزيع توضيحي' in html
  assert 'احجز الآن' not in html and 'متاح الآن' not in html
  assert len([h for h in a.links if h.startswith('/teachers/tch-m1-')])==30
 if page.startswith('teachers/'):
  assert 'ملف المدرس في المرحلة القادمة' in html
  assert '/student/learning/teachers/' not in html
for item in aliases:
 assert (root/f"teachers/{item['id']}.html").exists()
 assert (root/f"teachers/{item['legacyId']}.html").exists()
for page,active in [('student.html','nav-home'),('student/learning.html','nav-learn'),('student/journey.html','nav-journey'),('student/finance.html','nav-finance'),('student/account.html','nav-account')]:
 a,_=parse(page);assert len(a.nav)==5,page;assert [n['data-testid'] for n in a.nav if n.get('aria-current')=='page']==[active],page
print('M1 static exports passed: Public/Student shells separated, 30 cards/60 profile aliases, valid links, unique IDs and no fake booking or live-map claims.')
