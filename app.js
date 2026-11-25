(()=>{
const D=document,ADMIN=D.body.dataset.mode==='admin',C=window.CONFIG||{},LOCAL=!C.owner;
const DN=['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
const $=id=>D.getElementById(id),p2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const money=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9),tm=t=>{const a=String(t).split(':');return +a[0]*60+(+a[1]||0)};
const short=d=>DN[d].replace('Thứ ','T').replace('Chủ nhật','CN');
const b64=s=>{let t='';new TextEncoder().encode(s).forEach(x=>t+=String.fromCharCode(x));return btoa(t)};
const unb64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g,'')),c=>c.charCodeAt(0)));
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let S=null,sha=null,token=ls.get('hp_token')||'',month=ymd(new Date()).slice(0,7),cid=ls.get('hp_cid'),sheet=null,E=null,armed=null,selDate=ymd(new Date()),busy=false;
const url='https://api.github.com/repos/'+C.owner+'/'+C.repo+'/contents/'+C.path;
const H=()=>Object.assign({Accept:'application/vnd.github+json'},token?{Authorization:'Bearer '+token}:{});
function flash(t){const e=D.createElement('div');e.className='t';e.textContent=t;D.body.appendChild(e);setTimeout(()=>e.remove(),2400)}
async function load(){
 try{
  if(LOCAL){const l=ls.get('hp_local');S=l?JSON.parse(l):await(await fetch('data.json',{cache:'no-store'})).json();return}
  const r=await fetch(url+'?ref='+C.branch,{headers:H(),cache:'no-store'});if(!r.ok)throw 0;
  const j=await r.json();sha=j.sha;S=JSON.parse(unb64(j.content));
 }catch(e){try{S=await(await fetch('data.json',{cache:'no-store'})).json()}catch(x){S={classes:[],sessions:[],payments:[]};flash('Không tải được dữ liệu')}}
}
async function save(){
 if(LOCAL){ls.set('hp_local',JSON.stringify(S));return true}
 try{
  const r=await fetch(url,{method:'PUT',headers:H(),body:JSON.stringify({message:'Cập nhật học phí',content:b64(JSON.stringify(S,null,1)),sha:sha,branch:C.branch})});
  if(!r.ok){flash(r.status===409?'Dữ liệu vừa đổi ở nơi khác, đã tải lại':(r.status===401||r.status===403||r.status===404)?'Mã GitHub sai hoặc thiếu quyền':'Không lưu được');await load();return false}
  sha=(await r.json()).content.sha;return true
 }catch(e){flash('Mất kết nối, chưa lưu được');await load();return false}
}
async function commit(){busy=true;render();await save();busy=false;render()}
function auto(){const n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes();let best=null,bd=1e9;
 S.classes.forEach(c=>c.slots.forEach(s=>{if(s.d!==d)return;const a=tm(s.s),b=tm(s.e),x=m<a?a-m:m>b?m-b:0;if(x<bd){bd=x;best=c}}));return best}
function cur(){const f=S.classes.find(c=>c.id===cid);if(f)return{c:f};const a=auto();if(a)return{c:a,auto:1};return{c:S.classes[0],none:1}}
const slotTxt=c=>c.slots.map(s=>short(s.d)+' '+s.s+'-'+s.e).join(' · ');
function hue(id){let n=0;for(const ch of String(id))n=(n*31+ch.charCodeAt(0))%360;return n}
function badge(s){const d=new Date(s.date+'T00:00:00');return '<div class="dtb" style="--h:'+hue(s.cid)+'"><b>'+d.getDate()+'</b><span>'+short(d.getDay())+'</span></div>'}
const fmtD=s=>s.split('-').reverse().join('/');
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1),mname=m=>{const a=m.split('-');return 'tháng '+(+a[1])+'/'+a[0]};
const remDays=()=>(S.settings&&+S.settings.remind)||3;
const monthDue=m=>S.sessions.filter(s=>s.date.slice(0,7)===m).reduce((x,s)=>x+s.price,0)-S.payments.filter(s=>s.date.slice(0,7)===m).reduce((x,s)=>x+s.amount,0);
function alerts(){const now=new Date(),cm=ymd(now).slice(0,7),left=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate(),out=[];
 [...new Set(S.sessions.map(s=>s.date.slice(0,7)))].sort().forEach(m=>{const d=monthDue(m);if(d<=0)return;if(m<cm)out.push({m,d,late:1});else if(m===cm&&left<=remDays())out.push({m,d,left})});return out}
const A=window.A={
 mshift(n){const a=month.split('-'),d=new Date(+a[0],+a[1]-1+n,1);month=d.getFullYear()+'-'+p2(d.getMonth()+1);armed=null;render()},
 setDate(v){selDate=v||selDate},
 attend(){const c=cur().c;if(!c)return;
  if(S.sessions.some(s=>s.cid===c.id&&s.date===selDate)){flash('Đã điểm danh '+c.name+' ngày này rồi');return}
  S.sessions.push({id:uid(),cid:c.id,name:c.name,price:c.price,date:selDate});month=selDate.slice(0,7);cid=c.id;ls.set('hp_cid',cid);commit()},
 pickC(id){cid=id;ls.set('hp_cid',id);sheet=null;render()},
 open(s){sheet=s;render()},close(){sheet=null;render()},
 del(k,id){const key=k+id;if(armed!==key){armed=key;render();return}armed=null;
  if(k==='s')S.sessions=S.sessions.filter(x=>x.id!==id);else S.payments=S.payments.filter(x=>x.id!==id);commit()},
 openPay(){E={date:ymd(new Date()),amount:'',note:''};sheet='pay';render()},
 savePay(){const a=+E.amount;if(!(a>0)){flash('Nhập số tiền');return}
  S.payments.push({id:uid(),date:E.date||ymd(new Date()),amount:a,note:E.note||''});month=(E.date||ymd(new Date())).slice(0,7);sheet=null;commit()},
 openCls(id){const c=S.classes.find(x=>x.id===id);E=c?JSON.parse(JSON.stringify(c)):{id:null,name:'',place:'',price:80000,slots:[]};sheet='cls';render()},
 addSlot(){E.slots.push({d:1,s:'18:00',e:'20:00'});render()},rmSlot(i){E.slots.splice(i,1);render()},
 saveCls(){if(!E.name.trim()||!(+E.price>0)){flash('Cần tên lớp và đơn giá');return}
  E.price=+E.price;E.name=E.name.trim();
  if(E.id){S.classes[S.classes.findIndex(x=>x.id===E.id)]=E}else{E.id=uid();S.classes.push(E);cid=E.id}
  sheet=null;commit()},
 delCls(){S.classes=S.classes.filter(x=>x.id!==E.id);if(cid===E.id)cid=null;sheet=null;commit()},
 setTok(){const v=$('tk').value.trim();if(!v)return;token=v;ls.set('hp_token',v);load().then(render)},
 logout(){token='';ls.del('hp_token');render()}
};
function render(){
 if(!S){$('app').innerHTML='<div class="mu mid">Đang tải…</div>';return}
 if(ADMIN&&!LOCAL&&!token){$('app').innerHTML='<h1>Cài đặt lần đầu</h1><div class="card"><div class="mu">Dán mã truy cập GitHub (token) để lưu được điểm danh. Mã chỉ được lưu trên máy này.</div><label>Mã GitHub</label><input id="tk" type="password" autocomplete="off"><button class="p big" onclick="A.setTok()">Lưu</button></div>';return}
 const ed=ADMIN,ses=S.sessions.filter(s=>s.date.slice(0,7)===month).sort((a,b)=>b.date.localeCompare(a.date)),
  pay=S.payments.filter(s=>s.date.slice(0,7)===month).sort((a,b)=>b.date.localeCompare(a.date)),
  tot=ses.reduce((a,s)=>a+s.price,0),paid=pay.reduce((a,s)=>a+s.amount,0),due=tot-paid,a=month.split('-'),r=cur(),c=r.c;
 const del=(k,id)=>ed?'<button class="x" onclick="A.del(\''+k+'\',\''+id+'\')">'+(armed===k+id?'Xóa?':'✕')+'</button>':'';
 let h=ed?'<div class="row"><h1>Điểm danh</h1><a class="lk" href="index.html" target="_blank">Trang phụ huynh ↗</a></div>'+(LOCAL?'<div class="mu">Đang chạy thử trên máy này, chưa kết nối GitHub.</div>':''):'<h1>Học phí và buổi học</h1><div class="mu">Dành cho phụ huynh</div>';
 const al=alerts();
 if(al.length)h+='<div class="alert"><b>'+(al.some(x=>x.late)?'Cần đóng học phí':'Sắp đến hạn đóng học phí')+'</b>'+al.map(x=>'<div>'+cap(mname(x.m))+': còn '+money(x.d)+(x.late?' (đã quá hạn)':x.left===0?' (hôm nay là hạn cuối)':' (còn '+x.left+' ngày)')+'</div>').join('')+'</div>';
 if(ed&&c)h+='<div class="card"><div class="cap">'+(r.none?'Hôm nay không có lớp theo lịch':r.auto?'Lớp theo lịch hiện tại':'Lớp đã chọn')+'</div><div class="cls">'+esc(c.name)+'</div><div class="mu">'+esc(c.place)+' · '+money(c.price)+'/buổi<br>'+slotTxt(c)+'</div><label>Ngày học</label><input type="date" value="'+selDate+'" onchange="A.setDate(this.value)"><button class="p big" onclick="A.attend()">Điểm danh ngay</button><button class="g" style="margin-top:8px;width:100%" onclick="A.open(\'pick\')">Chọn lớp khác</button></div>';
 h+='<div class="mn"><button onclick="A.mshift(-1)">‹</button><b>Tháng '+(+a[1])+'/'+a[0]+'</b><button onclick="A.mshift(1)">›</button></div>'
  +'<div class="card" style="margin-top:10px"><div class="stats"><div class="stat"><span>Số buổi</span><b>'+ses.length+'</b></div><div class="stat"><span>Tổng học phí</span><b>'+money(tot)+'</b></div><div class="stat"><span>Đã đóng</span><b>'+money(paid)+'</b></div><div class="stat due'+(due<=0?' ok':'')+'"><span>'+(due<0?'Đóng dư':'Còn phải đóng')+'</span><b>'+money(Math.abs(due))+'</b></div></div></div>'
  +'<div class="card"><h2>Các buổi đã học</h2>'+(ses.length?ses.map(s=>'<div class="item"><div class="l">'+badge(s)+'<div><b>'+esc(s.name)+'</b><div class="mu">'+fmtD(s.date)+'</div></div></div><div class="row"><span>'+money(s.price)+'</span>'+del('s',s.id)+'</div></div>').join(''):'<div class="mu">Chưa có buổi nào trong tháng này.</div>')+'</div>'
  +'<div class="card"><div class="row"><h2>Tiền đã đóng</h2>'+(ed?'<button class="g" onclick="A.openPay()">+ Ghi nhận</button>':'')+'</div>'+(pay.length?pay.map(s=>'<div class="item"><div><b>'+money(s.amount)+'</b><div class="mu">'+fmtD(s.date)+(s.note?' · '+esc(s.note):'')+'</div></div>'+del('p',s.id)+'</div>').join(''):'<div class="mu">Chưa ghi nhận khoản nào.</div>')+'</div>'
  +'<div class="card"><div class="row"><h2>Lớp học và lịch</h2>'+(ed?'<button class="g" onclick="A.openCls(null)">+ Thêm lớp</button>':'')+'</div>'+S.classes.map(k=>'<div class="item"><div><b>'+esc(k.name)+'</b> · '+money(k.price)+'<div class="mu">'+esc(k.place)+'<br>'+slotTxt(k)+'</div></div>'+(ed?'<button class="g" onclick="A.openCls(\''+k.id+'\')">Sửa</button>':'')+'</div>').join('')+'</div>';
  if(ed&&!LOCAL)h+='<button class="g" style="margin-top:14px" onclick="A.logout()">Đổi mã GitHub</button>';
 if(busy)h+='<div class="t">Đang lưu…</div>';
 const sh=(inner)=>'<div class="sh" onclick="if(event.target===this)A.close()"><div>'+inner+'</div></div>';
 if(sheet==='pick')h+=sh('<h2>Chọn lớp</h2>'+S.classes.map(k=>'<button class="pick'+(c&&c.id===k.id?' on':'')+'" onclick="A.pickC(\''+k.id+'\')"><b>'+esc(k.name)+'</b><div class="mu">'+esc(k.place)+' · '+slotTxt(k)+'</div></button>').join(''));
 if(sheet==='pay')h+=sh('<h2>Ghi nhận tiền đã đóng</h2><label>Số tiền (đ)</label><input type="number" inputmode="numeric" value="'+esc(E.amount)+'" oninput="E.amount=this.value"><label>Ngày đóng</label><input type="date" value="'+E.date+'" oninput="E.date=this.value"><label>Ghi chú</label><input value="'+esc(E.note)+'" oninput="E.note=this.value"><button class="p big" onclick="A.savePay()">Lưu</button>');
 if(sheet==='cls')h+=sh('<h2>'+(E.id?'Sửa lớp':'Thêm lớp')+'</h2><label>Tên lớp / môn</label><input value="'+esc(E.name)+'" oninput="E.name=this.value"><label>Nơi học / giáo viên</label><input value="'+esc(E.place)+'" oninput="E.place=this.value"><label>Đơn giá mỗi buổi (đ)</label><input type="number" inputmode="numeric" value="'+esc(E.price)+'" oninput="E.price=this.value"><label>Lịch học</label>'
  +E.slots.map((s,i)=>'<div class="sl"><select onchange="E.slots['+i+'].d=+this.value">'+DN.map((n,d)=>'<option value="'+d+'"'+(s.d===d?' selected':'')+'>'+n+'</option>').join('')+'</select><input type="time" value="'+s.s+'" oninput="E.slots['+i+'].s=this.value"><input type="time" value="'+s.e+'" oninput="E.slots['+i+'].e=this.value"><button class="x" onclick="A.rmSlot('+i+')">✕</button></div>').join('')
  +'<button class="g" onclick="A.addSlot()">+ Thêm giờ học</button><button class="p big" onclick="A.saveCls()">Lưu lớp</button>'+(E.id?'<button class="g" style="width:100%;color:var(--bad)" onclick="A.delCls()">Xóa lớp này</button>':''));
 $('app').innerHTML=h;
}
window.E=null;Object.defineProperty(window,'E',{get:()=>E,set:v=>{E=v}});
render();load().then(render);
if(!ADMIN)D.addEventListener('visibilitychange',()=>{if(!D.hidden)load().then(render)});
})();
