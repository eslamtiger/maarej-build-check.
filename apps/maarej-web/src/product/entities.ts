// Future public contexts reserve separate entity contracts; no operations or datasets yet.
export type CenterIdentity={kind:'center';id:string;name:string};
export type CoSpaceIdentity={kind:'cospace';id:string;name:string};
// Order provider IDs can reference this registry through explicit aliases; no booking flow here.
export type CanonicalProviderRef={type:'teacher'|'center'|'cospace';id:string};
