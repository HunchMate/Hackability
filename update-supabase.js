const url = 'https://otzrqnmyrzegqqxgwdbd.supabase.co/rest/v1/site_content?section_key=eq.hero_parent';
const key = 'sb_publishable_w-apjLisOCfwXc824ZZZEA_dDKWjQXh';

async function updateHero() {
  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await response.json();
  console.log('Current Data:', JSON.stringify(data, null, 2));
  
  if (data && data.length > 0) {
    const row = data[0];
    const newData = { ...row.data };
    
    // Check if the old text exists
    if (newData.title && newData.title.includes('Talent at Scale')) {
      newData.title = "Building innovation driven <span style=\"color:#F5C200;\">talent ecosystems</span>";
      
      const patchResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ data: newData })
      });
      
      if (!patchResponse.ok) {
        console.error('Update failed:', await patchResponse.text());
      } else {
        console.log('Update successful:', await patchResponse.json());
      }
    } else {
      console.log('Title does not match what we expected to change:', newData.title);
      // Change it anyway
      newData.title = "Building innovation driven <span style=\"color:#F5C200;\">talent ecosystems</span>";
      const patchResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ data: newData })
      });
      if (patchResponse.ok) console.log('Forced update successful.');
    }
  } else {
    console.log('No hero_parent row found in site_content table.');
  }
}
updateHero();
