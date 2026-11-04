from pathlib import Path
from html.parser import HTMLParser
root=Path('apps/maarej-web/out')
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.nav=[];self.links=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='a':
   self.links.append(a.get('href',''))
   if a.get('data-testid','').startswith('nav-'):self.nav.append(a)
def parse(path):
 text=(root/path).read_text().split('<div hidden id="S:0">')[-1];a=Audit();a.feed(text);return a
for p in ['index.html','teachers.html','teachers/tch-m1-bb7bef77b6c7.html','teachers/tch-student-001.html']:
 a=parse(p);assert not a.nav,p;assert '/student' in a.links,p
for p in ['student.html','student/learning.html','student/journey.html','student/finance.html','student/settings.html','student/orders/demo-booking-001.html','student/learning/teachers/ahmed-salem.html']:
 a=parse(p);assert [n['data-testid'] for n in a.nav]==['nav-learn','nav-journey','nav-home','nav-finance','nav-account'],p
 assert '/' in a.links,p
 assert len([n for n in a.nav if n.get('aria-current')=='page'])<=1,p
 if 'orders/' not in p:assert '/teachers' in a.links,p
print('U1 shell ownership/export links passed: no public bottom nav, stable five Student tabs, public/student transitions and canonical public placeholders.')
