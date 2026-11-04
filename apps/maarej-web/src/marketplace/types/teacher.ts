// Search DTO only. Migration aliases are not final backend canonical IDs.
export type TeacherSearchDTO={id:string;legacyId:string;name:string;image?:string;subjects:string[];subjectIds?:string[];subjectKeys:string[];stages:string[];systems:string[];areas:string[];governorates:string[];rating?:number;reviewCount?:number;price?:{min:number;max:number;currency:'EGP';unit:'حصة'};provenance:{kind:'demo';source:string}};
export type SearchSort='default'|'rating'|'priceAsc'|'priceDesc';
export type SearchFilters={q:string;subject:string;governorate:string;area:string;stage:string;system:string;rating:string;minPrice:string;maxPrice:string;sort:SearchSort};
