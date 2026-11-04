'use strict';
const $=s=>document.querySelector(s),ST=k=>JSON.parse(localStorage.getItem(k)||'null'),SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return 1}catch(e){toast('Sem espaço para salvar');return 0}};
const API='https://db.ygoprodeck.com/api/v7/cardinfo.php',CARDS={},PZ=['deck','extra','gy','ban','hand'],PH=['DP','SP','M1','BP','EP'],NM={deck:'Deck',extra:'Extra Deck',gy:'Cemitério',ban:'Banidas'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const BAN={};
const norm=c=>{const b=c.banlist_info||{};BAN[c.id]={t:b.ban_tcg||'',o:b.ban_ocg||''};return{id:c.id,name:c.name,type:c.type,atk:c.atk,def:c.def,lvl:c.level!=null?c.level:c.linkval,sc:c.scale,rc:c.race,ar:c.archetype,attr:c.attribute,desc:c.desc,img:c.card_images&&c.card_images[0].image_url_small}};
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
const FT=[['no','Normal',['Normal Monster','Normal Tuner Monster','Pendulum Normal Monster']],['ef','Efeito',['Effect Monster','Flip Effect Monster','Flip Tuner Effect Monster','Gemini Monster','Spirit Monster','Toon Monster','Tuner Monster','Union Effect Monster','Union Tuner Effect Monster','Pendulum Effect Monster','Pendulum Flip Effect Monster','Pendulum Tuner Effect Monster']],['ri','Ritual',['Ritual Monster','Ritual Effect Monster','Pendulum Effect Ritual Monster']],['fu','Fusão',['Fusion Monster','Pendulum Effect Fusion Monster']],['sy','Sincro',['Synchro Monster','Synchro Tuner Monster','Synchro Pendulum Effect Monster']],['xy','Xyz',['XYZ Monster','XYZ Pendulum Effect Monster']],['pe','Pêndulo',['Pendulum Effect Monster','Pendulum Normal Monster','Pendulum Flip Effect Monster','Pendulum Tuner Effect Monster','Pendulum Effect Ritual Monster','Pendulum Effect Fusion Monster','Synchro Pendulum Effect Monster','XYZ Pendulum Effect Monster']],['li','Link',['Link Monster']]],
FA=[['LIGHT','LUZ'],['DARK','TREVAS'],['WATER','ÁGUA'],['FIRE','FOGO'],['EARTH','TERRA'],['WIND','VENTO'],['DIVINE','DIVINO']],
FR=[['Dragon','Dragão'],['Zombie','Zumbi'],['Fiend','Demônio'],['Pyro','Piro'],['Sea Serpent','Serpente Marinha'],['Rock','Rocha'],['Machine','Máquina'],['Fish','Peixe'],['Dinosaur','Dinossauro'],['Insect','Inseto'],['Beast','Besta'],['Beast-Warrior','Besta-Guerreira'],['Plant','Planta'],['Aqua','Aqua'],['Warrior','Guerreiro'],['Winged Beast','Besta Alada'],['Fairy','Fada'],['Spellcaster','Mago'],['Thunder','Trovão'],['Reptile','Réptil'],['Psychic','Psíquico'],['Wyrm','Wyrm'],['Divine-Beast','Besta Divina'],['Illusion','Ilusão'],['Cyberse','Cyberso']],
FS=[['Normal','Magia Normal'],['Field','Magia de Campo'],['Equip','Magia de Equipamento'],['Continuous','Magia Contínua'],['Quick-Play','Magia Rápida'],['Ritual','Magia de Ritual']],
FTR=[['Normal','Armadilha Normal'],['Counter','Armadilha de Resposta'],['Continuous','Armadilha Contínua']],
FE=[['hp','Aumentar PV',/gain[^.]{0,70}\b(LP|Life Points)\b/i],['dm','Dano de Efeito',/inflict[^.]{0,70}damage|damage to your opponent/i],['dr','Compra',/\bdraws?\b(?! Phase)/i],['ad','Aumentar/Diminuir ATK/DEF',/\b(ATK|DEF)\b[^.]{0,70}\b(increase|decrease|reduce|gain|lose|becomes?|by \d+)|\b(gain|lose|increase|decrease|reduce)[^.]{0,50}\b(ATK|DEF)\b/i],['dd','Destruição do deck',/send[^.]{0,60}top[^.]{0,50}Deck[^.]{0,40}(GY|Graveyard)/i],['dt','Destruir magias/armadilhas',/destroy[^.]{0,90}\b(Spell|Trap)/i],['dn','Destruir monstros',/destroy[^.]{0,90}monster/i],['ps','Mudar posição de batalha',/change[^.]{0,70}position|to (face-up )?(Attack|Defense) Position/i],['gy','Do Cemitério para mão/campo',/(GY|Graveyard)[^.]{0,90}(to (the |your )?hand|Special Summon|add)|(add|Special Summon|return)[^.]{0,90}from (your |the |either )?(GY|Graveyard)/i],['co','Dado/Moeda',/toss a coin|roll a (six-sided )?die|\bcoin\b|\bdice\b/i],['ba','Banir',/banish/i],['sp','Invocação-Especial',/Special Summon/i],['tk','Ficha',/\bTokens?\b/i],['ri','Ritual e afins',/Ritual/i],['fu','Fusão e afins',/Fusion/i],['to','Toon',/\bToon\b/i],['ge','Gêmeos',/Gemini/i],['un','Union',/\bUnion\b/i],['es','Espírito',/Spirit/i],['fl','Virar',/\bFLIP\b|Flip Effect/i],['nm','Monstro normal e afins',/Normal Monster/i],['tu','Regulador',/\bTuner\b/i],['sy','Sincro e afins',/Synchro/i],['xy','Xyz e afins',/\bXyz\b|XYZ/i],['pe','Pêndulo e afins',/Pendulum/i],['li','Link e afins',/\bLink\b/i]],
FEX=Object.fromEntries(FE.map(x=>[x[0],x[2]])),fnew=()=>({ty:[],at:[],rc:[],lv:[],sc:[],ef:[],sp:[],tp:[]}),
hasG=()=>{const f=B.f;return[f.ty.length||f.at.length||f.rc.length||f.lv.length||f.sc.length,f.sp.length||f.tp.length]},
fLabels=()=>{const f=B.f,L=(a,l)=>a.map(k=>(l.find(x=>x[0]==k)||[0,k])[1]);return[...L(f.ty,FT),...L(f.at,FA),...L(f.rc,FR),...f.lv.map(n=>'Nv '+n),...f.sc.map(n=>'Escala '+n),...L(f.sp,FS),...L(f.tp,FTR),...L(f.ef,FE)]};
function passF(c){const f=B.f,mon=isMon(c),[gm,gs]=hasG();
if(gm||gs){if(mon){if(!gm)return false;if(f.ty.length&&!f.ty.some(k=>FT.find(x=>x[0]==k)[2].includes(c.type)))return false;if(f.at.length&&!f.at.includes(c.attr))return false;if(f.rc.length&&!f.rc.includes(c.rc))return false;if(f.lv.length&&!f.lv.includes(c.lvl))return false;if(f.sc.length&&!f.sc.includes(c.sc))return false}
else{if(!gs)return false;const s=/Spell/i.test(c.type),a=s?f.sp:f.tp;if(!a.length||!a.includes(c.rc))return false}}
if(f.ef.length&&!f.ef.some(k=>FEX[k].test(c.desc||'')))return false;return true}
function srvUrl(){const f=B.f,[gm,gs]=hasG(),e=encodeURIComponent,P=['num=60','offset='+B.off,'sort='+B.sort];
if(B.rel)P.push(B.rel.a?'archetype='+e(B.rel.a):'fname='+e(B.rel.n));
let ty=null;
if(gm&&!gs){const t=[...new Set(f.ty.flatMap(k=>FT.find(x=>x[0]==k)[2]))];if(t.length)ty=t.join(',');if(f.at.length)P.push('attribute='+f.at.join(',').toLowerCase());if(f.rc.length)P.push('race='+e(f.rc.join(',')));if(f.lv.length==1&&!f.ty.includes('li'))P.push('level='+f.lv[0]);if(f.sc.length==1)P.push('scale='+f.sc[0])}
else if(gs&&!gm){ty=f.sp.length&&f.tp.length?'Spell Card,Trap Card':f.sp.length?'Spell Card':'Trap Card';P.push('race='+e([...new Set(f.sp.concat(f.tp))].join(',')))}
if(!ty&&B.t&&!(gm&&gs))ty=TYF[B.t];if(ty)P.push('type='+e(ty));
if(B.q)P.push('fname='+e(B.q));if(B.sd)P.push('format=speed%20duel');if(B.staple)P.push('staple=yes');
return API+'?'+P.join('&')}
async function loadMore(){if(B.busy||B.end)return;B.busy=1;const rid=B.rid,from=B.col.length,cf=B.f.ty.length+B.f.at.length+B.f.rc.length+B.f.lv.length+B.f.sc.length+B.f.ef.length+B.f.sp.length+B.f.tp.length>0;
try{let data=[];
if(B.t=='fav'){const f=ST('fav')||[];B.end=1;if(f.length){const r=await fetch(API+'?id='+f.join(','));if(r.ok)data=(await r.json()).data.map(norm).filter(passF)}}
else{if(B.off==0)data=custom();
for(let it=0;it<8;it++){const r=await fetch(srvUrl());if(rid!=B.rid)return;if(!r.ok){B.end=1;break}const d=(await r.json()).data;data=data.concat(d.map(norm).filter(passF));B.off+=60;if(d.length<60){B.end=1;break}if(!cf||data.length>=18)break}}
if(rid!=B.rid)return;B.col=B.col.concat(data)}catch(e){toast('Sem conexão');B.end=1}
B.busy=0;renderCol(from)}
const custom=()=>(ST('custom')||[]).filter(c=>(B.rel?c.name.toLowerCase().includes(String(B.rel.a||B.rel.n).toLowerCase()):(!B.q||c.name.toLowerCase().includes(B.q.toLowerCase())))&&(!B.t||B.rel||({mon:isMon(c)&&!isEx(c),sp:/Spell/.test(c.type),tr:/Trap/.test(c.type),ex:isEx(c)})[B.t])&&passF(c));
const BLS={tcg:'TCG',ocg:'OCG',md:'MD'},IC={fav:'<span class="si">★</span>',mon:'<i class="ic" style="--c:#e08a2a"></i>',sp:'<i class="ic" style="--c:#2ab58a"></i>',tr:'<i class="ic" style="--c:#d14c9a"></i>',ex:'<i class="ic" style="--c:#8a5cd0"></i>',fun:'<svg viewBox="0 0 24 24" width="17" height="17"><path d="M3 4h18l-7 8v7l-4 2v-9z" fill="#fff"/></svg>',cr:'<svg viewBox="0 0 24 24" width="17" height="17"><path d="M3 18l1-10 5 4 3-7 3 7 5-4 1 10z" fill="#ffd34a"/></svg>',mg:'<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="10" cy="10" r="6" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M15 15l6 6" stroke="#fff" stroke-width="3"/></svg>'};
const lite=c=>{if(!c.custom)return c;const x=Object.assign({},c);delete x.img;delete x.art;return x},hyd=c=>{if(!c.custom)return c;const m=(ST('custom')||[]).find(z=>z.id==c.id);if(!m)return c;const r=Object.assign({},c,m);delete r.art;delete r.src;return r};
function menuView(){$('#menuInner').innerHTML=`<div class="menu-grid"><div class="menu-item" onclick="setupView()"><div class="menu-icon">⚔️</div><span>Duelar</span></div><div class="menu-item" onclick="decksView()"><div class="menu-icon">🃏</div><span>Meus Decks</span></div><div class="menu-item" onclick="cfgAllSheet()"><div class="menu-icon">⚙️</div><span>Configurações</span></div><div class="menu-item" onclick="if(confirm('Sair do app?')){localStorage.clear();show('menu');menuView()}"><div class="menu-icon">🚪</div><span>Sair</span></div></div>`;show('menu')}

function decksView(){const D=ST('decks')||[];$('#decks').innerHTML=`<h2>Meus decks</h2>${D.map((d,i)=>`<div class="row"><b>${d.star?'★ ':''}${esc(d.n)}</b><span>${d.c.length}</span><button onclick="editDeck(${i})">Editar</button><button onclick="delDeck(${i})">Apagar</button></div>`).join('')||'<p>Nenhum deck ainda.</p>'}<div class="bt"><button onclick="editDeck(-1)">Novo deck</button><button onclick="show('menu')">Voltar</button></div>`;show('decks')}
function delDeck(i){if(!confirm('Apagar deck?'))return;const D=ST('decks');D.splice(i,1);SV('decks',D);decksView()}
function editDeck(i){const D=ST('decks')||[];B=Object.assign({i,n:'',c:[],t:'',q:'',sd:0,staple:0,attr:'',lv:'',sort:'name',col:[],off:0,end:0,busy:0,rid:0,exp:ST('hf')?1:0,rel:null,f:fnew(),big:0,lock:0,star:0},i<0?{}:{n:D[i].n,c:D[i].c.map(hyd),star:D[i].star||0});sortDeck();{const h=ST('dkh');if(h)$('#bld').style.setProperty('--dkh',Math.min(h,innerHeight*.6)+'px')}show('bld');reload();refreshBan(B.c);if(bl()=='md')loadMD()}
function reload(){B.col=[];B.off=0;B.end=0;B.busy=0;B.rid++;bldView();loadMore()}
function bldView(){const fl=[B.sd&&'Speed Duel',B.staple&&'Populares',B.q&&'"'+B.q+'"',B.t&&TN[B.t],...fLabels(),B.rel&&'Relacionados: '+(B.rel.a||B.rel.n)].filter(Boolean).join(', ')||'Desl.',sn=SORTS.find(s=>s[0]==B.sort)[1],ch=(t,l)=>`<button class="${B.t==t?'on':''}" onclick="setT('${t}')">${IC[t]||''}${l}</button>`;
$('#bld').className='scr on'+(B.exp?' x':'');
$('#bld').innerHTML=`<div class="dh"><div class="nm"><span>✎</span><input value="${esc(B.n)}" placeholder="Nome do deck" oninput="B.n=this.value"></div><button onclick="menuSheet()">MENU</button></div>
<div class="dh2"><div class="cnt"><div><i class="ic dk"></i>Deck Principal <b id="cm"></b></div><div><i class="ic exx">EX</i>Deck Adicional <b id="ce"></b></div></div><div class="st" id="stt"></div><button class="sq" onclick="rulesSheet()">i</button></div>
<div class="dh3"><button class="sq rd" onclick="clearDeck()">🗑</button><button onclick="autoDeck()">Automontar deck</button><button onclick="cfgSheet()">Configurações de Deck</button><button class="sq gn" onclick="B.lock^=1;toast(B.lock?'Deck travado':'Deck liberado');bldView()">${B.lock?'🔒':'🔓'}</button><button class="sq gn" onclick="B.star^=1;bldView()">${B.star?'★':'☆'}</button></div>
<div class="dkp" id="dk" data-z="bdeck"></div>
<div class="dv" id="dvb"><button class="sq" onclick="togX(this)">${B.exp?'▼':'▲'}</button><div>Ordenar por: ${sn}<br>Filtro: ${esc(fl)}${B.rel?' <button class="sq" onclick="B.rel=null;reload()">✕</button>':''}</div></div>
<div class="fxw fx"><div class="chips">${ch('fav','Cards favoritos')}${ch('mon','Monstros')}${ch('sp','Magias')}${ch('tr','Armadilha')}${ch('ex','Deck Adicional')}</div>
<div class="chips"><button class="fbt" onclick="fltSheet()">${IC.fun}Filtro</button><button class="${B.staple?'on':''}" onclick="B.staple^=1;reload()">${IC.cr}Cards populares</button><button onclick="txtSheet()">${IC.mg}Busca por texto</button><button class="sq" onclick="clrF()">🗑</button></div>
<div class="chips"><select onchange="B.sort=this.value;reload()">${SORTS.map(s=>`<option value="${s[0]}" ${s[0]==B.sort?'selected':''}>Ordenar por: ${s[1]}</option>`).join('')}</select><button class="sq" onclick="cycBl()">${BLS[bl()]}</button><button class="sq" onclick="B.big^=1;renderCol(0)">▢</button></div></div>
<div class="clp" id="cl" data-z="bcol" onscroll="colScroll(this)"></div>
<div class="bb"><button class="sq" onclick="decksView()">←</button><button onclick="saveDeck()">SALVAR</button><button onclick="copyDeck()">Copiar Deck</button><button class="sq" onclick="show('menu')">⌂</button></div>`;renderDeck();renderCol(0);initResize()}
function togX(b){B.exp^=1;SV('hf',B.exp);$('#bld').classList.toggle('x',!!B.exp);b.textContent=B.exp?'▼':'▲'}
function setT(t){B.t=B.t==t?'':t;reload()}
function clrF(){Object.assign(B,{t:'',q:'',sd:0,staple:0,rel:null,f:fnew()});reload()}
function renderDeck(){const m=B.c.filter(c=>!isEx(c)),e=B.c.filter(isEx),sl=(c)=>`<div class="sl" data-drag="dk" data-id="${B.c.indexOf(c)}" onclick="dkSheet(${B.c.indexOf(c)})">${cardEl(c,0)}${lvb(c)}${banB(c)}</div>`,es=n=>`<div class="es">${n}</div>`;
let h=m.map(sl).join('');for(let i=m.length;i<Math.min(30,Math.max(24,Math.ceil(m.length/6)*6));i++)h+=es(i+1);
h+='<div class="xh">Deck Adicional</div>'+e.map(sl).join('');for(let i=e.length;i<9;i++)h+=es(i+1);
$('#dk').innerHTML=h;$('#cm').textContent=m.length;$('#cm').style.color=m.length<20||m.length>30?'#ff7070':'#fff';$('#ce').textContent=e.length;
$('#stt').textContent=m.length<20?'Faltam '+(20-m.length)+' cartas no deck principal':m.length>30?'Deck principal passa de 30':e.length>9?'Deck adicional passa de 9':'Deck válido para Speed Duel'}
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
function cfgSheet(){sheet(`<h3>Configurações de Deck</h3><p>Banlist usada nos símbolos</p><select onchange="setBl(this.value)">${Object.keys(BLN).map(l=>`<option value="${l}" ${bl()==l?'selected':''}>${BLN[l]}</option>`).join('')}</select><label class="fl"><input type="checkbox" ${B.sd?'checked':''} onchange="B.sd=this.checked?1:0;reload()"> Mostrar só cartas do Speed Duel</label><div class="bt"><button onclick="impSheet()">Importar .ydk</button><button onclick="closeSh();clearDeck()">Limpar deck</button></div>`)}
function cycBl(){const k=Object.keys(BLN),n=k[(k.indexOf(bl())+1)%k.length];setBl(n);toast('Banlist: '+BLN[n]);bldView()}
function rulesSheet(){sheet('<h3>Regras do deck</h3><p>Deck principal: de 20 a 30 cartas. Deck adicional: até 9 cartas. No máximo 3 cópias de cada carta.</p><p>Toque numa carta para ver detalhes e cards relacionados. Segure uma carta da lista e arraste até o deck para adicionar. Segure uma carta do deck para completar a 2ª e a 3ª cópia. Arraste uma carta do deck para a lista para remover.</p><p>Os números vermelho (0), laranja (1) e azul (2) mostram Proibida, Limitada e Semi-limitada na banlist escolhida.</p>')}
let FD=null;
function fltSheet(){closeFlt();const d=document.createElement('div');d.id='fdl';d.className='fdl';FD={el:d,tab:'m'};document.body.appendChild(d);
d.onclick=e=>{const t=e.target,o=t.closest('[data-g]');if(o){fTog(o);return}const b=t.closest('[data-tab]');if(b){FD.tab=b.dataset.tab;fRender();return}if(t.closest('.ftrash')){B.f=fnew();fRender();return}if(t.closest('.fclose')||t.classList.contains('fbk'))closeFlt(1)};fRender()}
function closeFlt(apply){const d=$('#fdl');if(d)d.remove();FD=null;if(apply)reload()}
function fTog(o){const g=o.dataset.g,v=(g=='lv'||g=='sc')?+o.dataset.v:o.dataset.v,a=B.f[g],i=a.indexOf(v);if(i<0)a.push(v);else a.splice(i,1);o.classList.toggle('on',i<0)}
function fRender(){if(!FD)return;const f=B.f,m=FD.tab=='m',opt=(g,v,l)=>`<div class="fo${f[g].includes(v)?' on':''}" data-g="${g}" data-v="${esc(v)}"><i></i><span>${esc(l)}</span></div>`,
sec=(ic,t,it)=>`<div class="fs"><div class="fh">${ic}<b>${t}</b></div><div class="fg">${it}</div></div>`,
nums=(g,a,b)=>Array.from({length:b-a+1},(_,i)=>opt(g,a+i,a+i)).join(''),
ef=sec('<i class="fi eff">✸</i>','Efeito do Card',FE.map(x=>opt('ef',x[0],x[1])).join(''));
FD.el.innerHTML=`<div class="fbk"></div><div class="fwin"><div class="ftit">Filtro Detalhado</div><div class="ftabs"><button class="${m?'on':''}" data-tab="m">Monstros</button><button class="${m?'':'on'}" data-tab="s">Magias/Armadilhas</button></div><div class="fbody">${m?sec('<i class="fi card" style="--c:#e0a030"></i>','Tipo de Card',FT.map(x=>opt('ty',x[0],x[1])).join(''))+sec('<i class="fi att"></i>','Atributo',FA.map(x=>opt('at',x[0],x[1])).join(''))+sec('<i class="fi race"></i>','Tipo',FR.map(x=>opt('rc',x[0],x[1])).join(''))+sec('<i class="fi lvl"><b>★</b><u>L</u></i>','Nível/Classificação/Link',nums('lv',1,12))+sec('<i class="fi sca"></i>','Escala de Pêndulo',nums('sc',0,13)):sec('<i class="fi card" style="--c:#2ab58a"></i>','Magia',FS.map(x=>opt('sp',x[0],x[1])).join(''))+sec('<i class="fi card" style="--c:#d14c9a"></i>','Armadilha',FTR.map(x=>opt('tp',x[0],x[1])).join(''))}${ef}</div><div class="ffoot"><button class="fclose">FECHAR</button><button class="ftrash">🗑</button></div></div>`}
function txtSheet(){sheet(`<h3>Busca por texto</h3><input id="tq" value="${esc(B.q)}" placeholder="Nome da carta"><div class="bt"><button onclick="B.q=$('#tq').value.trim();closeSh();reload()">Buscar</button></div>`)}
function impSheet(){sheet('<h3>Importar .ydk</h3><textarea id="yd" rows="8" placeholder="Cole o conteúdo do arquivo .ydk"></textarea><div class="bt"><button onclick="imp()">Importar</button></div>')}
async function imp(){const ids=$('#yd').value.split(/!side/)[0].split(/\s+/).filter(x=>/^\d+$/.test(x));if(!ids.length)return toast('Nada para importar');closeSh();toast('Importando...');const u=[...new Set(ids)],M={};
try{for(let i=0;i<u.length;i+=40){const r=await fetch(API+'?id='+u.slice(i,i+40).join(','));if(r.ok)(await r.json()).data.forEach(c=>M[c.id]=norm(c))}}catch(e){return toast('Sem conexão')}
ids.forEach(i=>M[i]&&B.c.push(M[i]));sortDeck();renderDeck();renderCol(0);toast(B.c.length+' cartas no deck')}
/* ---------- criar cartas ---------- */
(function(){const c=ST('custom');if(c&&c.length){SV('custom',[]);console.log('Cartas custom removidas')}})();
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
if(k=='gy'||k=='ban'){const a=P[k],t=a[a.length-1];return`<div class="cell pile" ${dz} ${t?`data-drag="p" data-id="${t.u}"`:''} onclick="pile(${p},'${k}')">${t?cardEl(t,0):''}<span class="lb">${NM[k]}</span><em>${a.length}</em></div>`}
const c=P.s[k],pd=k=='s0'||k=='s2',n=c&&c.mat?c.mat.length:0,sc=c&&!c.fd&&/Pendulum/i.test(c.type||'')&&c.sc!=null?c.sc:'';
return`<div class="cell ${k[0]}${pd?' pd':''}${c&&c.df?' df':''}${n?' stk':''}${G.pend?' hl':''}" ${dz} ${c?`data-drag="f" data-id="${c.u}"`:''} onclick="slot(${p},'${k}')">${c?(n?stackHtml(c):cardEl(c,c.fd)):`<span class="lb">${LAB[k]}</span>`}${pd?`<span class="gm ${k=='s0'?'r':'b'}">${sc}</span>`:''}</div>`}
const rowST=(p,r)=>(r?['deck','s2','s1','s0','extra']:['extra','s0','s1','s2','deck']).map(k=>cell(p,k)).join(''),rowM=(p,r)=>(r?['gy','m2','m1','m0','fz']:['fz','m0','m1','m2','gy']).map(k=>cell(p,k)).join('');
const lpC=p=>`<div class="lpb" onclick="lpSheet(${p})"><small>${esc(G.p[p].name)}</small><b>${G.p[p].lp}</b></div>`;
function strip(p,mine){const P=G.p[p];return`<div class="hand" data-z="${p}|hand">${P.hand.map(c=>`<div class="hc" ${mine?`data-drag="h" data-id="${c.u}" onclick="act('${c.u}')"`:''}>${cardEl(c,!mine)}</div>`).join('')}</div>`}
function render(){applyBg();applySleeve();const me=G.me,op=1-me;$('#duel').innerHTML=`<div class="strip top">${G.pend?`<div class="ban">Escolha uma zona<button onclick="G.pend=null;render()">Cancelar</button></div>`:strip(op,0)}</div><div class="bd">${rowST(op,1)}${rowM(op,1)}${cell(op,'ban')}${cell(op,'em')}<div class="cell ph" onclick="nextPh()"><small>Turno ${G.turn}</small><b>${PH[G.ph]}</b></div>${cell(me,'em')}${cell(me,'ban')}${rowM(me)}${rowST(me)}</div><div class="tools">${lpC(op)}<button onclick="undo()">↶</button><button onclick="toast(Math.random()<.5?'Cara':'Coroa')">🪙</button><button onclick="toast('Dado: '+(1+Math.random()*6|0))">🎲</button><button onclick="G.me=1-G.me;render()">⇄</button><button onclick="if(confirm('Sair do duelo?'))show('menu')">✕</button>${lpC(me)}</div><div class="strip bot">${strip(me,1)}</div>${G.over!=null?endHtml():''}`}
function nextPh(){snap();if(++G.ph>=PH.length){G.ph=0;G.turn++}render()}
function slot(p,k){const c=G.p[p].s[k];if(G.pend){const q=G.pend;G.pend=null;if(c&&c.u==q.u){render();return}return place(q.u,p,k,q)}if(c){if(c.mat&&c.mat.length)stkMenu(p,k);else act(c.u)}}
function pend(u,fd,df){G.pend={u,fd,df};closeSh();render()}
function flip(u,k){const f=find(u);snap();f.c[k]^=1;closeSh();render()}
function pile(p,z){if(G.pend)return;const a=G.p[p][z];sheet(`<h3>${NM[z]} de ${esc(G.p[p].name)}: ${a.length}</h3><div class="gr">${a.map(c=>`<div class="hc" data-drag="p" data-id="${c.u}" onclick="act('${c.u}')">${cardEl(c,0)}</div>`).join('')||'<p>Vazio</p>'}</div>`)}
function act(u){const f=find(u);if(!f)return;const c=f.c,mat=!!f.par,fld=!PZ.includes(f.z)&&!mat,ex=isEx(c),n=(c.mat||[]).length,B=(t,fn)=>`<button onclick="${fn}">${t}</button>`,to=(t,z,o)=>B(t,`mv('${u}',0,'${z}',{${o||''}})`);
sheet(det(c,fld&&c.fd&&f.p!=G.me)+'<div class="bt">'+[mat?to('Retirar → Cemitério','gy'):'',B(ex?'Invocar (ATK)':'Invocar / Ativar',`pend('${u}',0,0)`),ex?B('Invocar (DEF)',`pend('${u}',0,1)`):'',mat?'':B('Baixar',`pend('${u}',1,${isMon(c)?1:0})`),mat?B('Trazer para o topo',`toTop('${u}')`):'',fld?B('Virar',`flip('${u}','fd')`):'',fld&&isMon(c)?B('Posição',`flip('${u}','df')`):'',fld?B('Mover de zona',`pend('${u}',${c.fd},${c.df})`):'',f.z!='hand'?to('Mão','hand'):'',!mat&&f.z!='gy'?to('Cemitério','gy'):'',f.z!='ban'?to('Banir','ban'):'',ex?(f.z!='extra'?to('Extra Deck','extra'):''):to('Topo do deck','deck','top:1')+to('Fundo do deck','deck')].join('')+'</div>')}
let LPI='';
function lpSheet(p){LPI='';lpDraw(p)}
function lpDraw(p){sheet(`<h3>${esc(G.p[p].name)}</h3><div class="lpd"><small>Pontos de vida atual</small><b>${G.p[p].lp}</b></div><input id="lpv" type="number" inputmode="numeric" placeholder="Digite o valor (use - para subtrair)" style="width:100%;text-align:center;font-size:22px;padding:10px;margin:8px 0" onkeydown="if(event.key==='Enter')lpApply2(${p})"></div>`)}
function lpApply2(p){const v=+$('#lpv').value||0;if(!v)return toast('Digite um valor');snap();G.p[p].lp=Math.max(0,G.p[p].lp+v);closeSh();render()}
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
const w=String(c.name).split(/\s+/)[0];Object.assign(B,{t:'',q:'',sd:0,staple:0,f:fnew(),rel:a?{a}:{n:w.length>2?w:c.name}});reload()})()}
/* ---------- arrastar e soltar (deck e duelo) ---------- */
const DR={s:null,z:null};let noClk=0;
const dgCard=s=>s.k=='col'?B.col[s.id]:s.k=='dk'?B.c[s.id]:(find(s.id)||{}).c;
const dgZ=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.closest('[data-z]')};
function dgSet(z){if(DR.z&&DR.z!==z)DR.z.classList.remove('dzh');DR.z=z;if(z)z.classList.add('dzh')}
function dgPos(x,y){const s=DR.s;s.g.style.left=x+'px';s.g.style.top=y+'px';dgSet(dgZ(x,y))}
function dgClr(s){clearTimeout(s.tm);clearTimeout(s.c1);clearTimeout(s.c2)}
function dgOff(s){if(s.g){s.g.remove();s.g=null}dgSet(null);s.t.classList.remove('dgs');document.body.classList.remove('dg');s.on=0}
function dgBack(s){const g=s.g;if(!g){dgOff(s);return}s.g=null;dgSet(null);document.body.classList.remove('dg');s.on=0;const r=s.r;
g.style.transition='left .2s ease,top .2s ease,width .2s ease,transform .2s ease,opacity .2s ease';
requestAnimationFrame(()=>{g.style.left=(r.left+r.width/2)+'px';g.style.top=(r.top+r.height/2)+'px';g.style.width=r.width+'px';g.style.transform='translate(-50%,-50%) scale(1)';g.style.opacity='.7'});
setTimeout(()=>{g.remove();s.t.classList.remove('dgs')},230)}
function dgBegin(){const s=DR.s;if(!s||s.on)return;clearTimeout(s.tm);const c=dgCard(s);if(!c){DR.s=null;return}s.on=1;
const g=document.createElement('div');g.className='ghost';g.innerHTML=cardEl(c,s.k=='f'?c.fd:0);document.body.appendChild(g);s.g=g;s.t.classList.add('dgs');document.body.classList.add('dg');
if(s.k=='p')$('#sh').classList.add('dgh');if(navigator.vibrate)navigator.vibrate(12);dgPos(s.lx,s.ly)}
function dgEnd(drop){const s=DR.s;if(!s)return;dgClr(s);DR.s=null;if(s.cp)noClk=Date.now()+450;if(!s.on)return;
const z=DR.z?DR.z.dataset.z:null;noClk=Date.now()+450;let done=false;
if(drop&&z)done=dgDrop(s,z);
if(done)dgOff(s);else dgBack(s);
$('#sh').classList.remove('dgh')}
function dkCopy(s){if(DR.s!==s||s.mv0||!s.cid)return;const c=B.c.find(x=>x.id==s.cid);if(!c)return;const n=B.c.filter(x=>x.id==c.id).length;if(n>=3)return;
addC(c);if(B.c.filter(x=>x.id==c.id).length<=n)return;s.cp=(s.cp||0)+1;if(navigator.vibrate)navigator.vibrate(20);toast((n+1)+' cópias no deck')}
function dgDrop(s,z){if(s.k=='col'){if(z!='bdeck')return false;const n=B.c.length;addC(B.col[s.id]);return B.c.length>n}
if(s.k=='dk'){if(z!='bcol'||s.cid==null)return false;const n=B.c.length;rmId(s.cid);return B.c.length<n}
const[a,k]=z.split('|');return k?dropCard(s.id,+a,k):false}
function dropCard(u,p,k){const f=find(u);if(!f)return false;const c=f.c;
if(PZ.includes(k)){if(f.z==k&&!f.par)return false;if(k=='extra'&&!isEx(c)){toast('Só cartas do Deck Adicional');return false}if(k=='deck'&&isEx(c)){toast('Carta do Deck Adicional não vai ao deck');return false}mv(u,p,k,k=='deck'?{top:1}:{});return true}
if(f.p==p&&f.z==k&&!f.par)return false;
place(u,p,k,PZ.includes(f.z)||f.par?{fd:0,df:0}:{fd:c.fd,df:c.df});return true}
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-drag]');if(!t||DR.s||(e.pointerType=='mouse'&&e.button))return;
const k=t.dataset.drag,touch=e.pointerType!='mouse',s=DR.s={t,k,id:t.dataset.id,r:t.getBoundingClientRect(),x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,on:0,touch,pid:e.pointerId};
if(k=='dk'){const cd=B.c[s.id];s.cid=cd&&cd.id;s.c1=setTimeout(()=>dkCopy(s),700);s.c2=setTimeout(()=>dkCopy(s),1300)}
if(touch&&(k=='col'||k=='dk'||k=='p'))s.tm=setTimeout(dgBegin,220)});
document.addEventListener('pointermove',e=>{const s=DR.s;if(!s||e.pointerId!=s.pid)return;s.lx=e.clientX;s.ly=e.clientY;
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
function loadCustomImg(type){
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const data=ev.target.result;if(type==='bg'){SV('bg',data);applyBg();toast('Tapete salvo')}else{SV('sleeve',data);applySleeve();toast('Sleeve salvo')}};r.readAsDataURL(f)};input.click()}
function applyBg(){const bg=ST('bg');if(bg&&G){document.querySelector('.bd').style.backgroundImage=`url(${bg})`}}
function applySleeve(){const sl=ST('sleeve');if(sl){let s=document.getElementById('sleeveStyle');if(!s){s=document.createElement('style');s.id='sleeveStyle';document.head.appendChild(s)}s.textContent=`.back{background-image:url(${sl});background-size:cover;border:2px solid #2a1408}`}else{const s=document.getElementById('sleeveStyle');if(s)s.remove()}}
function cfgAllSheet(){sheet(`<h3>Configurações</h3><label class="fl"><input type="checkbox" ${ST('hf')?'checked':''} onchange="SV('hf',this.checked?1:0);toast('Salvo')"> Expandido por padrão</label><label class="fl"><input type="checkbox" ${ST('sd')?'checked':''} onchange="SV('sd',this.checked?1:0);toast('Salvo')"> Só Speed Duel</label><div class="bt"><button onclick="loadCustomImg('bg')">🖼️ Tapete do campo</button><button onclick="loadCustomImg('sleeve')">🃏 Capa das cartas</button></div><div class="bt"><button onclick="closeSh()">Fechar</button></div>`)}
addEventListener('load',()=>{setTimeout(menuView,100);applySleeve();applyBg()});
