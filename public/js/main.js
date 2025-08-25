// Loader show on form submit and link clicks with data-loader
(function(){
  const loader = document.getElementById('loader');
  function show(){ if(loader) loader.classList.remove('hidden'); }
  function hide(){ if(loader) loader.classList.add('hidden'); }
  window.addEventListener('pageshow', hide);
  document.addEventListener('submit', (e)=>{
    const form = e.target.closest('form');
    if(form && (form.hasAttribute('data-loader') || form.method.toLowerCase() === 'post')) show();
  });
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[data-loader]');
    if(a) show();
    const delForm = e.target.closest('form[data-confirm]');
    if(delForm){
      const msg = delForm.getAttribute('data-confirm') || 'Are you sure?';
      if(!confirm(msg)) e.preventDefault();
    }
  });

  // Fetch dashboard stats
  const elTotal = document.getElementById('stat-total');
  if(elTotal){
    fetch('/members/api/stats').then(r=>r.json()).then(d=>{
      document.getElementById('stat-total').textContent = d.totalUsers;
      document.getElementById('stat-expiring').textContent = d.expiringSoon;
      document.getElementById('stat-expired').textContent = d.expired;
    }).catch(()=>{});
  }

  // Client search
  const search = document.getElementById('search');
  const tbody = document.getElementById('members-body');
  if(search && tbody){
    search.addEventListener('input', ()=>{
      const q = search.value.toLowerCase();
      tbody.querySelectorAll('tr').forEach(tr=>{
        const name = tr.getAttribute('data-name') || '';
        const phone = tr.getAttribute('data-phone') || '';
        const show = name.includes(q) || phone.includes(q);
        tr.style.display = show ? '' : 'none';
      });
    });
  }
})();