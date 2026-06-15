const url = 'https://otzrqnmyrzegqqxgwdbd.supabase.co/rest/v1/site_content?section_key=eq.hero_parent';
const key = 'sb_publishable_w-apjLisOCfwXc824ZZZEA_dDKWjQXh';

async function verify() {
  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await response.json();
  console.log('Current Title:', data[0].data.title);
}
verify();
