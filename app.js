'use strict';
const $=s=>document.querySelector(s),ST=k=>JSON.parse(localStorage.getItem(k)||'null'),SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return 1}catch(e){toast('Sem espaço para salvar');return 0}};
const API='https://db.ygoprodeck.com/api/v7/cardinfo.php',CARDS={},PZ=['deck','extra','gy','ban','hand'],PH=['DP','SP','M1','BP','M2','EP'],NM={deck:'Deck',extra:'Extra Deck',gy:'Cemitério',ban:'Banidas'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=c=>({id:c.id,name:c.name,type:c.type,atk:c.atk,def:c.def,lvl:c.level,attr:c.attribute,desc:c.desc,scale:c.scale,img:c.card_images&&c.card_images[0].image_url_small});
const isEx=c=>/Fusion|Synchro|XYZ|Link/i.test(c.type||''),isMon=c=>/Monster/i.test(c.type||'');
const kind=c=>/Spell/i.test(c.type)?'sp':/Trap/i.test(c.type)?'tr':/Fusion/i.test(c.type)?'fu':/Synchro/i.test(c.type)?'sy':/XYZ/i.test(c.type)?'xy':/Link/i.test(c.type)?'li':/Effect|Pendulum/i.test(c.type)?'ef':'no';
const frame=c=>`<div class="cd fr ${kind(c)}"><b>${esc(c.name)}</b><small>${isMon(c)?esc(c.atk)+'/'+esc(c.def):''}</small></div>`;
function cardEl(c,fd){if(fd)return'<div class="cd back"></div>';CARDS[c.id]=c;return c.img?`<img class="cd" data-id="${esc(c.id)}" src="${esc(c.img)}">`:frame(c)}
addEventListener('error',e=>{const t=e.target;if(t.tagName=='IMG'&&t.dataset.id&&CARDS[t.dataset.id]){const d=document.createElement('div');d.innerHTML=frame(CARDS[t.dataset.id]);t.replaceWith(d.firstChild)}},true);
let tt;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),1800)}
function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('on',s.id==id))}
function sheet(h){$('#sh').innerHTML='<div class="bk" onclick="closeSh()"></div><div class="pn">'+h+'</div>';$('#sh').classList.add('on')}
function closeSh(){$('#sh').classList.remove('on')}
const det=(c,hide)=>hide?`<div class="det"><div class="bg">${cardEl(c,1)}</div><div><b>Carta virada</b></div></div>`:`<div class="det"><div class="bg">${cardEl(c,0)}</div><div><b>${esc(c.name)}</b><p class="mt">${esc(c.type||'')}${c.attr?', '+esc(c.attr):''}${c.lvl?', Nv '+c.lvl:''}${c.scale!=null?', Escala '+c.scale:''}${isMon(c)&&c.atk!=null?', ATK '+c.atk+' / DEF '+c.def:''}</p><p class="tx">${esc(c.desc||'')}</p></div></div>`;
/* ---------- banco de cartas (YGOPRODeck, sempre atualizado) ---------- */
async function search(q,sd){const r=await fetch(API+'?fname='+encodeURIComponent(q)+(sd?'&format=speed%20duel':'')+'&num=40&offset=0');return r.ok?(await r.json()).data.map(norm):[]}
/* ---------- decks ---------- */
let B;
const T_MON='Effect Monster,Normal Monster,Flip Effect Monster,Flip Tuner Effect Monster,Gemini Monster,Normal Tuner Monster,Pendulum Effect Monster,Pendulum Flip Effect Monster,Pendulum Normal Monster,Pendulum Tuner Effect Monster,Ritual Effect Monster,Ritual Monster,Spirit Monster,Toon Monster,Tuner Monster,Union Effect Monster',
T_EX='Fusion Monster,Link Monster,Pendulum Effect Fusion Monster,Synchro Monster,Synchro Pendulum Effect Monster,Synchro Tuner Monster,XYZ Monster,XYZ Pendulum Effect Monster',
TYF={mon:T_MON,sp:'Spell Card',tr:'Trap Card',ex:T_EX},TN={fav:'Favoritos',mon:'Monstros',sp:'Magias',tr:'Armadilhas',ex:'Deck Adicional'},SORTS=[['name','Nome'],['new','Mais novas'],['atk','ATK'],['def','DEF'],['level','Nível'],['type','Tipo']];
const ord=c=>({no:0,ef:1,fu:2,sy:3,xy:4,li:5,sp:6,tr:7})[kind(c)],lvb=c=>isMon(c)&&c.lvl?`<span class="lv">${/Link/i.test(c.type)?'L':'★'}${c.lvl}</span>`:'';
const sortDeck=()=>B.c.sort((a,b)=>ord(a)-ord(b)||(b.lvl||0)-(a.lvl||0)||String(a.name).localeCompare(b.name));
function decksView(){const D=ST('decks')||[];$('#decks').innerHTML=`<h2>Meus decks</h2>${D.map((d,i)=>`<div class="row"><b>${d.star?'★ ':''}${esc(d.n)}</b><span>${d.c.length}</span><button onclick="editDeck(${i})">Editar</button><button onclick="delDeck(${i})">Apagar</button></div>`).join('')||'<p>Nenhum deck ainda.</p>'}<div class="bt"><button onclick="editDeck(-1)">Novo deck</button><button onclick="show('menu')">Voltar</button></div>`;show('decks')}
function delDeck(i){if(!confirm('Apagar deck?'))return;const D=ST('decks');D.splice(i,1);SV('decks',D);decksView()}
function editDeck(i){const D=ST('decks')||[];B=Object.assign({i,n:'',c:[],t:'',q:'',sd:0,staple:0,attr:'',lv:'',sort:'name',col:[],off:0,end:0,busy:0,rid:0,exp:0,big:0,lock:0,star:0},i<0?{}:{n:D[i].n,c:D[i].c.slice(),star:D[i].star||0});sortDeck();show('bld');reload()}
function reload(){B.col=[];B.off=0;B.end=0;B.busy=0;B.rid++;bldView();loadMore()}
function bldView(){const fl=[B.sd&&'Speed Duel',B.attr,B.lv&&'Nv '+B.lv,B.staple&&'Populares',B.q&&'"'+B.q+'"',B.t&&TN[B.t]].filter(Boolean).join(', ')||'Desl.',sn=SORTS.find(s=>s[0]==B.sort)[1],ch=(t,l)=>`<button class="${B.t==t?'on':''}" onclick="setT('${t}')">${l}</button>`;
$('#bld').className='scr on'+(B.exp?' x':'');
$('#bld').innerHTML=`<div class="dh"><div class="nm"><span>✎</span><input value="${esc(B.n)}" placeholder="Nome do deck" oninput="B.n=this.value"></div><button onclick="menuSheet()">MENU</button></div>
<div class="dh2"><div class="cnt"><div>Deck Principal <b id="cm"></b></div><div>Deck Adicional <b id="ce"></b></div></div><div class="st" id="stt"></div><button class="sq" onclick="rulesSheet()">i</button></div>
<div class="dh3"><button class="sq rd" onclick="clearDeck()">🗑</button><button onclick="autoDeck()">Automontar deck</button><button onclick="cfgSheet()">Configurações de Deck</button><button class="sq gn" onclick="B.lock^=1;toast(B.lock?'Deck travado':'Deck liberado');bldView()">${B.lock?'🔒':'🔓'}</button><button class="sq gn" onclick="B.star^=1;bldView()">${B.star?'★':'☆'}</button></div>
<div class="dkp" id="dk"></div>
<div class="dv"><button class="sq" onclick="togX(this)">${B.exp?'▼':'▲'}</button><div>Ordenar por: ${sn}<br>Filtro: ${esc(fl)}</div><div class="grip"></div></div>
<div class="chips fx">${ch('fav','★ Cards favoritos')}${ch('mon','Monstros')}${ch('sp','Magias')}${ch('tr','Armadilha')}${ch('ex','Deck Adicional')}</div>
<div class="chips fx"><button onclick="fltSheet()">Filtro</button><button class="${B.staple?'on':''}" onclick="B.staple^=1;reload()">Cards populares</button><button onclick="txtSheet()">Busca por texto</button><button class="sq" onclick="clrF()">🗑</button></div>
<div class="chips fx"><select onchange="B.sort=this.value;reload()">${SORTS.map(s=>`<option value="${s[0]}" ${s[0]==B.sort?'selected':''}>Ordenar por: ${s[1]}</option>`).join('')}</select><button class="sq" onclick="B.big^=1;renderCol(0)">▢</button></div>
<div class="clp" id="cl" onscroll="colScroll(this)"></div>
<div class="bb"><button class="sq" onclick="decksView()">←</button><button onclick="saveDeck()">SALVAR</button><button onclick="copyDeck()">Copiar Deck</button><button class="sq" onclick="show('menu')">⌂</button></div>`;renderDeck();renderCol(0)}
function togX(b){B.exp^=1;$('#dk').style.height='';$('#dk').style.flex='';$('#bld').classList.toggle('x',!!B.exp);b.textContent=B.exp?'▼':'▲'}
function setT(t){B.t=B.t==t?'':t;reload()}
function clrF(){Object.assign(B,{t:'',q:'',sd:0,staple:0,attr:'',lv:''});reload()}
function renderDeck(){const m=B.c.filter(c=>!isEx(c)),e=B.c.filter(isEx),sl=(c)=>`<div class="sl" data-id="${esc(c.id)}" onclick="dkSheet(${B.c.indexOf(c)})">${cardEl(c,0)}${lvb(c)}</div>`,es=n=>`<div class="es">${n}</div>`;
let h=m.map(sl).join('');for(let i=m.length;i<Math.min(30,Math.max(24,Math.ceil(m.length/6)*6));i++)h+=es(i+1);
h+='<div class="xh">Deck Adicional</div>'+e.map(sl).join('');for(let i=e.length;i<6;i++)h+=es(i+1);
$('#dk').innerHTML=h;$('#cm').textContent=m.length;$('#cm').style.color=m.length<20||m.length>30?'#ff7070':'#fff';$('#ce').textContent=e.length;
$('#stt').textContent=m.length<20?'Faltam '+(20-m.length)+' cartas no deck principal':m.length>30?'Deck principal passa de 30':e.length>6?'Deck adicional passa de 6':'Deck válido para Speed Duel'}
const custom=()=>(ST('custom')||[]).filter(c=>(!B.q||c.name.toLowerCase().includes(B.q.toLowerCase()))&&({'':1,mon:isMon(c)&&!isEx(c),sp:/Spell/.test(c.type),tr:/Trap/.test(c.type),ex:isEx(c)})[B.t]);
async function loadMore(){if(B.busy||B.end)return;B.busy=1;const rid=B.rid,from=B.col.length;
try{let data=[];
if(B.t=='fav'){const f=ST('fav')||[];B.end=1;if(f.length){const r=await fetch(API+'?id='+f.join(','));if(r.ok)data=(await r.json()).data.map(norm)}}
else{if(B.off==0)data=custom();let u=API+'?num=60&offset='+B.off+'&sort='+B.sort;if(B.t)u+='&type='+encodeURIComponent(TYF[B.t]);if(B.q)u+='&fname='+encodeURIComponent(B.q);if(B.sd)u+='&format=speed%20duel';if(B.staple)u+='&staple=yes';if(B.attr)u+='&attribute='+B.attr;if(B.lv)u+='&level='+B.lv;
const r=await fetch(u);if(r.ok){const d=(await r.json()).data;data=data.concat(d.map(norm));B.off+=60;if(d.length<60)B.end=1}else B.end=1}
if(rid!=B.rid)return;B.col=B.col.concat(data)}catch(e){toast('Sem conexão');B.end=1}
B.busy=0;renderCol(from)}
function colScroll(el){if(el.scrollTop+el.clientHeight>el.scrollHeight-400)loadMore()}
function renderCol(from){const el=$('#cl');if(!el)return;const s=el.scrollTop;el.className='clp'+(B.big?' b3':'');
const h=(c,i)=>{const n=B.c.filter(x=>x.id==c.id).length;return`<div class="ci" data-i="${i}" onclick="colSheet(${i})">${cardEl(c,0)}${lvb(c)}${n?`<span class="cn">${n}</span>`:''}</div>`};
if(from>0)el.insertAdjacentHTML('beforeend',B.col.slice(from).map((c,j)=>h(c,from+j)).join(''));else{el.innerHTML=B.col.map(h).join('')||`<p>${B.end?'Nenhuma carta encontrada.':'Carregando...'}</p>`;el.scrollTop=s}}
function addC(c){if(B.lock)return toast('Deck travado');if(B.c.filter(x=>x.id==c.id).length>=3)return toast('Máximo 3 cópias');const ex=isEx(c);if(ex?B.c.filter(isEx).length>=6:B.c.filter(x=>!isEx(x)).length>=30)return toast(ex?'Deck adicional cheio (6)':'Deck principal cheio (30)');B.c.push(c);sortDeck();renderDeck();renderCol(0)}
function rmId(id){if(B.lock)return toast('Deck travado');const i=B.c.map(x=>x.id).lastIndexOf(id);if(i>=0){B.c.splice(i,1);renderDeck();renderCol(0)}}
function colSheet(i){const c=B.col[i],n=B.c.filter(x=>x.id==c.id).length,f=(ST('fav')||[]).includes(c.id);sheet(det(c)+`<div class="bt"><button onclick="addC(B.col[${i}]);colSheet(${i})">Adicionar (${n}/3)</button><button onclick="rmId(B.col[${i}].id);colSheet(${i})">Remover</button><button onclick="favT(B.col[${i}].id);colSheet(${i})">${f?'★ Favorito':'☆ Favoritar'}</button></div>`)}
function dkSheet(i){const c=B.c[i];if(!c)return;sheet(det(c)+`<div class="bt"><button onclick="closeSh()">Fechar</button><button onclick="rmId(B.c[${i}].id);closeSh()">Remover do deck</button></div>`)}
function favT(id){let f=ST('fav')||[];f=f.includes(id)?f.filter(x=>x!=id):f.concat(id);SV('fav',f)}
function autoDeck(){if(B.lock)return toast('Deck travado');shuf(B.col.slice()).forEach(c=>{if(!isEx(c)&&B.c.filter(x=>!isEx(x)).length<20&&B.c.filter(x=>x.id==c.id).length<3)B.c.push(c)});sortDeck();renderDeck();renderCol(0)}
function clearDeck(){if(B.lock)return toast('Deck travado');if(confirm('Remover todas as cartas?')){B.c=[];renderDeck();renderCol(0)}}
function saveDeck(){const D=ST('decks')||[],d={n:B.n||'Deck',c:B.c,star:B.star};if(B.i<0){D.push(d);B.i=D.length-1}else D[B.i]=d;if(SV('decks',D))toast('Deck salvo')}
function copyDeck(){const ok=c=>/^\d+$/.test(c.id),t='#created by Duel\n#main\n'+B.c.filter(c=>!isEx(c)&&ok(c)).map(c=>c.id).join('\n')+'\n#extra\n'+B.c.filter(c=>isEx(c)&&ok(c)).map(c=>c.id).join('\n')+'\n!side\n';navigator.clipboard.writeText(t).then(()=>toast('Deck copiado (.ydk)'),()=>toast('Não foi possível copiar'))}
function menuSheet(){sheet('<h3>Menu</h3><div class="bt"><button onclick="saveDeck();closeSh()">Salvar</button><button onclick="impSheet()">Importar .ydk</button><button onclick="copyDeck();closeSh()">Copiar Deck</button><button onclick="closeSh();decksView()">Sair</button></div>')}
function cfgSheet(){sheet('<h3>Configurações de Deck</h3><div class="bt"><button onclick="impSheet()">Importar .ydk</button><button onclick="closeSh();clearDeck()">Limpar deck</button><button onclick="closeSh();cstView()">Criar carta</button></div>')}
function rulesSheet(){sheet('<h3>Regras do deck</h3><p>Speed Duel: deck principal de 20 a 30 cartas, deck adicional de até 6 e no máximo 3 cópias de cada carta. Toque numa carta para ver o texto e adicionar ou remover.</p>')}
function fltSheet(){const A=['','DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'];sheet(`<h3>Filtro</h3><label><input type="checkbox" id="fs" ${B.sd?'checked':''}> Só Speed Duel</label><p>Atributo</p><select id="fa">${A.map(a=>`<option value="${a}" ${a==B.attr?'selected':''}>${a||'Todos'}</option>`).join('')}</select><p>Nível</p><select id="fl">${Array.from({length:13},(_,i)=>`<option value="${i||''}" ${(i||'')==B.lv?'selected':''}>${i||'Todos'}</option>`).join('')}</select><div class="bt"><button onclick="B.sd=$('#fs').checked?1:0;B.attr=$('#fa').value;B.lv=$('#fl').value;closeSh();reload()">Aplicar</button></div>`)}
function txtSheet(){sheet(`<h3>Busca por texto</h3><input id="tq" value="${esc(B.q)}" placeholder="Nome da carta"><div class="bt"><button onclick="B.q=$('#tq').value.trim();closeSh();reload()">Buscar</button></div>`)}
function impSheet(){sheet('<h3>Importar .ydk</h3><textarea id="yd" rows="8" placeholder="Cole o conteúdo do arquivo .ydk"></textarea><div class="bt"><button onclick="imp()">Importar</button></div>')}
async function imp(){const ids=$('#yd').value.split(/!side/)[0].split(/\s+/).filter(x=>/^\d+$/.test(x));if(!ids.length)return toast('Nada para importar');closeSh();toast('Importando...');const u=[...new Set(ids)],M={};
try{for(let i=0;i<u.length;i+=40){const r=await fetch(API+'?id='+u.slice(i,i+40).join(','));if(r.ok)(await r.json()).data.forEach(c=>M[c.id]=norm(c))}}catch(e){return toast('Sem conexão')}
ids.forEach(i=>M[i]&&B.c.push(M[i]));sortDeck();renderDeck();renderCol(0);toast(B.c.length+' cartas no deck')}
/* ---------- criar cartas ---------- */
const TY=[['Normal Monster','Monstro Normal'],['Effect Monster','Monstro de Efeito'],['Pendulum Effect Monster','Monstro Pêndulo'],['Fusion Monster','Fusão'],['Synchro Monster','Sincro'],['XYZ Monster','Xyz'],['Link Monster','Link'],['Spell Card','Mágica'],['Trap Card','Armadilha']];
let CC={};
function cstView(){CC={};const L=ST('custom')||[];$('#cst').innerHTML=`<h2>Criar carta</h2><input id="cn" placeholder="Nome"><div class="bh"><select id="ct">${TY.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('')}</select></div><div class="bh"><input id="ca" placeholder="Atributo (DARK...)"><input id="cl" type="number" placeholder="Nível"></div><div class="bh"><input id="cs" type="number" placeholder="Escala"><input id="ck" type="number" placeholder="ATK"><input id="cd" type="number" placeholder="DEF"></div><textarea id="cx" rows="4" placeholder="Efeito / texto"></textarea><label class="fl">Imagem da carta (opcional)<input type="file" accept="image/*" onchange="pickImg(this)"></label><div class="bt"><button onclick="saveCust()">Salvar carta</button><button onclick="show('menu')">Voltar</button></div><h3>Minhas cartas (toque para apagar)</h3><div class="gr big">${L.map((c,i)=>`<div class="hc" onclick="delCust(${i})">${cardEl(c,0)}</div>`).join('')||'<p>Elas aparecem na busca do deck.</p>'}</div>`;show('cst')}
function pickImg(inp){const f=inp.files[0];if(!f)return;const im=new Image();im.onload=()=>{const s=Math.min(1,320/im.width),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);CC.img=cv.toDataURL('image/jpeg',.8);toast('Imagem carregada')};im.src=URL.createObjectURL(f)}
function saveCust(){const n=$('#cn').value.trim();if(!n)return toast('Dê um nome');const t=$('#ct').value,v=i=>$(i).value===''?null:+$(i).value,m=/Monster/.test(t);
const L=ST('custom')||[];L.push({id:'c'+Date.now(),custom:1,name:n,type:t,attr:m?$('#ca').value:'',lvl:m?v('#cl'):null,scale:/Pendulum/.test(t)?v('#cs'):null,atk:m?v('#ck'):null,def:m?v('#cd'):null,desc:$('#cx').value,img:CC.img||''});if(SV('custom',L)){toast('Carta salva');cstView()}}
function delCust(i){if(!confirm('Apagar carta?'))return;const L=ST('custom');L.splice(i,1);SV('custom',L);cstView()}
/* ---------- duelo manual ---------- */
let G=null;const uid=()=>Math.random().toString(36).slice(2,9),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function setupView(){const D=ST('decks')||[];if(!D.length){toast('Crie um deck primeiro');return decksView()}const o=D.map((d,i)=>`<option value="${i}">${esc(d.n)} (${d.c.length})</option>`).join('');
$('#setup').innerHTML=`<h2>Novo duelo</h2><p>Jogador 1</p><select id="d1">${o}</select><p>Jogador 2</p><select id="d2">${o}</select><div class="bt"><button onclick="go()">Começar (4000 LP, 4 cartas)</button><button onclick="show('menu')">Voltar</button></div>`;show('setup')}
function go(){const D=ST('decks');startDuel(D[$('#d1').value].c,D[$('#d2').value].c)}
function startDuel(d1,d2){const mk=(deck,o)=>{const cs=deck.map(c=>Object.assign({},c,{u:uid(),o,fd:0,df:0}));return{lp:4000,deck:shuf(cs.filter(c=>!isEx(c))),extra:cs.filter(isEx),gy:[],ban:[],hand:[],s:{}}};
G={p:[mk(d1,0),mk(d2,1)],me:0,turn:1,ph:0,pend:null,h:[]};G.p.forEach(P=>{for(let i=0;i<4;i++){const x=P.deck.shift();x&&P.hand.push(x)}});show('duel');render()}
const snap=()=>{G.h.push(JSON.stringify([G.p,G.turn,G.ph]));if(G.h.length>80)G.h.shift()};
function undo(){if(!G.h.length)return toast('Nada para desfazer');[G.p,G.turn,G.ph]=JSON.parse(G.h.pop());G.pend=null;render()}
function find(u){for(let p=0;p<2;p++){const P=G.p[p];for(const z of PZ){const i=P[z].findIndex(c=>c.u==u);if(i>=0)return{p,z,i,c:P[z][i]}}for(const k in P.s)if(P.s[k]&&P.s[k].u==u)return{p,z:k,c:P.s[k]}}}
function mv(u,p,z,o){o=o||{};const f=find(u);if(!f)return;snap();const P0=G.p[f.p];if(f.i!==undefined)P0[f.z].splice(f.i,1);else delete P0.s[f.z];const c=f.c;c.fd=o.fd||0;c.df=o.df||0;
if(PZ.includes(z)){const P=G.p[c.o];if(z=='deck'&&o.top)P.deck.unshift(c);else P[z].push(c)}else G.p[p].s[z]=c;closeSh();render()}
function draw(p){const P=G.p[p],c=P.deck.shift();if(!c)return toast('Deck vazio');snap();P.hand.push(c);closeSh();render()}
function shufDeck(p){snap();shuf(G.p[p].deck);closeSh();toast('Deck embaralhado')}
const LAB={m0:'Monstro',m1:'Monstro',m2:'Monstro',em:'Zona extra',s0:'Mágica / Armadilha',s1:'Mágica / Armadilha',s2:'Mágica / Armadilha'},SN={gy:'Cem.',ban:'Ban.',deck:'Deck',extra:'Extra'};
const cry=(k,n,lg)=>`<span class="cry ${k=='pl1'?'b':''}${lg?' lg':''}">${n!=null?`<i>${n}</i>`:''}</span>`;
function pc(p,k){const a=G.p[p][k],bk=k=='deck'||k=='extra';return`<div class="cell pile" data-p="${p}" data-k="${k}" onclick="pile(${p},'${k}')">${a.length?cardEl(bk?a[0]:a[a.length-1],bk):''}<span class="lb">${SN[k]}</span><em>${a.length}</em></div>`}
const split=(p,m)=>`<div class="spl">${m?pc(p,'gy')+pc(p,'ban'):pc(p,'ban')+pc(p,'gy')}</div>`;
function cell(p,k){const c=G.p[p].s[k],pl=k[0]=='p';return`<div class="cell ${k[0]}${c&&c.df?' df':''}${G.pend&&!c?' hl':''}" data-p="${p}" data-k="${k}"${c?` data-u="${c.u}"`:''} onclick="slot(${p},'${k}')">${c?cardEl(c,c.fd)+(pl&&!c.fd?cry(k,c.scale):''):(pl?cry(k,null,1):'')+`<span class="lb">${pl?'Pêndulo':LAB[k]}</span>`}</div>`}
const hand=(p,m)=>`<div class="hand${m?'':' op'}">${G.p[p].hand.map(c=>`<div class="hc"${m?` data-u="${c.u}" onclick="act('${c.u}')"`:''}>${cardEl(c,!m)}</div>`).join('')}</div>`;
function rows(p,m){const r1=['pl0','m0','m1','m2','pl1'].map(k=>cell(p,k)),r2=[cell(p,'em'),cell(p,'s0'),cell(p,'s1'),cell(p,'s2'),split(p,m)],r3=[pc(p,'extra'),hand(p,m),pc(p,'deck')];return(m?[...r1,...r2,...r3]:[...r3.reverse(),...r2.reverse(),...r1.reverse()]).join('')}
const lpC=p=>`<div class="cell lp${p==G.me?' me':''}" onclick="lpSheet(${p})"><small>Jogador ${p+1}</small><b>${G.p[p].lp}</b></div>`;
function render(){const me=G.me,op=1-me;$('#duel').innerHTML=`${G.pend?`<div class="ban">Escolha uma zona vazia<button onclick="G.pend=null;render()">Cancelar</button></div>`:''}<div class="bd">${rows(op,0)}${lpC(op)}<div class="cell ph" onclick="nextPh()"><small>Turno ${G.turn}</small><b>${PH[G.ph]}</b></div>${lpC(me)}${rows(me,1)}</div><div class="tools"><button onclick="if(confirm('Sair do duelo?'))show('menu')">Sair</button><button onclick="undo()">Desfazer</button><button onclick="draw(G.me)">Comprar</button><button onclick="toast(Math.random()<.5?'Cara':'Coroa')">Moeda</button><button onclick="toast('Dado: '+(1+Math.random()*6|0))">Dado</button><button onclick="G.me=1-G.me;render()">Lado</button></div>`}
function nextPh(){snap();if(++G.ph>5){G.ph=0;G.turn++}render()}
function slot(p,k){const c=G.p[p].s[k];if(G.pend){if(c)return;const q=G.pend;G.pend=null;mv(q.u,p,k,q);return}if(c)act(c.u)}
function pend(u,fd,df){G.pend={u,fd,df};closeSh();render()}
function flip(u,k){const f=find(u);snap();f.c[k]^=1;closeSh();render()}
function pile(p,z){if(G.pend)return;const a=G.p[p][z];sheet(`<h3>${NM[z]} do J${p+1}: ${a.length}</h3>${z=='deck'?`<div class="bt"><button onclick="draw(${p})">Comprar</button><button onclick="shufDeck(${p})">Embaralhar</button></div>`:''}<div class="gr">${a.map(c=>`<div class="hc" onclick="act('${c.u}')">${cardEl(c,0)}</div>`).join('')||'<p>Vazio</p>'}</div>`)}
function act(u){const f=find(u);if(!f)return;const c=f.c,fld=!PZ.includes(f.z),ex=isEx(c),B=(t,fn)=>`<button onclick="${fn}">${t}</button>`,to=(t,z,o)=>B(t,`mv('${u}',0,'${z}',{${o||''}})`);
sheet(det(c,fld&&c.fd&&f.p!=G.me)+'<div class="bt">'+[B(ex?'Invocar (ATK)':'Invocar / Ativar',`pend('${u}',0,0)`),ex?B('Invocar (DEF)',`pend('${u}',0,1)`):'',B('Baixar',`pend('${u}',1,${isMon(c)?1:0})`),fld?B('Virar',`flip('${u}','fd')`):'',fld&&isMon(c)?B('Posição',`flip('${u}','df')`):'',fld?B('Mover de zona',`pend('${u}',${c.fd},${c.df})`):'',f.z!='hand'?to('Mão','hand'):'',f.z!='gy'?to('Cemitério','gy'):'',f.z!='ban'?to('Banir','ban'):'',ex?(f.z!='extra'?to('Extra Deck','extra'):''):to('Topo do deck','deck','top:1')+to('Fundo do deck','deck')].join('')+'</div>')}
function lpSheet(p){sheet(`<h3>Jogador ${p+1}: ${G.p[p].lp} LP</h3><input id="lpv" type="number" inputmode="numeric" placeholder="Valor"><div class="bt"><button onclick="lpDo(${p},-1)">Dano</button><button onclick="lpDo(${p},1)">Cura</button><button onclick="lpDo(${p},0)">Definir</button></div><div class="bt">${[-100,-500,-1000,500].map(v=>`<button onclick="lpQ(${p},${v})">${v>0?'+':''}${v}</button>`).join('')}</div>`)}
function lpSet(p,v){snap();G.p[p].lp=Math.max(0,v);closeSh();render()}
function lpDo(p,s){const v=Math.abs(+$('#lpv').value)||0;lpSet(p,s?G.p[p].lp+s*v:v)}
function lpQ(p,v){lpSet(p,G.p[p].lp+v)}
/* ---------- arrastar e soltar ---------- */
const DR={};
const sup=()=>{DR.sup=1;setTimeout(()=>DR.sup=0,150)};
document.addEventListener('click',e=>{if(DR.sup){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('touchmove',e=>{if(DR.lock)e.preventDefault()},{passive:false});
function begin(){const s=DR.src;if(!s)return;DR.on=1;DR.lock=1;const cd=s.querySelector('.cd'),g=document.createElement('div');g.className='gh';g.innerHTML=cd?cd.outerHTML:'';document.body.appendChild(g);DR.g=g;mvG(DR.lx,DR.ly);if(navigator.vibrate)navigator.vibrate(20)}
const mvG=(x,y)=>{if(DR.g)DR.g.style.transform=`translate(${x-34}px,${y-70}px)`};
function mark(x,y){const el=document.elementFromPoint(x,y),d=el&&el.closest('[data-k],#dk');if(DR.d!==d){DR.d&&DR.d.classList.remove('dt');DR.d=d;d&&d.classList.add('dt')}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('#sh'))return;const h=e.target.closest('.dv');if(h&&!e.target.closest('button')){const d=$('#dk');DR.rs={y:e.clientY,h:d.offsetHeight,id:e.pointerId};return}
const t=e.target.closest('[data-u],.ci,.sl');if(!t)return;Object.assign(DR,{src:t,id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,on:0,lock:0});clearTimeout(DR.tm);if(t.matches('.ci,.sl'))DR.tm=setTimeout(begin,350)});
document.addEventListener('pointermove',e=>{if(DR.rs&&e.pointerId==DR.rs.id){const d=$('#dk');B.exp=0;$('#bld').classList.remove('x');const b=$('.dv button');if(b)b.textContent='▲';d.style.flex='none';d.style.height=Math.max(60,Math.min(innerHeight*.7,DR.rs.h+e.clientY-DR.rs.y))+'px';return}
if(!DR.src||e.pointerId!=DR.id)return;DR.lx=e.clientX;DR.ly=e.clientY;const dx=e.clientX-DR.x,dy=e.clientY-DR.y;
if(!DR.on){if(DR.src.matches('.ci,.sl')){if(Math.hypot(dx,dy)>10){clearTimeout(DR.tm);DR.src=null}return}
if(DR.src.closest('.hand')?(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)):Math.hypot(dx,dy)>10)begin();else return}
mvG(e.clientX,e.clientY);mark(e.clientX,e.clientY)});
function endDrag(e,ok){clearTimeout(DR.tm);if(DR.on){DR.g&&DR.g.remove();DR.d&&DR.d.classList.remove('dt');if(ok)drop(e.clientX,e.clientY);sup()}DR.src=null;DR.on=0;DR.lock=0;DR.d=null;DR.g=null}
document.addEventListener('pointerup',e=>{if(DR.rs&&e.pointerId==DR.rs.id)DR.rs=null;if(DR.src&&e.pointerId==DR.id)endDrag(e,1)});
document.addEventListener('pointercancel',()=>{DR.rs=null;if(DR.src)endDrag(null,0)});
function drop(x,y){const el=document.elementFromPoint(x,y),s=DR.src;if(!el)return;
if(s.matches('.ci')){if(el.closest('#dk'))addC(B.col[+s.dataset.i]);return}
if(s.matches('.sl')){if(!el.closest('#dk'))rmId(s.dataset.id);return}
const t=el.closest('[data-k]');if(t&&G)dropDuel(s.dataset.u,+t.dataset.p,t.dataset.k)}
function dropDuel(u,p,k){const f=find(u);if(!f)return;const c=f.c;
if(k=='gy'||k=='ban')return f.z==k?0:mv(u,0,k);
if(k=='deck')return mv(u,0,isEx(c)?'extra':'deck',{top:1});
if(k=='extra')return isEx(c)?mv(u,0,'extra'):toast('Só cartas do Deck Adicional');
const o=G.p[p].s[k];if(o&&o.u!=u)return toast('Zona ocupada');if(f.z==k&&f.p==p)return;
mv(u,p,k,PZ.includes(f.z)?{}:{fd:c.fd,df:c.df})}
