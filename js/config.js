const CONFIG = {
    siteName: 'ROOM 237',
    devName: 'Riguetto',

    // themoviedb.org/settings/api (serve a "API Key" v3 ou o "Token de leitura" v4)
    apiKey: '6928eace35047a607f70b0101f9b8072',
    lang: 'pt-BR',
    minVotes: 100, // evita "nota 10 com 1 voto" na busca
  
    countries: {BR:'Brasil',AR:'Argentina',MX:'México',US:'EUA',GB:'Reino Unido',FR:'França',IT:'Itália',DE:'Alemanha',ES:'Espanha',PT:'Portugal',SE:'Suécia',DK:'Dinamarca',PL:'Polônia',RU:'Rússia',SU:'União Soviética',JP:'Japão',KR:'Coreia do Sul',CN:'China',HK:'Hong Kong',TW:'Taiwan',IN:'Índia',IR:'Irã',TH:'Tailândia',TR:'Turquia'},
  
    // "Me recomende": [texto que aparece na frase, filtros do TMDB]
    reco: {
      mood:[['um filme qualquer',{}],['um drama que dói',{with_genres:18}],['uma comédia ácida',{with_genres:35}],['um thriller sem sono',{with_genres:53}],['um terror de arrepiar',{with_genres:27}],['uma ficção científica',{with_genres:878}],['um romance impossível',{with_genres:10749}],['um crime sujo',{with_genres:80}],['um documentário',{with_genres:99}],['uma animação adulta',{with_genres:16}]],
      place:[['de qualquer lugar',{}],['do Brasil',{countries:['BR']}],['da Europa',{countries:['FR','IT','DE','GB','SE','DK','PL','ES','RU']}],['da Ásia',{countries:['JP','KR','HK','CN','TW','IN','IR','TH']}],['de Hollywood',{countries:['US']}],['da América Latina',{countries:['AR','MX','CL','CO','CU','UY']}]],
      era:[['de qualquer época',{}],['dos clássicos (até 1969)',{'primary_release_date.lte':'1969-12-31'}],['dos anos 70 e 80',{'primary_release_date.gte':'1970-01-01','primary_release_date.lte':'1989-12-31'}],['dos anos 90 e 2000',{'primary_release_date.gte':'1990-01-01','primary_release_date.lte':'2009-12-31'}],['recente (2010+)',{'primary_release_date.gte':'2010-01-01'}]],
      cult:[['filme cult',{'vote_count.gte':400,'vote_count.lte':6000,'vote_average.gte':7.2}],['clássico consagrado',{'vote_count.gte':5000,'vote_average.gte':7.6}],['joia escondida',{'vote_count.gte':50,'vote_count.lte':700,'vote_average.gte':6.9}]],
      len:[['sem pressa',{}],['curtinho (até 95 min)',{'with_runtime.lte':95}],['de duração média',{'with_runtime.gte':90,'with_runtime.lte':130}],['longo, pra maratonar',{'with_runtime.gte':140}]]
    },

    devPicks: {
      'Terror': [
        ['Psycho',1960,10],['The Texas Chain Saw Massacre',1974,10],['The Shining',1980,10],['The Thing',1982,10],['Get Out',2017,10],['The Visit',2015,10],
        ['Sinners',2025,9],['The Witch',2015,9],['Pulse',2001,9],
        ['Halloween',1978,8],['Hausu',1977,8],['A Nightmare on Elm Street',1984,8],['The Blair Witch Project',1999,8],['Shutter',2004,8],['Hereditary',2018,8],['Creep',2014,8],['Creep 2',2017,8],['Nosferatu',2024,8],['The Substance',2024,8],['Late Night with the Devil',2023,8]
      ],
      'Suspense e mistério': [
        ['Se7en',1995,10],['The Silence of the Lambs',1991,10],['Mulholland Drive',2001,10],['The Sixth Sense',1999,10],['Shutter Island',2010,10],['Black Swan',2010,10],
        ['Prisoners',2013,9],['Creepy',2016,9],
        ['O Agente Secreto',2025,8],['Parasita',2019,8],['Nightcrawler',2014,8]
      ],
      'Crime e ação': [
        ['The Godfather',1972,10],['The Godfather Part II',1974,10],['City of God',2002,10],
        ['Uncut Gems',2019,9],
        ['Taxi Driver',1976,8],['Scarface',1983,8],['The Irishman',2019,8],['Catch Me If You Can',2002,8],['Baby Driver',2017,8],['One Battle After Another',2025,8],['Kill Bill: Vol. 1',2003,8],['Kill Bill: Vol. 2',2004,8],['Inglourious Basterds',2009,8]
      ],
      'Ficção científica': [
        ['Dawn of the Planet of the Apes',2014,10],['Godzilla Minus One',2023,10],['Mad Max: Fury Road',2015,10],
        ['Alien',1979,9],['Back to the Future',1985,9],['War for the Planet of the Apes',2017,9],
        ['Arrival',2016,8],['Rise of the Planet of the Apes',2011,8],['Cloverfield',2008,8]
      ],
      'Fantasia e aventura': [
        ['The Odyssey',2026,10],
        ["Pan's Labyrinth",2006,9],['Harry Potter and the Prisoner of Azkaban',2004,9],['The Lord of the Rings: The Fellowship of the Ring',2001,9],['The Lord of the Rings: The Return of the King',2003,9],
        ['The Lord of the Rings: The Two Towers',2002,8],['Harry Potter and the Deathly Hallows: Part 1',2010,8],['Sleepy Hollow',1999,8]
      ],
      'Super-heróis': [
        ['The Dark Knight',2008,8],['Avengers: Infinity War',2018,8],['Guardians of the Galaxy',2014,8],['Guardians of the Galaxy Vol. 2',2017,8],['Deadpool & Wolverine',2024,8]
      ],
      'Animação': [
        ['Spider-Man: Into the Spider-Verse',2018,10],['The Lion King',1994,10],['Akira',1988,10],
        ['Spider-Man: Across the Spider-Verse',2023,9],["Howl's Moving Castle",2004,9],
        ['A Viagem de Chihiro',2001,8],['Whisper of the Heart',1995,8],['Coraline',2009,8],['Ratatouille',2007,8],['Kung Fu Panda 2',2011,8],['Rango',2011,8],["Guillermo del Toro's Pinocchio",2022,8]
      ],
      'Drama': [
        ['Whiplash',2014,10],['Eternal Sunshine of the Spotless Mind',2004,10],['Carandiru',2003,10],['American History X',1998,10],
        ['Ainda Estou Aqui',2024,9],['Oppenheimer',2023,9],['Captain Fantastic',2016,9],['Birdman',2014,9],['Malcolm X',1992,9],
        ['The Shawshank Redemption',1994,8],['The Pianist',2002,8],['Dead Poets Society',1989,8],['Rocky',1976,8],['Estômago',2007,8],['Once Upon a Time in Hollywood',2019,8]
      ],
      'Comédia': [
        ['The Grand Budapest Hotel',2014,9],['The Truman Show',1998,9],['Jojo Rabbit',2019,9],['Barbie',2023,8]
      ],
      'Documentário':[
        ['Cabra Marcado Para Morrer ',1984,10]
      ]
    },

    // Filmes que inspiraram o site: [título, ano, nome do tema (igual ao do seu CSS), comentário opcional]
    inspirados: [
      ['The Shining',1980,'','Quarto 237: de onde veio o nome do site.'],
      ['Blade Runner',1982,'bladerunner'],
      ['The Matrix',1999,'matrix'],
      ['A Clockwork Orange',1971,'laranja'],
      ['The Grand Budapest Hotel',2014,'budapest'],
      ['Drive',2011,'drive'],
      ['Sin City',2005,'sincity'],
      ['Fargo',1996,'fargo'],
      ['Suspiria',1977,'suspiria']
    ],

};
  