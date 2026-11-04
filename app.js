'use strict';
const $=s=>document.querySelector(s),ST=k=>JSON.parse(localStorage.getItem(k)||'null'),SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return 1}catch(e){toast('Sem espaço para salvar');return 0}};
const API='https://db.ygoprodeck.com/api/v7/cardinfo.php',CARDS={},PZ=['deck','extra','gy','ban','hand'],PH=['DP','SP','M1','BP','EP'],NM={deck:'Deck',extra:'Extra Deck',gy:'Cemitério',ban:'Banidas'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const BAN={};
const norm=c=>{const b=c.banlist_info||{};BAN[c.id]={t:b.ban_tcg||'',o:b.ban_ocg||''};return{id:c.id,name:c.name,type:c.type,atk:c.atk,def:c.def,lvl:c.level,sc:c.scale,rc:c.race,ar:c.archetype,attr:c.attribute,desc:c.desc,img:c.card_images&&c.card_images[0].image_url_small}};
const isEx=c=>/Fusion|Synchro|XYZ|Link/i.test(c.type||''),isMon=c=>/Monster/i.test(c.type||'');
const kind=c=>/Spell/i.test(c.type)?'sp':/Trap/i.test(c.type)?'tr':/Fusion/i.test(c.type)?'fu':/Synchro/i.test(c.type)?'sy':/XYZ/i.test(c.type)?'xy':/Link/i.test(c.type)?'li':/Effect|Pendulum/i.test(c.type)?'ef':'no';
const frame=c=>`<div class="cd fr ${kind(c)}"><b>${esc(c.name)}</b><small>${isMon(c)?esc(c.atk)+'/'+esc(c.def):''}</small></div>`;
function cardEl(c,fd){if(fd)return'<div class="cd back"></div>';CARDS[c.id]=c;return c.img?`<img class="cd" draggable="false" data-id="${esc(c.id)}" src="${esc(c.img)}">`:frame(c)}
addEventListener('error',e=>{const t=e.target;if(t.tagName=='IMG'&&t.dataset.id&&CARDS[t.dataset.id]){const d=document.createElement('div');d.innerHTML=frame(CARDS[t.dataset.id]);t.replaceWith(d.firstChild)}},true);
let tt;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),1800)}
function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('on',s.id==id))}
function sheet(h){$('#sh').innerHTML='<div class="bk" onclick="closeSh()"></div><div class="pn">'+h+'</div>';$('#sh').classList.add('on')}
function closeSh(){$('#sh').classList.remove('on')}
const det=(c,hide)=>hide?`<div class="det"><div class="bg">${cardEl(c,1)}</div><div><b>Carta virada</b></div></div>`:`<div class="det"><div class="bg">${cardEl(c,0)}</div><div><b>${esc(c.name)}</b><p class="mt">${esc(c.type||'')}${c.attr?', '+esc(c.attr):''}${c.lvl?', Nv '+c.lvl:''}${c.sc!=null?', Escala '+c.sc:''}${isMon(c)&&c.atk!=null?', ATK '+c.atk+' / DEF '+c.def:''}</p><p class="tx">${esc(c.desc||'')}</p></div></div>`;
/* ---------- banco de cartas (YGOPRODeck, sempre atualizado) ---------- */
async function search(q,sd){const r=await fetch(API+'?fname='+encodeURIComponent(q)+(sd?'&format=speed%20duel':'')+'&num=40&offset=0');return r.ok?(await r.json()).data.map(norm):[]}
/* ---------- decks ---------- */
let B;
const T_MON='Effect Monster,Normal Monster,Flip Effect Monster,Flip Tuner Effect Monster,Gemini Monster,Normal Tuner Monster,Pendulum Effect Monster,Pendulum Flip Effect Monster,Pendulum Normal Monster,Pendulum Tuner Effect Monster,Ritual Effect Monster,Ritual Monster,Spirit Monster,Toon Monster,Tuner Monster,Union Effect Monster',
T_EX='Fusion Monster,Link Monster,Pendulum Effect Fusion Monster,Synchro Monster,Synchro Pendulum Effect Monster,Synchro Tuner Monster,XYZ Monster,XYZ Pendulum Effect Monster',
TYF={mon:T_MON,sp:'Spell Card',tr:'Trap Card',ex:T_EX},TN={fav:'Favoritos',mon:'Monstros',sp:'Magias',tr:'Armadilhas',ex:'Deck Adicional'},SORTS=[['name','Nome'],['new','Mais novas'],['atk','ATK'],['def','DEF'],['level','Nível'],['type','Tipo']];
const ord=c=>({no:0,ef:1,fu:2,sy:3,xy:4,li:5,sp:6,tr:7})[kind(c)],lvb=c=>isMon(c)&&c.lvl?`<span class="lv">${/Link/i.test(c.type)?'L':'★'}${c.lvl}</span>`:'';
const sortDeck=()=>B.c.sort((a,b)=>ord(a)-ord(b)||(b.lvl||0)-(a.lvl||0)||String(a.name).localeCompare(b.name));
const MT={fu:['Fusão','Fusion Monster,Pendulum Effect Fusion Monster'],sy:['Sincro','Synchro Monster,Synchro Pendulum Effect Monster,Synchro Tuner Monster'],xy:['Xyz','XYZ Monster,XYZ Pendulum Effect Monster'],li:['Link','Link Monster'],pe:['Pêndulo','Pendulum Effect Monster,Pendulum Normal Monster,Pendulum Flip Effect Monster,Pendulum Tuner Effect Monster,Pendulum Effect Ritual Monster,Pendulum Effect Fusion Monster,Synchro Pendulum Effect Monster,XYZ Pendulum Effect Monster'],ri:['Ritual','Ritual Monster,Ritual Effect Monster,Pendulum Effect Ritual Monster'],no:['Normal','Normal Monster,Normal Tuner Monster,Pendulum Normal Monster'],tu:['Tuner','Tuner Monster,Normal Tuner Monster,Synchro Tuner Monster,Pendulum Tuner Effect Monster']},
MTR={fu:/Fusion/,sy:/Synchro/,xy:/XYZ/,li:/Link/,pe:/Pendulum/,ri:/Ritual/,no:/Normal/,tu:/Tuner/},
SPT={sp:[['Normal','Normal'],['Continuous','Contínua'],['Quick-Play','Rápida'],['Equip','Equipamento'],['Field','Campo'],['Ritual','Ritual']],tr:[['Normal','Normal'],['Continuous','Contínua'],['Counter','Resposta']]},
stpN=()=>{const a=(SPT[B.t]||SPT.sp.concat(SPT.tr)).find(x=>x[0]==B.stp);return a?a[1]:B.stp};
const lite=c=>{if(!c.custom)return c;const x=Object.assign({},c);delete x.img;delete x.art;return x},hyd=c=>{if(!c.custom)return c;const m=(ST('custom')||[]).find(z=>z.id==c.id);if(!m)return c;const r=Object.assign({},c,m);delete r.art;delete r.src;return r};
function decksView(){const D=ST('decks')||[];$('#decks').innerHTML=`<h2>Meus decks</h2>${D.map((d,i)=>`<div class="row"><b>${d.star?'★ ':''}${esc(d.n)}</b><span>${d.c.length}</span><button onclick="editDeck(${i})">Editar</button><button onclick="delDeck(${i})">Apagar</button></div>`).join('')||'<p>Nenhum deck ainda.</p>'}<div class="bt"><button onclick="editDeck(-1)">Novo deck</button><button onclick="show('menu')">Voltar</button></div>`;show('decks')}
function delDeck(i){if(!confirm('Apagar deck?'))return;const D=ST('decks');D.splice(i,1);SV('decks',D);decksView()}
function editDeck(i){const D=ST('decks')||[];B=Object.assign({i,n:'',c:[],t:'',q:'',sd:0,staple:0,attr:'',lv:'',sort:'name',col:[],off:0,end:0,busy:0,rid:0,exp:ST('hf')?1:0,rel:null,mt:'',sc:'',stp:'',big:0,lock:0,star:0},i<0?{}:{n:D[i].n,c:D[i].c.map(hyd),star:D[i].star||0});sortDeck();{const h=ST('dkh');if(h)$('#bld').style.setProperty('--dkh',Math.min(h,innerHeight*.6)+'px')}show('bld');reload();refreshBan(B.c);if(bl()=='md')loadMD()}
function reload(){B.col=[];B.off=0;B.end=0;B.busy=0;B.rid++;bldView();loadMore()}
function bldView(){const fl=[B.sd&&'Speed Duel',B.attr,B.lv&&'Nv '+B.lv,B.staple&&'Populares',B.q&&'"'+B.q+'"',B.t&&TN[B.t],B.mt&&MT[B.mt][0],B.sc!==''&&'Escala '+B.sc,B.stp&&stpN(),B.rel&&'Relacionados: '+(B.rel.a||B.rel.n)].filter(Boolean).join(', ')||'Desl.',sn=SORTS.find(s=>s[0]==B.sort)[1],ch=(t,l)=>`<button class="${B.t==t?'on':''}" onclick="setT('${t}')">${l}</button>`;
$('#bld').className='scr on'+(B.exp?' x':'');
$('#bld').innerHTML=`<div class="dh"><div class="nm"><span>✎</span><input value="${esc(B.n)}" placeholder="Nome do deck" oninput="B.n=this.value"></div><button onclick="menuSheet()">MENU</button></div>
<div class="dh2"><div class="cnt"><div>Deck Principal <b id="cm"></b></div><div>Deck Adicional <b id="ce"></b></div></div><div class="st" id="stt"></div><button class="sq" onclick="rulesSheet()">i</button></div>
<div class="dh3"><button class="sq rd" onclick="clearDeck()">🗑</button><button onclick="autoDeck()">Automontar deck</button><button onclick="cfgSheet()">Configurações de Deck</button><button class="sq gn" onclick="B.lock^=1;toast(B.lock?'Deck travado':'Deck liberado');bldView()">${B.lock?'🔒':'🔓'}</button><button class="sq gn" onclick="B.star^=1;bldView()">${B.star?'★':'☆'}</button></div>
<div class="dkp" id="dk" data-z="bdeck"></div>
<div class="dv" id="dvb"><button class="sq" onclick="togX(this)">${B.exp?'▼':'▲'}</button><div>Ordenar por: ${sn}<br>Filtro: ${esc(fl)}${B.rel?' <button class="sq" onclick="B.rel=null;reload()">✕</button>':''}</div></div>
<div class="chips fx">${ch('fav','★ Cards favoritos')}${ch('mon','Monstros')}${ch('sp','Magias')}${ch('tr','Armadilha')}${ch('ex','Deck Adicional')}</div>
${SPT[B.t]?`<div class="chips fx">${SPT[B.t].map(x=>`<button class="${B.stp==x[0]?'on':''}" onclick="setSp('${x[0]}')">${x[1]}</button>`).join('')}</div>`:''}
<div class="chips fx"><button onclick="fltSheet()">Filtro</button><button class="${B.staple?'on':''}" onclick="B.staple^=1;reload()">Cards populares</button><button onclick="txtSheet()">Busca por texto</button><button class="sq" onclick="clrF()">🗑</button></div>
<div class="chips fx"><select onchange="B.sort=this.value;reload()">${SORTS.map(s=>`<option value="${s[0]}" ${s[0]==B.sort?'selected':''}>Ordenar por: ${s[1]}</option>`).join('')}</select><select onchange="setBl(this.value)">${Object.keys(BLN).map(l=>`<option value="${l}" ${bl()==l?'selected':''}>Banlist: ${BLN[l]}</option>`).join('')}</select><button class="sq" onclick="B.big^=1;renderCol(0)">▢</button></div>
<div class="clp" id="cl" data-z="bcol" onscroll="colScroll(this)"></div>
<div class="bb"><button class="sq" onclick="decksView()">←</button><button onclick="saveDeck()">SALVAR</button><button onclick="copyDeck()">Copiar Deck</button><button class="sq" onclick="show('menu')">⌂</button></div>`;renderDeck();renderCol(0);initResize()}
function togX(b){B.exp^=1;SV('hf',B.exp);$('#bld').classList.toggle('x',!!B.exp);b.textContent=B.exp?'▼':'▲'}
function setT(t){B.t=B.t==t?'':t;B.mt='';B.stp='';reload()}
function clrF(){Object.assign(B,{t:'',q:'',sd:0,staple:0,attr:'',lv:'',rel:null,mt:'',sc:'',stp:''});reload()}
function renderDeck(){const m=B.c.filter(c=>!isEx(c)),e=B.c.filter(isEx),sl=(c)=>`<div class="sl" data-drag="dk" data-id="${B.c.indexOf(c)}" onclick="dkSheet(${B.c.indexOf(c)})">${cardEl(c,0)}${lvb(c)}${banB(c)}</div>`,es=n=>`<div class="es">${n}</div>`;
let h=m.map(sl).join('');for(let i=m.length;i<Math.min(30,Math.max(24,Math.ceil(m.length/6)*6));i++)h+=es(i+1);
h+='<div class="xh">Deck Adicional</div>'+e.map(sl).join('');for(let i=e.length;i<9;i++)h+=es(i+1);
$('#dk').innerHTML=h;$('#cm').textContent=m.length;$('#cm').style.color=m.length<20||m.length>30?'#ff7070':'#fff';$('#ce').textContent=e.length;
$('#stt').textContent=m.length<20?'Faltam '+(20-m.length)+' cartas no deck principal':m.length>30?'Deck principal passa de 30':e.length>9?'Deck adicional passa de 9':'Deck válido para Speed Duel'}
const custom=()=>(ST('custom')||[]).filter(c=>(!B.q||c.name.toLowerCase().includes(B.q.toLowerCase()))&&({'':1,mon:isMon(c)&&!isEx(c),sp:/Spell/.test(c.type),tr:/Trap/.test(c.type),ex:isEx(c)})[B.t]&&(!B.mt||MTR[B.mt].test(c.type))&&(!B.stp||c.rc==B.stp)&&(B.sc===''||c.sc==B.sc));
async function loadMore(){if(B.busy||B.end)return;B.busy=1;const rid=B.rid,from=B.col.length;
try{let data=[];
if(B.t=='fav'){const f=ST('fav')||[];B.end=1;if(f.length){const r=await fetch(API+'?id='+f.join(','));if(r.ok)data=(await r.json()).data.map(norm)}}
else{if(B.off==0)data=B.rel?(ST('custom')||[]).filter(c=>c.name.toLowerCase().includes(String(B.rel.a||B.rel.n).toLowerCase())):custom();let u=API+'?num=60&offset='+B.off+'&sort='+B.sort;if(B.rel)u+=B.rel.a?'&archetype='+encodeURIComponent(B.rel.a):'&fname='+encodeURIComponent(B.rel.n);if(B.mt)u+='&type='+encodeURIComponent(MT[B.mt][1]);else if(B.t)u+='&type='+encodeURIComponent(TYF[B.t]);if(B.stp)u+='&race='+encodeURIComponent(B.stp);if(B.sc!=='')u+='&scale='+B.sc;if(B.q)u+='&fname='+encodeURIComponent(B.q);if(B.sd)u+='&format=speed%20duel';if(B.staple)u+='&staple=yes';if(B.attr)u+='&attribute='+B.attr;if(B.lv)u+='&level='+B.lv;
const r=await fetch(u);if(r.ok){const d=(await r.json()).data;data=data.concat(d.map(norm));B.off+=60;if(d.length<60)B.end=1}else B.end=1}
if(rid!=B.rid)return;B.col=B.col.concat(data)}catch(e){toast('Sem conexão');B.end=1}
B.busy=0;renderCol(from)}
function colScroll(el){if(el.scrollTop+el.clientHeight>el.scrollHeight-400)loadMore()}
function renderCol(from){const el=$('#cl');if(!el)return;const s=el.scrollTop;el.className='clp'+(B.big?' b3':'');
const h=(c,i)=>{const n=B.c.filter(x=>x.id==c.id).length;return`<div class="ci" data-drag="col" data-id="${i}" onclick="colSheet(${i})">${cardEl(c,0)}${lvb(c)}${banB(c)}${n?`<span class="cn">${n}</span>`:''}</div>`};
if(from>0)el.insertAdjacentHTML('beforeend',B.col.slice(from).map((c,j)=>h(c,from+j)).join(''));else{el.innerHTML=B.col.map(h).join('')||`<p>${B.end?'Nenhuma carta encontrada.':'Carregando...'}</p>`;el.scrollTop=s}}
function addC(c){if(B.lock)return toast('Deck travado');if(B.c.filter(x=>x.id==c.id).length>=3)return toast('Máximo 3 cópias');const ex=isEx(c);if(ex?B.c.filter(isEx).length>=9:B.c.filter(x=>!isEx(x)).length>=30)return toast(ex?'Deck adicional cheio (9)':'Deck principal cheio (30)');B.c.push(c);sortDeck();renderDeck();renderCol(0)}
function rmId(id){if(B.lock)return toast('Deck travado');const i=B.c.map(x=>x.id).lastIndexOf(id);if(i>=0){B.c.splice(i,1);renderDeck();renderCol(0)}}
function colSheet(i){const c=B.col[i];if(c)sheet(det(c)+`<div class="bt"><button onclick="relGo(B.col[${i}])">Cards relacionados</button></div>`)}
function dkSheet(i){const c=B.c[i];if(c)sheet(det(c)+`<div class="bt"><button onclick="relGo(B.c[${i}])">Cards relacionados</button></div>`)}
function favT(id){let f=ST('fav')||[];f=f.includes(id)?f.filter(x=>x!=id):f.concat(id);SV('fav',f)}
function autoDeck(){if(B.lock)return toast('Deck travado');shuf(B.col.slice()).forEach(c=>{if(!isEx(c)&&B.c.filter(x=>!isEx(x)).length<20&&B.c.filter(x=>x.id==c.id).length<3)B.c.push(c)});sortDeck();renderDeck();renderCol(0)}
function clearDeck(){if(B.lock)return toast('Deck travado');if(confirm('Remover todas as cartas?')){B.c=[];renderDeck();renderCol(0)}}
function saveDeck(){const D=ST('decks')||[],d={n:B.n||'Deck',c:B.c.map(lite),star:B.star};if(B.i<0){D.push(d);B.i=D.length-1}else D[B.i]=d;if(SV('decks',D))toast('Deck salvo')}
function copyDeck(){const ok=c=>/^\d+$/.test(c.id),t='#created by Duel\n#main\n'+B.c.filter(c=>!isEx(c)&&ok(c)).map(c=>c.id).join('\n')+'\n#extra\n'+B.c.filter(c=>isEx(c)&&ok(c)).map(c=>c.id).join('\n')+'\n!side\n';navigator.clipboard.writeText(t).then(()=>toast('Deck copiado (.ydk)'),()=>toast('Não foi possível copiar'))}
function menuSheet(){sheet('<h3>Menu</h3><div class="bt"><button onclick="saveDeck();closeSh()">Salvar</button><button onclick="impSheet()">Importar .ydk</button><button onclick="copyDeck();closeSh()">Copiar Deck</button><button onclick="closeSh();decksView()">Sair</button></div>')}
function cfgSheet(){sheet('<h3>Configurações de Deck</h3><div class="bt"><button onclick="impSheet()">Importar .ydk</button><button onclick="closeSh();clearDeck()">Limpar deck</button><button onclick="closeSh();cstView()">Criar carta</button></div>')}
function rulesSheet(){sheet('<h3>Regras do deck</h3><p>Deck principal: de 20 a 30 cartas. Deck adicional: até 9 cartas. No máximo 3 cópias de cada carta.</p><p>Toque numa carta para ver detalhes e cards relacionados. Segure uma carta da lista e arraste até o deck para adicionar. Segure uma carta do deck para completar a 2ª e a 3ª cópia. Arraste uma carta do deck para a lista para remover.</p><p>Os números vermelho (0), laranja (1) e azul (2) mostram Proibida, Limitada e Semi-limitada na banlist escolhida.</p>')}
function setSp(v){B.stp=B.stp==v?'':v;reload()}
function fltSheet(){const A=['','DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'],AN={DARK:'Trevas',LIGHT:'Luz',EARTH:'Terra',WATER:'Água',FIRE:'Fogo',WIND:'Vento',DIVINE:'Divino'},o=(v,l,s)=>`<option value="${v}" ${s?'selected':''}>${l}</option>`;
sheet(`<h3>Filtro</h3><label><input type="checkbox" id="fs" ${B.sd?'checked':''}> Só Speed Duel</label><p>Tipo de monstro</p><select id="fm">${o('','Todos',!B.mt)}${Object.keys(MT).map(k=>o(k,MT[k][0],B.mt==k)).join('')}</select><p>Atributo</p><select id="fa">${A.map(a=>o(a,a?AN[a]:'Todos',a==B.attr)).join('')}</select><p>Nível / Rank</p><select id="fl">${Array.from({length:13},(_,i)=>o(i||'',i||'Todos',(i||'')==B.lv)).join('')}</select><p>Escala Pêndulo</p><select id="fc">${o('','Todas',B.sc==='')}${Array.from({length:14},(_,i)=>o(i,i,B.sc!==''&&B.sc==i)).join('')}</select><div class="bt"><button onclick="applyFlt()">Aplicar</button></div>`)}
function applyFlt(){B.sd=$('#fs').checked?1:0;B.attr=$('#fa').value;B.lv=$('#fl').value;B.mt=$('#fm').value;B.sc=$('#fc').value;if(B.mt||B.sc!==''){B.t='';B.stp=''}closeSh();reload()}
function txtSheet(){sheet(`<h3>Busca por texto</h3><input id="tq" value="${esc(B.q)}" placeholder="Nome da carta"><div class="bt"><button onclick="B.q=$('#tq').value.trim();closeSh();reload()">Buscar</button></div>`)}
function impSheet(){sheet('<h3>Importar .ydk</h3><textarea id="yd" rows="8" placeholder="Cole o conteúdo do arquivo .ydk"></textarea><div class="bt"><button onclick="imp()">Importar</button></div>')}
async function imp(){const ids=$('#yd').value.split(/!side/)[0].split(/\s+/).filter(x=>/^\d+$/.test(x));if(!ids.length)return toast('Nada para importar');closeSh();toast('Importando...');const u=[...new Set(ids)],M={};
try{for(let i=0;i<u.length;i+=40){const r=await fetch(API+'?id='+u.slice(i,i+40).join(','));if(r.ok)(await r.json()).data.forEach(c=>M[c.id]=norm(c))}}catch(e){return toast('Sem conexão')}
ids.forEach(i=>M[i]&&B.c.push(M[i]));sortDeck();renderDeck();renderCol(0);toast(B.c.length+' cartas no deck')}
/* ---------- criar cartas ---------- */
/* ---------- duelo manual ---------- */
let G=null;const uid=()=>Math.random().toString(36).slice(2,9),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function setupView(){const D=ST('decks')||[];if(!D.length){toast('Crie um deck primeiro');return decksView()}const o=D.map((d,i)=>`<option value="${i}">${esc(d.n)} (${d.c.length})</option>`).join(''),N=ST('names')||['Duelista 1','Duelista 2'];
$('#setup').innerHTML=`<h2>Novo duelo</h2><p>Duelista 1</p><input id="n1" value="${esc(N[0])}" maxlength="16"><select id="d1">${o}</select><p>Duelista 2</p><input id="n2" value="${esc(N[1])}" maxlength="16"><select id="d2">${o}</select><div class="bt"><button onclick="go()">Começar (4000 LP, 4 cartas)</button><button onclick="show('menu')">Voltar</button></div>`;show('setup')}
function startDuel(d1,d2,nm){const mk=(deck,o)=>{const cs=deck.map(c=>Object.assign({},c,{u:uid(),o,fd:0,df:0}));return{name:(nm&&nm[o])||'Duelista '+(o+1),lp:4000,deck:shuf(cs.filter(c=>!isEx(c))),extra:cs.filter(isEx),gy:[],ban:[],hand:[],s:{}}};
G={p:[mk(d1,0),mk(d2,1)],me:0,turn:1,ph:0,pend:null,over:null,h:[]};G.p.forEach(P=>{for(let i=0;i<4;i++){const x=P.deck.shift();x&&P.hand.push(x)}});show('duel');render()}
const snap=()=>{G.h.push(JSON.stringify([G.p,G.turn,G.ph]));if(G.h.length>80)G.h.shift()};
function undo(){if(!G.h.length)return toast('Nada para desfazer');[G.p,G.turn,G.ph]=JSON.parse(G.h.pop());G.pend=null;render()}
function find(u){for(let p=0;p<2;p++){const P=G.p[p];for(const z of PZ){const i=P[z].findIndex(c=>c.u==u);if(i>=0)return{p,z,i,c:P[z][i]}}for(const k in P.s){const t=P.s[k];if(!t)continue;if(t.u==u)return{p,z:k,c:t};const j=(t.mat||[]).findIndex(m=>m.u==u);if(j>=0)return{p,z:k,j,par:t,c:t.mat[j]}}}}
function take(f){const P=G.p[f.p];if(f.i!==undefined)P[f.z].splice(f.i,1);else if(f.par)f.par.mat.splice(f.j,1);else delete P.s[f.z];return f.c}
function mv(u,p,z,o){o=o||{};const f=find(u);if(!f)return;const isP=PZ.includes(z);if(!isP){const t=G.p[p].s[z];if(t&&t.u!=u)return toast('Zona ocupada')}
snap();const c=take(f);c.fd=o.fd||0;c.df=o.df||0;
if(isP&&c.mat&&c.mat.length){c.mat.forEach(m=>{m.fd=0;m.df=0;m.mat=[];G.p[m.o].gy.push(m)});c.mat=[];toast('Materiais enviados ao Cemitério')}
if(isP){const P=G.p[c.o];if(z=='deck'&&o.top)P.deck.unshift(c);else P[z].push(c)}else G.p[p].s[z]=c;closeSh();render()}
function draw(p){const P=G.p[p],c=P.deck.shift();if(!c)return toast('Deck vazio');snap();P.hand.push(c);closeSh();render()}
function shufDeck(p){snap();shuf(G.p[p].deck);closeSh();toast('Deck embaralhado')}
const LAB={m0:'Monstro',m1:'Monstro',m2:'Monstro',em:'Zona extra',fz:'Magia de Campo',s0:'',s1:'Mágica / Armadilha',s2:''};
function cell(p,k){const P=G.p[p],dz=`data-z="${p}|${k}"`;
if(k=='deck'||k=='extra'){const a=P[k];return`<div class="cell pile" ${dz} onclick="${k=='deck'?`deckMenu(${p})`:`pile(${p},'extra')`}">${a.length?cardEl(a[0],1):''}<span class="lb">${NM[k]}</span><em>${a.length}</em></div>`}
if(k=='gy'||k=='ban'){const a=P[k],t=a[a.length-1];return`<div class="cell pile" ${dz} onclick="pile(${p},'${k}')">${t?cardEl(t,0):''}<span class="lb">${NM[k]}</span><em>${a.length}</em></div>`}
const c=P.s[k],pd=k=='s0'||k=='s2',n=c&&c.mat?c.mat.length:0,sc=c&&!c.fd&&/Pendulum/i.test(c.type||'')&&c.sc!=null?c.sc:'';
return`<div class="cell ${k[0]}${pd?' pd':''}${c&&c.df?' df':''}${n?' stk':''}${G.pend?' hl':''}" ${dz} ${c?`data-drag="f" data-id="${c.u}"`:''} onclick="slot(${p},'${k}')">${c?(n?stackHtml(c):cardEl(c,c.fd)):`<span class="lb">${LAB[k]}</span>`}${pd?`<span class="gm ${k=='s0'?'r':'b'}">${sc}</span>`:''}</div>`}
const rowST=(p,r)=>(r?['deck','s2','s1','s0','extra']:['extra','s0','s1','s2','deck']).map(k=>cell(p,k)).join(''),rowM=(p,r)=>(r?['gy','m2','m1','m0','fz']:['fz','m0','m1','m2','gy']).map(k=>cell(p,k)).join('');
const lpC=p=>`<div class="lpb" onclick="lpSheet(${p})"><small>${esc(G.p[p].name)}</small><b>${G.p[p].lp}</b></div>`;
function strip(p,mine){const P=G.p[p];return`<div class="hand" data-z="${p}|hand">${P.hand.map(c=>`<div class="hc" ${mine?`data-drag="h" data-id="${c.u}" onclick="act('${c.u}')"`:''}>${cardEl(c,!mine)}</div>`).join('')}</div>`}
function render(){const me=G.me,op=1-me;$('#duel').innerHTML=`<div class="strip top">${G.pend?`<div class="ban">Escolha uma zona<button onclick="G.pend=null;render()">Cancelar</button></div>`:strip(op,0)}</div><div class="bd">${rowST(op,1)}${rowM(op,1)}${cell(op,'ban')}${cell(op,'em')}<div class="cell ph" onclick="nextPh()"><small>Turno ${G.turn}</small><b>${PH[G.ph]}</b></div>${cell(me,'em')}${cell(me,'ban')}${rowM(me)}${rowST(me)}</div><div class="tools">${lpC(op)}<button onclick="undo()">↶</button><button onclick="toast(Math.random()<.5?'Cara':'Coroa')">🪙</button><button onclick="toast('Dado: '+(1+Math.random()*6|0))">🎲</button><button onclick="G.me=1-G.me;render()">⇄</button><button onclick="if(confirm('Sair do duelo?'))show('menu')">✕</button>${lpC(me)}</div><div class="strip bot">${strip(me,1)}</div>${G.over!=null?endHtml():''}`}
function nextPh(){snap();if(++G.ph>=PH.length){G.ph=0;G.turn++}render()}
function slot(p,k){const c=G.p[p].s[k];if(G.pend){const q=G.pend;G.pend=null;if(c&&c.u==q.u){render();return}return place(q.u,p,k,q)}if(c){if(c.mat&&c.mat.length)stkMenu(p,k);else act(c.u)}}
function pend(u,fd,df){G.pend={u,fd,df};closeSh();render()}
function flip(u,k){const f=find(u);snap();f.c[k]^=1;closeSh();render()}
function pile(p,z){if(G.pend)return;const a=G.p[p][z];sheet(`<h3>${NM[z]} de ${esc(G.p[p].name)}: ${a.length}</h3><div class="gr">${a.map(c=>`<div class="hc" data-drag="p" data-id="${c.u}" onclick="act('${c.u}')">${cardEl(c,0)}</div>`).join('')||'<p>Vazio</p>'}</div>`)}
function act(u){const f=find(u);if(!f)return;const c=f.c,mat=!!f.par,fld=!PZ.includes(f.z)&&!mat,ex=isEx(c),n=(c.mat||[]).length,B=(t,fn)=>`<button onclick="${fn}">${t}</button>`,to=(t,z,o)=>B(t,`mv('${u}',0,'${z}',{${o||''}})`);
sheet(det(c,fld&&c.fd&&f.p!=G.me)+'<div class="bt">'+[mat?to('Retirar → Cemitério','gy'):'',B(ex?'Invocar (ATK)':'Invocar / Ativar',`pend('${u}',0,0)`),ex?B('Invocar (DEF)',`pend('${u}',0,1)`):'',mat?'':B('Baixar',`pend('${u}',1,${isMon(c)?1:0})`),mat?B('Trazer para o topo',`toTop('${u}')`):'',fld?B('Virar',`flip('${u}','fd')`):'',fld&&isMon(c)?B('Posição',`flip('${u}','df')`):'',fld?B('Mover de zona',`pend('${u}',${c.fd},${c.df})`):'',f.z!='hand'?to('Mão','hand'):'',!mat&&f.z!='gy'?to('Cemitério','gy'):'',f.z!='ban'?to('Banir','ban'):'',ex?(f.z!='extra'?to('Extra Deck','extra'):''):to('Topo do deck','deck','top:1')+to('Fundo do deck','deck')].join('')+'</div>')}
let LPI='';
function lpSheet(p){LPI='';lpDraw(p)}
function lpDraw(p){sheet(`<h3>${esc(G.p[p].name)}</h3><div class="lpd"><small>Pontos de vida</small><b>${G.p[p].lp}</b></div><div class="lpi" id="lpi">${LPI||'0'}</div><div class="kp">${[7,8,9,4,5,6,1,2,3].map(n=>`<button onclick="lpK('${n}')">${n}</button>`).join('')}<button onclick="lpK('C')">C</button><button onclick="lpK('0')">0</button><button onclick="lpK('B')">⌫</button></div><div class="bt"><button class="rd" onclick="lpA(${p},-1)">− Diminuir</button><button class="gn" onclick="lpA(${p},1)">+ Somar</button></div>`)}
function lpK(k){if(k=='C')LPI='';else if(k=='B')LPI=LPI.slice(0,-1);else if(LPI.length<6)LPI=(LPI+k).replace(/^0+(?=\d)/,'');const e=$('#lpi');if(e)e.textContent=LPI||'0'}
function lpA(p,s){const v=+LPI||0;if(!v)return toast('Digite um valor');snap();G.p[p].lp=Math.max(0,G.p[p].lp+s*v);LPI='';render();lpDraw(p)}
/* ---------- pilhas (Xyz): carta solta por cima, as de baixo aparecem à direita ---------- */
function place(u,p,k,o){const t=G.p[p].s[k];if(t&&t.u!=u)return stk(u,p,k,1,o.fd||0,o.df||0);mv(u,p,k,o)}
function stk(u,p,k,top,fd,df){const f=find(u),t=G.p[p].s[k];if(!f||!t||t.u==u){closeSh();render();return}snap();const c=take(f),cm=c.mat||[],tm=t.mat||[],cl=m=>{m.fd=0;m.df=0;m.mat=[];return m};c.mat=[];t.mat=[];
if(top){c.fd=fd;c.df=df;c.mat=[...cm.map(cl),...tm.map(cl),cl(t)];G.p[p].s[k]=c}else{t.mat=[...tm,cl(c),...cm.map(cl)]}
closeSh();render()}
function toTop(u){const f=find(u);if(!f||!f.par){closeSh();return}const t=f.par,p=f.p,k=f.z,fd=t.fd,df=t.df;snap();const m=take(f),rest=t.mat,cl=x=>{x.fd=0;x.df=0;x.mat=[];return x};t.mat=[];m.fd=fd;m.df=df;m.mat=[...rest.map(cl),cl(t)];G.p[p].s[k]=m;closeSh();render()}
function stackHtml(c){const m=c.mat.slice().reverse().slice(0,3),v=m.length,s=7,x=i=>(i*s-v*s/2).toFixed(1);
return m.map((q,i)=>[i,q]).reverse().map(([i,q])=>`<div class="sw" style="transform:translate(-50%,-50%) translateX(${x(i+1)}px)">${cardEl(q,0)}</div>`).join('')+`<div class="sw" style="transform:translate(-50%,-50%) translateX(${x(0)}px)${c.df?' rotate(-90deg)':''}">${cardEl(c,c.fd)}</div>`}
function stkMenu(p,k){const t=G.p[p].s[k];if(!t)return;const L=[t,...(t.mat||[]).slice().reverse()];
sheet(`<h3>Cartas empilhadas (${L.length})</h3><p class="mt">Toque numa carta para ver e escolher a ação.</p><div class="gr">${L.map((c,i)=>`<div class="hc stc" onclick="act('${c.u}')">${cardEl(c,i?0:c.fd)}${i?'':'<span class="tg">Topo</span>'}</div>`).join('')}</div>`)}
/* ---------- deck: menu e rendição ---------- */
function deckMenu(p){if(G.pend)return;sheet(`<h3>Deck de ${esc(G.p[p].name)} (${G.p[p].deck.length})</h3><div class="bt vc"><button onclick="draw(${p})">Comprar uma carta</button><button onclick="pile(${p},'deck')">Visualizar deck</button><button onclick="shufDeck(${p})">Embaralhar</button><button class="rd" onclick="surr(${p})">Render-se</button></div>`)}
function surr(p){if(!confirm(G.p[p].name+' se rende? A vitória será do oponente.'))return;closeSh();G.over=1-p;render()}
const endHtml=()=>`<div class="end"><h2>Fim do duelo</h2><p><b>${esc(G.p[G.over].name)}</b> venceu</p><p class="mt">${esc(G.p[1-G.over].name)} se rendeu.</p><button onclick="G=null;show('menu')">Voltar ao menu</button></div>`;
function go(){const D=ST('decks'),n=[$('#n1').value.trim()||'Duelista 1',$('#n2').value.trim()||'Duelista 2'];SV('names',n);startDuel(D[$('#d1').value].c.map(hyd),D[$('#d2').value].c.map(hyd),n)}
/* ---------- cards relacionados (montador) ---------- */
function relGo(c){closeSh();(async()=>{let a=c.ar;if(a===undefined&&/^\d+$/.test(c.id)){try{const r=await fetch(API+'?id='+c.id);if(r.ok){const d=(await r.json()).data[0];a=d&&d.archetype||null}}catch(e){}}
const w=String(c.name).split(/\s+/)[0];Object.assign(B,{t:'',q:'',sd:0,staple:0,attr:'',lv:'',mt:'',sc:'',stp:'',rel:a?{a}:{n:w.length>2?w:c.name}});reload()})()}
/* ---------- arrastar e soltar (deck e duelo) ---------- */
const DR={s:null,z:null};let noClk=0;
const dgCard=s=>s.k=='col'?B.col[s.id]:s.k=='dk'?B.c[s.id]:(find(s.id)||{}).c;
const dgZ=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.closest('[data-z]')};
function dgSet(z){if(DR.z&&DR.z!==z)DR.z.classList.remove('dzh');DR.z=z;if(z)z.classList.add('dzh')}
function dgPos(x,y){const s=DR.s;s.g.style.left=x+'px';s.g.style.top=y+'px';dgSet(dgZ(x,y))}
function dgClr(s){clearTimeout(s.tm);clearTimeout(s.c1);clearTimeout(s.c2)}
function dgOff(s){if(s.g){s.g.remove();s.g=null}dgSet(null);s.t.classList.remove('dgs');document.body.classList.remove('dg');s.on=0}
function dgBegin(){const s=DR.s;if(!s||s.on)return;clearTimeout(s.tm);const c=dgCard(s);if(!c){DR.s=null;return}s.on=1;
const g=document.createElement('div');g.className='ghost';g.innerHTML=cardEl(c,s.k=='f'?c.fd:0);document.body.appendChild(g);s.g=g;s.t.classList.add('dgs');document.body.classList.add('dg');
if(s.k=='p')$('#sh').classList.add('dgh');if(navigator.vibrate)navigator.vibrate(12);dgPos(s.lx,s.ly)}
function dgEnd(drop){const s=DR.s;if(!s)return;dgClr(s);DR.s=null;if(s.cp)noClk=Date.now()+450;if(!s.on)return;
const z=DR.z?DR.z.dataset.z:null;dgOff(s);noClk=Date.now()+450;if(drop&&z)dgDrop(s,z);$('#sh').classList.remove('dgh')}
function dkCopy(s){if(DR.s!==s||s.mv0||!s.cid)return;const c=B.c.find(x=>x.id==s.cid);if(!c)return;const n=B.c.filter(x=>x.id==c.id).length;if(n>=3)return;
addC(c);if(B.c.filter(x=>x.id==c.id).length<=n)return;s.cp=(s.cp||0)+1;if(s.on)dgOff(s);if(navigator.vibrate)navigator.vibrate(20);toast((n+1)+' cópias no deck')}
function dgDrop(s,z){if(s.k=='col'){if(z=='bdeck')addC(B.col[s.id]);return}
if(s.k=='dk'){if(z=='bcol'&&B.c[s.id])rmId(B.c[s.id].id);return}
const[a,k]=z.split('|');if(k)dropCard(s.id,+a,k)}
function dropCard(u,p,k){const f=find(u);if(!f)return;const c=f.c;
if(PZ.includes(k)){if(f.z==k&&!f.par)return;if(k=='extra'&&!isEx(c))return toast('Só cartas do Deck Adicional');if(k=='deck'&&isEx(c))return toast('Carta do Deck Adicional não vai ao deck');return mv(u,p,k,k=='deck'?{top:1}:{})}
if(f.p==p&&f.z==k&&!f.par)return;
place(u,p,k,PZ.includes(f.z)||f.par?{fd:0,df:0}:{fd:c.fd,df:c.df})}
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-drag]');if(!t||DR.s||(e.pointerType=='mouse'&&e.button))return;
const k=t.dataset.drag,touch=e.pointerType!='mouse',s=DR.s={t,k,id:t.dataset.id,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,on:0,touch,pid:e.pointerId};
if(k=='dk'){const cd=B.c[s.id];s.cid=cd&&cd.id;s.c1=setTimeout(()=>dkCopy(s),650);s.c2=setTimeout(()=>dkCopy(s),1250)}
if(touch&&(k=='col'||k=='dk'||k=='p'))s.tm=setTimeout(dgBegin,300)});
document.addEventListener('pointermove',e=>{const s=DR.s;if(!s||e.pointerId!=s.pid||s.cp)return;s.lx=e.clientX;s.ly=e.clientY;
const dx=e.clientX-s.x,dy=e.clientY-s.y,d=Math.hypot(dx,dy);
if(!s.on){if(s.tm){if(d>10){dgClr(s);DR.s=null}return}
if(d<(s.touch?10:6))return;if(s.touch&&s.k=='h'&&Math.abs(dx)>Math.abs(dy))return;
s.mv0=1;clearTimeout(s.c1);clearTimeout(s.c2);dgBegin();if(!DR.s)return}
else if(d>10&&!s.mv0){s.mv0=1;clearTimeout(s.c1);clearTimeout(s.c2)}
e.preventDefault();dgPos(e.clientX,e.clientY)});
document.addEventListener('pointerup',e=>{if(DR.s&&e.pointerId==DR.s.pid)dgEnd(1)});
document.addEventListener('pointercancel',e=>{if(DR.s&&e.pointerId==DR.s.pid)dgEnd(0)});
document.addEventListener('touchmove',e=>{if(DR.s&&DR.s.on)e.preventDefault()},{passive:false});
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-drag]'))e.preventDefault()});
addEventListener('click',e=>{if(Date.now()<noClk){e.stopPropagation();e.preventDefault()}},true);
/* ---------- aba de cartas móvel (sobe/desce) ---------- */
function initResize(){const dv=$('#dvb');if(!dv)return;dv.onpointerdown=e=>{if(e.target.closest('button'))return;const bl=$('#bld');
const y0=e.clientY,h0=$('#dk').offsetHeight,mx=h0+$('#cl').offsetHeight-70;dv.setPointerCapture(e.pointerId);
dv.onpointermove=ev=>{const h=Math.round(Math.max(56,Math.min(mx,h0+ev.clientY-y0)));B.dkh=h;bl.style.setProperty('--dkh',h+'px')};
dv.onpointerup=dv.onpointercancel=()=>{dv.onpointermove=dv.onpointerup=dv.onpointercancel=null;if(B.dkh)SV('dkh',B.dkh)}}}
/* ---------- criar cartas (estilo DuelingBook) ---------- */
const CTY=[['normal','Monstro Normal'],['effect','Monstro de Efeito'],['ritual','Monstro Ritual'],['fusion','Monstro de Fusão'],['synchro','Monstro Sincro'],['xyz','Monstro Xyz'],['link','Monstro Link'],['spell','Carta de Magia'],['trap','Carta de Armadilha']],
CATT=['DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'],CATN={DARK:'Trevas',LIGHT:'Luz',EARTH:'Terra',WATER:'Água',FIRE:'Fogo',WIND:'Vento',DIVINE:'Divino'},
CRACE=[['Aqua','Aqua'],['Beast','Fera'],['Beast-Warrior','Fera-Guerreira'],['Cyberse','Cyberso'],['Dinosaur','Dinossauro'],['Divine-Beast','Fera Divina'],['Dragon','Dragão'],['Fairy','Fada'],['Fiend','Demônio'],['Fish','Peixe'],['Illusion','Ilusão'],['Insect','Inseto'],['Machine','Máquina'],['Plant','Planta'],['Psychic','Psíquico'],['Pyro','Piro'],['Reptile','Réptil'],['Rock','Rocha'],['Sea Serpent','Serpente Marinha'],['Spellcaster','Mago'],['Thunder','Trovão'],['Warrior','Guerreiro'],['Winged Beast','Besta Alada'],['Wyrm','Wyrm'],['Zombie','Zumbi']],RN=Object.fromEntries(CRACE),
FC={normal:'#d8b45c',effect:'#c4672e',ritual:'#4a76b8',fusion:'#8250a8',synchro:'#e9e7e0',xyz:'#2b2b2b',link:'#1d5f9e',spell:'#1f9c77',trap:'#b4477f'},
AC={DARK:'#6b3fa0',LIGHT:'#e9c53a',EARTH:'#8a5a2b',WATER:'#2f7fd0',FIRE:'#d9452b',WIND:'#3aa65a',DIVINE:'#c9a227'},AI={DARK:'TR',LIGHT:'LZ',EARTH:'TE',WATER:'AG',FIRE:'FG',WIND:'VT',DIVINE:'DV'};
let CF={},CC={};
const cdef=()=>({idx:null,n:'',ty:'effect',pen:0,tun:0,att:'DARK',rc:'Dragon',lv:4,sc:4,atk:'0',def:'0',lk:[],sub:'Normal',tx:'',px:'',zoom:1,ox:0,oy:0});
const mixC=(h,a)=>{const n=parseInt(h.slice(1),16),f=v=>Math.round(a>0?v+(255-v)*a:v*(1+a));return'rgb('+[n>>16&255,n>>8&255,n&255].map(f).join(',')+')'};
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wrapT(x,t,w){const out=[];String(t).split('\n').forEach(p=>{let l='';p.split(' ').forEach(wd=>{const n=l?l+' '+wd:wd;if(x.measureText(n).width>w&&l){out.push(l);l=wd}else l=n});out.push(l)});return out}
function fitText(x,t,bx,by,bw,bh,max,min,col){for(let s=max;s>=min;s--){x.font=s+'px Arial,sans-serif';const L=wrapT(x,t,bw),lh=s*1.18;if(L.length*lh<=bh||s==min){x.fillStyle=col;L.forEach((l,i)=>x.fillText(l,bx,by+s+i*lh));return}}}
function typeLine(F){const p=[RN[F.rc]||F.rc],m={fusion:'Fusão',synchro:'Sincro',xyz:'Xyz',link:'Link',ritual:'Ritual'}[F.ty];if(F.pen&&F.ty!='link')p.push('Pêndulo');if(m)p.push(m);if(F.tun)p.push('Tuner');p.push(F.ty=='normal'?'Normal':'Efeito');return p.filter(Boolean).join('/')}
function cType(F){if(F.ty=='spell')return'Spell Card';if(F.ty=='trap')return'Trap Card';const p=F.pen,t=F.tun;
switch(F.ty){case'normal':return p?'Pendulum Normal Monster':t?'Normal Tuner Monster':'Normal Monster';case'effect':return p?(t?'Pendulum Tuner Effect Monster':'Pendulum Effect Monster'):t?'Tuner Monster':'Effect Monster';case'ritual':return p?'Pendulum Effect Ritual Monster':'Ritual Effect Monster';case'fusion':return p?'Pendulum Effect Fusion Monster':'Fusion Monster';case'synchro':return p?'Synchro Pendulum Effect Monster':t?'Synchro Tuner Monster':'Synchro Monster';case'xyz':return p?'XYZ Pendulum Effect Monster':'XYZ Monster';default:return'Link Monster'}}
function drawCard(cv,F,im){const k=.75,W=421,H=614;cv.width=Math.round(W*k);cv.height=Math.round(H*k);const x=cv.getContext('2d');x.scale(k,k);
const sp=F.ty=='spell'||F.ty=='trap',lk=F.ty=='link',pen=!sp&&!lk&&!!F.pen,col=FC[F.ty],white=sp||F.ty=='xyz'||lk;
x.fillStyle='#16120e';rr(x,0,0,W,H,18);x.fill();
const g=x.createLinearGradient(0,0,0,H);
if(pen){g.addColorStop(0,col);g.addColorStop(.5,col);g.addColorStop(.6,FC.spell);g.addColorStop(1,mixC(FC.spell,-.2))}else{g.addColorStop(0,mixC(col,.12));g.addColorStop(1,mixC(col,-.2))}
x.fillStyle=g;rr(x,10,10,W-20,H-20,10);x.fill();
x.textBaseline='alphabetic';x.textAlign='left';let s=34;const nm=F.n||'Nome da carta';
for(;s>16;s--){x.font='bold '+s+'px Georgia,"Times New Roman",serif';if(x.measureText(nm).width<=300)break}
x.fillStyle=white?'#fff':'#111';x.fillText(nm,30,62);
const ac=sp?FC[F.ty]:AC[F.att]||'#555',at=sp?(F.ty=='spell'?'MG':'AR'):AI[F.att]||'';
x.fillStyle=mixC(ac,-.3);x.beginPath();x.arc(368,46,26,0,7);x.fill();x.fillStyle=ac;x.beginPath();x.arc(368,46,22,0,7);x.fill();
x.fillStyle='#fff';x.font='bold 19px Arial,sans-serif';x.textAlign='center';x.fillText(at,368,53);x.textAlign='left';
if(sp){const st=SPT[F.ty=='spell'?'sp':'tr'].find(z=>z[0]==F.sub);x.font='bold 21px Arial,sans-serif';x.fillStyle='#fff';x.textAlign='right';x.fillText('['+(F.ty=='spell'?'Magia':'Armadilha')+(st&&F.sub!='Normal'?' '+st[1]:'')+']',391,108);x.textAlign='left'}
else if(!lk){const n=+F.lv||0,xy=F.ty=='xyz';for(let i=0;i<n;i++){const cx=xy?42+i*25:379-i*25;x.fillStyle=xy?'#f4c542':'#d9582a';x.beginPath();x.arc(cx,100,11,0,7);x.fill();x.fillStyle=xy?'#111':'#fff';x.font='13px Arial,sans-serif';x.textAlign='center';x.fillText('★',cx,105);x.textAlign='left'}}
const ax=pen?30:52,ay=pen?116:120,aw=pen?361:317,ah=pen?300:317;
x.save();rr(x,ax,ay,aw,ah,2);x.clip();
if(im&&im.width){const q=Math.max(aw/im.width,ah/im.height)*(F.zoom||1),dw=im.width*q,dh=im.height*q;x.drawImage(im,ax+(aw-dw)/2+(F.ox||0)*(dw-aw)/2,ay+(ah-dh)/2+(F.oy||0)*(dh-ah)/2,dw,dh)}
else{const q=x.createLinearGradient(ax,ay,ax+aw,ay+ah);q.addColorStop(0,'#2a2f45');q.addColorStop(1,'#12151f');x.fillStyle=q;x.fillRect(ax,ay,aw,ah);x.fillStyle='rgba(255,255,255,.35)';x.font='bold 90px Arial,sans-serif';x.textAlign='center';x.fillText('?',ax+aw/2,ay+ah/2+30);x.textAlign='left'}
x.restore();x.strokeStyle='#8c7a45';x.lineWidth=3;rr(x,ax,ay,aw,ah,2);x.stroke();
if(lk){const cx=ax+aw/2,cy=ay+ah/2,P={t:[[cx-16,ay],[cx+16,ay],[cx,ay-15]],b:[[cx-16,ay+ah],[cx+16,ay+ah],[cx,ay+ah+15]],l:[[ax,cy-16],[ax,cy+16],[ax-15,cy]],r:[[ax+aw,cy-16],[ax+aw,cy+16],[ax+aw+15,cy]],tl:[[ax-15,ay-15],[ax+17,ay-2],[ax-2,ay+17]],tr:[[ax+aw+15,ay-15],[ax+aw-17,ay-2],[ax+aw+2,ay+17]],bl:[[ax-15,ay+ah+15],[ax+17,ay+ah+2],[ax-2,ay+ah-17]],br:[[ax+aw+15,ay+ah+15],[ax+aw-17,ay+ah+2],[ax+aw+2,ay+ah-17]]};
(F.lk||[]).forEach(id=>{const p=P[id];if(!p)return;x.fillStyle='#ff8a1f';x.strokeStyle='#5a2a00';x.lineWidth=2;x.beginPath();x.moveTo(p[0][0],p[0][1]);x.lineTo(p[1][0],p[1][1]);x.lineTo(p[2][0],p[2][1]);x.closePath();x.fill();x.stroke()})}
if(pen){x.fillStyle='#2a5fd6';x.fillRect(30,316,34,100);x.fillStyle='#d6402a';x.fillRect(357,316,34,100);x.fillStyle='#fff';x.font='bold 24px Arial,sans-serif';x.textAlign='center';x.fillText(String(F.sc),47,346);x.fillText(String(F.sc),374,346);x.textAlign='left';
x.fillStyle='rgba(250,245,230,.92)';x.fillRect(64,336,293,80);x.save();x.beginPath();x.rect(64,336,293,80);x.clip();fitText(x,F.px||'',70,340,281,72,16,9,'#111');x.restore()}
const by=452,bh=122;x.fillStyle=mixC(F.ty=='xyz'?'#888888':col,.55);x.fillRect(30,by,361,bh);x.strokeStyle='#6d5a2a';x.lineWidth=2;x.strokeRect(30,by,361,bh);
x.save();x.beginPath();x.rect(30,by,361,bh);x.clip();let t0=by+4;
if(!sp){x.font='bold 18px Arial,sans-serif';x.fillStyle='#111';x.fillText('['+typeLine(F)+']',36,by+22);t0=by+28}
fitText(x,F.tx||'',36,t0,349,by+bh-t0-4,17,9,'#111');x.restore();
if(!sp){x.font='bold 22px Arial,sans-serif';x.fillStyle=white?'#fff':'#111';x.textAlign='right';const a=F.atk===''||F.atk==null?'?':F.atk;let t='ATK/ '+a;if(lk)t+='   LINK-'+(F.lk||[]).length;else t+='   DEF/ '+(F.def===''||F.def==null?'?':F.def);x.fillText(t,391,598);x.textAlign='left'}}
function cDraw(){const cv=$('#cv');if(cv)drawCard(cv,CF,CC.im)}
function cstView(i){const L=ST('custom')||[];CF=cdef();CC={};
if(i!=null&&L[i]&&L[i].src){CF=Object.assign(cdef(),L[i].src,{idx:i});CC.art=L[i].art||'';if(CC.art){CC.im=new Image();CC.im.onload=cDraw;CC.im.src=CC.art}}
$('#cst').innerHTML=`<h2>${CF.idx!=null?'Editar carta':'Criar carta'}</h2><canvas id="cv"></canvas><div class="cf" id="cform"></div><div class="bt"><button onclick="saveCust()">Salvar carta</button><button onclick="show('menu')">Voltar</button></div><h3>Minhas cartas (toque para editar)</h3><div class="gr big">${L.map((c,j)=>`<div class="hc" onclick="cstSheet(${j})">${cardEl(c,0)}</div>`).join('')||'<p>Elas aparecem na busca do deck.</p>'}</div>`;cForm();cDraw();show('cst')}
function cForm(){const F=CF,sp=F.ty=='spell'||F.ty=='trap',lk=F.ty=='link',mon=!sp,
o=(v,l,s)=>`<option value="${esc(v)}" ${s?'selected':''}>${esc(l)}</option>`,
sel=(k,opts,cur)=>`<select onchange="cs('${k}',this.value)">${opts.map(a=>o(a[0],a[1],a[0]==cur)).join('')}</select>`,
nums=(a,b)=>Array.from({length:b-a+1},(_,i)=>[a+i,a+i]),
AR=[['tl','↖'],['t','↑'],['tr','↗'],['l','←'],['','·'],['r','→'],['bl','↙'],['b','↓'],['br','↘']];
$('#cform').innerHTML=`<p>Nome</p><input value="${esc(F.n)}" maxlength="40" oninput="cf('n',this)">
<p>Tipo de carta</p>${sel('ty',CTY,F.ty)}
${mon&&!lk?`<div class="bh"><label><input type="checkbox" ${F.pen?'checked':''} onchange="cs('pen',this.checked?1:0)"> Pêndulo</label>${['normal','effect','synchro'].includes(F.ty)?`<label><input type="checkbox" ${F.tun?'checked':''} onchange="cs('tun',this.checked?1:0)"> Tuner</label>`:''}</div>`:''}
${mon?`<p>Atributo</p>${sel('att',CATT.map(a=>[a,CATN[a]]),F.att)}<p>Tipo do monstro</p>${sel('rc',CRACE,F.rc)}`:`<p>Tipo de ${F.ty=='spell'?'magia':'armadilha'}</p>${sel('sub',SPT[F.ty=='spell'?'sp':'tr'],F.sub)}`}
${mon&&!lk?`<p>${F.ty=='xyz'?'Rank':'Nível'}</p>${sel('lv',nums(1,13),F.lv)}`:''}
${lk?`<p>Setas Link (Link ${F.lk.length})</p><div class="lkg">${AR.map(a=>a[0]?`<button class="${F.lk.includes(a[0])?'on':''}" onclick="cs('lk','${a[0]}')">${a[1]}</button>`:'<span></span>').join('')}</div>`:''}
${mon&&!lk&&F.pen?`<p>Escala de Pêndulo</p>${sel('sc',nums(0,13),F.sc)}`:''}
${mon?`<div class="bh"><div><p>ATK</p><input value="${esc(F.atk)}" maxlength="5" oninput="cf('atk',this)"></div>${lk?'':`<div><p>DEF</p><input value="${esc(F.def)}" maxlength="5" oninput="cf('def',this)"></div>`}</div>`:''}
${mon&&!lk&&F.pen?`<p>Efeito de Pêndulo</p><textarea rows="3" oninput="cf('px',this)">${esc(F.px)}</textarea>`:''}
<p>${mon?(F.ty=='normal'?'Texto da carta':'Efeito de monstro'):'Efeito'}</p><textarea rows="5" oninput="cf('tx',this)">${esc(F.tx)}</textarea>
<label class="fl">Imagem da carta<input type="file" accept="image/*" onchange="pickImg(this)"></label>
${CC.im?`<p>Zoom</p><input type="range" min="1" max="3" step="0.05" value="${F.zoom}" oninput="cf('zoom',this,1)"><p>Posição horizontal</p><input type="range" min="-1" max="1" step="0.05" value="${F.ox}" oninput="cf('ox',this,1)"><p>Posição vertical</p><input type="range" min="-1" max="1" step="0.05" value="${F.oy}" oninput="cf('oy',this,1)">`:''}`}
function cs(k,v){if(k=='lk'){const a=CF.lk,i=a.indexOf(v);i<0?a.push(v):a.splice(i,1)}else if(k=='lv'||k=='sc')CF[k]=+v;else CF[k]=v;
if(k=='ty'){if(v=='link')CF.pen=0;if(v=='spell'||v=='trap')CF.sub='Normal';if(!['normal','effect','synchro'].includes(v))CF.tun=0}
if(['ty','pen','tun','lk'].includes(k))cForm();cDraw()}
function cf(k,el,num){CF[k]=num?+el.value:el.value;cDraw()}
function pickImg(inp){const f=inp.files[0];if(!f)return;const im=new Image();im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);CC.art=cv.toDataURL('image/jpeg',.85);const a=new Image();a.onload=()=>{CC.im=a;CF.zoom=1;CF.ox=0;CF.oy=0;cForm();cDraw()};a.src=CC.art};im.src=URL.createObjectURL(f)}
function saveCust(){const F=CF,n=F.n.trim();if(!n)return toast('Dê um nome');const sp=F.ty=='spell'||F.ty=='trap',lk=F.ty=='link',mon=!sp,pen=mon&&!lk&&!!F.pen,v=z=>z===''||z==null?null:(z=='?'?'?':(isNaN(+z)?null:+z));
const cv=document.createElement('canvas');drawCard(cv,F,CC.im);const img=cv.toDataURL('image/jpeg',.8);
const L=ST('custom')||[],old=F.idx!=null?L[F.idx]:null,desc=pen?'[ Efeito de Pêndulo ]\n'+F.px+'\n----------------------------------------\n[ '+(F.ty=='normal'?'Texto':'Efeito de Monstro')+' ]\n'+F.tx:F.tx;
const c={id:old?old.id:'c'+Date.now(),custom:1,name:n,type:cType(F),attr:mon?F.att:'',lvl:lk?F.lk.length:mon?+F.lv:null,atk:mon?v(F.atk):null,def:mon&&!lk?v(F.def):null,rc:mon?F.rc:F.sub,sc:pen?+F.sc:undefined,desc,img,art:CC.art||'',src:Object.assign({},F,{idx:null})};
if(old)L[F.idx]=c;else L.push(c);if(SV('custom',L)){toast('Carta salva');cstView()}}
function cstSheet(i){const c=(ST('custom')||[])[i];if(c)sheet(det(c)+`<div class="bt">${c.src?`<button onclick="closeSh();cstView(${i})">Editar</button>`:''}<button onclick="delCust(${i})">Apagar</button></div>`)}
function delCust(i){if(!confirm('Apagar carta?'))return;const L=ST('custom');L.splice(i,1);SV('custom',L);closeSh();cstView()}
/* ---------- banlist (símbolos 0 / 1 / 2) ---------- */
const BLN={tcg:'TCG',ocg:'OCG',md:'Master Duel'};let MD=null;
const bl=()=>ST('bl')||'tcg';
function banOf(c){if(c.custom)return -1;const l=bl(),n=l=='md'?(MD&&MD[String(c.name).toLowerCase()]):(BAN[c.id]||{})[l=='tcg'?'t':'o'];return /^(Banned|Forbidden)/i.test(n||'')?0:/^Limited/i.test(n||'')?1:/^Semi/i.test(n||'')?2:-1}
const banB=c=>{const b=banOf(c);return b<0?'':`<span class="bn b${b}">${b}</span>`};
function setBl(v){SV('bl',v);if(v=='md')loadMD();if(B&&$('#dk')){renderDeck();renderCol(0)}}
async function loadMD(){const C=ST('mdban');if(C&&Date.now()-C.t<432e5){MD=C.m;return}
try{const m={};for(const s of['Forbidden','Limited','Semi-Limited']){const r=await fetch('https://www.masterduelmeta.com/api/v1/cards?banStatus='+s+'&fields=name&limit=500');if(!r.ok)throw 0;const j=await r.json();(Array.isArray(j)?j:j.data||[]).forEach(c=>{if(c&&c.name)m[c.name.toLowerCase()]=s})}
if(!Object.keys(m).length)throw 0;MD=m;SV('mdban',{t:Date.now(),m})}catch(e){MD=C?C.m:null;toast(MD?'Master Duel: usando a última lista salva':'Lista do Master Duel indisponível agora')}
if(B&&$('#dk')){renderDeck();renderCol(0)}}
async function refreshBan(cs){const ids=[...new Set(cs.filter(c=>!c.custom&&/^\d+$/.test(c.id)).map(c=>c.id))];if(!ids.length)return;
try{for(let i=0;i<ids.length;i+=40){const r=await fetch(API+'?id='+ids.slice(i,i+40).join(','));if(r.ok)(await r.json()).data.forEach(norm)}}catch(e){return}
if(B&&$('#dk'))renderDeck()}
