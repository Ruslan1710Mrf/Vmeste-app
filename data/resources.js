export const RESOURCE_CATEGORIES = [
  { id: 'banks', label: 'Банки' },
  { id: 'transfers', label: 'Переводы' },
  { id: 'installments', label: 'Рассрочка' },
  { id: 'credit', label: 'Бюро' },
];

function resourceIcon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export const RESOURCES = {
  banks: [
    {
      id: 'chase',
      name: 'Chase',
      description:
        'Крупный банк с отделениями по всей стране. Удобно открыть checking/savings при наличии SSN или ITIN.',
      url: 'https://www.chase.com/',
      domain: 'chase.com',
      icon: resourceIcon('chase.com'),
      brandColor: '#117ACA',
      fallback: 'Ch',
    },
    {
      id: 'bofa',
      name: 'Bank of America',
      description:
        'Популярный выбор для новоприбывших: онлайн-заявка, мобильное приложение и широкая сеть банкоматов.',
      url: 'https://www.bankofamerica.com/',
      domain: 'bankofamerica.com',
      icon: resourceIcon('bankofamerica.com'),
      brandColor: '#E31837',
      fallback: 'BoA',
    },
    {
      id: 'wells-fargo',
      name: 'Wells Fargo',
      description:
        'Базовые счета для повседневных операций, переводы Zelle и дебетовые карты для старта в США.',
      url: 'https://www.wellsfargo.com/',
      domain: 'wellsfargo.com',
      icon: resourceIcon('wellsfargo.com'),
      brandColor: '#D71E28',
      fallback: 'WF',
    },
    {
      id: 'capital-one',
      name: 'Capital One',
      description:
        'Часто одобряют первый счёт без сложной кредитной истории. Хороший вариант для первых месяцев в стране.',
      url: 'https://www.capitalone.com/',
      domain: 'capitalone.com',
      icon: resourceIcon('capitalone.com'),
      brandColor: '#D03027',
      fallback: 'C1',
    },
  ],
  transfers: [
    {
      id: 'wise',
      name: 'Wise',
      description:
        'Международные переводы с прозрачным курсом. Подходит для отправки денег в СНГ и между счетами в разных валютах.',
      url: 'https://wise.com/',
      domain: 'wise.com',
      icon: resourceIcon('wise.com'),
      brandColor: '#9FE870',
      fallback: 'W',
    },
    {
      id: 'paysend',
      name: 'PaySend',
      description:
        'Переводы в СНГ и Европу с фиксированной комиссией. Популярен среди русскоязычных иммигрантов в США.',
      url: 'https://paysend.com/',
      domain: 'paysend.com',
      icon: resourceIcon('paysend.com'),
      brandColor: '#5B4FE9',
      fallback: 'PS',
    },
    {
      id: 'remitly',
      name: 'Remitly',
      description:
        'Быстрые переводы родственникам за рубеж. Есть доставка на карту, счёт и наличными в ряде стран.',
      url: 'https://www.remitly.com/',
      domain: 'remitly.com',
      icon: resourceIcon('remitly.com'),
      brandColor: '#2E4F8E',
      fallback: 'R',
    },
    {
      id: 'sendwave',
      name: 'Sendwave',
      description:
        'Переводы на мобильные кошельки и карты. Удобен для регулярных небольших отправок без комиссии в приложении.',
      url: 'https://www.sendwave.com/',
      domain: 'sendwave.com',
      icon: resourceIcon('sendwave.com'),
      brandColor: '#00A86B',
      fallback: 'Sw',
    },
    {
      id: 'zelle',
      name: 'Zelle',
      description:
        'Мгновенные переводы между банками внутри США по email или телефону. Встроен в приложения многих банков.',
      url: 'https://www.zellepay.com/',
      domain: 'zellepay.com',
      icon: resourceIcon('zellepay.com'),
      brandColor: '#6D1ED4',
      fallback: 'Z',
    },
  ],
  installments: [
    {
      id: 'affirm',
      name: 'Affirm',
      description:
        'Рассрочка на покупки в интернет-магазинах и у партнёров. Показывает условия до подтверждения платежа.',
      url: 'https://www.affirm.com/',
      domain: 'affirm.com',
      icon: resourceIcon('affirm.com'),
      brandColor: '#4A4AF4',
      fallback: 'Af',
    },
    {
      id: 'klarna',
      name: 'Klarna',
      description:
        'Оплата частями в магазинах одежды, техники и маркетплейсах. Есть отложенный платёж и план на несколько месяцев.',
      url: 'https://www.klarna.com/us/',
      domain: 'klarna.com',
      icon: resourceIcon('klarna.com'),
      brandColor: '#FFB3C7',
      fallback: 'K',
    },
    {
      id: 'afterpay',
      name: 'Afterpay',
      description:
        'Разбивка чека на 4 платежа без процентов у тысяч ритейлеров. Полезно для крупных бытовых покупок.',
      url: 'https://www.afterpay.com/',
      domain: 'afterpay.com',
      icon: resourceIcon('afterpay.com'),
      brandColor: '#B2FCE4',
      fallback: 'Ap',
    },
    {
      id: 'sunbit',
      name: 'Sunbit',
      description:
        'Рассрочка для медицины, стоматологии и авторемонта. Одобрение за 30 секунд.',
      url: 'https://sunbit.com/',
      domain: 'sunbit.com',
      icon: resourceIcon('sunbit.com'),
      brandColor: '#F5A623',
      fallback: 'Sb',
    },
    {
      id: 'paypal-pay-later',
      name: 'PayPal Pay Later',
      description:
        'Рассрочка и отложенная оплата через PayPal там, где принимают этот способ оплаты.',
      url: 'https://www.paypal.com/us/digital-wallet/ways-to-pay/buy-now-pay-later',
      domain: 'paypal.com',
      icon: resourceIcon('paypal.com'),
      brandColor: '#003087',
      fallback: 'PP',
    },
  ],
  credit: [
    {
      id: 'credit-karma',
      name: 'Credit Karma',
      description:
        'Бесплатный мониторинг кредитного скора и рекомендации по картам. Помогает понять, что влияет на кредитную историю.',
      url: 'https://www.creditkarma.com/',
      domain: 'creditkarma.com',
      icon: resourceIcon('creditkarma.com'),
      brandColor: '#20C4B5',
      fallback: 'CK',
    },
    {
      id: 'discover-secured',
      name: 'Discover it Secured',
      description:
        'Залоговая карта для старта кредитной истории. Через несколько месяцев ответственного использования можно перейти на обычную карту.',
      url: 'https://www.discover.com/credit-cards/secured/',
      domain: 'discover.com',
      icon: resourceIcon('discover.com'),
      brandColor: '#FF6000',
      fallback: 'Di',
    },
    {
      id: 'self',
      name: 'Self',
      description:
        'Credit builder: небольшой кредит на свой депозит, чтобы появились первые записи в credit report.',
      url: 'https://www.self.inc/',
      domain: 'self.inc',
      icon: resourceIcon('self.inc'),
      brandColor: '#00B67A',
      fallback: 'S',
    },
    {
      id: 'experian',
      name: 'Experian',
      description:
        'Официальный отчёт о кредитной истории и инструменты для отслеживания изменений в бюро.',
      url: 'https://www.experian.com/',
      domain: 'experian.com',
      icon: resourceIcon('experian.com'),
      brandColor: '#6E2B62',
      fallback: 'Ex',
    },
  ],
};
