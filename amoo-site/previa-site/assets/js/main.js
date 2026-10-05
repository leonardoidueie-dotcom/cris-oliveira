// Prévia Cris Oliveira — menu, horário, pré-avaliação pelo WhatsApp, mapa sob demanda
(() => {
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const cab = $('[data-cabecalho]'); const linha = () => cab.classList.toggle('border-linha', scrollY > 8);
  addEventListener('scroll', linha, { passive: true }); linha();

  // menu do celular
  const menu = $('[data-menu]'), abrir = $('[data-menu-abrir]');
  const fechar = () => { menu.classList.add('hidden'); menu.classList.remove('flex'); abrir.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  abrir.addEventListener('click', () => { menu.classList.remove('hidden'); menu.classList.add('flex'); abrir.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('[data-menu-fechar]').focus(); });
  $('[data-menu-fechar]').addEventListener('click', () => { fechar(); abrir.focus(); });
  $$('[data-menu-link]').forEach(a => a.addEventListener('click', fechar));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { fechar(); abrir.focus(); } });

  // atendendo agora? (horário do Google, fuso de Itajubá)
  const H = { 0: null, 1: [12.5, 17.5], 2: [9, 16.5], 3: [9.5, 18], 4: [10.5, 17.5], 5: [8.5, 17], 6: [8.5, 11.5] };
  const NOME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const hh = h => `${Math.floor(h)}h${h % 1 ? '30' : ''}`;
  const agora = () => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: +p.hour + (+p.minute) / 60 }; };
  const pinta = () => {
    const { dia, h } = agora(), hoje = H[dia]; let txt, aberto = false;
    if (hoje && h >= hoje[0] && h < hoje[1]) { aberto = true; txt = `Atendendo agora · até ${hh(hoje[1])}`; }
    else if (hoje && h < hoje[0]) txt = `Hoje a partir das ${hh(hoje[0])}`;
    else for (let i = 1; i <= 7; i++) { const d = (dia + i) % 7; if (H[d]) { txt = `Próximo atendimento: ${i === 1 ? 'amanhã' : NOME[d]}, ${hh(H[d][0])}`; break; } }
    $$('[data-status]').forEach(el => el.textContent = txt);
    $$('[data-status-ponto]').forEach(el => { el.classList.toggle('bg-[#3f8f5a]', aberto); el.classList.toggle('bg-cinza', !aberto); });
    $$('[data-dia]').forEach(tr => tr.classList.toggle('font-semibold', tr.dataset.dia === String(dia)));
  };
  pinta(); setInterval(pinta, 60000);

  // entrada suave
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.surge').forEach(el => matchMedia('(prefers-reduced-motion: reduce)').matches ? el.classList.add('visto') : io.observe(el));

  // pré-avaliação: monta a mensagem e abre o WhatsApp (nada é salvo)
  const form = $('[data-form]'), previa = $('[data-previa]');
  const lista = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a.at(-1);
  const mensagem = () => {
    const f = new FormData(form); const nome = (f.get('nome') || '').trim();
    const q = f.getAll('queixa').map(s => s.toLowerCase()); const per = f.get('periodo') || 'qualquer horário';
    let m = `Oi, Cris! ${nome ? `Meu nome é ${nome}. ` : ''}Vi o site e queria agendar uma avaliação.`;
    if (q.length) m += ` O que mais me incomoda hoje: ${lista(q)}.`;
    m += ` Melhor período para mim: ${per}.`;
    return m;
  };
  const atualiza = () => { previa.textContent = mensagem(); };
  form.addEventListener('input', atualiza); form.addEventListener('change', atualiza); atualiza();
  form.addEventListener('submit', e => { e.preventDefault(); open(`https://wa.me/${window.SITE.whatsapp}?text=${encodeURIComponent(mensagem())}`, '_blank', 'noopener'); });

  // botão flutuante some quando o formulário está na tela
  const flut = $('[data-flutuante]');
  new IntersectionObserver(es => { const v = es[0].isIntersecting; flut.style.opacity = v ? '0' : ''; flut.style.pointerEvents = v ? 'none' : ''; }, { threshold: 0.15 }).observe($('#avaliacao'));

  // mapa quando chega perto (ou no toque)
  const btn = $('[data-mapa-carregar]');
  const mapa = () => { if (!btn.isConnected) return; const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Clinica+Amoo+Estetica,+R.+Flam%C3%ADnio+Miranda,+186,+Itajub%C3%A1&z=16&output=embed';
    f.title = 'Mapa: Clínica Amoo Estética, R. Flamínio Miranda, 186'; f.loading = 'lazy'; f.className = 'absolute inset-0 h-full w-full border-0'; btn.replaceWith(f); };
  btn.addEventListener('click', mapa);
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { mapa(); o.disconnect(); } }, { rootMargin: '200px' }).observe($('[data-mapa]'));
})();
