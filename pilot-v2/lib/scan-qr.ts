export function parseWardQR(text:string,origin:string){
 const url=new URL(text);
 if(url.origin!==origin||url.pathname.replace(/\/$/,'')!=='/scan')throw Error('Use an IN or OUT QR issued by this GARUD pilot.');
 const wardId=Number(url.searchParams.get('ward')),action=url.searchParams.get('action'),qrVersion=Number(url.searchParams.get('v'));
 if(!Number.isSafeInteger(wardId)||wardId<1||!Number.isSafeInteger(qrVersion)||qrVersion<1||!['IN','OUT'].includes(action||''))throw Error('This ward QR is incomplete or invalid. Ask the administrator to reissue it.');
 return {wardId,action:action as 'IN'|'OUT',qrVersion};
}
