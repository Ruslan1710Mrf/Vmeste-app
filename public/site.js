'use strict';
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
let sending = false;
// Fixed server endpoint. Never accept a recipient or mail payload from the browser.
const endpoint = 'https://us-central1-veste-app-bffb0.cloudfunctions.net/submitWebsiteInquiry';
for (const link of document.querySelectorAll('[data-service]')) {
  link.addEventListener('click', () => {
    document.querySelector('#service').value = link.dataset.service;
  });
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const fields = new FormData(form);
  if (fields.get('company_url')) return;
  sending = true;
  const button = form.querySelector('button[type=submit]');
  button.disabled = true;
  status.textContent = 'Отправляем заявку…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: fields.get('name').trim(), email: fields.get('email').trim(), service: fields.get('service'), message: fields.get('message').trim(), consent: fields.get('consent') === 'on', company_url: ''}),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      if (response.status === 429) throw new Error('rate-limit');
      throw new Error('not-accepted');
    }
    form.reset();
    status.textContent = 'Заявка принята. Ответим на указанный email.';
  } catch (error) {
    status.textContent = error.message === 'rate-limit' ? 'Слишком много попыток. Попробуйте позже или напишите на ruslan@vmestegroup.app.' : 'Не удалось подтвердить отправку. Напишите на ruslan@vmestegroup.app. Если заявка уже поступила, мы ответим на неё.';
  } finally {
    clearTimeout(timeout); sending = false; button.disabled = false;
  }
});
