import { Language } from '../types';

export interface Country {
  code: string;
  en: string;
  tr: string;
  de: string;
  fr: string;
  nl: string;
  ru: string;
  zh: string;
  pt_BR: string;
  pt_PT: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AE', en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', de: 'Vereinigte Arabische Emirate', fr: 'Émirats arabes unis', nl: 'Verenigde Arabische Emiraten', ru: 'Объединённые Арабские Эмираты', zh: '阿联酋', pt_BR: 'Emirados Árabes Unidos', pt_PT: 'Emirados Árabes Unidos' },
  { code: 'AF', en: 'Afghanistan', tr: 'Afganistan', de: 'Afghanistan', fr: 'Afghanistan', nl: 'Afghanistan', ru: 'Афганистан', zh: '阿富汗', pt_BR: 'Afeganistão', pt_PT: 'Afeganistão' },
  { code: 'AL', en: 'Albania', tr: 'Arnavutluk', de: 'Albanien', fr: 'Albanie', nl: 'Albanië', ru: 'Албания', zh: '阿尔巴尼亚', pt_BR: 'Albânia', pt_PT: 'Albânia' },
  { code: 'AM', en: 'Armenia', tr: 'Ermenistan', de: 'Armenien', fr: 'Arménie', nl: 'Armenië', ru: 'Армения', zh: '亚美尼亚', pt_BR: 'Armênia', pt_PT: 'Arménia' },
  { code: 'AR', en: 'Argentina', tr: 'Arjantin', de: 'Argentinien', fr: 'Argentine', nl: 'Argentinië', ru: 'Аргентина', zh: '阿根廷', pt_BR: 'Argentina', pt_PT: 'Argentina' },
  { code: 'AT', en: 'Austria', tr: 'Avusturya', de: 'Österreich', fr: 'Autriche', nl: 'Oostenrijk', ru: 'Австрия', zh: '奥地利', pt_BR: 'Áustria', pt_PT: 'Áustria' },
  { code: 'AU', en: 'Australia', tr: 'Avustralya', de: 'Australien', fr: 'Australie', nl: 'Australië', ru: 'Австралия', zh: '澳大利亚', pt_BR: 'Austrália', pt_PT: 'Austrália' },
  { code: 'AZ', en: 'Azerbaijan', tr: 'Azerbaycan', de: 'Aserbaidschan', fr: 'Azerbaïdjan', nl: 'Azerbeidzjan', ru: 'Азербайджан', zh: '阿塞拜疆', pt_BR: 'Azerbaijão', pt_PT: 'Azerbaijão' },
  { code: 'BA', en: 'Bosnia and Herzegovina', tr: 'Bosna-Hersek', de: 'Bosnien und Herzegowina', fr: 'Bosnie-Herzégovine', nl: 'Bosnië en Herzegovina', ru: 'Босния и Герцеговина', zh: '波斯尼亚和黑塞哥维那', pt_BR: 'Bósnia e Herzegovina', pt_PT: 'Bósnia e Herzegovina' },
  { code: 'BD', en: 'Bangladesh', tr: 'Bangladeş', de: 'Bangladesch', fr: 'Bangladesh', nl: 'Bangladesh', ru: 'Бангладеш', zh: '孟加拉国', pt_BR: 'Bangladesh', pt_PT: 'Bangladesh' },
  { code: 'BE', en: 'Belgium', tr: 'Belçika', de: 'Belgien', fr: 'Belgique', nl: 'België', ru: 'Бельгия', zh: '比利时', pt_BR: 'Bélgica', pt_PT: 'Bélgica' },
  { code: 'BG', en: 'Bulgaria', tr: 'Bulgaristan', de: 'Bulgarien', fr: 'Bulgarie', nl: 'Bulgarije', ru: 'Болгария', zh: '保加利亚', pt_BR: 'Bulgária', pt_PT: 'Bulgária' },
  { code: 'BR', en: 'Brazil', tr: 'Brezilya', de: 'Brasilien', fr: 'Brésil', nl: 'Brazilië', ru: 'Бразилия', zh: '巴西', pt_BR: 'Brasil', pt_PT: 'Brasil' },
  { code: 'BY', en: 'Belarus', tr: 'Beyaz Rusya', de: 'Weißrussland', fr: 'Biélorussie', nl: 'Wit-Rusland', ru: 'Беларусь', zh: '白俄罗斯', pt_BR: 'Bielorrússia', pt_PT: 'Bielorrússia' },
  { code: 'CA', en: 'Canada', tr: 'Kanada', de: 'Kanada', fr: 'Canada', nl: 'Canada', ru: 'Канада', zh: '加拿大', pt_BR: 'Canadá', pt_PT: 'Canadá' },
  { code: 'CH', en: 'Switzerland', tr: 'İsviçre', de: 'Schweiz', fr: 'Suisse', nl: 'Zwitserland', ru: 'Швейцария', zh: '瑞士', pt_BR: 'Suíça', pt_PT: 'Suíça' },
  { code: 'CL', en: 'Chile', tr: 'Şili', de: 'Chile', fr: 'Chili', nl: 'Chili', ru: 'Чили', zh: '智利', pt_BR: 'Chile', pt_PT: 'Chile' },
  { code: 'CN', en: 'China', tr: 'Çin', de: 'China', fr: 'Chine', nl: 'China', ru: 'Китай', zh: '中国', pt_BR: 'China', pt_PT: 'China' },
  { code: 'CO', en: 'Colombia', tr: 'Kolombiya', de: 'Kolumbien', fr: 'Colombie', nl: 'Colombia', ru: 'Колумбия', zh: '哥伦比亚', pt_BR: 'Colômbia', pt_PT: 'Colômbia' },
  { code: 'CZ', en: 'Czech Republic', tr: 'Çek Cumhuriyeti', de: 'Tschechien', fr: 'République tchèque', nl: 'Tsjechië', ru: 'Чехия', zh: '捷克', pt_BR: 'República Tcheca', pt_PT: 'República Checa' },
  { code: 'DE', en: 'Germany', tr: 'Almanya', de: 'Deutschland', fr: 'Allemagne', nl: 'Duitsland', ru: 'Германия', zh: '德国', pt_BR: 'Alemanha', pt_PT: 'Alemanha' },
  { code: 'DK', en: 'Denmark', tr: 'Danimarka', de: 'Dänemark', fr: 'Danemark', nl: 'Denemarken', ru: 'Дания', zh: '丹麦', pt_BR: 'Dinamarca', pt_PT: 'Dinamarca' },
  { code: 'DZ', en: 'Algeria', tr: 'Cezayir', de: 'Algerien', fr: 'Algérie', nl: 'Algerije', ru: 'Алжир', zh: '阿尔及利亚', pt_BR: 'Argélia', pt_PT: 'Argélia' },
  { code: 'EE', en: 'Estonia', tr: 'Estonya', de: 'Estland', fr: 'Estonie', nl: 'Estland', ru: 'Эстония', zh: '爱沙尼亚', pt_BR: 'Estônia', pt_PT: 'Estónia' },
  { code: 'EG', en: 'Egypt', tr: 'Mısır', de: 'Ägypten', fr: 'Égypte', nl: 'Egypte', ru: 'Египет', zh: '埃及', pt_BR: 'Egito', pt_PT: 'Egito' },
  { code: 'ES', en: 'Spain', tr: 'İspanya', de: 'Spanien', fr: 'Espagne', nl: 'Spanje', ru: 'Испания', zh: '西班牙', pt_BR: 'Espanha', pt_PT: 'Espanha' },
  { code: 'ET', en: 'Ethiopia', tr: 'Etiyopya', de: 'Äthiopien', fr: 'Éthiopie', nl: 'Ethiopië', ru: 'Эфиопия', zh: '埃塞俄比亚', pt_BR: 'Etiópia', pt_PT: 'Etiópia' },
  { code: 'FI', en: 'Finland', tr: 'Finlandiya', de: 'Finnland', fr: 'Finlande', nl: 'Finland', ru: 'Финляндия', zh: '芬兰', pt_BR: 'Finlândia', pt_PT: 'Finlândia' },
  { code: 'FR', en: 'France', tr: 'Fransa', de: 'Frankreich', fr: 'France', nl: 'Frankrijk', ru: 'Франция', zh: '法国', pt_BR: 'França', pt_PT: 'França' },
  { code: 'GB', en: 'United Kingdom', tr: 'Birleşik Krallık', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni', nl: 'Verenigd Koninkrijk', ru: 'Великобритания', zh: '英国', pt_BR: 'Reino Unido', pt_PT: 'Reino Unido' },
  { code: 'GE', en: 'Georgia', tr: 'Gürcistan', de: 'Georgien', fr: 'Géorgie', nl: 'Georgië', ru: 'Грузия', zh: '格鲁吉亚', pt_BR: 'Geórgia', pt_PT: 'Geórgia' },
  { code: 'GH', en: 'Ghana', tr: 'Gana', de: 'Ghana', fr: 'Ghana', nl: 'Ghana', ru: 'Гана', zh: '加纳', pt_BR: 'Gana', pt_PT: 'Gana' },
  { code: 'GR', en: 'Greece', tr: 'Yunanistan', de: 'Griechenland', fr: 'Grèce', nl: 'Griekenland', ru: 'Греция', zh: '希腊', pt_BR: 'Grécia', pt_PT: 'Grécia' },
  { code: 'HR', en: 'Croatia', tr: 'Hırvatistan', de: 'Kroatien', fr: 'Croatie', nl: 'Kroatië', ru: 'Хорватия', zh: '克罗地亚', pt_BR: 'Croácia', pt_PT: 'Croácia' },
  { code: 'HU', en: 'Hungary', tr: 'Macaristan', de: 'Ungarn', fr: 'Hongrie', nl: 'Hongarije', ru: 'Венгрия', zh: '匈牙利', pt_BR: 'Hungria', pt_PT: 'Hungria' },
  { code: 'ID', en: 'Indonesia', tr: 'Endonezya', de: 'Indonesien', fr: 'Indonésie', nl: 'Indonesië', ru: 'Индонезия', zh: '印度尼西亚', pt_BR: 'Indonésia', pt_PT: 'Indonésia' },
  { code: 'IE', en: 'Ireland', tr: 'İrlanda', de: 'Irland', fr: 'Irlande', nl: 'Ierland', ru: 'Ирландия', zh: '爱尔兰', pt_BR: 'Irlanda', pt_PT: 'Irlanda' },
  { code: 'IL', en: 'Israel', tr: 'İsrail', de: 'Israel', fr: 'Israël', nl: 'Israël', ru: 'Израиль', zh: '以色列', pt_BR: 'Israel', pt_PT: 'Israel' },
  { code: 'IN', en: 'India', tr: 'Hindistan', de: 'Indien', fr: 'Inde', nl: 'India', ru: 'Индия', zh: '印度', pt_BR: 'Índia', pt_PT: 'Índia' },
  { code: 'IQ', en: 'Iraq', tr: 'Irak', de: 'Irak', fr: 'Irak', nl: 'Irak', ru: 'Ирак', zh: '伊拉克', pt_BR: 'Iraque', pt_PT: 'Iraque' },
  { code: 'IR', en: 'Iran', tr: 'İran', de: 'Iran', fr: 'Iran', nl: 'Iran', ru: 'Иран', zh: '伊朗', pt_BR: 'Irã', pt_PT: 'Irão' },
  { code: 'IT', en: 'Italy', tr: 'İtalya', de: 'Italien', fr: 'Italie', nl: 'Italië', ru: 'Италия', zh: '意大利', pt_BR: 'Itália', pt_PT: 'Itália' },
  { code: 'JP', en: 'Japan', tr: 'Japonya', de: 'Japan', fr: 'Japon', nl: 'Japan', ru: 'Япония', zh: '日本', pt_BR: 'Japão', pt_PT: 'Japão' },
  { code: 'KE', en: 'Kenya', tr: 'Kenya', de: 'Kenia', fr: 'Kenya', nl: 'Kenia', ru: 'Кения', zh: '肯尼亚', pt_BR: 'Quênia', pt_PT: 'Quénia' },
  { code: 'KH', en: 'Cambodia', tr: 'Kamboçya', de: 'Kambodscha', fr: 'Cambodge', nl: 'Cambodja', ru: 'Камбоджа', zh: '柬埔寨', pt_BR: 'Camboja', pt_PT: 'Camboja' },
  { code: 'KP', en: 'North Korea', tr: 'Kuzey Kore', de: 'Nordkorea', fr: 'Corée du Nord', nl: 'Noord-Korea', ru: 'Северная Корея', zh: '朝鲜', pt_BR: 'Coreia do Norte', pt_PT: 'Coreia do Norte' },
  { code: 'KR', en: 'South Korea', tr: 'Güney Kore', de: 'Südkorea', fr: 'Corée du Sud', nl: 'Zuid-Korea', ru: 'Южная Корея', zh: '韩国', pt_BR: 'Coreia do Sul', pt_PT: 'Coreia do Sul' },
  { code: 'KW', en: 'Kuwait', tr: 'Kuveyt', de: 'Kuwait', fr: 'Koweït', nl: 'Koeweit', ru: 'Кувейт', zh: '科威特', pt_BR: 'Kuwait', pt_PT: 'Kuwait' },
  { code: 'KZ', en: 'Kazakhstan', tr: 'Kazakistan', de: 'Kasachstan', fr: 'Kazakhstan', nl: 'Kazachstan', ru: 'Казахстан', zh: '哈萨克斯坦', pt_BR: 'Cazaquistão', pt_PT: 'Cazaquistão' },
  { code: 'LB', en: 'Lebanon', tr: 'Lübnan', de: 'Libanon', fr: 'Liban', nl: 'Libanon', ru: 'Ливан', zh: '黎巴嫩', pt_BR: 'Líbano', pt_PT: 'Líbano' },
  { code: 'LT', en: 'Lithuania', tr: 'Litvanya', de: 'Litauen', fr: 'Lituanie', nl: 'Litouwen', ru: 'Литва', zh: '立陶宛', pt_BR: 'Lituânia', pt_PT: 'Lituânia' },
  { code: 'LU', en: 'Luxembourg', tr: 'Lüksemburg', de: 'Luxemburg', fr: 'Luxembourg', nl: 'Luxemburg', ru: 'Люксембург', zh: '卢森堡', pt_BR: 'Luxemburgo', pt_PT: 'Luxemburgo' },
  { code: 'LV', en: 'Latvia', tr: 'Letonya', de: 'Lettland', fr: 'Lettonie', nl: 'Letland', ru: 'Латвия', zh: '拉脱维亚', pt_BR: 'Letônia', pt_PT: 'Letónia' },
  { code: 'LY', en: 'Libya', tr: 'Libya', de: 'Libyen', fr: 'Libye', nl: 'Libië', ru: 'Ливия', zh: '利比亚', pt_BR: 'Líbia', pt_PT: 'Líbia' },
  { code: 'MA', en: 'Morocco', tr: 'Fas', de: 'Marokko', fr: 'Maroc', nl: 'Marokko', ru: 'Марокко', zh: '摩洛哥', pt_BR: 'Marrocos', pt_PT: 'Marrocos' },
  { code: 'MM', en: 'Myanmar', tr: 'Myanmar', de: 'Myanmar', fr: 'Myanmar', nl: 'Myanmar', ru: 'Мьянма', zh: '缅甸', pt_BR: 'Mianmar', pt_PT: 'Mianmar' },
  { code: 'MX', en: 'Mexico', tr: 'Meksika', de: 'Mexiko', fr: 'Mexique', nl: 'Mexico', ru: 'Мексика', zh: '墨西哥', pt_BR: 'México', pt_PT: 'México' },
  { code: 'MY', en: 'Malaysia', tr: 'Malezya', de: 'Malaysia', fr: 'Malaisie', nl: 'Maleisië', ru: 'Малайзия', zh: '马来西亚', pt_BR: 'Malásia', pt_PT: 'Malásia' },
  { code: 'NG', en: 'Nigeria', tr: 'Nijerya', de: 'Nigeria', fr: 'Nigéria', nl: 'Nigeria', ru: 'Нигерия', zh: '尼日利亚', pt_BR: 'Nigéria', pt_PT: 'Nigéria' },
  { code: 'NL', en: 'Netherlands', tr: 'Hollanda', de: 'Niederlande', fr: 'Pays-Bas', nl: 'Nederland', ru: 'Нидерланды', zh: '荷兰', pt_BR: 'Países Baixos', pt_PT: 'Países Baixos' },
  { code: 'NO', en: 'Norway', tr: 'Norveç', de: 'Norwegen', fr: 'Norvège', nl: 'Noorwegen', ru: 'Норвегия', zh: '挪威', pt_BR: 'Noruega', pt_PT: 'Noruega' },
  { code: 'NP', en: 'Nepal', tr: 'Nepal', de: 'Nepal', fr: 'Népal', nl: 'Nepal', ru: 'Непал', zh: '尼泊尔', pt_BR: 'Nepal', pt_PT: 'Nepal' },
  { code: 'NZ', en: 'New Zealand', tr: 'Yeni Zelanda', de: 'Neuseeland', fr: 'Nouvelle-Zélande', nl: 'Nieuw-Zeeland', ru: 'Новая Зеландия', zh: '新西兰', pt_BR: 'Nova Zelândia', pt_PT: 'Nova Zelândia' },
  { code: 'PE', en: 'Peru', tr: 'Peru', de: 'Peru', fr: 'Pérou', nl: 'Peru', ru: 'Перу', zh: '秘鲁', pt_BR: 'Peru', pt_PT: 'Peru' },
  { code: 'PH', en: 'Philippines', tr: 'Filipinler', de: 'Philippinen', fr: 'Philippines', nl: 'Filipijnen', ru: 'Филиппины', zh: '菲律宾', pt_BR: 'Filipinas', pt_PT: 'Filipinas' },
  { code: 'PK', en: 'Pakistan', tr: 'Pakistan', de: 'Pakistan', fr: 'Pakistan', nl: 'Pakistan', ru: 'Пакистан', zh: '巴基斯坦', pt_BR: 'Paquistão', pt_PT: 'Paquistão' },
  { code: 'PL', en: 'Poland', tr: 'Polonya', de: 'Polen', fr: 'Pologne', nl: 'Polen', ru: 'Польша', zh: '波兰', pt_BR: 'Polônia', pt_PT: 'Polónia' },
  { code: 'PT', en: 'Portugal', tr: 'Portekiz', de: 'Portugal', fr: 'Portugal', nl: 'Portugal', ru: 'Португалия', zh: '葡萄牙', pt_BR: 'Portugal', pt_PT: 'Portugal' },
  { code: 'QA', en: 'Qatar', tr: 'Katar', de: 'Katar', fr: 'Qatar', nl: 'Qatar', ru: 'Катар', zh: '卡塔尔', pt_BR: 'Catar', pt_PT: 'Catar' },
  { code: 'RO', en: 'Romania', tr: 'Romanya', de: 'Rumänien', fr: 'Roumanie', nl: 'Roemenië', ru: 'Румыния', zh: '罗马尼亚', pt_BR: 'Romênia', pt_PT: 'Roménia' },
  { code: 'RS', en: 'Serbia', tr: 'Sırbistan', de: 'Serbien', fr: 'Serbie', nl: 'Servië', ru: 'Сербия', zh: '塞尔维亚', pt_BR: 'Sérvia', pt_PT: 'Sérvia' },
  { code: 'RU', en: 'Russia', tr: 'Rusya', de: 'Russland', fr: 'Russie', nl: 'Rusland', ru: 'Россия', zh: '俄罗斯', pt_BR: 'Rússia', pt_PT: 'Rússia' },
  { code: 'SA', en: 'Saudi Arabia', tr: 'Suudi Arabistan', de: 'Saudi-Arabien', fr: 'Arabie saoudite', nl: 'Saoedi-Arabië', ru: 'Саудовская Аравия', zh: '沙特阿拉伯', pt_BR: 'Arábia Saudita', pt_PT: 'Arábia Saudita' },
  { code: 'SE', en: 'Sweden', tr: 'İsveç', de: 'Schweden', fr: 'Suède', nl: 'Zweden', ru: 'Швеция', zh: '瑞典', pt_BR: 'Suécia', pt_PT: 'Suécia' },
  { code: 'SG', en: 'Singapore', tr: 'Singapur', de: 'Singapur', fr: 'Singapour', nl: 'Singapore', ru: 'Сингапур', zh: '新加坡', pt_BR: 'Singapura', pt_PT: 'Singapura' },
  { code: 'SI', en: 'Slovenia', tr: 'Slovenya', de: 'Slowenien', fr: 'Slovénie', nl: 'Slovenië', ru: 'Словения', zh: '斯洛文尼亚', pt_BR: 'Eslovênia', pt_PT: 'Eslovénia' },
  { code: 'SK', en: 'Slovakia', tr: 'Slovakya', de: 'Slowakei', fr: 'Slovaquie', nl: 'Slowakije', ru: 'Словакия', zh: '斯洛伐克', pt_BR: 'Eslováquia', pt_PT: 'Eslováquia' },
  { code: 'SY', en: 'Syria', tr: 'Suriye', de: 'Syrien', fr: 'Syrie', nl: 'Syrië', ru: 'Сирия', zh: '叙利亚', pt_BR: 'Síria', pt_PT: 'Síria' },
  { code: 'TH', en: 'Thailand', tr: 'Tayland', de: 'Thailand', fr: 'Thaïlande', nl: 'Thailand', ru: 'Таиланд', zh: '泰国', pt_BR: 'Tailândia', pt_PT: 'Tailândia' },
  { code: 'TN', en: 'Tunisia', tr: 'Tunus', de: 'Tunesien', fr: 'Tunisie', nl: 'Tunesië', ru: 'Тунис', zh: '突尼斯', pt_BR: 'Tunísia', pt_PT: 'Tunísia' },
  { code: 'TR', en: 'Turkey', tr: 'Türkiye', de: 'Türkei', fr: 'Turquie', nl: 'Turkije', ru: 'Турция', zh: '土耳其', pt_BR: 'Turquia', pt_PT: 'Turquia' },
  { code: 'TW', en: 'Taiwan', tr: 'Tayvan', de: 'Taiwan', fr: 'Taïwan', nl: 'Taiwan', ru: 'Тайвань', zh: '台湾', pt_BR: 'Taiwan', pt_PT: 'Taiwan' },
  { code: 'TZ', en: 'Tanzania', tr: 'Tanzanya', de: 'Tansania', fr: 'Tanzanie', nl: 'Tanzania', ru: 'Танзания', zh: '坦桑尼亚', pt_BR: 'Tanzânia', pt_PT: 'Tanzânia' },
  { code: 'UA', en: 'Ukraine', tr: 'Ukrayna', de: 'Ukraine', fr: 'Ukraine', nl: 'Oekraïne', ru: 'Украина', zh: '乌克兰', pt_BR: 'Ucrânia', pt_PT: 'Ucrânia' },
  { code: 'US', en: 'United States', tr: 'Amerika Birleşik Devletleri', de: 'Vereinigte Staaten', fr: 'États-Unis', nl: 'Verenigde Staten', ru: 'Соединённые Штаты Америки', zh: '美国', pt_BR: 'Estados Unidos', pt_PT: 'Estados Unidos' },
  { code: 'UZ', en: 'Uzbekistan', tr: 'Özbekistan', de: 'Usbekistan', fr: 'Ouzbékistan', nl: 'Oezbekistan', ru: 'Узбекистан', zh: '乌兹别克斯坦', pt_BR: 'Uzbequistão', pt_PT: 'Usbequistão' },
  { code: 'VN', en: 'Vietnam', tr: 'Vietnam', de: 'Vietnam', fr: 'Viêt Nam', nl: 'Vietnam', ru: 'Вьетнам', zh: '越南', pt_BR: 'Vietnã', pt_PT: 'Vietname' },
  { code: 'ZA', en: 'South Africa', tr: 'Güney Afrika', de: 'Südafrika', fr: 'Afrique du Sud', nl: 'Zuid-Afrika', ru: 'Южная Африка', zh: '南非', pt_BR: 'África do Sul', pt_PT: 'África do Sul' },
];

export function getCountryName(code: string, language: Language): string {
  const country = COUNTRIES.find(c => c.code === code);
  if (!country) return code;
  return (country as any)[language] ?? country.en;
}
