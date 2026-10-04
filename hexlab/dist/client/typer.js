// Visual code theatre: these examples are displayed as text and never executed.
const streams={
 python:[
  '# integrity_guard.py / SHA-256 verification\nimport hashlib\n\ndef verify_integrity(payload, expected):\n    digest = hashlib.sha256(payload).hexdigest()\n    return digest == expected\n\n',
  '# packet_inspector.py / synthetic packet records\npackets = [{"source": "lab-node", "port": 443, "encrypted": True}]\nfor packet in packets:\n    verdict = "ALLOW" if packet["encrypted"] else "REVIEW"\n    print(f"[INSPECT] {packet[\"source\"]}: {verdict}")\n\n',
  '# auth_guard.py / defensive request validation\ndef authorize(session, resource):\n    if not session.get("authenticated"):\n        return {"status": "DENIED"}\n    return {"status": "VERIFIED", "scope": resource}\n\n',
  '# audit_trail.py / local event classification\nevents = ["session_open", "policy_check", "integrity_verified"]\nfor event in events:\n    audit_record = {"event": event, "environment": "sandbox"}\n    print("[AUDIT]", audit_record)\n\n'
 ],
 javascript:[
  '// secure-render.js / safe text output\nconst renderMessage = (node, message) => {\n  node.textContent = String(message);\n  node.dataset.integrity = "verified";\n};\n\n',
  '// policy-engine.js / isolated security checks\nconst policies = ["validate-input", "check-origin", "encode-output"];\nfor (const policy of policies) {\n  console.info(`[POLICY] ${policy} :: PASS`);\n}\n\n',
  '// crypto-digest.js / integrity fingerprint\nasync function fingerprint(text) {\n  const bytes = new TextEncoder().encode(text);\n  const digest = await crypto.subtle.digest("SHA-256", bytes);\n  return Array.from(new Uint8Array(digest))\n    .map(byte => byte.toString(16).padStart(2, "0")).join("");\n}\n\n',
  '// sandbox-gateway.js / simulated packet filtering\nconst packets = [{ protocol: "HTTPS", destination: "lab.local" }];\nconst approved = packets.filter(packet => packet.protocol === "HTTPS");\nconsole.table(approved);\n\n'
 ],
 terminal:[
  'operator@hexlab:~$ inspect --source virtual-network\n[INIT] Loading synthetic packet records...\n[PASS] TLS channel verified\n[PASS] Origin policy validated\n[DONE] 0 external requests / sandbox complete\n\n',
  'operator@hexlab:~$ integrity --verify virtual-files\n[SHA256] index.html ........ VERIFIED\n[SHA256] config.json ....... VERIFIED\n[SHA256] backup.zip ........ VERIFIED\n[STATUS] No unexpected changes detected\n\n',
  'operator@hexlab:~$ audit --mode simulation\n[RECON] Mapping virtual nodes...\n[CHECK] Content policy ........ OK\n[CHECK] Input validation ...... OK\n[CHECK] Session isolation ..... OK\n[REPORT] Defensive audit complete\n\n',
  'operator@hexlab:~$ trace --dataset demo\n[TRACE] lab-node-01 -> policy-gateway\n[TRACE] policy-gateway -> isolated-preview\n[PASS] Boundary intact / checksum matched\n[READY] Awaiting operator input_\n\n'
 ]
};

export function mountTypingBoard(root){
 const capture=root.querySelector('#typer-capture');
 const output=root.querySelector('#typer-output');
 const surface=root.querySelector('.typer-surface');
 const scroller=root.querySelector('.typer-code');
 const count=root.querySelector('#typer-count');
 const state=root.querySelector('#typer-state');
 const format=root.querySelector('#typer-format');
 const speed=root.querySelector('#typer-speed');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const lifecycle=new AbortController();
 const on=(element,event,fn)=>element.addEventListener(event,fn,{signal:lifecycle.signal});
 let text='',queue='',remaining='',lastSnippet='',timer=0,composing=false,disposed=false;
 function draw(){
  output.textContent=text;
  count.textContent=text.length.toLocaleString('ko-KR');
  scroller.scrollTop=scroller.scrollHeight;
  state.textContent=queue?'STREAMING':'READY';
 }
 function step(){
  timer=0;if(disposed)return;
  const amount=reducedMotion.matches?queue.length:Number(speed.value);
  text+=queue.slice(0,amount);queue=queue.slice(amount);
  if(text.length>24000){const cut=text.indexOf('\n',text.length-20000);text=text.slice(cut<0?text.length-20000:cut+1);}
  draw();if(queue)timer=setTimeout(step,24);
 }
 function feed(){
  if(disposed||queue.length>3000)return;
  if(!remaining){
   const pool=format.value==='mixed'?Object.values(streams).flat():streams[format.value];
   const choices=pool.filter(s=>s!==lastSnippet);
   remaining=choices[Math.floor(Math.random()*choices.length)];lastSnippet=remaining;
  }
  const amount=18+Math.floor(Math.random()*34);
  queue+=remaining.slice(0,amount);remaining=remaining.slice(amount);
  capture.value='';
  if(!timer)step();
 }
 on(capture,'keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing||composing)return;
  if(event.key.length===1||['Enter','Backspace','Delete'].includes(event.key)){
   event.preventDefault();feed();
  }
 });
 on(capture,'beforeinput',event=>{if(event.isComposing||composing)return;event.preventDefault();feed();});
 on(capture,'input',()=>{if(!composing){capture.value='';feed();}});
 on(capture,'compositionstart',()=>{composing=true;});
 on(capture,'compositionend',()=>{composing=false;capture.value='';feed();});
 on(capture,'focus',()=>surface.classList.add('typing-focus'));
 on(capture,'blur',()=>surface.classList.remove('typing-focus'));
 on(capture,'wheel',event=>{event.preventDefault();scroller.scrollTop+=event.deltaY;});
 on(root.querySelector('#typer-clear'),'click',()=>{clearTimeout(timer);timer=0;text=queue=remaining=lastSnippet='';capture.value='';draw();capture.focus({preventScroll:true});});
 on(root.querySelector('#typer-focus'),'click',()=>capture.focus({preventScroll:true}));
 on(format,'change',()=>{remaining='';});
 on(root.querySelector('#typer-expand'),'click',()=>{root.querySelector('.typer-panel').classList.toggle('expanded-panel');capture.focus({preventScroll:true});});
 capture.focus({preventScroll:true});
 return()=>{disposed=true;clearTimeout(timer);lifecycle.abort();};
}
