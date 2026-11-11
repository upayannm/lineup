export const spots=[
{id:'shores',name:'La Jolla Shores',region:'San Diego',lat:32.857,lon:-117.257,normal:270,type:'Sand beach break',station:'9410230',stationName:'La Jolla',bottom:'sand',learn:true,source:'https://www.sandiego.gov/lifeguards/beaches/shores',note:'Stay in the designated surfing area. Sandbars, rips and the nearby canyon can change how swell breaks.',water:'https://www.sdbeachinfo.com/'},
{id:'huntington',name:'Huntington State Beach',region:'Orange County',lat:33.638,lon:-117.975,normal:225,type:'Exposed sand beach break',station:'9410660',stationName:'Los Angeles',bottom:'sand',learn:false,source:'https://www.parks.ca.gov/?page_id=643',note:'Open-coast sandbars can produce steep takeoffs, closeouts and rip currents. Check designated surf areas.',water:'https://ocbeachinfo.com/'},
{id:'malibu',name:'Malibu Surfrider',region:'Los Angeles',lat:34.033,lon:-118.680,normal:180,type:'Cobblestone point break',station:'9410840',stationName:'Santa Monica',bottom:'rock',learn:false,source:'https://beaches.lacounty.gov/malibu-surfrider-beach/',note:'Rocky footing and a shared point-break lineup require control and etiquette. Crowding is not measured here.',water:'https://www.publichealth.lacounty.gov/phcommon/public/eh/water_quality/beach_grades.cfm'}];
export const finite=x=>typeof x==='number'&&Number.isFinite(x);
export const angle=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function at(hourly,time,key){const i=hourly?.time?.indexOf(time);return i>=0&&finite(hourly[key]?.[i])?hourly[key][i]:null;}
export function conditions(data,time){if(!data)return null;const m=data.marine?.hourly,w=data.weather?.hourly;const point=data.tides?.find(p=>p.time===time);return {height:at(m,time,'wave_height'),swell:at(m,time,'swell_wave_height'),period:at(m,time,'swell_wave_period'),direction:at(m,time,'swell_wave_direction'),wind:at(w,time,'wind_speed_10m'),windDirection:at(w,time,'wind_direction_10m'),day:at(w,time,'is_day'),tide:point?.value??null,fetched:data.fetched};}
export function assess(spot,c,level,board,now=Date.now()){
const reasons=[];let rank=2;if(!c||now-c.fetched>30*60e3||!['height','swell','period','direction','wind','windDirection','tide','day'].every(k=>finite(c[k])))return {rank:-1,title:'Data incomplete',reasons:['A complete, recent swell, wind and tide forecast is required. No recommendation is made from missing or stale values.']};
const lower=(r,text)=>{rank=Math.min(rank,r);reasons.push(text)};
if(!c.day)lower(0,'Outside daylight hours. Choose a daytime forecast.');
if(level==='beginner'&&!spot.learn)lower(0,'This exposed or technical lineup is outside the beginner recommendation set.');
if(level==='beginner'&&(c.height>.8||c.period>=13||c.wind>10))lower(0,'The modeled height, period or wind exceeds our conservative beginner screening limits.');
if(level==='beginner'&&board!=='foam')lower(1,'Your smaller board makes learning harder; favor instructor-led whitewater practice with a suitable foam board.');
if(c.height>({beginner:.8,intermediate:1.8,advanced:2.8}[level]))lower(0,'Modeled offshore wave height exceeds this profile’s screening limit. Breaking-wave height may differ substantially.');
if(c.period>=14)lower(1,'Longer-period swell can focus and steepen over the local bottom. Watch sets and verify the entry and exit.');
if(spot.bottom==='rock'&&c.tide<.6)lower(0,'Low predicted water at the reference station adds concern about exposed rocks. Local clearance is unknown.');
if(c.wind>=20)lower(0,'Strong modeled wind makes this a poor session candidate.');
else if(c.wind>=12)lower(1,'Wind strength could affect paddling and face quality, including when offshore.');
const windAngle=angle(c.windDirection,spot.normal);if(c.wind>=6&&windAngle<60)lower(1,'Onshore wind relative to the approximate coastline may add surface chop.');
if(angle(c.direction,spot.normal)>85)lower(1,'The main swell is oblique to this shoreline. Headlands, islands and refraction make local delivery uncertain.');
if(c.swell<.35)lower(1,'Very little modeled swell; there may be limited rideable surf.');
if(c.height<.6&&board!=='foam')lower(1,'On smaller, softer surf, a longer board can offer more glide than your selected board.');
if(!reasons.length)reasons.push(level==='beginner'?'A candidate for an instructor-led session, subject to an on-site check of whitewater and currents.':'The modeled swell and wind pass this profile’s initial screen. Confirm actual faces, currents and crowding on site.');
return {rank,title:['Skip this window','Check carefully','Worth a look'][rank],reasons};}
