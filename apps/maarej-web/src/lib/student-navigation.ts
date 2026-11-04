export function safeStudentReturn(value:string|null|undefined){return value==="/"?"/student":value&&/^\/student(?:[/?#]|$)[^\\]*$/.test(value)?value:undefined;}
export function studentDetailHref(href:string,origin?:string){
  const from=safeStudentReturn(origin??(typeof window!=="undefined"?window.location.pathname+window.location.search+window.location.hash:undefined));
  if(!from||!href.startsWith("/")||href.startsWith("//"))return href;
  const url=new URL(href,"https://maarej.local");url.searchParams.set("returnTo",from);return url.pathname+url.search+url.hash;
}
