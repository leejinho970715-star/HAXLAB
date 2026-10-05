const upstream='https://hexlab-security-lab.leejinho970715.chatgpt.site';
export async function proxyRequest(request,fetcher=fetch){
 const action=new URL(request.url).pathname.split('/').pop();
 const json=(data,status)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
 if(!['health','scan','clone'].includes(action))return json({error:'Not found'},404);
 if(request.method!==(action==='health'?'GET':'POST'))return json({error:'지원하지 않는 요청입니다.'},405);
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return json({error:'동일한 사이트에서만 요청할 수 있습니다.'},403);
 const body=action==='health'?undefined:await request.text();
 if(body?.length>3000)return json({error:'요청이 너무 큽니다.'},413);
 try{
  const result=await fetcher(upstream+'/api/'+action,{method:request.method,headers:{'Content-Type':'application/json'},...(body!==undefined?{body}:{}),signal:AbortSignal.timeout(55000)});
  return new Response(await result.arrayBuffer(),{status:result.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'분석 서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.'},502);}
}
export default async function handler(req,res){
 const host=req.headers.host;
 const action=String(req.query?.action||new URL(req.url,'https://'+host).pathname.split('/').pop());
 const body=req.method==='POST'?(typeof req.body==='string'?req.body:JSON.stringify(req.body??{})):undefined;
 const response=await proxyRequest(new Request('https://'+host+'/api/'+encodeURIComponent(action),{method:req.method,headers:{...(req.headers.origin?{origin:req.headers.origin}:{}),'Content-Type':'application/json'},...(body!==undefined?{body}:{})}));
 res.statusCode=response.status;
 for(const [name,value] of response.headers)res.setHeader(name,value);
 res.end(Buffer.from(await response.arrayBuffer()));
}
