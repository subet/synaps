import { Language } from '../types';

export interface Country {
  code: string;
  en: string;
  es: string;
  it: string;
  tr: string;
  de: string;
  fr: string;
  nl: string;
  ru: string;
  zh: string;
  pt_BR: string;
  pt_PT: string;
  ja: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AE', en: 'United Arab Emirates', es: 'Emiratos Árabes Unidos', it: 'Emirati Arabi Uniti', tr: 'Birleşik Arap Emirlikleri', de: 'Vereinigte Arabische Emirate', fr: 'Émirats arabes unis', nl: 'Verenigde Arabische Emiraten', ru: 'Объединённые Арабские Эмираты', zh: '阿联酋', pt_BR: 'Emirados Árabes Unidos', pt_PT: 'Emirados Árabes Unidos' , ja: 'アラブ首長国連邦' },
  { code: 'AF', en: 'Afghanistan', es: 'Afganistán', it: 'Afghanistan', tr: 'Afganistan', de: 'Afghanistan', fr: 'Afghanistan', nl: 'Afghanistan', ru: 'Афганистан', zh: '阿富汗', pt_BR: 'Afeganistão', pt_PT: 'Afeganistão' , ja: 'アフガニスタン' },
  { code: 'AL', en: 'Albania', es: 'Albania', it: 'Albania', tr: 'Arnavutluk', de: 'Albanien', fr: 'Albanie', nl: 'Albanië', ru: 'Албания', zh: '阿尔巴尼亚', pt_BR: 'Albânia', pt_PT: 'Albânia' , ja: 'アルバニア' },
  { code: 'AM', en: 'Armenia', es: 'Armenia', it: 'Armenia', tr: 'Ermenistan', de: 'Armenien', fr: 'Arménie', nl: 'Armenië', ru: 'Армения', zh: '亚美尼亚', pt_BR: 'Armênia', pt_PT: 'Arménia' , ja: 'アルメニア' },
  { code: 'AR', en: 'Argentina', es: 'Argentina', it: 'Argentina', tr: 'Arjantin', de: 'Argentinien', fr: 'Argentine', nl: 'Argentinië', ru: 'Аргентина', zh: '阿根廷', pt_BR: 'Argentina', pt_PT: 'Argentina' , ja: 'アルゼンチン' },
  { code: 'AT', en: 'Austria', es: 'Austria', it: 'Austria', tr: 'Avusturya', de: 'Österreich', fr: 'Autriche', nl: 'Oostenrijk', ru: 'Австрия', zh: '奥地利', pt_BR: 'Áustria', pt_PT: 'Áustria' , ja: 'オーストリア' },
  { code: 'AU', en: 'Australia', es: 'Australia', it: 'Australia', tr: 'Avustralya', de: 'Australien', fr: 'Australie', nl: 'Australië', ru: 'Австралия', zh: '澳大利亚', pt_BR: 'Austrália', pt_PT: 'Austrália' , ja: 'オーストラリア' },
  { code: 'AZ', en: 'Azerbaijan', es: 'Azerbaiyán', it: 'Azerbaigian', tr: 'Azerbaycan', de: 'Aserbaidschan', fr: 'Azerbaïdjan', nl: 'Azerbeidzjan', ru: 'Азербайджан', zh: '阿塞拜疆', pt_BR: 'Azerbaijão', pt_PT: 'Azerbaijão' , ja: 'アゼルバイジャン' },
  { code: 'BA', en: 'Bosnia and Herzegovina', es: 'Bosnia y Herzegovina', it: 'Bosnia ed Erzegovina', tr: 'Bosna-Hersek', de: 'Bosnien und Herzegowina', fr: 'Bosnie-Herzégovine', nl: 'Bosnië en Herzegovina', ru: 'Босния и Герцеговина', zh: '波斯尼亚和黑塞哥维那', pt_BR: 'Bósnia e Herzegovina', pt_PT: 'Bósnia e Herzegovina' , ja: 'ボスニア・ヘルツェゴビナ' },
  { code: 'BD', en: 'Bangladesh', es: 'Bangladés', it: 'Bangladesh', tr: 'Bangladeş', de: 'Bangladesch', fr: 'Bangladesh', nl: 'Bangladesh', ru: 'Бангладеш', zh: '孟加拉国', pt_BR: 'Bangladesh', pt_PT: 'Bangladesh' , ja: 'バングラデシュ' },
  { code: 'BE', en: 'Belgium', es: 'Bélgica', it: 'Belgio', tr: 'Belçika', de: 'Belgien', fr: 'Belgique', nl: 'België', ru: 'Бельгия', zh: '比利时', pt_BR: 'Bélgica', pt_PT: 'Bélgica' , ja: 'ベルギー' },
  { code: 'BG', en: 'Bulgaria', es: 'Bulgaria', it: 'Bulgaria', tr: 'Bulgaristan', de: 'Bulgarien', fr: 'Bulgarie', nl: 'Bulgarije', ru: 'Болгария', zh: '保加利亚', pt_BR: 'Bulgária', pt_PT: 'Bulgária' , ja: 'ブルガリア' },
  { code: 'BR', en: 'Brazil', es: 'Brasil', it: 'Brasile', tr: 'Brezilya', de: 'Brasilien', fr: 'Brésil', nl: 'Brazilië', ru: 'Бразилия', zh: '巴西', pt_BR: 'Brasil', pt_PT: 'Brasil' , ja: 'ブラジル' },
  { code: 'BY', en: 'Belarus', es: 'Bielorrusia', it: 'Bielorussia', tr: 'Beyaz Rusya', de: 'Weißrussland', fr: 'Biélorussie', nl: 'Wit-Rusland', ru: 'Беларусь', zh: '白俄罗斯', pt_BR: 'Bielorrússia', pt_PT: 'Bielorrússia' , ja: 'ベラルーシ' },
  { code: 'CA', en: 'Canada', es: 'Canadá', it: 'Canada', tr: 'Kanada', de: 'Kanada', fr: 'Canada', nl: 'Canada', ru: 'Канада', zh: '加拿大', pt_BR: 'Canadá', pt_PT: 'Canadá' , ja: 'カナダ' },
  { code: 'CH', en: 'Switzerland', es: 'Suiza', it: 'Svizzera', tr: 'İsviçre', de: 'Schweiz', fr: 'Suisse', nl: 'Zwitserland', ru: 'Швейцария', zh: '瑞士', pt_BR: 'Suíça', pt_PT: 'Suíça' , ja: 'スイス' },
  { code: 'CL', en: 'Chile', es: 'Chile', it: 'Cile', tr: 'Şili', de: 'Chile', fr: 'Chili', nl: 'Chili', ru: 'Чили', zh: '智利', pt_BR: 'Chile', pt_PT: 'Chile' , ja: 'チリ' },
  { code: 'CN', en: 'China', es: 'China', it: 'Cina', tr: 'Çin', de: 'China', fr: 'Chine', nl: 'China', ru: 'Китай', zh: '中国', pt_BR: 'China', pt_PT: 'China' , ja: '中国' },
  { code: 'CO', en: 'Colombia', es: 'Colombia', it: 'Colombia', tr: 'Kolombiya', de: 'Kolumbien', fr: 'Colombie', nl: 'Colombia', ru: 'Колумбия', zh: '哥伦比亚', pt_BR: 'Colômbia', pt_PT: 'Colômbia' , ja: 'コロンビア' },
  { code: 'CZ', en: 'Czech Republic', es: 'República Checa', it: 'Repubblica Ceca', tr: 'Çek Cumhuriyeti', de: 'Tschechien', fr: 'République tchèque', nl: 'Tsjechië', ru: 'Чехия', zh: '捷克', pt_BR: 'República Tcheca', pt_PT: 'República Checa' , ja: 'チェコ' },
  { code: 'DE', en: 'Germany', es: 'Alemania', it: 'Germania', tr: 'Almanya', de: 'Deutschland', fr: 'Allemagne', nl: 'Duitsland', ru: 'Германия', zh: '德国', pt_BR: 'Alemanha', pt_PT: 'Alemanha' , ja: 'ドイツ' },
  { code: 'DK', en: 'Denmark', es: 'Dinamarca', it: 'Danimarca', tr: 'Danimarka', de: 'Dänemark', fr: 'Danemark', nl: 'Denemarken', ru: 'Дания', zh: '丹麦', pt_BR: 'Dinamarca', pt_PT: 'Dinamarca' , ja: 'デンマーク' },
  { code: 'DZ', en: 'Algeria', es: 'Argelia', it: 'Algeria', tr: 'Cezayir', de: 'Algerien', fr: 'Algérie', nl: 'Algerije', ru: 'Алжир', zh: '阿尔及利亚', pt_BR: 'Argélia', pt_PT: 'Argélia' , ja: 'アルジェリア' },
  { code: 'EE', en: 'Estonia', es: 'Estonia', it: 'Estonia', tr: 'Estonya', de: 'Estland', fr: 'Estonie', nl: 'Estland', ru: 'Эстония', zh: '爱沙尼亚', pt_BR: 'Estônia', pt_PT: 'Estónia' , ja: 'エストニア' },
  { code: 'EG', en: 'Egypt', es: 'Egipto', it: 'Egitto', tr: 'Mısır', de: 'Ägypten', fr: 'Égypte', nl: 'Egypte', ru: 'Египет', zh: '埃及', pt_BR: 'Egito', pt_PT: 'Egito' , ja: 'エジプト' },
  { code: 'ES', en: 'Spain', es: 'España', it: 'Spagna', tr: 'İspanya', de: 'Spanien', fr: 'Espagne', nl: 'Spanje', ru: 'Испания', zh: '西班牙', pt_BR: 'Espanha', pt_PT: 'Espanha' , ja: 'スペイン' },
  { code: 'ET', en: 'Ethiopia', es: 'Etiopía', it: 'Etiopia', tr: 'Etiyopya', de: 'Äthiopien', fr: 'Éthiopie', nl: 'Ethiopië', ru: 'Эфиопия', zh: '埃塞俄比亚', pt_BR: 'Etiópia', pt_PT: 'Etiópia' , ja: 'エチオピア' },
  { code: 'FI', en: 'Finland', es: 'Finlandia', it: 'Finlandia', tr: 'Finlandiya', de: 'Finnland', fr: 'Finlande', nl: 'Finland', ru: 'Финляндия', zh: '芬兰', pt_BR: 'Finlândia', pt_PT: 'Finlândia' , ja: 'フィンランド' },
  { code: 'FR', en: 'France', es: 'Francia', it: 'Francia', tr: 'Fransa', de: 'Frankreich', fr: 'France', nl: 'Frankrijk', ru: 'Франция', zh: '法国', pt_BR: 'França', pt_PT: 'França' , ja: 'フランス' },
  { code: 'GB', en: 'United Kingdom', es: 'Reino Unido', it: 'Regno Unito', tr: 'Birleşik Krallık', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni', nl: 'Verenigd Koninkrijk', ru: 'Великобритания', zh: '英国', pt_BR: 'Reino Unido', pt_PT: 'Reino Unido' , ja: 'イギリス' },
  { code: 'GE', en: 'Georgia', es: 'Georgia', it: 'Georgia', tr: 'Gürcistan', de: 'Georgien', fr: 'Géorgie', nl: 'Georgië', ru: 'Грузия', zh: '格鲁吉亚', pt_BR: 'Geórgia', pt_PT: 'Geórgia' , ja: 'ジョージア' },
  { code: 'GH', en: 'Ghana', es: 'Ghana', it: 'Ghana', tr: 'Gana', de: 'Ghana', fr: 'Ghana', nl: 'Ghana', ru: 'Гана', zh: '加纳', pt_BR: 'Gana', pt_PT: 'Gana' , ja: 'ガーナ' },
  { code: 'GR', en: 'Greece', es: 'Grecia', it: 'Grecia', tr: 'Yunanistan', de: 'Griechenland', fr: 'Grèce', nl: 'Griekenland', ru: 'Греция', zh: '希腊', pt_BR: 'Grécia', pt_PT: 'Grécia' , ja: 'ギリシャ' },
  { code: 'HR', en: 'Croatia', es: 'Croacia', it: 'Croazia', tr: 'Hırvatistan', de: 'Kroatien', fr: 'Croatie', nl: 'Kroatië', ru: 'Хорватия', zh: '克罗地亚', pt_BR: 'Croácia', pt_PT: 'Croácia' , ja: 'クロアチア' },
  { code: 'HU', en: 'Hungary', es: 'Hungría', it: 'Ungheria', tr: 'Macaristan', de: 'Ungarn', fr: 'Hongrie', nl: 'Hongarije', ru: 'Венгрия', zh: '匈牙利', pt_BR: 'Hungria', pt_PT: 'Hungria' , ja: 'ハンガリー' },
  { code: 'ID', en: 'Indonesia', es: 'Indonesia', it: 'Indonesia', tr: 'Endonezya', de: 'Indonesien', fr: 'Indonésie', nl: 'Indonesië', ru: 'Индонезия', zh: '印度尼西亚', pt_BR: 'Indonésia', pt_PT: 'Indonésia' , ja: 'インドネシア' },
  { code: 'IE', en: 'Ireland', es: 'Irlanda', it: 'Irlanda', tr: 'İrlanda', de: 'Irland', fr: 'Irlande', nl: 'Ierland', ru: 'Ирландия', zh: '爱尔兰', pt_BR: 'Irlanda', pt_PT: 'Irlanda' , ja: 'アイルランド' },
  { code: 'IL', en: 'Israel', es: 'Israel', it: 'Israele', tr: 'İsrail', de: 'Israel', fr: 'Israël', nl: 'Israël', ru: 'Израиль', zh: '以色列', pt_BR: 'Israel', pt_PT: 'Israel' , ja: 'イスラエル' },
  { code: 'IN', en: 'India', es: 'India', it: 'India', tr: 'Hindistan', de: 'Indien', fr: 'Inde', nl: 'India', ru: 'Индия', zh: '印度', pt_BR: 'Índia', pt_PT: 'Índia' , ja: 'インド' },
  { code: 'IQ', en: 'Iraq', es: 'Irak', it: 'Iraq', tr: 'Irak', de: 'Irak', fr: 'Irak', nl: 'Irak', ru: 'Ирак', zh: '伊拉克', pt_BR: 'Iraque', pt_PT: 'Iraque' , ja: 'イラク' },
  { code: 'IR', en: 'Iran', es: 'Irán', it: 'Iran', tr: 'İran', de: 'Iran', fr: 'Iran', nl: 'Iran', ru: 'Иран', zh: '伊朗', pt_BR: 'Irã', pt_PT: 'Irão' , ja: 'イラン' },
  { code: 'IT', en: 'Italy', es: 'Italia', it: 'Italia', tr: 'İtalya', de: 'Italien', fr: 'Italie', nl: 'Italië', ru: 'Италия', zh: '意大利', pt_BR: 'Itália', pt_PT: 'Itália' , ja: 'イタリア' },
  { code: 'JP', en: 'Japan', es: 'Japón', it: 'Giappone', tr: 'Japonya', de: 'Japan', fr: 'Japon', nl: 'Japan', ru: 'Япония', zh: '日本', pt_BR: 'Japão', pt_PT: 'Japão' , ja: '日本' },
  { code: 'KE', en: 'Kenya', es: 'Kenia', it: 'Kenya', tr: 'Kenya', de: 'Kenia', fr: 'Kenya', nl: 'Kenia', ru: 'Кения', zh: '肯尼亚', pt_BR: 'Quênia', pt_PT: 'Quénia' , ja: 'ケニア' },
  { code: 'KH', en: 'Cambodia', es: 'Camboya', it: 'Cambogia', tr: 'Kamboçya', de: 'Kambodscha', fr: 'Cambodge', nl: 'Cambodja', ru: 'Камбоджа', zh: '柬埔寨', pt_BR: 'Camboja', pt_PT: 'Camboja' , ja: 'カンボジア' },
  { code: 'KP', en: 'North Korea', es: 'Corea del Norte', it: 'Corea del Nord', tr: 'Kuzey Kore', de: 'Nordkorea', fr: 'Corée du Nord', nl: 'Noord-Korea', ru: 'Северная Корея', zh: '朝鲜', pt_BR: 'Coreia do Norte', pt_PT: 'Coreia do Norte' , ja: '北朝鮮' },
  { code: 'KR', en: 'South Korea', es: 'Corea del Sur', it: 'Corea del Sud', tr: 'Güney Kore', de: 'Südkorea', fr: 'Corée du Sud', nl: 'Zuid-Korea', ru: 'Южная Корея', zh: '韩国', pt_BR: 'Coreia do Sul', pt_PT: 'Coreia do Sul' , ja: '韓国' },
  { code: 'KW', en: 'Kuwait', es: 'Kuwait', it: 'Kuwait', tr: 'Kuveyt', de: 'Kuwait', fr: 'Koweït', nl: 'Koeweit', ru: 'Кувейт', zh: '科威特', pt_BR: 'Kuwait', pt_PT: 'Kuwait' , ja: 'クウェート' },
  { code: 'KZ', en: 'Kazakhstan', es: 'Kazajistán', it: 'Kazakistan', tr: 'Kazakistan', de: 'Kasachstan', fr: 'Kazakhstan', nl: 'Kazachstan', ru: 'Казахстан', zh: '哈萨克斯坦', pt_BR: 'Cazaquistão', pt_PT: 'Cazaquistão' , ja: 'カザフスタン' },
  { code: 'LB', en: 'Lebanon', es: 'Líbano', it: 'Libano', tr: 'Lübnan', de: 'Libanon', fr: 'Liban', nl: 'Libanon', ru: 'Ливан', zh: '黎巴嫩', pt_BR: 'Líbano', pt_PT: 'Líbano' , ja: 'レバノン' },
  { code: 'LT', en: 'Lithuania', es: 'Lituania', it: 'Lituania', tr: 'Litvanya', de: 'Litauen', fr: 'Lituanie', nl: 'Litouwen', ru: 'Литва', zh: '立陶宛', pt_BR: 'Lituânia', pt_PT: 'Lituânia' , ja: 'リトアニア' },
  { code: 'LU', en: 'Luxembourg', es: 'Luxemburgo', it: 'Lussemburgo', tr: 'Lüksemburg', de: 'Luxemburg', fr: 'Luxembourg', nl: 'Luxemburg', ru: 'Люксембург', zh: '卢森堡', pt_BR: 'Luxemburgo', pt_PT: 'Luxemburgo' , ja: 'ルクセンブルク' },
  { code: 'LV', en: 'Latvia', es: 'Letonia', it: 'Lettonia', tr: 'Letonya', de: 'Lettland', fr: 'Lettonie', nl: 'Letland', ru: 'Латвия', zh: '拉脱维亚', pt_BR: 'Letônia', pt_PT: 'Letónia' , ja: 'ラトビア' },
  { code: 'LY', en: 'Libya', es: 'Libia', it: 'Libia', tr: 'Libya', de: 'Libyen', fr: 'Libye', nl: 'Libië', ru: 'Ливия', zh: '利比亚', pt_BR: 'Líbia', pt_PT: 'Líbia' , ja: 'リビア' },
  { code: 'MA', en: 'Morocco', es: 'Marruecos', it: 'Marocco', tr: 'Fas', de: 'Marokko', fr: 'Maroc', nl: 'Marokko', ru: 'Марокко', zh: '摩洛哥', pt_BR: 'Marrocos', pt_PT: 'Marrocos' , ja: 'モロッコ' },
  { code: 'MM', en: 'Myanmar', es: 'Myanmar', it: 'Myanmar', tr: 'Myanmar', de: 'Myanmar', fr: 'Myanmar', nl: 'Myanmar', ru: 'Мьянма', zh: '缅甸', pt_BR: 'Mianmar', pt_PT: 'Mianmar' , ja: 'ミャンマー' },
  { code: 'MX', en: 'Mexico', es: 'México', it: 'Messico', tr: 'Meksika', de: 'Mexiko', fr: 'Mexique', nl: 'Mexico', ru: 'Мексика', zh: '墨西哥', pt_BR: 'México', pt_PT: 'México' , ja: 'メキシコ' },
  { code: 'MY', en: 'Malaysia', es: 'Malasia', it: 'Malesia', tr: 'Malezya', de: 'Malaysia', fr: 'Malaisie', nl: 'Maleisië', ru: 'Малайзия', zh: '马来西亚', pt_BR: 'Malásia', pt_PT: 'Malásia' , ja: 'マレーシア' },
  { code: 'NG', en: 'Nigeria', es: 'Nigeria', it: 'Nigeria', tr: 'Nijerya', de: 'Nigeria', fr: 'Nigéria', nl: 'Nigeria', ru: 'Нигерия', zh: '尼日利亚', pt_BR: 'Nigéria', pt_PT: 'Nigéria' , ja: 'ナイジェリア' },
  { code: 'NL', en: 'Netherlands', es: 'Países Bajos', it: 'Paesi Bassi', tr: 'Hollanda', de: 'Niederlande', fr: 'Pays-Bas', nl: 'Nederland', ru: 'Нидерланды', zh: '荷兰', pt_BR: 'Países Baixos', pt_PT: 'Países Baixos' , ja: 'オランダ' },
  { code: 'NO', en: 'Norway', es: 'Noruega', it: 'Norvegia', tr: 'Norveç', de: 'Norwegen', fr: 'Norvège', nl: 'Noorwegen', ru: 'Норвегия', zh: '挪威', pt_BR: 'Noruega', pt_PT: 'Noruega' , ja: 'ノルウェー' },
  { code: 'NP', en: 'Nepal', es: 'Nepal', it: 'Nepal', tr: 'Nepal', de: 'Nepal', fr: 'Népal', nl: 'Nepal', ru: 'Непал', zh: '尼泊尔', pt_BR: 'Nepal', pt_PT: 'Nepal' , ja: 'ネパール' },
  { code: 'NZ', en: 'New Zealand', es: 'Nueva Zelanda', it: 'Nuova Zelanda', tr: 'Yeni Zelanda', de: 'Neuseeland', fr: 'Nouvelle-Zélande', nl: 'Nieuw-Zeeland', ru: 'Новая Зеландия', zh: '新西兰', pt_BR: 'Nova Zelândia', pt_PT: 'Nova Zelândia' , ja: 'ニュージーランド' },
  { code: 'PE', en: 'Peru', es: 'Perú', it: 'Perù', tr: 'Peru', de: 'Peru', fr: 'Pérou', nl: 'Peru', ru: 'Перу', zh: '秘鲁', pt_BR: 'Peru', pt_PT: 'Peru' , ja: 'ペルー' },
  { code: 'PH', en: 'Philippines', es: 'Filipinas', it: 'Filippine', tr: 'Filipinler', de: 'Philippinen', fr: 'Philippines', nl: 'Filipijnen', ru: 'Филиппины', zh: '菲律宾', pt_BR: 'Filipinas', pt_PT: 'Filipinas' , ja: 'フィリピン' },
  { code: 'PK', en: 'Pakistan', es: 'Pakistán', it: 'Pakistan', tr: 'Pakistan', de: 'Pakistan', fr: 'Pakistan', nl: 'Pakistan', ru: 'Пакистан', zh: '巴基斯坦', pt_BR: 'Paquistão', pt_PT: 'Paquistão' , ja: 'パキスタン' },
  { code: 'PL', en: 'Poland', es: 'Polonia', it: 'Polonia', tr: 'Polonya', de: 'Polen', fr: 'Pologne', nl: 'Polen', ru: 'Польша', zh: '波兰', pt_BR: 'Polônia', pt_PT: 'Polónia' , ja: 'ポーランド' },
  { code: 'PT', en: 'Portugal', es: 'Portugal', it: 'Portogallo', tr: 'Portekiz', de: 'Portugal', fr: 'Portugal', nl: 'Portugal', ru: 'Португалия', zh: '葡萄牙', pt_BR: 'Portugal', pt_PT: 'Portugal' , ja: 'ポルトガル' },
  { code: 'QA', en: 'Qatar', es: 'Catar', it: 'Qatar', tr: 'Katar', de: 'Katar', fr: 'Qatar', nl: 'Qatar', ru: 'Катар', zh: '卡塔尔', pt_BR: 'Catar', pt_PT: 'Catar' , ja: 'カタール' },
  { code: 'RO', en: 'Romania', es: 'Rumanía', it: 'Romania', tr: 'Romanya', de: 'Rumänien', fr: 'Roumanie', nl: 'Roemenië', ru: 'Румыния', zh: '罗马尼亚', pt_BR: 'Romênia', pt_PT: 'Roménia' , ja: 'ルーマニア' },
  { code: 'RS', en: 'Serbia', es: 'Serbia', it: 'Serbia', tr: 'Sırbistan', de: 'Serbien', fr: 'Serbie', nl: 'Servië', ru: 'Сербия', zh: '塞尔维亚', pt_BR: 'Sérvia', pt_PT: 'Sérvia' , ja: 'セルビア' },
  { code: 'RU', en: 'Russia', es: 'Rusia', it: 'Russia', tr: 'Rusya', de: 'Russland', fr: 'Russie', nl: 'Rusland', ru: 'Россия', zh: '俄罗斯', pt_BR: 'Rússia', pt_PT: 'Rússia' , ja: 'ロシア' },
  { code: 'SA', en: 'Saudi Arabia', es: 'Arabia Saudita', it: 'Arabia Saudita', tr: 'Suudi Arabistan', de: 'Saudi-Arabien', fr: 'Arabie saoudite', nl: 'Saoedi-Arabië', ru: 'Саудовская Аравия', zh: '沙特阿拉伯', pt_BR: 'Arábia Saudita', pt_PT: 'Arábia Saudita' , ja: 'サウジアラビア' },
  { code: 'SE', en: 'Sweden', es: 'Suecia', it: 'Svezia', tr: 'İsveç', de: 'Schweden', fr: 'Suède', nl: 'Zweden', ru: 'Швеция', zh: '瑞典', pt_BR: 'Suécia', pt_PT: 'Suécia' , ja: 'スウェーデン' },
  { code: 'SG', en: 'Singapore', es: 'Singapur', it: 'Singapore', tr: 'Singapur', de: 'Singapur', fr: 'Singapour', nl: 'Singapore', ru: 'Сингапур', zh: '新加坡', pt_BR: 'Singapura', pt_PT: 'Singapura' , ja: 'シンガポール' },
  { code: 'SI', en: 'Slovenia', es: 'Eslovenia', it: 'Slovenia', tr: 'Slovenya', de: 'Slowenien', fr: 'Slovénie', nl: 'Slovenië', ru: 'Словения', zh: '斯洛文尼亚', pt_BR: 'Eslovênia', pt_PT: 'Eslovénia' , ja: 'スロベニア' },
  { code: 'SK', en: 'Slovakia', es: 'Eslovaquia', it: 'Slovacchia', tr: 'Slovakya', de: 'Slowakei', fr: 'Slovaquie', nl: 'Slowakije', ru: 'Словакия', zh: '斯洛伐克', pt_BR: 'Eslováquia', pt_PT: 'Eslováquia' , ja: 'スロバキア' },
  { code: 'SY', en: 'Syria', es: 'Siria', it: 'Siria', tr: 'Suriye', de: 'Syrien', fr: 'Syrie', nl: 'Syrië', ru: 'Сирия', zh: '叙利亚', pt_BR: 'Síria', pt_PT: 'Síria' , ja: 'シリア' },
  { code: 'TH', en: 'Thailand', es: 'Tailandia', it: 'Thailandia', tr: 'Tayland', de: 'Thailand', fr: 'Thaïlande', nl: 'Thailand', ru: 'Таиланд', zh: '泰国', pt_BR: 'Tailândia', pt_PT: 'Tailândia' , ja: 'タイ' },
  { code: 'TN', en: 'Tunisia', es: 'Túnez', it: 'Tunisia', tr: 'Tunus', de: 'Tunesien', fr: 'Tunisie', nl: 'Tunesië', ru: 'Тунис', zh: '突尼斯', pt_BR: 'Tunísia', pt_PT: 'Tunísia' , ja: 'チュニジア' },
  { code: 'TR', en: 'Turkey', es: 'Turquía', it: 'Turchia', tr: 'Türkiye', de: 'Türkei', fr: 'Turquie', nl: 'Turkije', ru: 'Турция', zh: '土耳其', pt_BR: 'Turquia', pt_PT: 'Turquia' , ja: 'トルコ' },
  { code: 'TW', en: 'Taiwan', es: 'Taiwán', it: 'Taiwan', tr: 'Tayvan', de: 'Taiwan', fr: 'Taïwan', nl: 'Taiwan', ru: 'Тайвань', zh: '台湾', pt_BR: 'Taiwan', pt_PT: 'Taiwan' , ja: '台湾' },
  { code: 'TZ', en: 'Tanzania', es: 'Tanzania', it: 'Tanzania', tr: 'Tanzanya', de: 'Tansania', fr: 'Tanzanie', nl: 'Tanzania', ru: 'Танзания', zh: '坦桑尼亚', pt_BR: 'Tanzânia', pt_PT: 'Tanzânia' , ja: 'タンザニア' },
  { code: 'UA', en: 'Ukraine', es: 'Ucrania', it: 'Ucraina', tr: 'Ukrayna', de: 'Ukraine', fr: 'Ukraine', nl: 'Oekraïne', ru: 'Украина', zh: '乌克兰', pt_BR: 'Ucrânia', pt_PT: 'Ucrânia' , ja: 'ウクライナ' },
  { code: 'US', en: 'United States', es: 'Estados Unidos', it: 'Stati Uniti', tr: 'Amerika Birleşik Devletleri', de: 'Vereinigte Staaten', fr: 'États-Unis', nl: 'Verenigde Staten', ru: 'Соединённые Штаты Америки', zh: '美国', pt_BR: 'Estados Unidos', pt_PT: 'Estados Unidos' , ja: 'アメリカ合衆国' },
  { code: 'UZ', en: 'Uzbekistan', es: 'Uzbekistán', it: 'Uzbekistan', tr: 'Özbekistan', de: 'Usbekistan', fr: 'Ouzbékistan', nl: 'Oezbekistan', ru: 'Узбекистан', zh: '乌兹别克斯坦', pt_BR: 'Uzbequistão', pt_PT: 'Usbequistão' , ja: 'ウズベキスタン' },
  { code: 'VN', en: 'Vietnam', es: 'Vietnam', it: 'Vietnam', tr: 'Vietnam', de: 'Vietnam', fr: 'Viêt Nam', nl: 'Vietnam', ru: 'Вьетнам', zh: '越南', pt_BR: 'Vietnã', pt_PT: 'Vietname' , ja: 'ベトナム' },
  { code: 'ZA', en: 'South Africa', es: 'Sudáfrica', it: 'Sudafrica', tr: 'Güney Afrika', de: 'Südafrika', fr: 'Afrique du Sud', nl: 'Zuid-Afrika', ru: 'Южная Африка', zh: '南非', pt_BR: 'África do Sul', pt_PT: 'África do Sul' , ja: '南アフリカ' },
];

export function getCountryName(code: string, language: Language): string {
  const country = COUNTRIES.find(c => c.code === code);
  if (!country) return code;
  return (country as any)[language] ?? country.en;
}
