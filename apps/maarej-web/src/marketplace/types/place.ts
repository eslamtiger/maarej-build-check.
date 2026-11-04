// Search DTOs for Center and Co-space. Kept separate on purpose: a Center hosts
// lessons in rooms; a Co-space rents study/work spaces. Demo data only.
export type Provenance={kind:'demo';source:string};
export type CenterRoom={name:string;seats:number;price:number;features:string[]};
export type CenterReview={name:string;rating:number;text:string};
export type CenterReviewRole='parents'|'students'|'teachers'|'centers';
export type CenterDTO={
 id:string;legacyId:string;name:string;type:string;area:string;governorate:string;address:string;
 rating:number;reviews:number;note:string;branches:string[];features:string[];rooms:CenterRoom[];
 featuredTeachers:string[];reviewsByRole:Partial<Record<CenterReviewRole,CenterReview[]>>;
 lat:number;lng:number;price:{min:number;max:number};maxSeats:number;provenance:Provenance;
};
export type SpaceDTO={
 id:string;legacyId:string;name:string;type:string;area:string;governorate:string;rating:number;reviews:number;
 capacity:number;units:number;features:string[];price:{min:number;max:number};lat:number;lng:number;provenance:Provenance;
};
export type PlaceSort='default'|'rating'|'priceAsc'|'priceDesc';
export type PlaceFilters={q:string;governorate:string;area:string;seats:string;feature:string;rating:string;minPrice:string;maxPrice:string;sort:PlaceSort};
