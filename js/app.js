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

const T=['cobalto','giallo','nitrato','brasil'];let ti=0;
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
async function loadDev(){
  if(dev.dataset.ok)return;
  dev.innerHTML='<p>Carregando…</p>';
  const ms=(await Promise.all(CONFIG.devPicks.map(async p=>{try{
    const m=p.id?await api('/movie/'+p.id):(await api('/search/movie',{query:p.q,year:p.year})).results[0];
    return m&&{...m,note:p.note}}catch(e){return null}}))).filter(Boolean);
  dev.innerHTML=ms.length?ms.map(m=>`<article class="pick">${card(m)}<p>${esc(m.note||'')}</p></article>`).join(''):'<p>Nenhum filme carregado. Confira devPicks e a chave da API no config.js.</p>';
  if(ms.length)dev.dataset.ok=1;
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
