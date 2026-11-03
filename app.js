'use strict';
const $=s=>document.querySelector(s),ST=k=>JSON.parse(localStorage.getItem(k)||'null'),SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return 1}catch(e){toast('Sem espaço para salvar');return 0}};
const API='https://db.ygoprodeck.com/api/v7/cardinfo.php',CARDS={},PZ=['deck','extra','gy','ban','hand'],PH=['DP','SP','M1','BP','M2','EP'],NM={deck:'Deck',extra:'Extra Deck',gy:'Cemitério',ban:'Banidas'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=c=>({id:c.id,name:c.name,type:c.type,atk:c.atk,def:c.def,lvl:c.level,attr:c.attribute,desc:c.desc,img:c.card_images&&c.card_images[0].image_url_small});
const isEx=c=>/Fusion|Synchro|XYZ|Link/i.test(c.type||''),isMon=c=>/Monster/i.test(c.type||'');
const kind=c=>/Spell/i.test(c.type)?'sp':/Trap/i.test(c.type)?'tr':/Fusion/i.test(c.type)?'fu':/Synchro/i.test(c.type)?'sy':/XYZ/i.test(c.type)?'xy':/Link/i.test(c.type)?'li':/Effect|Pendulum/i.test(c.type)?'ef':'no';
const frame=c=>`<div class="cd fr ${kind(c)}"><b>${esc(c.name)}</b><small>${isMon(c)?esc(c.atk)+'/'+esc(c.def):''}</small></div>`;
function cardEl(c,fd){if(fd)return'<div class="cd back"></div>';CARDS[c.id]=c;return c.img?`<img class="cd" data-id="${esc(c.id)}" src="${esc(c.img)}">`:frame(c)}
addEventListener('error',e=>{const t=e.target;if(t.tagName=='IMG'&&t.dataset.id&&CARDS[t.dataset.id]){const d=document.createElement('div');d.innerHTML=frame(CARDS[t.dataset.id]);t.replaceWith(d.firstChild)}},true);
let tt;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),1800)}
function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('on',s.id==id))}
function sheet(h){$('#sh').innerHTML='<div class="bk" onclick="closeSh()"></div><div class="pn">'+h+'</div>';$('#sh').classList.add('on')}
function closeSh(){$('#sh').classList.remove('on')}
const det=(c,hide)=>hide?`<div class="det"><div class="bg">${cardEl(c,1)}</div><div><b>Carta virada</b></div></div>`:`<div class="det"><div class="bg">${cardEl(c,0)}</div><div><b>${esc(c.name)}</b><p class="mt">${esc(c.type||'')}${c.attr?', '+esc(c.attr):''}${c.lvl?', Nv '+c.lvl:''}${isMon(c)&&c.atk!=null?', ATK '+c.atk+' / DEF '+c.def:''}</p><p class="tx">${esc(c.desc||'')}</p></div></div>`;
/* ---------- banco de cartas (YGOPRODeck, sempre atualizado) ---------- */
async function search(q,sd){const r=await fetch(API+'?fname='+encodeURIComponent(q)+(sd?'&format=speed%20duel':'')+'&num=40&offset=0');return r.ok?(await r.json()).data.map(norm):[]}
/* ---------- decks ---------- */
let B;
function decksView(){const D=ST('decks')||[];$('#decks').innerHTML=`<h2>Meus decks</h2>${D.map((d,i)=>`<div class="row"><b>${esc(d.n)}</b><span>${d.c.length}</span><button onclick="editDeck(${i})">Editar</button><button onclick="delDeck(${i})">Apagar</button></div>`).join('')||'<p>Nenhum deck ainda.</p>'}<div class="bt"><button onclick="editDeck(-1)">Novo deck</button><button onclick="show('menu')">Voltar</button></div>`;show('decks')}
function delDeck(i){if(!confirm('Apagar deck?'))return;const D=ST('decks');D.splice(i,1);SV('decks',D);decksView()}
function editDeck(i){const D=ST('decks')||[];B=i<0?{i:-1,n:'',c:[],res:[],tab:0,q:'',sd:0}:{i,n:D[i].n,c:D[i].c.slice(),res:[],tab:0,q:'',sd:0};bldView();show('bld')}
function bldView(){const L=B.tab?B.c:B.res;$('#bld').innerHTML=`<div class="bh"><input value="${esc(B.n)}" placeholder="Nome do deck" oninput="B.n=this.value"><button onclick="saveDeck()">Salvar</button><button onclick="decksView()">Voltar</button></div><div class="bh"><input id="q" value="${esc(B.q)}" placeholder="Buscar carta (nome)" onkeydown="if(event.key=='Enter')doSearch()"><button onclick="doSearch()">Buscar</button></div><div class="bh"><label><input type="checkbox" id="sd" ${B.sd?'checked':''}> Só Speed Duel</label><button onclick="impSheet()">Importar .ydk</button></div><div class="tabs"><button class="${B.tab?'':'on'}" onclick="B.tab=0;bldView()">Resultados</button><button class="${B.tab?'on':''}" onclick="B.tab=1;bldView()">Deck (${B.c.length})</button></div><div class="gr big">${L.map((c,i)=>`<div class="hc" onclick="${B.tab?`rmCard(${i})`:`addSheet(${i})`}">${cardEl(c,0)}</div>`).join('')||'<p>'+(B.tab?'Deck vazio.':'Busque uma carta.')+'</p>'}</div>`}
async function doSearch(){B.q=$('#q').value.trim();B.sd=$('#sd').checked;if(!B.q)return;toast('Buscando...');let r=[];try{r=await search(B.q,B.sd)}catch(e){toast('Sem conexão')}
const cu=(ST('custom')||[]).filter(c=>c.name.toLowerCase().includes(B.q.toLowerCase()));B.res=cu.concat(r);B.tab=0;bldView()}
function addSheet(i){const c=B.res[i];sheet(det(c)+`<div class="bt"><button onclick="B.c.push(B.res[${i}]);toast('Adicionada (${B.c.length+1})');closeSh();bldView()">Adicionar ao deck</button></div>`)}
function rmCard(i){B.c.splice(i,1);bldView()}
function saveDeck(){const D=ST('decks')||[],d={n:B.n||'Deck',c:B.c};if(B.i<0){D.push(d);B.i=D.length-1}else D[B.i]=d;if(SV('decks',D))toast('Deck salvo')}
function impSheet(){sheet('<h3>Importar .ydk</h3><textarea id="yd" rows="8" placeholder="Cole o conteúdo do arquivo .ydk"></textarea><div class="bt"><button onclick="imp()">Importar</button></div>')}
async function imp(){const ids=$('#yd').value.split(/!side/)[0].split(/\s+/).filter(x=>/^\d+$/.test(x));if(!ids.length)return toast('Nada para importar');closeSh();toast('Importando...');const u=[...new Set(ids)],M={};
try{for(let i=0;i<u.length;i+=40){const r=await fetch(API+'?id='+u.slice(i,i+40).join(','));if(r.ok)(await r.json()).data.forEach(c=>M[c.id]=norm(c))}}catch(e){return toast('Sem conexão')}
ids.forEach(i=>M[i]&&B.c.push(M[i]));B.tab=1;bldView();toast(B.c.length+' cartas no deck')}
/* ---------- criar cartas ---------- */
const TY=[['Normal Monster','Monstro Normal'],['Effect Monster','Monstro de Efeito'],['Pendulum Effect Monster','Monstro Pêndulo'],['Fusion Monster','Fusão'],['Synchro Monster','Sincro'],['XYZ Monster','Xyz'],['Link Monster','Link'],['Spell Card','Mágica'],['Trap Card','Armadilha']];
let CC={};
function cstView(){CC={};const L=ST('custom')||[];$('#cst').innerHTML=`<h2>Criar carta</h2><input id="cn" placeholder="Nome"><div class="bh"><select id="ct">${TY.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('')}</select></div><div class="bh"><input id="ca" placeholder="Atributo (DARK...)"><input id="cl" type="number" placeholder="Nível"></div><div class="bh"><input id="ck" type="number" placeholder="ATK"><input id="cd" type="number" placeholder="DEF"></div><textarea id="cx" rows="4" placeholder="Efeito / texto"></textarea><label class="fl">Imagem da carta (opcional)<input type="file" accept="image/*" onchange="pickImg(this)"></label><div class="bt"><button onclick="saveCust()">Salvar carta</button><button onclick="show('menu')">Voltar</button></div><h3>Minhas cartas (toque para apagar)</h3><div class="gr big">${L.map((c,i)=>`<div class="hc" onclick="delCust(${i})">${cardEl(c,0)}</div>`).join('')||'<p>Elas aparecem na busca do deck.</p>'}</div>`;show('cst')}
function pickImg(inp){const f=inp.files[0];if(!f)return;const im=new Image();im.onload=()=>{const s=Math.min(1,320/im.width),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);CC.img=cv.toDataURL('image/jpeg',.8);toast('Imagem carregada')};im.src=URL.createObjectURL(f)}
function saveCust(){const n=$('#cn').value.trim();if(!n)return toast('Dê um nome');const t=$('#ct').value,v=i=>$(i).value===''?null:+$(i).value,m=/Monster/.test(t);
const L=ST('custom')||[];L.push({id:'c'+Date.now(),custom:1,name:n,type:t,attr:m?$('#ca').value:'',lvl:m?v('#cl'):null,atk:m?v('#ck'):null,def:m?v('#cd'):null,desc:$('#cx').value,img:CC.img||''});if(SV('custom',L)){toast('Carta salva');cstView()}}
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
const LAB={m0:'Monstro',m1:'Monstro',m2:'Monstro',em:'Zona extra',s0:'Mágica / Armadilha',s1:'Mágica / Armadilha',s2:'Mágica / Armadilha',pl0:'Pêndulo',pl1:'Pêndulo'};
function cell(p,k){const P=G.p[p];if(k=='gy'||k=='ban'){const a=P[k],t=a[a.length-1];return`<div class="cell pile" onclick="pile(${p},'${k}')">${t?cardEl(t,0):''}<span class="lb">${NM[k]}</span><em>${a.length}</em></div>`}
const c=P.s[k];return`<div class="cell ${k[0]}${c&&c.df?' df':''}${G.pend&&!c?' hl':''}" onclick="slot(${p},'${k}')">${c?cardEl(c,c.fd):`<span class="lb">${LAB[k]}</span>`}</div>`}
const rowST=p=>['pl0','s0','s1','s2','pl1'].map(k=>cell(p,k)).join(''),rowM=p=>['ban','m0','m1','m2','gy'].map(k=>cell(p,k)).join('');
const lpC=p=>`<div class="cell lp" onclick="lpSheet(${p})"><small>Jogador ${p+1}</small><b>${G.p[p].lp}</b></div>`;
function strip(p,mine){const P=G.p[p];return`<div class="pc" onclick="pile(${p},'deck')">${cardEl(null,1)}<em>${P.deck.length}</em></div><div class="pc" onclick="pile(${p},'extra')">${P.extra.length?cardEl(P.extra[0],1):'<div class="cd"></div>'}<em>EX ${P.extra.length}</em></div><div class="hand">${P.hand.map(c=>`<div class="hc" ${mine?`onclick="act('${c.u}')"`:''}>${cardEl(c,!mine)}</div>`).join('')}</div>`}
function render(){const me=G.me,op=1-me;$('#duel').innerHTML=`<div class="strip top">${G.pend?`<div class="ban">Escolha uma zona vazia<button onclick="G.pend=null;render()">Cancelar</button></div>`:strip(op,0)}</div><div class="bd">${rowST(op)}${rowM(op)}${lpC(op)}${cell(op,'em')}<div class="cell ph" onclick="nextPh()"><small>Turno ${G.turn}</small><b>${PH[G.ph]}</b></div>${cell(me,'em')}${lpC(me)}${rowM(me)}${rowST(me)}</div><div class="tools"><button onclick="if(confirm('Sair do duelo?'))show('menu')">Sair</button><button onclick="undo()">Desfazer</button><button onclick="draw(G.me)">Comprar</button><button onclick="toast(Math.random()<.5?'Cara':'Coroa')">Moeda</button><button onclick="toast('Dado: '+(1+Math.random()*6|0))">Dado</button><button onclick="G.me=1-G.me;render()">Lado</button></div><div class="strip bot">${strip(me,1)}</div>`}
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
