from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=Path('apps/maarej-web/out')
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.buttons=0;self.h1=0;self.links=[];self.nav=[];self.copy=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='button':
   assert self.buttons==0,'nested buttons';self.buttons+=1
   if a.get('aria-label') in ['نسخ رقم الطلب','نسخ العنوان']:self.copy+=1
  if tag=='h1':self.h1+=1
  if tag=='a':
   self.links.append(a.get('href',''))
   if a.get('data-testid','').startswith('nav-'):self.nav.append(a)
 def handle_endtag(self,tag):
  if tag=='button':self.buttons-=1
ids=['demo-booking-001','demo-booking-confirmed','demo-booking-rejected','demo-booking-completed','demo-not-found']
for id in ids:
 html=(root/f'student/orders/{id}.html').read_text();a=Audit();a.feed(html.split('<div hidden id="S:0">')[-1])
 assert a.h1==1,id
 assert [n['data-testid'] for n in a.nav]==['nav-learn','nav-journey','nav-home','nav-finance','nav-account'],id
 assert [n['data-testid'] for n in a.nav if n.get('aria-current')=='page']==[],id
 for href in a.links:
  path=unquote(urlsplit(href).path)
  if path.startswith('/'):
   assert (root/('index.html' if path=='/' else path.lstrip('/')+'.html')).exists() or (root/path.lstrip('/')).is_file(),(id,href)
 if id!='demo-not-found':assert a.copy>=1 and 'dir="ltr"' in html,id
 assert 'البحث عن المدرسين' not in html and 'البحث عن السناتر' not in html,id
 assert 'موعد الحجز</h2>' not in html and 'تفاصيل الحجز</h2>' not in html,id
 if id=='demo-booking-001':
  visible=html.split('<div hidden id="S:0">')[-1].split('<script')[0]
  assert visible.count('أحمد محمد')==1,'provider duplicated'
  assert visible.count('سنتر النخبة')==1,'location duplicated'
  assert 'ملخص الحجز' in visible and 'آخر دفعة' in visible
  assert visible.count('4:30')==1,'schedule duplicated'
 if id=='demo-booking-001':assert '4:30' in html and 'الاثنين' in html and '150' in html and 'غير متاح حاليًا' in html
 if id=='demo-booking-rejected':assert 'القاعة' not in html and 'التقييم ' not in html and 'مدفوع جزئيًا' not in html
 if id=='demo-booking-completed':assert 'نسخ العنوان' not in html
 if id=='demo-not-found':assert 'تعذر العثور على الطلب' in html
print('5 Order exports passed: RTL IDs, headings, Student navigation, valid destinations, partial data, dates and unavailable actions.')

assert '/student/orders/demo-booking-001' in (root/'student/learning.html').read_text()
print('Learning entry connects to the booking demo.')
