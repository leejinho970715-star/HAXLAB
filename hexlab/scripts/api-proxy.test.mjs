import test from 'node:test';
import assert from 'node:assert/strict';
import { proxyRequest } from '../server/api-proxy.mjs';

const request=(path,options={})=>new Request('https://haxlab-ten.vercel.app/api/'+path,options);
test('proxy forwards only supported methods, paths and bounded same-origin requests',async()=>{
  let calls=0;
  const upstream=async()=>{calls++;return Response.json({ok:true});};
  assert.equal((await proxyRequest(request('admin'),upstream)).status,404);
  assert.equal((await proxyRequest(request('scan'),upstream)).status,405);
  assert.equal((await proxyRequest(request('scan',{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),upstream)).status,403);
  assert.equal((await proxyRequest(request('scan',{method:'POST',body:'x'.repeat(3001)}),upstream)).status,413);
  assert.equal(calls,0);
});
test('proxy strips browser Origin for upstream and preserves response status and content',async()=>{
  const body=JSON.stringify({url:'https://example.com'});
  const response=await proxyRequest(request('clone',{method:'POST',headers:{Origin:'https://haxlab-ten.vercel.app'},body}),async(url,options)=>{
    assert.equal(url,'https://hexlab-security-lab.leejinho970715.chatgpt.site/api/clone');
    assert.equal(options.method,'POST');
    assert.equal(options.body,body);
    assert.equal(new Headers(options.headers).get('Origin'),null);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({error:'Too many requests'}, {status:429});
  });
  assert.equal(response.status,429);
  assert.deepEqual(await response.json(),{error:'Too many requests'});
  assert.equal(response.headers.get('Cache-Control'),'no-store');
});
test('proxy reports upstream failure and supports health without a POST body',async()=>{
  assert.equal((await proxyRequest(request('health'),async()=>{throw Error('offline');})).status,502);
  const response=await proxyRequest(request('health'),async(url,options)=>{
    assert.equal(options.method,'GET');assert.equal(options.body,undefined);
    return Response.json({status:'healthy'});
  });
  assert.deepEqual(await response.json(),{status:'healthy'});
});
