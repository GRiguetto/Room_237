const CONFIG = {
    siteName: 'ROOM 237',
    devName: 'Riguetto',

    // themoviedb.org/settings/api (serve a "API Key" v3 ou o "Token de leitura" v4)
    apiKey: 'colar a chave aqui quando tiver',
    lang: 'pt-BR',
    minVotes: 100, // evita "nota 10 com 1 voto" na busca
  
    // Indicados do Dev: {q:'título', year:ano} ou {id:123} (id do TMDB), mais a sua nota
    devPicks: [
      {q:'Stalker', year:1979, note:'Uma caminhada pela Zona; cinema como meditação.'},
      {q:'Mulholland Drive', year:2001, note:'Hollywood sonhando o próprio pesadelo.'},
      {q:'In the Mood for Love', year:2000, note:'O romance que nunca se completa.'},
      {q:'Persona', year:1966, note:'Duas mulheres, um rosto que se confunde.'},
      {q:'Paris, Texas', year:1984, note:'O deserto como lugar de arrependimento.'},
      {q:'Terra em Transe', year:1967, note:'Glauber e a alegoria de um país em chamas.'}
    ],
  
    countries: {BR:'Brasil',AR:'Argentina',MX:'México',US:'EUA',GB:'Reino Unido',FR:'França',IT:'Itália',DE:'Alemanha',ES:'Espanha',PT:'Portugal',SE:'Suécia',DK:'Dinamarca',PL:'Polônia',RU:'Rússia',SU:'União Soviética',JP:'Japão',KR:'Coreia do Sul',CN:'China',HK:'Hong Kong',TW:'Taiwan',IN:'Índia',IR:'Irã',TH:'Tailândia',TR:'Turquia'},
  
    // "Me recomende": [texto que aparece na frase, filtros do TMDB]
    reco: {
      mood:[['um filme qualquer',{}],['um drama que dói',{with_genres:18}],['uma comédia ácida',{with_genres:35}],['um thriller sem sono',{with_genres:53}],['um terror de arrepiar',{with_genres:27}],['uma ficção científica',{with_genres:878}],['um romance impossível',{with_genres:10749}],['um crime sujo',{with_genres:80}],['um documentário',{with_genres:99}],['uma animação adulta',{with_genres:16}]],
      place:[['de qualquer lugar',{}],['do Brasil',{countries:['BR']}],['da Europa',{countries:['FR','IT','DE','GB','SE','DK','PL','ES','RU']}],['da Ásia',{countries:['JP','KR','HK','CN','TW','IN','IR','TH']}],['de Hollywood',{countries:['US']}],['da América Latina',{countries:['AR','MX','CL','CO','CU','UY']}]],
      era:[['de qualquer época',{}],['dos clássicos (até 1969)',{'primary_release_date.lte':'1969-12-31'}],['dos anos 70 e 80',{'primary_release_date.gte':'1970-01-01','primary_release_date.lte':'1989-12-31'}],['dos anos 90 e 2000',{'primary_release_date.gte':'1990-01-01','primary_release_date.lte':'2009-12-31'}],['recente (2010+)',{'primary_release_date.gte':'2010-01-01'}]],
      cult:[['filme cult',{'vote_count.gte':400,'vote_count.lte':6000,'vote_average.gte':7.2}],['clássico consagrado',{'vote_count.gte':5000,'vote_average.gte':7.6}],['joia escondida',{'vote_count.gte':50,'vote_count.lte':700,'vote_average.gte':6.9}]],
      len:[['sem pressa',{}],['curtinho (até 95 min)',{'with_runtime.lte':95}],['de duração média',{'with_runtime.gte':90,'with_runtime.lte':130}],['longo, pra maratonar',{'with_runtime.gte':140}]]
    }
  };
  