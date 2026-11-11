import {findProfile,emptyProfile,mapFacts,articleContext,matchArticle} from './profile-model.js';
const memory=new Map(),VERSION='lineup-evidence-v1-',TTL=24*3600e3;
async function json(url,signal){const r=await fetch(url,{signal});if(!r.ok)throw Error('Source request failed');const d=await r.json();if(d.error)throw Error('Source request failed');return d;}
export async function research(spot,{signal,force=false}={}){
 const key=`${spot.id}:${spot.lat.toFixed(4)},${spot.lon.toFixed(4)}`;
 let cached=memory.get(key);if(!cached)try{cached=JSON.parse(localStorage.getItem(VERSION+key));}catch{}
 if(!force&&cached&&Date.now()-cached.retrieved<TTL)return {...cached,cached:true};
 const seed=findProfile(spot);let profile=seed?{...seed,facts:[...seed.facts],automatic:false}:emptyProfile(spot);
 const checks=[];const osm=String(spot.id).match(/^([NWR])-(\d+)$/i);
 const params=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'extracts|coordinates|info',explaintext:'1',exintro:'1',exlimit:'max',colimit:'max'});
 if(seed)params.set('titles',seed.wiki);else{params.set('generator','geosearch');params.set('ggscoord',`${spot.lat}|${spot.lon}`);params.set('ggsradius','1500');params.set('ggslimit','10');}
 const results=await Promise.allSettled([
 json('https://en.wikipedia.org/w/api.php?'+params,signal),
 osm?json(`https://api.openstreetmap.org/api/0.6/${{N:'node',W:'way',R:'relation'}[osm[1].toUpperCase()]}/${osm[2]}.json`,signal):Promise.resolve(null)
 ]);
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 const wiki=results[0];if(wiki.status==='fulfilled'){
  const pages=Object.values(wiki.value.query?.pages||{});const page=matchArticle(seed?{...spot,name:seed.wiki}:spot,pages);
  profile=articleContext(profile,page);checks.push(page?'Wikipedia: matched name and coordinates.':'Wikipedia: no article passed the name + distance match.');
 }else checks.push('Wikipedia: unavailable. No facts were invented.');
 if(osm){const result=results[1];if(result.status==='fulfilled'){
  const el=result.value?.elements?.find(e=>String(e.id)===osm[2]);profile.facts.push(...mapFacts(el));checks.push(el?'OpenStreetMap: exact selected feature checked.':'OpenStreetMap: selected feature not returned.');
 }else checks.push('OpenStreetMap: unavailable.');}
 else checks.push('OpenStreetMap: no exact feature ID for this selection.');
 const result={profile,checks,retrieved:Date.now(),cached:false,partial:results.some(r=>r.status==='rejected')};
 // Failed refreshes are visible and never replace cached evidence with a false success.
 if(!result.partial){memory.set(key,result);try{localStorage.setItem(VERSION+key,JSON.stringify(result));}catch{}}
 return result;
}
