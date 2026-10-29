const $=s=>document.querySelector(s),IMG='https://image.tmdb.org/t/p/';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const yr=m=>(m.release_date||'').slice(0,4)||'–';
const nt=m=>m.vote_average?m.vote_average.toFixed(1).replace('.',','):'–';

async function api(path,params={}){
  const k=CONFIG.apiKey,bearer=k.length>40,u=new URL('https://api.themoviedb.org/3'+path),q={language:CONFIG.lang,...params};
  if(!bearer)q.api_key=k;
  for(const[a,b]of Object.entries(q))if(b!==''&&b!=null)u.searchParams.set(a,b);
  const r=await fetch(u,bearer?{headers:{Authorization:'Bearer '+k}}:{}).catch(()=>{throw Error('Sem conexão com o TMDB. Confira a internet.')});
  if(!r.ok)throw Error(r.status==401?'Chave do TMDB inválida. Cole a sua em apiKey, no config.js.':'O TMDB respondeu com erro '+r.status+'.');
  return r.json();
}

document.title=CONFIG.siteName;
$('#logo').textContent=CONFIG.siteName;
$('#dh').textContent='Indicados do '+CONFIG.devName;

const T=['cobalto','giallo','nitrato','brasil','pb','bladerunner','matrix','laranja','budapest','drive','sincity','fargo','suspiria'];let ti=0;
try{ti=+localStorage.th||0}catch(e){}
const setT=()=>{document.documentElement.dataset.t=T[ti%13];try{localStorage.th=ti%13}catch(e){}};
setT();$('#th').onclick=()=>{ti++;setT()};

function route(){
  const h=location.hash.slice(2),r=['recomendar','dev'].includes(h)?h:'catalogo';
  document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!='v-'+r);
  document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.hash=='#/'+r));
  if(r=='dev')loadDev();
  scrollTo(0,0);
}
addEventListener('hashchange',route);

/* Catálogo e busca */
const f=$('#f'),grid=$('#grid'),st=$('#st'),more=$('#more'),ro=$('#ro');let page=1;
const opts=(el,a)=>el.insertAdjacentHTML('beforeend',a.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join(''));
opts(f.country,Object.entries(CONFIG.countries));
api('/genre/movie/list').then(g=>opts(f.genre,g.genres.map(x=>[x.id,x.name]))).catch(()=>{});

const card=m=>`<button class="card" data-id="${m.id}">${m.poster_path?`<img loading="lazy" alt="" src="${IMG}w342${m.poster_path}">`:`<div class="noimg">${esc(m.title)}</div>`}<span class="nota">${nt(m)}</span><b>${esc(m.title)}</b><small>${yr(m)}</small></button>`;
const pid=async n=>n.trim()?(await api('/search/person',{query:n})).results[0]?.id||-1:'';

async function run(reset=true){
  if(reset){page=1;grid.innerHTML=''}
  st.textContent='Revelando os fotogramas…';more.hidden=true;
  try{
    const v=Object.fromEntries(new FormData(f));let r;
    if(v.q.trim()){ // com título, só ano e nota valem
      r=await api('/search/movie',{query:v.q,page});
      r.results=r.results.filter(m=>(!v.from||+yr(m)>=v.from)&&(!v.to||+yr(m)<=v.to)&&m.vote_average>=v.rating);
    }else{
      const[c,d]=await Promise.all([pid(v.cast),pid(v.crew)]);
      r=await api('/discover/movie',{page,sort_by:v.sort,with_cast:c,with_crew:d,with_origin_country:v.country,with_genres:v.genre,
        'primary_release_date.gte':v.from&&v.from+'-01-01','primary_release_date.lte':v.to&&v.to+'-12-31',
        'vote_average.gte':v.rating,'vote_count.gte':CONFIG.minVotes});
    }
    grid.insertAdjacentHTML('beforeend',r.results.map(card).join(''));
    st.textContent=grid.children.length?r.total_results.toLocaleString('pt-BR')+' filmes encontrados':'Nenhum filme com esses filtros. Confira a grafia dos nomes ou afrouxe nota e anos.';
    more.hidden=page>=r.total_pages;
  }catch(e){st.textContent=e.message}
}
f.onsubmit=e=>{e.preventDefault();run()};
f.onreset=()=>setTimeout(()=>{ro.textContent=0;run()});
f.rating.oninput=()=>ro.textContent=f.rating.value;
more.onclick=()=>{page++;run(false)};

/* Me recomende um filme */
const R=$('#reco'),res=$('#result'),seen=new Set();
for(const k in CONFIG.reco)R.elements[k].innerHTML=CONFIG.reco[k].map((o,i)=>`<option value="${i}">${esc(o[0])}</option>`).join('');
R.onchange=()=>seen.clear();
R.onsubmit=async e=>{
  e.preventDefault();res.innerHTML='<p>Procurando na prateleira…</p>';
  const p=Object.assign({},...Object.keys(CONFIG.reco).map(k=>CONFIG.reco[k][R.elements[k].value][1]));
  if(p.countries){p.with_origin_country=rnd(p.countries);delete p.countries}
  const steps=[[],['with_runtime.lte','with_runtime.gte'],['with_origin_country'],['primary_release_date.gte','primary_release_date.lte'],['with_genres']];
  try{
    for(let i=0;i<steps.length;i++){
      steps[i].forEach(k=>delete p[k]);
      const pg=1+Math.floor(Math.random()*3);
      let r=(await api('/discover/movie',{...p,sort_by:'popularity.desc',page:pg})).results;
      if(!r.length&&pg>1)r=(await api('/discover/movie',{...p,sort_by:'popularity.desc'})).results;
      r=r.filter(m=>!seen.has(m.id));
      if(r.length){
        const m=rnd(r);seen.add(m.id);
        res.innerHTML=`<article class="hit">${m.poster_path?`<img src="${IMG}w500${m.poster_path}" alt="">`:''}<div><h2>${esc(m.title)}</h2><p class="sub">Lançado em ${yr(m)}, nota ${nt(m)}</p><p>${esc(m.overview||'Sem sinopse em português.')}</p>${i?'<p class="sub">Não achei com todos os critérios, então afrouxei alguns.</p>':''}<button class="b" data-id="${m.id}">Ver detalhes</button><button class="b ghost" id="again">Sortear outro</button></div></article>`;
        return;
      }
    }
    res.innerHTML='<p>Nada encontrado. Troque algum campo da frase e tente de novo.</p>';
  }catch(e){res.innerHTML=`<p>${esc(e.message)}</p>`}
};

/* Indicados do Dev */
const dev=$('#dev');
const pick=async([q,year,nota,note])=>{try{
  const m=typeof q=='number'?await api('/movie/'+q):(await api('/search/movie',{query:q,year})).results[0];
  return m&&{...m,vote_average:nota,note}}catch(e){return null}};
const pickCard=m=>`<article class="pick">${card(m)}${m.note?`<p>${esc(m.note)}</p>`:''}</article>`;
function loadDev(){
  if(dev.dataset.ok)return;dev.dataset.ok=1;dev.className='genres';
  dev.insertAdjacentHTML('beforebegin','<p class="sub">O selo redondo é a nota do Dev, de 0 a 10.</p>');
  const io=new IntersectionObserver(es=>es.forEach(async e=>{
    if(!e.isIntersecting)return;io.unobserve(e.target);
    const s=e.target,g=s.dataset.g,box=s.querySelector('.grid');
    if(g){
      const ms=(await Promise.all(CONFIG.devPicks[g].map(pick))).filter(Boolean);
      box.innerHTML=ms.map(pickCard).join('')||'<p>Nada carregado. Confira a chave da API no config.js.</p>';
    }else{
      const ms=(await Promise.all(CONFIG.inspirados.map(async([q,y,t,n])=>{const m=await pick([q,y,0,n]);return m&&{...m,t}}))).filter(Boolean);
      box.innerHTML=ms.map(m=>`<article class="pick">${card(m)}${m.note?`<p>${esc(m.note)}</p>`:''}${m.t?`<button class="chip" data-tema="${esc(m.t)}">Tema ${esc(m.t)}</button>`:''}</article>`).join('');
    }
  }),{rootMargin:'300px'});
  for(const g in CONFIG.devPicks)dev.insertAdjacentHTML('beforeend',`<section class="gen" data-g="${esc(g)}"><h2>${esc(g)}</h2><div class="grid dev"></div></section>`);
  dev.insertAdjacentHTML('beforeend','<section class="ins"><h3>Filmes que inspiraram o site</h3><p class="sub">Cada um virou um tema. Clique no botão para trocar o visual.</p><div class="grid mini"></div></section>');
  dev.querySelectorAll('section').forEach(s=>io.observe(s));
  dev.addEventListener('click',e=>{
    const b=e.target.closest('[data-tema]');if(!b)return;
    const i=typeof T!='undefined'?T.indexOf(b.dataset.tema):-1;
    if(i>=0&&typeof setT=='function'){ti=i;setT()}else document.documentElement.dataset.t=b.dataset.tema;
  });
}

/* Detalhes do filme */
const dlg=$('#dlg'),body=$('#dbody');
async function openMovie(id){
  body.innerHTML='<p style="padding:24px">Carregando…</p>';if(!dlg.open)dlg.showModal();
  try{
    const m=await api('/movie/'+id,{append_to_response:'credits,videos',include_video_language:'pt,en,null'});
    const dir=m.credits.crew.filter(c=>c.job=='Director'),cast=m.credits.cast.slice(0,8);
    const t=m.videos.results.find(v=>v.site=='YouTube'&&v.type=='Trailer');
    const ppl=(a,k)=>a.map(c=>`<button class="chip" data-p="${esc(c.name)}" data-k="${k}">${esc(c.name)}</button>`).join('');
    body.innerHTML=`<div class="dd">${m.poster_path?`<img src="${IMG}w342${m.poster_path}" alt="">`:''}<div><h2>${esc(m.title)}</h2>${m.original_title!=m.title?`<p class="sub">${esc(m.original_title)}</p>`:''}<dl class="ft"><div><dt>Ano</dt><dd>${yr(m)}</dd></div><div><dt>Duração</dt><dd>${m.runtime?m.runtime+' min':'–'}</dd></div><div><dt>País</dt><dd>${esc(m.production_countries.map(c=>CONFIG.countries[c.iso_3166_1]||c.name).join(', ')||'–')}</dd></div><div><dt>Nota</dt><dd>${nt(m)} (${m.vote_count})</dd></div></dl><p>${m.genres.map(g=>`<span class="chip">${esc(g.name)}</span>`).join('')}</p>${m.tagline?`<p class="tag">${esc(m.tagline)}</p>`:''}<p>${esc(m.overview||'Sem sinopse em português.')}</p>${dir.length?`<p class="sub">Direção</p><p>${ppl(dir,'crew')}</p>`:''}<p class="sub">Elenco</p><p>${ppl(cast,'cast')}</p><p>${t?`<a class="b" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${t.key}">Ver trailer</a> `:''}<a class="b ghost" target="_blank" rel="noopener" href="https://www.themoviedb.org/movie/${m.id}">Abrir no TMDB</a></p></div></div>`;
  }catch(e){body.innerHTML=`<p style="padding:24px">${esc(e.message)}</p>`}
}
dlg.onclick=e=>{if(e.target==dlg)dlg.close()};
document.addEventListener('click',e=>{
  const t=e.target,c=t.closest('[data-id]'),p=t.closest('[data-p]');
  if(t.closest('[data-x]'))dlg.close();
  else if(p){dlg.close();f.reset();f.elements[p.dataset.k].value=p.dataset.p;location.hash='#/catalogo'} // o reset dispara a busca
  else if(c)openMovie(c.dataset.id);
  else if(t.id=='again')R.requestSubmit();
});

route();run();

/* ===== Campeonato de filmes + filtro novo do "Me recomende" + botão do Letterboxd ===== */
(()=>{
const DF=getComputedStyle($('h1')).fontFamily,BF=getComputedStyle(document.body).fontFamily;
document.documentElement.style.setProperty('--df',DF);

/* Botão do Letterboxd (troque o link com CONFIG.letterboxd, no config.js) */
$('#v-dev h1').insertAdjacentHTML('afterend',`<p><a class="b" target="_blank" rel="noopener" href="${CONFIG.letterboxd||'https://boxd.it/5Gbrn/'}">Meu Letterboxd</a></p>`);

/* "Me recomende": só vale filme cujo gênero PRINCIPAL (o 1º do detalhe, o mesmo do pop-up) é o escolhido */
if(typeof R!='undefined')R.onsubmit=async e=>{
  e.preventDefault();res.innerHTML='<p>Procurando na prateleira…</p>';
  const p=Object.assign({},...Object.keys(CONFIG.reco).map(k=>CONFIG.reco[k][R.elements[k].value][1]));
  if(p.countries){p.with_origin_country=rnd(p.countries);delete p.countries}
  const g=p.with_genres;
  p.without_genres=g&&g!=16?'10770,16':'10770'; // sem filme de TV e, se pediu outro gênero, sem animação
  const steps=[[],['with_runtime.lte','with_runtime.gte'],['with_origin_country'],['primary_release_date.gte','primary_release_date.lte']];
  try{
    for(let i=0;i<steps.length;i++){
      steps[i].forEach(k=>delete p[k]);
      const pgs=[1,2,3,4].sort(()=>Math.random()-.5).slice(0,3);
      let r=(await Promise.all(pgs.map(pg=>api('/discover/movie',{...p,sort_by:'popularity.desc',page:pg}).then(x=>x.results)))).flat();
      r=r.filter(m=>m.poster_path&&!seen.has(m.id)).sort(()=>Math.random()-.5);
      if(g){ // confere o gênero principal na ficha de cada candidato
        const cand=r.slice(0,24);r=[];
        for(let j=0;j<cand.length&&!r.length;j+=8){
          const ds=await Promise.all(cand.slice(j,j+8).map(m=>api('/movie/'+m.id).catch(()=>null)));
          r=ds.filter(d=>d&&d.genres[0]&&d.genres[0].id==g);
        }
      }
      if(r.length){
        const m=rnd(r);seen.add(m.id);
        res.innerHTML=`<article class="hit">${m.poster_path?`<img src="${IMG}w500${m.poster_path}" alt="">`:''}<div><h2>${esc(m.title)}</h2><p class="sub">Lançado em ${yr(m)}, nota ${nt(m)}</p><p>${esc(m.overview||'Sem sinopse em português.')}</p>${i?'<p class="sub">Não achei com todos os critérios, então afrouxei alguns.</p>':''}<button class="b" data-id="${m.id}">Ver detalhes</button><button class="b ghost" id="again">Sortear outro</button></div></article>`;
        return;
      }
    }
    res.innerHTML='<p>Nada encontrado. Troque algum campo da frase e tente de novo.</p>';
  }catch(e){res.innerHTML=`<p>${esc(e.message)}</p>`}
};

/* Aba do campeonato */
$('#th').insertAdjacentHTML('beforebegin','<a href="#/campeonato">Campeonato</a>');
$('main').insertAdjacentHTML('beforeend',`<section id="v-campeonato" class="cp" hidden>
<div id="cp-setup"><h1>Campeonato de filmes</h1>
<p class="cp-lead">Monte a chave, escolha o gênero e decida duelo a duelo quem leva o título. Só entram filmes em que o gênero escolhido é o principal.</p>
<p class="step"><b>1</b>Tamanho da chave</p>
<div class="cp-sizes" id="cp-sizes">${[[4,'Semifinal e final'],[8,'Das quartas em diante'],[16,'Das oitavas em diante'],[32,'Desde a primeira fase']].map(([n,t])=>`<button class="cp-size" aria-pressed="${n==8}" data-n="${n}"><b>${n}</b><small>${t}</small></button>`).join('')}</div>
<p class="step"><b>2</b>Gênero</p>
<div class="cp-gens" id="cp-gens"><span>Carregando gêneros…</span></div>
<button class="b" id="cp-go">Começar o campeonato</button><p id="cp-msg"></p></div>
<div id="cp-play" hidden></div><div id="cp-end" hidden></div></section>`);

const sec=$('#v-campeonato'),msg=$('#cp-msg'),go=$('#cp-go'),play=$('#cp-play');
const S={n:8,g:null,gn:'',round:[],next:[],all:[],i:0};
const NAMES={2:'Final',4:'Semifinal',8:'Quartas de final',16:'Oitavas de final',32:'Primeira fase'};
const PHASE={1:'Campeão',2:'Vice-campeão',3:'Semifinal',5:'Quartas de final',9:'Oitavas de final',17:'Primeira fase'};
const show=k=>{['setup','play','end'].forEach(s=>$('#cp-'+s).hidden=s!=k);scrollTo(0,0)};
let loaded=0;

async function loadGenres(){
  loaded=1;
  try{
    const g=await api('/genre/movie/list');
    $('#cp-gens').innerHTML=g.genres.filter(x=>x.id!=10770).map(x=>`<button class="cp-gen" aria-pressed="false" data-g="${x.id}">${esc(x.name)}</button>`).join('');
  }catch(e){loaded=0;$('#cp-gens').innerHTML=`<span>${esc(e.message)}</span>`}
}
$('#cp-sizes').onclick=e=>{const b=e.target.closest('[data-n]');if(!b)return;S.n=+b.dataset.n;document.querySelectorAll('.cp-size').forEach(x=>x.setAttribute('aria-pressed',x==b))};
$('#cp-gens').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;S.g=b.dataset.g;S.gn=b.textContent;document.querySelectorAll('.cp-gen').forEach(x=>x.setAttribute('aria-pressed',x==b))};

/* Modo do campeonato: todos os filmes ou só os melhores (nota 7 ou mais) */
S.min=0;
go.insertAdjacentHTML('beforebegin',`<p class="step"><b>3</b>Modo</p><div class="cp-gens" id="cp-modes"><button class="cp-gen" aria-pressed="true" data-m="0">Todos os filmes</button><button class="cp-gen" aria-pressed="false" data-m="7">Só os melhores (nota 7 ou mais)</button></div>`);
$('#cp-modes').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;S.min=+b.dataset.m;document.querySelectorAll('#cp-modes .cp-gen').forEach(x=>x.setAttribute('aria-pressed',x==b))};
$('#cp-gens').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;S.g=b.dataset.g;S.gn=b.textContent;document.querySelectorAll('#cp-gens .cp-gen').forEach(x=>x.setAttribute('aria-pressed',x==b))};

go.onclick=async()=>{
  if(!S.g){msg.textContent='Escolha um gênero para começar.';return}
  msg.textContent='Sorteando os competidores…';go.disabled=true;
  try{
    const rs=await Promise.all(Array.from({length:12},(_,i)=>api('/discover/movie',{with_genres:S.g,without_genres:'10770',sort_by:'vote_count.desc','vote_average.gte':S.min||6,'vote_count.gte':S.min?300:'',page:i+1}).then(r=>r.results).catch(()=>[])));
    const ids=new Set(),pool=rs.flat().filter(m=>m.poster_path&&m.release_date&&!ids.has(m.id)&&ids.add(m.id));
    pool.sort(()=>Math.random()-.5);
    msg.textContent='Conferindo o gênero principal de cada filme…';
    const good=[];
    for(let i=0;i<pool.length&&i<160&&good.length<S.n;i+=16){
      const ds=await Promise.all(pool.slice(i,i+16).map(m=>api('/movie/'+m.id).catch(()=>null)));
      ds.forEach(d=>{if(d&&d.poster_path&&d.genres[0]&&d.genres[0].id==S.g)good.push(d)});
    }
    let n=S.n;while(n>good.length&&n>2)n/=2;
    if(n<4){msg.textContent=S.min?'Poucos filmes com nota 7 ou mais nesse gênero. Tente outro gênero ou o modo com todos os filmes.':'Poucos filmes com esse gênero como principal. Tente outro gênero.';return}
    S.round=good.slice(0,n).map(m=>({...m,pos:1}));S.all=[...S.round];S.next=[];S.i=0;S.size=n;S.busy=0;
    S.note=(S.min?'Só nota 7 ou mais. ':'')+(n<S.n?`Só achei filmes para uma chave de ${n}.`:'');
    msg.textContent='';show('play');duel();
  }catch(e){msg.textContent=e.message}finally{go.disabled=false}
};

const fighter=(m,k)=>`<article class="fighter${k?' r':''}" data-k="${k}">${m.poster_path?`<img src="${IMG}w342${m.poster_path}" alt="">`:`<div class="noimg">${esc(m.title)}</div>`}<div class="fi"><h2>${esc(m.title)}</h2><p class="sub">${yr(m)}, nota ${nt(m)}</p><p class="ov">${esc(m.overview||'Sem sinopse em português.')}</p><div class="acts"><button class="b" data-pick="${k}">Este passa</button><button class="b ghost" data-id="${m.id}">Detalhes</button></div></div></article>`;

function duel(){
  const r=S.round,a=r[S.i],b=r[S.i+1],tot=r.length/2,cur=S.i/2;
  play.innerHTML=`<p class="cp-round">${NAMES[r.length]}</p><div class="cp-meta"><span>Duelo ${cur+1} de ${tot}${S.note?'. '+S.note:''}</span><div class="reel">${Array.from({length:tot},(_,j)=>`<i class="${j==cur?'on':''}"${S.next[j]?` style="background-image:url(${IMG}w92${S.next[j].poster_path})"`:''}></i>`).join('')}</div></div><div class="duel">${fighter(a,0)}<div class="vs">VS</div>${fighter(b,1)}</div><p><button class="b ghost" data-reset>Abandonar campeonato</button></p>`;
}

sec.addEventListener('click',e=>{
  if(e.target.closest('[data-reset]')){show('setup');return}
  if(e.target.id=='cp-img-go'){makeImg();return}
  const bt=e.target.closest('[data-pick]');if(!bt||S.busy)return;
  S.busy=1;
  const k=+bt.dataset.pick,r=S.round,w=r[S.i+k],l=r[S.i+1-k];
  l.pos=r.length/2+1;
  play.querySelectorAll('.fighter').forEach(x=>x.classList.add(+x.dataset.k==k?'win':'lose'));
  setTimeout(()=>{
    S.next.push(w);S.i+=2;
    if(S.i>=r.length){
      if(S.next.length==1){w.pos=1;S.busy=0;end();return}
      S.round=S.next;S.next=[];S.i=0;
    }
    S.busy=0;duel();
  },800);
});

function end(){
  const c=S.next[0],rank=[...S.all].sort((a,b)=>a.pos-b.pos);
  show('end');
  $('#cp-end').innerHTML=`<div class="champ"><div class="cpost">${c.poster_path?`<img src="${IMG}w500${c.poster_path}" alt="">`:''}<span class="crown">1º</span></div><div><p class="cp-round">Campeão</p><h2>${esc(c.title)}</h2><p class="sub">${yr(c)}, nota ${nt(c)}</p><p>${esc(c.overview||'Sem sinopse em português.')}</p><p><button class="b" id="cp-img-go">Gerar imagem do ranking</button><button class="b ghost" data-id="${c.id}">Detalhes</button><button class="b ghost" data-reset>Novo campeonato</button></p></div></div><div id="cp-out"></div><p class="step"><b>★</b>Classificação final</p><ol class="rk">${rank.map(m=>`<li><span class="pn">${m.pos}º</span><img src="${IMG}w92${m.poster_path}" alt=""><span><b>${esc(m.title)}</b><small>${PHASE[m.pos]}</small></span></li>`).join('')}</ol>`;
}

/* Imagem do ranking (usa as cores do tema ativo) */
const loadImg=u=>new Promise(r=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>r(i);i.onerror=()=>{if(i.dataset.t)r(null);else{i.dataset.t=1;i.src=u+'?cors=1'}};i.src=u});
async function makeImg(){
  const out=$('#cp-out');out.innerHTML='<p>Revelando a imagem…</p>';
  const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();
  const bg=v('--bg'),ink=v('--ink'),ac=v('--ac'),cd=v('--cd'),mu=v('--mu');
  await document.fonts.ready;
  const rank=[...S.all].sort((a,b)=>a.pos-b.pos);
  const ims=await Promise.all(rank.map((m,i)=>loadImg(IMG+(i<4?'w780':'w185')+m.poster_path)));
  const it=rank.map((m,i)=>({m,im:ims[i]})),rest=it.slice(4);
  const groups=[5,9,17].map(p=>rest.filter(o=>o.m.pos==p)).filter(g=>g.length);
  const W=1080,M=48,PER=8,TW=106,TH=159,GAP=18,y0=380,PH=880;
  const H=y0+PH+groups.reduce((s,g)=>s+80+Math.ceil(g.length/PER)*(TH+GAP),0)+110;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  x.fillStyle=bg;x.fillRect(0,0,W,H);
  const strip=y=>{x.fillStyle=ink;x.fillRect(0,y,W,30);x.fillStyle=bg;for(let i=6;i<W;i+=30)x.fillRect(i,y+9,16,12)};
  const txt=(t,px,py,font,col,al='left')=>{x.font=font;x.fillStyle=col;x.textAlign=al;x.fillText(t,px,py)};
  const wrap=(t,px,py,mw,lh,font,col)=>{x.font=font;x.fillStyle=col;x.textAlign='left';let l='',n=0;for(const w of t.split(' ')){const s=l?l+' '+w:w;if(x.measureText(s).width>mw&&l){x.fillText(l,px,py+n*lh);n++;l=w}else l=s}x.fillText(l,px,py+n*lh)};
  const post=(o,px,py,w,h,sh)=>{x.fillStyle=ac;x.fillRect(px-3+sh,py-3+sh,w+6,h+6);x.fillStyle=ink;x.fillRect(px-3,py-3,w+6,h+6);if(o.im)x.drawImage(o.im,px,py,w,h);else{x.fillStyle=cd;x.fillRect(px,py,w,h);wrap(o.m.title,px+10,py+30,w-20,26,`20px ${DF}`,ink)}};
  const badge=(t,cx,cy,r)=>{x.beginPath();x.arc(cx,cy,r,0,7);x.fillStyle=ac;x.fill();x.lineWidth=4;x.strokeStyle=ink;x.stroke();txt(t,cx,cy+r*.3,`${Math.round(r*.9)}px ${DF}`,bg,'center')};
  strip(0);
  txt(CONFIG.siteName,M,105,`38px ${DF}`,ac);
  txt('Campeonato de',M,178,`600 34px ${BF}`,mu);
  let fs=124;x.font=`${fs}px ${DF}`;
  while(x.measureText(S.gn).width>W-2*M&&fs>48){fs-=4;x.font=`${fs}px ${DF}`}
  txt(S.gn,M,178+fs*.95,`${fs}px ${DF}`,ink);
  txt(`${S.size} filmes, ${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}`,M,178+fs*.95+48,`600 28px ${BF}`,mu);
  post(it[0],M,y0,420,630,10);badge('1º',M+414,y0+10,46);
  txt('Grande campeão',M,y0+676,`600 24px ${BF}`,mu);
  wrap(it[0].m.title,M,y0+732,420,50,`44px ${DF}`,ink);
  post(it[1],508,y0,250,375,8);badge('2º',508+246,y0+8,38);
  txt('Vice-campeão',778,y0+40,`600 22px ${BF}`,mu);
  wrap(it[1].m.title,778,y0+86,254,38,`32px ${DF}`,ink);
  txt('Semifinalistas',508,y0+405,`600 22px ${BF}`,mu);
  [2,3].forEach((k,j)=>{const px=508+j*180;post(it[k],px,y0+425,150,225,6);badge('3º',px+146,y0+431,30);wrap(it[k].m.title,px,y0+425+225+44,150,26,`22px ${DF}`,ink)});
  const GN={5:'Quartas de final',9:'Oitavas de final',17:'Primeira fase'};
  let y=y0+PH;
  groups.forEach(g=>{
    txt(GN[g[0].m.pos],M,y+54,`34px ${DF}`,ink);
    g.forEach((o,i)=>post(o,M+3+(i%PER)*(TW+GAP),y+80+Math.floor(i/PER)*(TH+GAP)-20,TW,TH,4));
    y+=80+Math.ceil(g.length/PER)*(TH+GAP);
  });
  txt('Dados e imagens: TMDB',W/2,H-62,`600 22px ${BF}`,mu,'center');
  strip(H-30);
  try{
    c.toBlob(b=>{
      if(!b){out.innerHTML='<p>Não consegui gerar a imagem.</p>';return}
      const u=URL.createObjectURL(b),nm=S.gn.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
      out.innerHTML=`<img class="rkimg" src="${u}" alt="Ranking do campeonato"><p><a class="b" href="${u}" download="campeonato-${nm}.png">Baixar imagem</a></p>`;
    },'image/png');
  }catch(e){out.innerHTML='<p>O navegador bloqueou a geração da imagem. Tire um print da classificação.</p>'}
}

/* Roteamento: roda depois do route() acima */
const cpRoute=()=>{
  if(location.hash!='#/campeonato')return;
  document.querySelectorAll('main>section').forEach(s=>s.hidden=s!==sec);
  document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.hash=='#/campeonato'));
  if(!loaded)loadGenres();
};
addEventListener('hashchange',cpRoute);cpRoute();
})();
